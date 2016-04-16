'use strict';

var Config    = global.Config,
    Log       = global.Log,
    express   = require('express'),
    Server    = require('./server.js'),
    PublicKey = express.Router(),
    ResProps  = ['okay', 'error', 'public-key']
;

PublicKey.use(Server.addCORSHeader);

PublicKey.doPublicKey = function()
{
    return Server.marshalResponse(ResProps, {
        'okay': true,
        'public-key': Config.get('PublicKey')
    });
};

PublicKey.options('/', function (req, res, next) {
    Log.debug('preflight /public-key');

    res.status(204).send();
});

PublicKey.get('/', function (req, res, next) {
    Log.debug('get /public-key');

    return res.json(PublicKey.doPublicKey());
});

module.exports = PublicKey;