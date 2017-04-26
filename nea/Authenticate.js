'use strict';

const
    NeaHelpers = require('nea-helpers'),
    os = require('os'),
    crypto = require('crypto'),
    Events = NeaHelpers.Events,
    Responses = NeaHelpers.Responses,
    Factory = NeaHelpers.RequestFactory;

class Authenticate
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
        this._nea.on('RoamingAuthRun', this._roamingAuth.bind(this));
        this._nea.on('RoamingAuthReportNonce', this._roamingAuth.bind(this));
        this._nea.on('RoamingAuthSigRun', this._roamingAuth.bind(this));
        this._nea.on('InfoGet', this._infoHandler.bind(this));
    }

    /**
     * Handle roaming auth setup
     * @param {RoamingAuthNonceEvent|AcknowledgementResponse|RoamingAuthSigResponse} response
     * @private
     * @return {void}
     */
    _roamingAuth (response)
    {
        this._exitOnError(response, 'Failed to authenticate selected Nymi Band');

        if (response instanceof Events.RoamingAuthNonce) {
            this._connector.startAuth(response.getNymiBandNonce(), response.getExchange()).then(res => {
                this._nea.send(Factory.completeRoamingAuth(
                    res.partnerPublicKey,
                    res.serverNonce,
                    res.serverSignature,
                    response.getExchange()
                ));
            }).catch(err => this._exit(err.response + '\nFirst stage of roaming auth on roaming service failed'));
        } else if (response instanceof Responses.RoamingAuthSig) {
            let sig = response.getNymiBandSignature(),
                exchange = response.getExchange(),
                keyId = response.getRoamingAuthKeyId();

            this._connector.completeAuth(sig, exchange, keyId).then(userId => {
                this._stdOut('Roaming authentication successful!');
                this._stdOut(`User: ${userId}`);
                this._nea.stop().then(() => process.exit(0)).catch(() => process.exit(0));
            }).catch(err => this._exit(err.response + '\nRoaming authentication failed.'));
        }
    }

    /**
     * Handle InfoGet
     * @param {InfoResponse} response
     * @private
     * @return {void}
     */
    _infoHandler (response)
    {
        this._exitOnError(response, 'Unable to find any bands to authenticate');

        let bands = response.getNymiBands(false, true);

        if (bands.length === 0) {
            return this._exit('Unable to find any bands to authenticate');
        } else if (bands.length > 0) {
            let tid = response.getClosestBand(bands).getTid(),
                exchange = crypto.randomBytes(16).toString('hex') + 'roamingauth';

            this._nea.send(Factory.startRoamingAuth(tid, exchange));
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
     * @param {string} [msg]
     * @return {void}
     * @private
     */
    _exitOnError (res, msg)
    {
        res.getErrors() !== null && this._exit(msg);
    }

    /**
     * Inform about error and exit
     * @param {string} [msg = '']
     * @private
     * @return {void}
     */
    _exit (msg = '')
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

module.exports = Authenticate;