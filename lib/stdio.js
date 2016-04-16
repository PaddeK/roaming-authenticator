'use strict';

var Stdio    = {},
    fs       = require('fs'),
    path     = require('path'),
    camelize = require('camelize')
;

Stdio.run = function stdio(command, config, log, stdin)
{
    var cmd  = require(path.join(__dirname, camelize(command))),
        func = cmd[camelize('do-' + command)];

    log.info('run stdio');

    console.log(func(stdin ? {body: JSON.parse(stdin)} : undefined));
};

module.exports = Stdio;