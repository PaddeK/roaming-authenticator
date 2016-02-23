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
	"crypto/ecdsa"
	"crypto/elliptic"
	"encoding/json"
	"github.com/docopt/docopt-go"
	"io/ioutil"
	"path/filepath"
)

var config Configuration

var users map[string]*User

func loadConfig(arguments map[string]interface{}) {
	appRoot := arguments["<root>"].(string)
	configFilename := filepath.Join(appRoot, "config.json")
	configJson, err := ioutil.ReadFile(configFilename)
	if nil != err {
		panic("could not read: " + configFilename)
	}
	err = json.Unmarshal(configJson, &config)
	if nil != err {
		panic("could not parse: " + configFilename)
	}

	config.privateKey = new(ecdsa.PrivateKey)
	config.privateKey.Curve = elliptic.P256()
	config.privateKey.D = config.PKeyD
	config.privateKey.X = config.PKeyX
	config.privateKey.Y = config.PKeyY

	usersJson, err := ioutil.ReadFile(config.UsersFileName)
	if nil != err {
		panic("could not read: " + config.UsersFileName)
	}
	err = json.Unmarshal(usersJson, &users)
	if nil != err {
		panic("could not parse: " + config.UsersFileName)
	}
}

func main() {
	arguments, _ := docopt.Parse(usage, nil, true, "roaming-authenticator v0.1", false)

	users = make(map[string]*User)

	if arguments["fresh"].(bool) {
		runFresh(arguments)
	} else {
		check(arguments)
		loadConfig(arguments)
		setupLog(arguments)

		for k := range arguments {
			Debug.Printf("    %18s %v\n", k, arguments[k])
		}

		if arguments["server"].(bool) {
			runServer(arguments)
		} else if arguments["stdio"].(bool) {
			runStdio(arguments)
		}
		Info.Printf("Terminating")
	}
}
