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
    constructor (url)
    {
        this._client = defaultClient
                        .wrap(mime)
                        .wrap(errorCode)
                        .wrap(defaulter, { headers: {'Content-Type': 'application/json'} })
                        .wrap(pathPrefix, { prefix: url });

    }

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