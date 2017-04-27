'use strict';

const
    path = require('path'),
    spawn = require('child_process').spawn,
    Client = require('./../lib/Client'),
    program = require('commander'),
    setup = require(path.resolve(__dirname, '../nea/main.js')).Setup,
    authenticate = require(path.resolve(__dirname, '../nea/main.js')).Authenticate,
    Service = path.resolve(__dirname, '../service/roamingService.js'),
    defaultURL = 'http://localhost:9090/roamingauth/';

class CommandLine
{
    /**
     * Manipulate default help
     * @param {string} help
     * @returns {string}
     * @private
     */
    static _help (help)
    {
        let parts = help.split('\n').filter(p => p.length).slice(0, -2);

        parts[0] = ['', parts[0]].join('\n');
        parts[1] = '\n  The command can be either:';

        return parts.join('\n') + '\n';
    }

    /**
     * Parse commandline arguments
     * @param {[]} argv
     * @returns {*}
     */
    static parse (argv)
    {
        /**
         * @property {function} program.usage
         * @property {function} program.command
         * @property {function} program.help
         * @property {function} program.helpInformation
         * @property {function} program.parse
         */
        program._defaultUrl = defaultURL;
        program
                .usage('roamingnea <command>')
                .description('\n');

        program
                .command('setup')
                .description('Sets up a band for roaming authentication')
                .action(() => setup(defaultURL).run());

        program
                .command('auth')
                .description('Starts authentication of a set-up band and returns the results')
                .action(() => authenticate(defaultURL).run());

        program
                .command('start')
                .description('Starts the Roaming Service')
                .action(() => {
                    spawn('node', [Service], {stdio: 'ignore', detached: true}).unref();
                    process.stdout.write('Roaming Service started');
                });

        program
                .command('stop')
                .description('Stops the Roaming Service')
                .action(() => {
                    (new Client(defaultURL)).get('shutdown').catch(() => process.exit(1));
                    process.stdout.write('Roaming Service stopped');
                });

        program
                .command('state')
                .description('Returns running state of Roaming Service')
                .action(() => {
                    (new Client(defaultURL)).get('ping').then(() => {
                        process.stdout.write('Roaming Service IS running');
                    }).catch(() => process.stdout.write('Roaming Service is NOT running'));
                });

        program.description(`\n  Roaming Service is listening on ${defaultURL}`);

        program.outputHelp = process.stdout.write.bind(process.stdout, CommandLine._help(program.helpInformation()));

        if (!argv.slice(2).length || !['state', 'stop', 'start', 'setup', 'auth'].includes(argv[2])) {
            return program.outputHelp();
        }

        program.parse(argv);
    }
}
module.exports = CommandLine;