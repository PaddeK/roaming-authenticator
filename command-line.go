/*
Copyright 2016 Nymi Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package main

import (
	"log"
	"os"
	"path/filepath"
)

var usage = `roaming-authenticator: simplistic demonstration of a roaming authentication server that works with the Nymi JSON api

    Usage:
      roaming-authenticator fresh    <root> [--addr=<addr>] [--log=<file>] [--certs=<dir>]
      roaming-authenticator server   <root> [--verbose | --be-very-verbose] [--multi-log]
      roaming-authenticator stdio    <root> ( register | sign | confirm | public-key ) [--verbose | --be-very-verbose] [--multi-log]
      roaming-authenticator          (-h | --help)
      roaming-authenticator          --version

    Options:
      <root>                         Root directory of the application, use 'fresh' command to initialise.
      --addr=<addr>                  Address on which to listen for websocket connections [default: 127.0.0.1:9999].
      --log=<file>                   The log file to append to [default: <root>/roaming-authenticator.log].
      --certs=<dir>                  The directory containing the service TLS certs [default: <root>/certs].

			register                       expect a single registration json object on stdin
			sign                           expect a single sign json object on stdin
			confirm                        expect a single confirmation json object on stdin
			public-key                     print the partner public key

      --verbose                      Be verbose.
      --be-very-verbose              Be very verbose.
      --multi-log                    Log to both the log file and stdout

      --version                      Show version.
      -h --help                      Show this information.`

func check(arguments map[string]interface{}) {
	// make sure app points at a directory
	appRoot := arguments["<root>"].(string)
	root, err := os.Open(appRoot)
	if err != nil {
		log.Fatalln("Problem in app root:", err)
	}
	defer root.Close()

	fi, err := root.Stat()
	if err != nil {
		log.Fatalln("Problem in app root:", appRoot, err)
	}
	if !fi.Mode().IsDir() {
		log.Fatalln("App root is not a directory:", appRoot)
	}

	// make sure there's a configuration file
	configFilename := filepath.Join(appRoot, "config.json")
	config, err := os.Open(configFilename)
	if err != nil {
		log.Fatalln("Problem in app config:", err)
	}
	defer config.Close()

	fi, err = config.Stat()
	if err != nil {
		log.Fatalln("Problem in app config:", configFilename, err)
	}
	if !fi.Mode().IsRegular() {
		log.Fatalln("App config.json is not a regular file:", configFilename)
	}
}
