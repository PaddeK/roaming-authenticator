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
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
)

// Convenience method to allow printing the partner public key in hex format
func publicKeyToHexString(partnerSk *ecdsa.PrivateKey) (hexVal string) {
	combinedBytes := make([]byte, 64)
	copy(combinedBytes[:32], partnerSk.PublicKey.X.Bytes())
	copy(combinedBytes[32:], partnerSk.PublicKey.Y.Bytes())
	hexVal = hex.EncodeToString(combinedBytes)
	return
}

func runFresh(arguments map[string]interface{}) {
	fmt.Println("run fresh")

	// make sure app points at a directory, if necessary create the directory
	appRoot := arguments["<root>"].(string)
	root, err := os.Open(appRoot)
	if err != nil {
		// we have to create the directory (and it's parents)
		os.MkdirAll(appRoot, 0777)
		root, err = os.Open(appRoot)
		if err != nil {
			panic("cannot open the root directory we just created: " + appRoot)
		}
	}
	defer root.Close()

	// make sure the appRoot is a directory
	fi, err := root.Stat()
	if err != nil {
		panic("Problem in app root: " + appRoot)
	}
	if !fi.Mode().IsDir() {
		panic("App root is not a directory: " + appRoot)
	}

	// check if there's already a config.json file, if there is then refuse to proceed, otherwise create it
	configFilename := filepath.Join(appRoot, "config.json")
	configFile, err := os.Open(configFilename)
	if err == nil {
		configFile.Close()
		panic("root is already configured " + appRoot)
	}

	// logging configuration
	if "<root>/roaming-authenticator.log" == arguments["--log"] {
		config.Log, err = filepath.Abs(filepath.Join(appRoot, "roaming-authenticator.log"))
		if nil != err {
			panic("could not get absolute path for: " + filepath.Join(appRoot, "roaming-authenticator.log"))
		}
	} else {
		config.Log, err = filepath.Abs(arguments["--log"].(string))
		if nil != err {
			panic("could not get absolute path for: " + arguments["--log"].(string))
		}
	}

	// service configuration
	config.ServiceAddr = arguments["--addr"].(string)
	config.UsersFileName, err = filepath.Abs(filepath.Join(appRoot, "users.json"))
	if nil != err {
		panic("could not obtain absolute path: " + filepath.Join(appRoot, "users.json"))
	}

	if "<root>/certs" == arguments["--certs"].(string) {
		config.Certs, err = filepath.Abs(filepath.Join(appRoot, "certs"))
		if nil != err {
			panic("could not get absolute path for: " + filepath.Join(appRoot, "certs"))
		}
	} else {
		config.Certs, err = filepath.Abs(arguments["--certs"].(string))
		if nil != err {
			panic("could not get absolute path for: " + arguments["--certs"].(string))
		}
	}

	// generate and write the keys
	keys, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		panic("failed to generate keys")
	}

	config.PKeyD = keys.D
	config.PKeyX = keys.X
	config.PKeyY = keys.Y
	config.PublicKey = publicKeyToHexString(keys)

	jsonstr, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		panic("failed to marshal the configuration")
	}

	// write the configuration
	err = ioutil.WriteFile(configFilename, jsonstr, 0600)
	if err != nil {
		panic("failed to write configuration to: " + configFilename)
	}

	// write an empty users.json
	jsonstr, err = json.MarshalIndent(users, "", "  ")
	if err != nil {
		panic("failed to marshal the configuration")
	}

	// write the configuration
	err = ioutil.WriteFile(config.UsersFileName, jsonstr, 0600)
	if err != nil {
		panic("failed to write to: " + config.UsersFileName)
	}

}
