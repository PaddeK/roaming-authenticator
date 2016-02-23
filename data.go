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
	"math/big"
)

type Configuration struct {
	ServiceAddr   string   `json:"service-addr"`
	Log           string   `json:"log"`
	Certs         string   `json:"certs"`
	UsersFileName string   `json:"users"`
	PublicKey     string   `json:"public-key"`
	PKeyD         *big.Int `json:"D"`
	PKeyX         *big.Int `json:"X"`
	PKeyY         *big.Int `json:"Y"`

	privateKey *ecdsa.PrivateKey
}

type User struct {
	VerificationKeyId *big.Int `json:"verification-key-id"`
	VerificationKey   *big.Int `json:"verification-key"`
	RegisteredAt      string   `json:"registered-at"`
	LastSignedAt      string   `json:"last-signed-at"`
	Count             int      `json:"count"`
	Data              UserData `json:"data"`
}

type UserData struct {
	Name string `json:"name"`
}

type UserRegistrationData struct {
	Name string `json:"name"`
}

type PublicKeyResponse struct {
	Okay      bool   `json:"okay"`
	ErrorMsg  string `json:"error"`
	PublicKey string `json:"public-key"`
}

type RegistrationRequest struct {
	VerificationKeyId string               `json:"verification-key-id"`
	VerificationKey   string               `json:"verification-key"`
	UserData          UserRegistrationData `json:"user-data"`
}

type RegistrationResponse struct {
	Okay     bool   `json:"okay"`
	ErrorMsg string `json:"error"`
}

type SignRequest struct {
	NymiBandTID   int    `json:"tid"`
	NymiBandNonce string `json:"nymiband-nonce"`
}

type SignResponse struct {
	Okay            bool   `json:"okay"`
	ErrorMsg        string `json:"error"`
	NymiBandTID     int    `json:"tid"`
	NymiBandNonce   string `json:"nymiband-nonce"`
	ServerNonce     string `json:"server-nonce"`
	ServerSignature string `json:"server-signature"`
	PublicKey       string `json:"public-key"`
}

type ConfirmationRequest struct {
	NymiBandTID       int    `json:"tid"`
	ServerNonce       string `json:"server-nonce"`
	VerificationKeyId string `json:"verification-key-id"`
	NymiBandSignature string `json:"nymiband-signature"`
	ConfirmingNEA     string `json:"confirming-nea"`
}

type ConfirmationResponse struct {
	Okay          bool     `json:"okay"`
	ErrorMsg      string   `json:"error"`
	NymiBandTID   int      `json:"tid"`
	UserData      UserData `json:"user-data"`
	ConfirmingNEA string   `json:"confirming-nea"`
}
