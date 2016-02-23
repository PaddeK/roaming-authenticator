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
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/big"
)

// The following function handles request to verify a signature produced by the Nymi
// as a response to a roaming authentication sign. Typically, this will be integrated
// into another single sign-on system as a plugin to securely identify the wearer of the band.
func doConfirm(decoder *json.Decoder) (respJson []byte) {
	Debug.Println("confirm")
	var resp ConfirmationResponse

	var req ConfirmationRequest
	err := decoder.Decode(&req)
	if err != nil {
		resp.Okay = false
		resp.ErrorMsg = "failed to parse confirmation request"
		respJson, _ = json.MarshalIndent(resp, "", "  ")
		Info.Println("failed request:", resp.ErrorMsg)
		return
	}

	resp.NymiBandTID = req.NymiBandTID

	serverNonce, err := hex.DecodeString(req.ServerNonce)
	if len(serverNonce) != 32 {
		resp.Okay = false
		resp.ErrorMsg = fmt.Sprintf("server-nonce has incorrect length of %d, must be 32 bytes.", len(serverNonce))
		respJson, _ = json.MarshalIndent(resp, "", "  ")
		Info.Println("failed request:", resp.ErrorMsg)
		return
	}

	signature, err := hex.DecodeString(req.NymiBandSignature)
	if len(signature) != 64 {
		resp.Okay = false
		resp.ErrorMsg = fmt.Sprintf("signature has incorrect length of %d, must be 64 bytes.", len(signature))
		respJson, _ = json.MarshalIndent(resp, "", "  ")
		Info.Println("failed request:", resp.ErrorMsg)
		return
	}

	user, ok := users[req.VerificationKeyId]
	if !ok {
		resp.Okay = false
		resp.ErrorMsg = "unknown verification-key-id."
		respJson, _ = json.MarshalIndent(resp, "", "  ")
		Info.Println("failed request:", resp.ErrorMsg)
		return
	}

	// The value of req.ConfirmingNEA should be checked here

	inputHash := sha256.Sum256(serverNonce)

	var pubkey ecdsa.PublicKey
	pubkey.Curve = elliptic.P256()
	vkBytes := user.VerificationKey.Bytes()
	pubkey.X = big.NewInt(0).SetBytes(vkBytes[0:32])
	pubkey.Y = big.NewInt(0).SetBytes(vkBytes[32:64])

	inr := big.NewInt(0).SetBytes(signature[0:32])
	ins := big.NewInt(0).SetBytes(signature[32:64])

	// Verify the signature
	verificationResult := ecdsa.Verify(&pubkey, inputHash[:], inr, ins)
	if verificationResult {
		resp.Okay = true
		resp.UserData = user.Data
		resp.ConfirmingNEA = req.ConfirmingNEA
	} else {
		resp.Okay = false
		resp.ErrorMsg = "failed to verify signature"
	}

	respJson, _ = json.MarshalIndent(resp, "", "  ")
	return
}
