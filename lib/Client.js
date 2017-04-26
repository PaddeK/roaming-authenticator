'use strict';

const
    /** @property {function} wrap */
    defaultClient = require('rest'),
    pathPrefix = require('rest/interceptor/pathPrefix'),
    defaulter = require('rest/interceptor/defaultRequest'),
    errorCode = require('rest/interceptor/errorCode'),
    mime = require('rest/interceptor/mime');

class Client
{
    /**
     * Create client instance
     * @param {string} url
     */
    constructor (url)
    {
        let header = {headers: {'Content-Type': 'application/json'}},
            prefix = {prefix: url};

        this._client = defaultClient.wrap(mime).wrap(errorCode).wrap(defaulter, header).wrap(pathPrefix, prefix);
    }

    /**
     * GET request
     * @param {string} path
     * @returns {Promise}
     */
    get (path)
    {
        return new Promise((resolve, reject) => {
            this._client({path: path}).then(response => {
                resolve(response.entity);
            }).catch(response => {
                /** @property response.raw.response */
                reject(response.error || response.raw.response.statusCode + ' ' + response.raw.response.statusMessage);
            });
        });
    }

    /**
     * POST request
     * @param {string} path
     * @param {*} body
     * @returns {Promise}
     */
    post (path, body)
    {
        return new Promise((resolve, reject) => {
            this._client({path: path, entity: body}).then(response => {
                resolve(response.entity);
            }).catch(response => {
                /** @property response.raw.response */
                reject(response.error || response.raw.response.statusCode + ' ' + response.raw.response.statusMessage);
            });
        });
    }
}

module.exports = Client;