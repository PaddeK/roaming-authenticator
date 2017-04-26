'use strict';


class ServiceConnector
{
    /**
     * Create ServiceConnector instance
     * @param {Client} client
     */
    constructor (client)
    {
        this._client = client;
    }

    /**
     * Get PublicKey from RoamingAuth Service
     * @returns {Promise}
     */
    getPublicKey ()
    {
        return new Promise((resolve, reject) => {
            this._client.get('provision/getpubkey').then(response => {
                if(response.successful) {
                    return resolve(response.response.partnerPublicKey);
                }
                return reject(response);
            }).catch(reject);
        });
    }

    /**
     * Create user on RoamingAuth Service
     * @param {string} userID
     * @param {string} nbPublicKey
     * @param {string} nbPublicKeyID
     * @returns {Promise}
     */
    createUser (userID, nbPublicKey, nbPublicKeyID)
    {
        return new Promise((resolve, reject) => {
            this._client.post('provision/newuser', {request: {userID, nbPublicKey, nbPublicKeyID}}).then(response => {
                if (response.successful) {
                    return resolve();
                }
                return reject(response);
            }).catch(reject);
        });
    }

    /**
     * Start authentication against RoamingAuth Service
     * @param {string} nymibandNonce
     * @param {string} exchange
     * @returns {Promise}
     */
    startAuth (nymibandNonce, exchange)
    {
        return new Promise((resolve, reject) => {
            this._client.post('sign', {request: {nymibandNonce, exchange}}).then(response => {
                if (response.successful) {
                    return resolve(response.response);
                }
                return reject(response);
            }).catch(reject);
        });

    }

    /**
     * Finish authentication against Roamingauth Service
     * @param {string} signedNonces
     * @param {string} exchange
     * @param {string} nbPublicKeyID
     * @returns {Promise}
     */
    completeAuth (signedNonces, exchange, nbPublicKeyID)
    {
        return new Promise((resolve, reject) => {
            this._client.post('auth', {request: {signedNonces, exchange, nbPublicKeyID}}).then(response => {
                if (response.successful) {
                    return resolve(response.response.userId);
                }
                return reject(response);
            }).catch(reject);
        });
    }
}

module.exports = ServiceConnector;