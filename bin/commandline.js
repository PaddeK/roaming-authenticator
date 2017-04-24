'use strict';

const
    path = require('path'),
    program = require('commander'),
    setup = require(path.resolve(__dirname, '../nea/main.js')).Setup,
    defaultURL = 'http://127.0.0.1:9090/roamingauth/';

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

        return parts.join('\n');
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
                .usage('roamingnea <command> [URL]')
                .description(
                    '\n  URL is optional and represents the base URL of the roaming authentication web service.' +
                    `\n  If not included it defaults to "${defaultURL}"` +
                    '\n '
                );

        program
                .command('setup')
                .description('Sets up a band for roaming authentication')
                .action((args, cmd) => setup((cmd ? args : null) || (cmd||args).parent._defaultUrl).run());

        program
                .command('auth')
                .description('Starts authentication of a set-up band and returns the results')
                .action(url => console.log(a));

        program.outputHelp = process.stdout.write.bind(process.stdout, CommandLine._help(program.helpInformation()));

        if (!argv.slice(2).length) {
            return program.help(CommandLine._help);
        }

        program.parse(argv);
    }
}
module.exports = CommandLine;