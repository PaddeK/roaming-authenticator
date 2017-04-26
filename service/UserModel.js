'use strict';

const
    Utils = require('nea-helpers').Utils,
    /**
     * @property {function} prepare
     * @property {function} close
     */
    Database = require('better-sqlite3');

class UserModel
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
     * Get UserKey from KeyID
     * @param {string} keyId
     * @returns {string}
     */
    getUserKeyFromKeyID (keyId)
    {
        let con = new Database(this._db),
            sql = 'SELECT bandPublicKey FROM users WHERE keyId = :keyId;',
            /** @property {string} userRow.bandPublicKey */
            userRow = Utils.tryCatch(() => con.prepare(sql).get({keyId}));

        con.close();

        return userRow !== undefined ? userRow.bandPublicKey : '';
    }

    /**
     * Get UserID from KeyID
     * @param {string} keyId
     * @returns {string}
     */
    getUserIDFromKeyID (keyId)
    {
        let con = new Database(this._db),
            sql = 'SELECT userId FROM users WHERE keyId = :keyId;',
            /** @property {string} userRow.userId */
            userRow = Utils.tryCatch(() => con.prepare(sql).get({keyId}));

        con.close();

        return userRow !== undefined ? userRow.userId : '';
    }

    /**
     * Create new User
     * @param {string} userId
     * @param {string} bandPublicKey
     * @param {string} keyId
     * @returns {boolean}
     */
    createNewUser (userId, bandPublicKey, keyId)
    {
        let con = new Database(this._db),
            sql = 'INSERT INTO users (keyId, userId, bandPublicKey) VALUES (:keyId, :userId, :bandPublicKey);',
            /** @property {number} info.changes */
            info = Utils.tryCatch(() => con.prepare(sql).run({keyId, userId, bandPublicKey}));

        con.close();

        return info !== undefined && info.changes === 1;
    }
}

module.exports = UserModel;