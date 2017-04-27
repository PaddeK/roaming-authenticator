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
For global installation (prefered).
```
npm i nymi-roaming-authenticator -g
```
Just remove -g for normal local installation.

## Usage
On a global installation just type
```
$ roamingnea
```
or for local installation type
```
$ npm start
```
to print the commandline usage information.
```
  Usage:  roamingnea <command>

  The command can be either:
    setup   Sets up a band for roaming authentication
    auth    Starts authentication of a set-up band and returns the results
    start   Starts the Roaming Service
    stop    Stops the Roaming Service
    state   Returns running state of Roaming Service

  Roaming Service is listening on http://localhost:9090/roamingauth/
```

### License

See LICENSE file.