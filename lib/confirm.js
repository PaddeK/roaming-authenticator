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

    var users, sha256, inputHash, ec, user, signature, verificationResult, nonce, nea, verificationKeyId;

    if (!util.isObject(req.body) || !ReqProps.every(req.body.hasOwnProperty, req.body)) {
        return Server.marshalResponse(ResProps, {
            okay: false,
            error: 'failed to parse confirmation request'
        });
    }

    req = camelize(req.body);

    nonce = req.serverNonce;
    signature = req.nymibandSignature;
    verificationKeyId = req.verificationKeyId;
    nea = req.confirmingNea;

    if (nonce.length != 64) {
        return Server.marshalResponse(ResProps, {
            okay: false,
            error: util.format('server-nonce has incorrect length of %d, must be 32 bytes.', nonce.length / 2)
        });
    }

    if (signature.length != 128) {
        return Server.marshalResponse(ResProps, {
            okay: false,
            error: util.format('signature has incorrect length of %d, must be 64 bytes.', signature.length / 2)
        });
    }

    users = new json.File(Config.get('UsersFileName'));
    users.readSync();
    user = users.get(verificationKeyId);

    if (user === undefined) {
        return Server.marshalResponse(ResProps, {
            okay: false,
            error: 'unknown verification-key-id.'
        });
    }

	// The value of confirmingNea should be checked here

    sha256 = crypto.createHash('sha256');
    sha256.update(new Buffer(nonce, 'hex'));

    inputHash = sha256.digest('hex');

    // signature from nymi band is a concatenation of the raw r and s values in hex
    signature = {r: signature.slice(0, 64), s: signature.slice(64)};

    ec = new EC('p256');

    // normally ecc public keys are prefixed with 0x04 and so elliptic expects that
    // but because the nymi band does not prefix its public keys we have to do that here
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
        'confirming-nea': nea
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