'use strict';

var Config   = global.Config,
    Log      = global.Log,
    util     = require('util'),
    crypto   = require('crypto'),
    EC       = require('elliptic').ec,
    express  = require('express'),
    camelize = require('camelize'),
    json     = require('jsonfile2'),
    Server   = require('./server.js'),
    Confirm  = express.Router(),
    ReqProps = ['tid', 'server-nonce', 'verification-key-id', 'nymiband-signature', 'confirming-nea'],
    ResProps = ['okay', 'error', 'tid', 'user-data', 'confirming-nea']
;

Confirm.use(Server.addCORSHeader);

Confirm.doConfirm = function(req)
{
    Log.debug('confirm');

    var users, sha256, inputHash, ec, user, signature, verificationResult;

    if (!util.isObject(req.body) || !ReqProps.every(req.body.hasOwnProperty, req.body)) {
        return Server.marshalResponse(ResProps, {
            okay: false,
            error: 'failed to parse confirmation request'
        });
    }

    req = camelize(req.body);

    if (req.serverNonce.length != 64) {
        return Server.marshalResponse(ResProps, {
            okay: false,
            error: util.format('server-nonce has incorrect length of %d, must be 32 bytes.', req.serverNonce.length >> 1)
        });
    }

    if (req.nymibandSignature.length != 128) {
        return Server.marshalResponse(ResProps, {
            okay: false,
            error: util.format('signature has incorrect length of %d, must be 64 bytes.', req.nymibandSignature.length)
        });
    }

    users = new json.File(Config.get('UsersFileName'));
    users.readSync();

    if (users.get(req.verificationKeyId) === undefined) {
        return Server.marshalResponse(ResProps, {
            okay: false,
            error: 'unknown verification-key-id.'
        });
    }

    user = users.get(req.verificationKeyId);

	// The value of req.confirmingNea should be checked here

    sha256 = crypto.createHash('sha256');
    sha256.update(new Buffer(req.serverNonce, 'hex'));

    inputHash = sha256.digest('hex');
    signature = {r: req.nymibandSignature.slice(0, 64), s: req.nymibandSignature.slice(64)};

    ec = new EC('p256');
    verificationResult = ec.verify(inputHash, signature, 0x04 + user.VerificationKey, 'hex');

    if (!verificationResult) {
        return Server.marshalResponse(ResProps, {
            'okay':  false,
            'tid':   req.tid,
            'error': 'failed to verify signature'
        });
    }

    return Server.marshalResponse(ResProps, {
        'okay':           true,
        'tid':            req.tid,
        'user-data':      user.Data,
        'confirming-nea': req.confirmingNea
    });
};

Confirm.options('/', function (req, res, next) {
    Log.debug('preflight /confirm');

    res.status(204).send();
});

Confirm.post('/', function (req, res, next) {
    Log.debug('post /confirm');

    return res.json(Confirm.doConfirm(req));
});

module.exports = Confirm;