'use strict';

var Config   = global.Config,
    Log      = global.Log,
    util     = require('util'),
    crypto   = require('crypto'),
    EC       = require('elliptic').ec,
    shake256 = require('js-sha3').shake_256,
    express  = require('express'),
    camelize = require('camelize'),
    Server   = require('./server.js'),
    Sign     = express.Router(),
    ReqProps = ['tid', 'nymiband-nonce'],
    ResProps = ['okay', 'error', 'tid', 'nymiband-nonce', 'server-signature', 'public-key']
;

Sign.use(Server.addCORSHeader);

Sign.doSign = function(req)
{
    Log.debug('sign');

    var advNonce, serverNonce, random, ecdsaInputHash, sha256, ec, signature;

    if (!util.isObject(req.body) || !ReqProps.every(req.body.hasOwnProperty, req.body)) {
        return Server.marshalResponse(ResProps, {
            okay : false,
            error: 'failed to parse sign request'
        });
    }

    req = camelize(req.body);

    if (req.nymibandNonce.length != 32) {
        return Server.marshalResponse(ResProps, {
            okay : false,
            error: util.format('nonce has incorrect length of %d, must be 16 bytes.', req.nymibandNonce.length)
        });
    }

    advNonce = req.nymibandNonce;
    random = crypto.randomBytes(16);
    serverNonce = shake256(random, 256);

    sha256 = crypto.createHash('sha256');
    sha256.update(Buffer.concat([new Buffer(advNonce, 'hex'), new Buffer(serverNonce, 'hex')]));

    ecdsaInputHash = sha256.digest('hex');

    ec = new EC('p256');
    signature = ec.sign(ecdsaInputHash, Config.get('PrivateKey'), 'hex');

    return Server.marshalResponse(ResProps, {
        'okay':             true,
        'tid':              req.tid,
        'nymiband-nonce':   advNonce,
        'server-nonce':     serverNonce,
        'server-signature': Buffer.concat([signature.r.toBuffer(), signature.s.toBuffer()]).toString('hex'),
        'public-key':       Config.get('PublicKey')
    });
};

Sign.options('/', function (req, res, next) {
    Log.debug('preflight /sign');

    res.status(204).send();
});

Sign.post('/', function (req, res, next) {
    Log.debug('post /sign');

    return res.json(Sign.doSign(req));
});

module.exports = Sign;