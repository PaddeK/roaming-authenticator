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

    getPublicKey ()
    {
        return new Promise((resolve, reject) => {
            this._client.get('provision/getpubkey').then(response => {
                if(response.successful) {
                    return resolve(response.response.partnerPublicKey);
                }
                return reject();
            }).catch(reject);
        });
    }

}

module.exports = ServiceConnector;