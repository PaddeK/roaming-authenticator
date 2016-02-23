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
	"io/ioutil"
	"math/big"
	"time"
)

func doRegister(decoder *json.Decoder) (respJson []byte) {
	Debug.Println("register")

	var resp RegistrationResponse

	var req RegistrationRequest
	err := decoder.Decode(&req)
	if err != nil {
		resp.Okay = false
		resp.ErrorMsg = "failed to parse register request"
		respJson, _ = json.MarshalIndent(resp, "", "  ")
		Info.Println("failed request:", resp.ErrorMsg)
		return
	}

	now := time.Now().Format(time.RFC3339)

	Debug.Println("  VerificationKeyId:", req.VerificationKeyId)
	Debug.Println("  VerificationKey  :", req.VerificationKey)
	Debug.Println("  UserData.Name    :", req.UserData.Name)
	Debug.Println("  now              :", now)

	if len(req.VerificationKeyId) != 32 {
		resp.Okay = false
		resp.ErrorMsg = fmt.Sprintf("verification-key-id has incorrect length of %d.", len(req.VerificationKeyId))
		respJson, _ = json.MarshalIndent(resp, "", "  ")
		Info.Println("failed request:", resp.ErrorMsg)
		return
	}
	if len(req.VerificationKey) != 128 {
		resp.Okay = false
		resp.ErrorMsg = fmt.Sprintf("verification-key has incorrect length of %d.", len(req.VerificationKey))
		respJson, _ = json.MarshalIndent(resp, "", "  ")
		Info.Println("failed request:", resp.ErrorMsg)
		return
	}

	var user = new(User)

	user.VerificationKeyId = new(big.Int)
	user.VerificationKeyId.SetString(req.VerificationKeyId, 16)
	user.VerificationKey = new(big.Int)
	user.VerificationKey.SetString(req.VerificationKey, 16)
	user.RegisteredAt = now
	user.LastSignedAt = now
	user.Count = 0
	user.Data.Name = req.UserData.Name

	users[req.VerificationKeyId] = user

	userJson, err := json.MarshalIndent(users, "", "  ")
	if err != nil {
		panic("failed to marshal users to JSON")
	}

	// write the updated users
	err = ioutil.WriteFile(config.UsersFileName, userJson, 0600)
	if err != nil {
		panic("failed to write users to: " + config.UsersFileName)
	}

	resp.Okay = true
	respJson, _ = json.MarshalIndent(resp, "", "  ")
	return
}
