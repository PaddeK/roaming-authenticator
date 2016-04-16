'use strict';

var Fresh  = {},
    path   = require('path'),
    fs     = require('fs'),
    EC     = require('elliptic').ec,
    mkdirp = require('mkdirp'),
    json   = require('jsonfile2')
;

Fresh.run = function fresh(root, options)
{
    var config, users, configFilename, logFilename, usersFilename, certsPath, curve, keyPair,
        Log = global.Log;

    Log.info('run fresh');

    root = path.normalize(root);

    try {
        mkdirp.sync(root)
    } catch (err) {
        Log.fatal('cannot create the root directory: ' + root)
    }

    fs.access(root, fs.F_OK | fs.R_OK | fs.W_OK, function(err) {
        if (err) {
            Log.fatal('insufficient permission for root directory we just created: ' + root)
        }
    });

    if (!fs.statSync(root).isDirectory()) {
        Log.fatal('App root is not a directory: ' + root)
    }

    configFilename = path.join(root, 'config.json');

    fs.access(configFilename, fs.F_OK | fs.R_OK, function(err) {
        if (!err) {
            Log.fatal('root is already configured: ' + root)
        }
    });

    config = new json.File(configFilename);
    config.updateSync();

    if (options.log === '<root>/roaming-authenticator.log') {
        logFilename = path.resolve(root, 'roaming-authenticator.log');
    } else {
        logFilename = path.resolve(options.log);
    }

    if (!path.isAbsolute(logFilename)) {
        Log.fatal('could not get absolute path for: ' + logFilename);
    }

    config.set('Log', logFilename);
    config.set('ServiceAddr', options.addr);

    usersFilename = path.resolve(root, 'users.json');

    if (!path.isAbsolute(usersFilename)) {
        Log.fatal('could not obtain absolute path: ' + usersFilename);
    }

    config.set('UsersFileName', usersFilename);

    if (options.certs === '<root>/certs') {
        certsPath = path.resolve(root, 'certs')
    } else {
        certsPath = path.resolve(options.certs);
    }

    if (!path.isAbsolute(certsPath)) {
        Log.fatal('could not get absolute path for: ' + certsPath);
    }

    config.set('Certs', certsPath);

    curve = new EC('p256');
    keyPair = curve.genKeyPair();

    config.set('PrivateKey', keyPair.getPrivate('hex'));
    config.set('PublicKey', keyPair.getPublic('hex').slice(2)); // removing 0x04 prefix of public key

    try {
        config.writeSync(null, 4);
        fs.chmodSync(config.path, '0600');
    } catch (err) {
        Log.fatal('failed to write configuration to: ' + config.path);
    }

    users = new json.File(usersFilename);

    try {
        users.updateSync();
        users.writeSync(null, 4);
        fs.chmodSync(users.path, '0600');
    } catch (err) {
        Log.fatal('failed to write to: ' + users.path);
    }
};

module.exports = Fresh;