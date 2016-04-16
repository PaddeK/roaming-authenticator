'use strict';

var Server     = {},
    fs         = require('fs'),
    https      = require('https'),
    express    = require('express'),
    Url        = require('url'),
    path       = require('path'),
    bodyParser = require('body-parser'),
    app        = express()
;

Server.addCORSHeader = function (req, res, next)
{
    res.header().set("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Access-Control-Allow-Origin");
    res.header().set("Access-Control-Allow-Origin", "*");
    next();
};

Server.marshalResponse = function (resprops, res)
{
    var Log = global.Log;

    resprops.forEach(function(prop) {
        !res.hasOwnProperty(prop) && (res[prop] = '');
    });

    if (res.error && res.error.length !== 0) {
        Log.info('failed request: %s', res.error);
        return res;
    }

    Log.debug(res);
    return res;
};

Server.errorHandler = function (log)
{
    return function (err, req, res, next) {
        log.error(err.stack || err.message || err);

        if(res.headersSent) {
            return next(err);
        }

        res.status(500).send();
    };
};

Server.run = function server(config, log)
{
    var addr       = Url.parse(config.get('ServiceAddr').replace(/^(https:\/\/)?/i, 'https://')),
        bodyOpts   = {
            inflate: true,
            limit:   500,
            reviver: undefined,
            strict:  true,
            type:    'application/json',
            verify:  false
        },
        serverOpts = {
            secure:       true,
            changeOrigin: true,
            autoRewrite:  true,
            ssl:          {
                key:  fs.readFileSync(path.join(config.get('Certs'), 'key.pem')),
                cert: fs.readFileSync(path.join(config.get('Certs'), 'cert.pem'))
            }
        };

    app.enable('strict routing');
    app.disable('x-powered-by');

    app.use(bodyParser.json(bodyOpts));
    app.use('/public-key', require('./publicKey.js'));
    app.use('/register',   require('./register.js'));
    app.use('/sign',       require('./sign.js'));
    app.use('/confirm',    require('./confirm.js'));
    app.use(Server.errorHandler(log));

    log.info('run server');

    https.createServer(serverOpts.ssl, app).listen(addr.port, addr.hostname);
};

module.exports = Server;