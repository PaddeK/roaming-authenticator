'use strict';

const
    Utils = require('nea-helpers').Utils,
    /**
     * @property {function} prepare
     * @property {function} close
     */
    Database = require('better-sqlite3');

class NonceModel
{
    /**
     * Create UserModel instance
     * @param {string} db
     */
    constructor (db)
    {
        this._db = db;
    }

    /**
     * Get Nonce by exchange
     * @param {string} exchange
     * @returns {string}
     */
    getNonce (exchange)
    {
        let con = new Database(this._db),
            sql = 'SELECT nonce FROM nonces WHERE exchange = :exchange;',
            /** @property {string} nonceRow.nonce */
            nonceRow = Utils.tryCatch(() => con.prepare(sql).get({exchange}));

        con.close();

        return nonceRow !== undefined ? nonceRow.nonce : '';
    }

    /**
     * Delete nonce by exchange
     * @param {string} exchange
     * @returns {boolean}
     */
    deleteNonceByExchange (exchange)
    {
        let con = new Database(this._db),
            sql = 'DELETE FROM nonces WHERE exchange = :exchange;',
            /** @property {number} info.changes */
            info = Utils.tryCatch(() => con.prepare(sql).run({exchange}));

        con.close();

        return info !== undefined && info.changes === 1;
    }

    /**
     * Save nonce
     * @param {string} exchange
     * @param {string} nonce
     * @returns {boolean}
     */
    saveNonce (exchange, nonce)
    {
        let con = new Database(this._db),
            sql = 'INSERT INTO nonces (exchange, nonce) VALUES (:exchange, :nonce);',
            /** @property {number} info.changes */
            info = Utils.tryCatch(() => con.prepare(sql).run({exchange, nonce}));

        con.close();

        return info !== undefined && info.changes === 1;
    }
}

module.exports = NonceModel;