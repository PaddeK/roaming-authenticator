'use strict';

var Log,
    fs     = require('fs'),
    Logger = require('log')
;

Log = module.exports = function (options, config)
{
    var level;

    level = options && options.verbose ? 'info' : 'notice';
    level = options && options.beVeryVerbose ? 'debug' : level;

    this.loggers = [new Logger(level)];

    if (options && options.multiLog && config && config.get('Log')) {
        this.loggers.push(new Logger(level, fs.createWriteStream(config.get('Log'), { flags: 'a' })));
    }
};

function _write (loggers, func, args)
{
    loggers.forEach(function (logger) {
        logger[func].apply(logger, args);
    });
}

Log.prototype.debug = function ()
{
    _write(this.loggers, 'debug', arguments);
};

Log.prototype.info = function ()
{
    _write(this.loggers, 'info', arguments);
};

Log.prototype.notice = function ()
{
    _write(this.loggers, 'notice', arguments);
};

Log.prototype.warning = function ()
{
    _write(this.loggers, 'warning', arguments);
};

Log.prototype.error = function ()
{
    _write(this.loggers, 'error', arguments);
};

Log.prototype.fatal = function ()
{
    _write(this.loggers, 'emergency', arguments);
    process.exit(1);
};