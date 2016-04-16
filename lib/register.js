'use strict';

var Config   = global.Config,
    Log      = global.Log,
    fs       = require('fs'),
    util     = require('util'),
    express  = require('express'),
    camelize = require('camelize'),
    Server   = require('./server.js'),
    json     = require('jsonfile2'),
    Register = express.Router(),
    ReqProps = ['verification-key', 'verification-key-id', 'user-data'],
    ResProps = ['okay', 'error']
;

Register.use(Server.addCORSHeader);

Register.doRegister = function(req)
{
    Log.debug('register');

    var now, user, users;

    if (!util.isObject(req.body) || !ReqProps.every(req.body.hasOwnProperty, req.body)) {
        return Server.marshalResponse(ResProps, {
            okay: false,
            error: 'failed to parse register request'
        });
    }
    
    req = camelize(req.body);
    now = (new Date()).toISOString();

    Log.debug('  VerificationKeyId: ' + req.verificationKeyId);
    Log.debug('  VerificationKey  : ' + req.verificationKey);
    Log.debug('  UserData.name    : ' + req.userData.name);
    Log.debug('  now              : ' + now);

    if (req.verificationKeyId.length != 32) {
        return Server.marshalResponse(ResProps, {
            okay: false,
            error: util.format('verification-key-id has incorrect length of %d.', req.verificationKeyId.length)
        });
    }

    if (req.verificationKey.length != 128) {
        return Server.marshalResponse(ResProps, {
            okay: false,
            error: util.format('verification-key has incorrect length of %d.', req.verificationKey.length)
        });
    }

    users = new json.File(Config.get('UsersFileName'));
    users.readSync();

    user = {
        VerificationKeyId: req.verificationKeyId,
        VerificationKey:   req.verificationKey,
        RegisteredAt:      now,
        LastSignedAt:      now,
        Count:             0,
        Data:              {
            Name:          req.userData.name
        }
    };

    users.set(user.VerificationKeyId, user);
    users.writeSync(null, 4);
    fs.chmodSync(users.path, '0600');

    return Server.marshalResponse(ResProps, {okay: true});
};

Register.options('/', function (req, res, next) {
    Log.debug('preflight /register');

    res.status(204).send();
});

Register.post('/', function (req, res, next) {
    Log.debug('post /register');

    return res.json(Register.doRegister(req));
});

module.exports = Register;