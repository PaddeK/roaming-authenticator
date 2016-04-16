'use strict';

var Log         = require('./log.js'),
    Server      = require('./server.js'),
    Stdio       = require('./stdio'),
    Fresh       = require('./fresh.js'),
    CommandLine = require('./command-line.js'),
    json        = require('jsonfile2'),
    path        = require('path')
;

function init(root, options)
{
    var config = null;

    if (options.name() !== Fresh.run.name) {
        config = new json.File(path.join(root, 'config.json'));
        config.readSync();
        global.Config = config;
    }

    global.Log = new Log(options, config);
}

function onFreshCmd (root, options)
{
    init(root, options);

    Fresh.run(root, options);
}

function onServerCmd (root, options)
{
    init(root, options);

    Server.run(global.Config, global.Log);
}

function onStdioCmd (root, command, options, stdin)
{
    init(root, options);

    Stdio.run(command, global.Config, global.Log, stdin);
}

new CommandLine(onFreshCmd, onServerCmd, onStdioCmd).parse(process.argv);
