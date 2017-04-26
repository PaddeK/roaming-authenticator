# roaming-authenticator

  An illustration of how one might write a roaming authenticator for Nymi Bands
  
  **Note: _This is only for the old Nymi SDK 3.x_**

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


# nymi-roaming-authenticator
NodeJs port of [RoamingNEASample](https://github.com/Nymi/SampleApps/tree/master/Java/RoamingNEASample) and [RoamingService](https://github.com/Nymi/SampleApps/tree/master/Java/RoamingService).

Please refer to the official [Nymi Github](https://github.com/Nymi/JSON-API) or [SDK Documentation](https://downloads.nymi.com/sdkDoc/latest/index.html) for details.
  
## Support
All Platforms supported by the Nymi SDK 4.1 should be supported by this module.

Tested on Windows 7 64bit, macOS Sierra 10.12.2, macOS Sierra 10.12.3 and macOS Sierra 10.12.4.

##### Apple Mac OS
 - OS X Yosemite (10.10)
 - OS X El Capitan (10.11)
 - macOS Sierra (10.12.2 or later)
 
##### Microsoft Windows 
 - Windows 10, 8.1, 7 
 - 64bit only
  
## Install
For global installation
```
npm i nymi-roaming-authenticator -g
```

## Usage
After installation simply start the app with
```
npm start
```

### License

See LICENSE file.