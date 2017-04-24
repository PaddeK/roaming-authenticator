'use strict';

const
    Utils = require('nea-helpers').Utils,
    Database = require('better-sqlite3');

class UserModel
{
    /**
     * Create UserModel instance
     * @param {string} db
     */
    constructor (db)
    {
        /** @property {function} prepare */
        this._db = new Database(db);
    }

    /**
     * Get UserKey from KeyID
     * @param {string} keyId
     * @returns {string}
     */
    getUserKeyFromKeyID (keyId)
    {
        let sql = 'SELECT bandPublicKey FROM users WHERE keyId = :keyId;',
            /** @property {string} userRow.bandPublicKey */
            userRow = Utils.tryCatch(() => this._db.prepare(sql).get({keyId}));

        return userRow !== undefined ? userRow.bandPublicKey : '';
    }

    /**
     * Get UserID from KeyID
     * @param {string} keyId
     * @returns {string}
     */
    getUserIDFromKeyID (keyId)
    {
        let sql = 'SELECT userId FROM users WHERE keyId = :keyId;',
            /** @property {string} userRow.userId */
            userRow = Utils.tryCatch(() => this._db.prepare(sql).get({keyId}));

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
        let sql = 'INSERT INTO users (keyId, userId, bandPublicKey) VALUES (:keyId, :userId, :bandPublicKey);',
            /** @property {number} info.changes */
            info = Utils.tryCatch(() => this._db.prepare(sql).run({keyId, userId, bandPublicKey}));

        return info !== undefined && info.changes === 1;
    }
}

module.exports = UserModel;