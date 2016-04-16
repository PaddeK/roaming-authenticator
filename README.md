# roaming-authenticator

  An illustration of how one might write a roaming authenticator for Nymi Bands


## Installation

    $ npm install -g nymi-roaming-authenticator


## Usage

Show available commands and general help

    $ roaming-authenticator -h

        Usage: roaming-authenticator [options] [command]


        Commands:

        fresh [options] <root>            Initialise the application in <root> directory
        server [options] <root>           Run as server and serve the application in <root> directory
        stdio [options] <root> <command>  Issues <command> directly for the application in <root> directory

        Simplistic demonstration of a roaming authentication server that works with the Nymi JSON api.

        Options:

        -h, --help     output usage information
        -V, --version  output the version number

Show help for a specific command for example: `fresh`

    $ roaming-authenticator fresh -h

        Usage: fresh [options] <root>

        Initialise the application in <root> directory

        Options:

        -h, --help      output usage information
        --addr  <addr>  Address on which to listen for websocket connections     default: 127.0.0.1:9999.
        --log   <file>  The log file to append to                                default: <root>/roaming-authenticator.log.
        --certs <dir>   The directory containing the service TLS certs           default: <root>/certs.
