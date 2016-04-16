var CommandLine,
    path     = require('path'),
    Pkg      = require('../package.json'),
    program  = require('commander'),
    Commands = ['register', 'sign', 'confirm', 'public-key'],
    Stdin    = ''
;

CommandLine = module.exports = function (freshCb, serverCb, stdioCb)
{
    program
        .description('Simplistic demonstration of a roaming authentication server that works with the Nymi JSON api.')
        .version(Pkg.version);

    program
        .command('fresh <root>')
        .description('Initialise the application in <root> directory')
        .option("--addr  <addr>", "Address on which to listen for websocket connections     default: 127.0.0.1:9999.", '127.0.0.1:9999')
        .option("--log   <file>", "The log file to append to                                default: <root>/roaming-authenticator.log.", "<root>/roaming-authenticator.log")
        .option("--certs <dir>",  "The directory containing the service TLS certs           default: <root>/certs.", "<root>/certs")
        .action(freshCb);

    program
        .command('server <root>')
        .description('Run as server and serve the application in <root> directory')
        .option("--verbose",         "Be verbose")
        .option("--be-very-verbose", "Be very verbose")
        .option("--multi-log",       "Log to both the log file and stdout")
        .action(serverCb);

    program
        .command('stdio <root> <command>')
        .description('Issues <command> directly for the application in <root> directory')
        .option("--verbose",         "Be verbose")
        .option("--be-very-verbose", "Be very verbose")
        .option("--multi-log",       "Log to both the log file and stdout")
        .on('--help', function() {
            console.log('  Commands:');
            console.log();
            console.log('    register           expect a single registration json object on stdin');
            console.log('    sign               expect a single sign json object on stdin');
            console.log('    confirm            expect a single confirmation json object on stdin');
            console.log('    public-key         print the partner public key');
            console.log();
        })
        .action(function(root, command, options){
            if (Commands.indexOf(command) === -1) {
                this.help();
            }

            stdioCb(root, command, options, Stdin)
        });
};

CommandLine.prototype._parse = function(argv)
{
    program.parse(argv);

    if (program.args.length < 2) {
        program.help();
    }
};

CommandLine.prototype.parse = function (argv)
{
    var me = this;

    argv[1] = argv[1] = Object.keys(Pkg.bin).pop();

    if (process.stdin.isTTY) {
        me._parse(argv)
    } else {
        process.stdin.on('readable', function() {
            var chunk = this.read();

            if (chunk !== null) {
                Stdin += chunk;
            }
        });

        process.stdin.on('end', function() {
            me._parse(argv)
        });
    }
};