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
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"golang.org/x/crypto/sha3"
)

// Given a Nymi's nonce, will generate a server nonce and appropriately sign both values.
func doSign(decoder *json.Decoder) (respJson []byte) {
	var resp SignResponse

	Debug.Println("sign")

	var req SignRequest
	err := decoder.Decode(&req)
	if err != nil {
		resp.Okay = false
		resp.ErrorMsg = "failed to parse sign request"
		respJson, _ = json.MarshalIndent(resp, "", "  ")
		Info.Println("failed request:", resp.ErrorMsg)
		return
	}

	Debug.Println("sign nonce:", req.NymiBandNonce)

	advNonce, err := hex.DecodeString(req.NymiBandNonce)
	if len(advNonce) != 16 {
		resp.Okay = false
		resp.ErrorMsg = fmt.Sprintf("nonce has incorrect length of %d, must be 16 bytes.", len(advNonce))
		respJson, _ = json.MarshalIndent(resp, "", "  ")
		Info.Println("failed request:", resp.ErrorMsg)
		return
	}

	//serverNonce, rawSig := FromOldGSignServer(advNonce, config.privateKey)

	var randomBytes [16]byte
	_, err = rand.Read(randomBytes[:])
	if nil != err {
		resp.Okay = false
		resp.ErrorMsg = "internal error"
		respJson, _ = json.MarshalIndent(resp, "", "  ")
		Info.Println("failed request:", resp.ErrorMsg)
		return
	}

	serverNonce := make([]byte, 32)
	sha3.ShakeSum256(serverNonce, randomBytes[:])

	// Need to sign the concatenation advNonce || serverNonce. To do so using Go ECDSA library,
	// first compute a SHA256 hash of the combined message.
	combinedMessage := make([]byte, 16+32)
	copy(combinedMessage[:16], advNonce)
	copy(combinedMessage[16:], serverNonce)

	ecdsaInputHash := sha256.Sum256(combinedMessage)

	// Compute the signature and convert it to a 64 byte long array.
	r, s, err := ecdsa.Sign(rand.Reader, config.privateKey, ecdsaInputHash[:])
	if err != nil {
		resp.Okay = false
		resp.ErrorMsg = "failed to sign"
		respJson, _ = json.MarshalIndent(resp, "", "  ")
		Info.Println("failed request:", resp.ErrorMsg)
		return
	}

	var rawSig [64]byte
	copy(rawSig[:32], r.Bytes())
	copy(rawSig[32:], s.Bytes())

	resp.Okay = true
	resp.NymiBandTID = req.NymiBandTID
	resp.NymiBandNonce = hex.EncodeToString(advNonce)
	resp.ServerNonce = hex.EncodeToString(serverNonce)
	resp.ServerSignature = hex.EncodeToString(rawSig[:])
	resp.PublicKey = config.PublicKey

	respJson, _ = json.MarshalIndent(resp, "", "  ")

	fmt.Println(string(respJson))
	return
}
