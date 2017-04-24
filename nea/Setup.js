'use strict';

const
    NeaHelpers = require('nea-helpers'),
    Events = NeaHelpers.Events,
    Responses = NeaHelpers.Responses,
    Factory = NeaHelpers.RequestFactory;

class Setup
{
    /**
     * Create Setup instance
     * @param {NeaHelpers.Nea|Nea|EventEmitter} nea
     * @param {ServiceConnector} client
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

    _roamingAuthSetup (res)
    {

    }

    _infoHandler (res)
    {
        if (res.getErrors() !== null) {
            process.stderr.write(res.getErrors(true));
            return process.exit();
        }

        let bands = res.getNymiBands(true, true, true);

        if (bands.length === 0) {
            this._stdOut('Unable to find any active provisions to set up for roaming authentication');
            this._stdOut('Starting provisioning now...');
            this._nea.send(Factory.provisionStart());
        } else if (bands.length > 0) {
            let pid = res.getClosestBand(bands).getProvisionInfo().getPid();
            //this._nea.send(Factory.setupRoamingAuth(pid, ))
        }
    }

    _provisionHandler (res)
    {
        if (res.getErrors() !== null) {
            process.stderr.write(res.getErrors(true));
            return process.exit();
        }

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
                    // TODO roaming setup
                }
                break;
        }
    }

    _stdOut (str)
    {
        process.stdout.write(str + process.EOL);
    }

    run ()
    {
        // this._nea.start().then(() => {
        //     clien
        // });

        console.log(this._connector.getPublicKey());
    }
}

module.exports = Setup;