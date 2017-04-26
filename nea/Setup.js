'use strict';

const
    NeaHelpers = require('nea-helpers'),
    os = require('os'),
    Events = NeaHelpers.Events,
    Responses = NeaHelpers.Responses,
    Factory = NeaHelpers.RequestFactory;

class Setup
{
    /**
     * Create Setup instance
     * @param {NeaHelpers.Nea|Nea|EventEmitter} nea
     * @param {ServiceConnector} connector
     */
    constructor (nea, connector)
    {
        this._connector = connector;
        this._nea = nea;
        this._nea.on('ProvisionRunStart', this._provisionHandler.bind(this));
        this._nea.on('ProvisionRunStop', this._provisionHandler.bind(this));
        this._nea.on('ProvisionReportPatterns', this._provisionHandler.bind(this));
        this._nea.on('ProvisionReportProvisioned', this._provisionHandler.bind(this));
        this._nea.on('RoamingAuthSetupRun', this._roamingAuthSetup.bind(this));
        this._nea.on('InfoGet', this._infoHandler.bind(this));
    }

    /**
     * Handle roaming auth setup
     * @param {RoamingAuthSetupResponse} res
     * @private
     * @return {void}
     */
    _roamingAuthSetup (res)
    {
        this._exitOnError(res);

        this._connector.createUser('testuser', res.getRoamingAuthKey(), res.getRoamingAuthKeyId()).then(() => {
            this._stdOut('Roaming authentication setup complete');
            this._nea.stop().then(() => process.exit(0)).catch(() => process.exit(0));
        }).catch((err) => this._exit(err.response + '\nFailed to create user on roaming service'));
    }

    /**
     * Handle InfoGet
     * @param {InfoResponse} res
     * @private
     * @return {void}
     */
    _infoHandler (res)
    {
        this._exitOnError(res);

        let bands = res.getNymiBands(true, true, true);

        if (bands.length === 0) {
            this._stdOut('Unable to find any active provisions to set up for roaming authentication');
            this._stdOut('Starting provisioning now...');
            this._nea.send(Factory.provisionStart());
        } else if (bands.length > 0) {
            let pid = res.getClosestBand(bands).getProvisionInfo().getPid();

            this._connector.getPublicKey().then(pubKey => {
                this._nea.send(Factory.setupRoamingAuth(pid, pubKey));
            }).catch(() => this._exit('Failed to get public key from roaming service'));
        }
    }

    /**
     * Handle provisioning
     * @param {PatternEvent|ProvisionedEvent|AcknowledgementResponse} res
     * @private
     * @return {void}
     */
    _provisionHandler (res)
    {
        this._exitOnError(res);

        switch (true) {
            case res instanceof Events.Pattern:
                this._nea.send(Factory.acceptPattern(res.getPatternAt(0)));
                break;
            case res instanceof Events.Provisioned:
                this._nea.send(Factory.provisionStop());
                break;
            case res instanceof Responses.Acknowledgement:
                if (res.getOperation().pop() === 'start') {
                    this._stdOut('Please put your band in provisioning mode.');
                } else {
                    this._nea.send(Factory.getInfo());
                }
                break;
        }
    }

    /**
     * Print to stdOut
     * @param {object|string} str
     * @return {void}
     * @private
     */
    _stdOut (str)
    {
        process.stdout.write((str instanceof Object ? JSON.stringify(str, null, 4) : str) + os.EOL);
    }

    /**
     * Print to stdErr
     * @param {BaseResponse} res
     * @return {void}
     * @private
     */
    _exitOnError (res)
    {
        res.getErrors() !== null && this._exit();
    }

    /**
     * Inform about error and exit
     * @param {string} [msg = 'Roaming authentication setup failed']
     * @private
     * @return {void}
     */
    _exit (msg = 'Roaming authentication setup failed')
    {
        process.stderr.write(msg + os.EOL);
        this._nea.stop().then(() => process.exit(1)).catch(() => process.exit(1));
    }

    /**
     * Start setup
     * @return {void}
     */
    run ()
    {
        this._nea.start().then(() => {
            this._nea.send(Factory.getInfo());
        }).catch(() => this._exit());
    }
}

module.exports = Setup;