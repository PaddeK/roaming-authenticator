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
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
)

func runStdio(arguments map[string]interface{}) {
	Info.Printf("run stdio")

	decoder := json.NewDecoder(os.Stdin)

	switch {
	case arguments["register"].(bool):
		resp := doRegister(decoder)
		fmt.Println(string(resp))
	case arguments["sign"].(bool):
		resp := doSign(decoder)
		fmt.Println(string(resp))
	case arguments["confirm"].(bool):
		resp := doConfirm(decoder)
		fmt.Println(string(resp))
	case arguments["public-key"].(bool):
		fmt.Println(config.PublicKey)
	}
}

func runServer(arguments map[string]interface{}) {
	Info.Printf("run server")

	http.HandleFunc("/register", handleRegistration)
	http.HandleFunc("/sign", handleSign)
	http.HandleFunc("/confirm", handleConfirmation)
	http.HandleFunc("/public-key", handlePublicKey)

	certPem := filepath.Join(config.Certs, "cert.pem")
	keyPem := filepath.Join(config.Certs, "key.pem")
	if err := http.ListenAndServeTLS(config.ServiceAddr, certPem, keyPem, nil); err != nil {
		Fatal.Println("ListenAndServeTLS:", err)
		os.Exit(1)
	}
}

func handleRegistration(w http.ResponseWriter, req *http.Request) {
	Debug.Println("register")
	resp := doRegister(json.NewDecoder(req.Body))

	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Access-Control-Allow-Origin")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	w.Write(resp)
}

func handleSign(w http.ResponseWriter, req *http.Request) {
	Debug.Println("sign")
	resp := doSign(json.NewDecoder(req.Body))

	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Access-Control-Allow-Origin")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(resp)
}

func handleConfirmation(w http.ResponseWriter, req *http.Request) {
	Debug.Println("register")
	resp := doConfirm(json.NewDecoder(req.Body))

	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Access-Control-Allow-Origin")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(resp)
}

func handlePublicKey(w http.ResponseWriter, req *http.Request) {
	Debug.Println("public-key")

	var resp PublicKeyResponse
	resp.Okay = true
	resp.PublicKey = config.PublicKey
	respJson, _ := json.MarshalIndent(resp, "", "  ")

	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Access-Control-Allow-Origin")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(respJson)
}
