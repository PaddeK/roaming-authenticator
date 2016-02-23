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
	"io"
	"io/ioutil"
	"log"
	"os"
)

var (
	Debug   *log.Logger
	Info    *log.Logger
	Warning *log.Logger
	Error   *log.Logger
	Fatal   *log.Logger
)

func setupLog(arguments map[string]interface{}) {
	file, err := os.OpenFile(config.Log, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0600)
	if err != nil {
		log.Fatalln("Failed to open log file:", err)
	}

	if arguments["--multi-log"].(bool) {
		multi := io.MultiWriter(file, os.Stderr)
		if arguments["--verbose"].(bool) {
			logInit(ioutil.Discard, multi, multi, multi, multi)
		} else if arguments["--be-very-verbose"].(bool) {
			logInit(multi, multi, multi, multi, multi)
		} else {
			logInit(ioutil.Discard, ioutil.Discard, multi, multi, multi)
		}
	} else {
		if arguments["--verbose"].(bool) {
			logInit(ioutil.Discard, file, file, file, file)
		} else if arguments["--be-very-verbose"].(bool) {
			logInit(file, file, file, file, file)
		} else {
			logInit(ioutil.Discard, ioutil.Discard, file, file, file)
		}
	}
}

func logInit(debugHandle io.Writer, infoHandle io.Writer, warningHandle io.Writer, errorHandle io.Writer, fatalHandle io.Writer) {
	Debug = log.New(debugHandle, "DEBUG: ", log.Ldate|log.Ltime|log.Lmicroseconds|log.Lshortfile)
	Info = log.New(infoHandle, "INFO:  ", log.Ldate|log.Ltime|log.Lmicroseconds|log.Lshortfile)
	Warning = log.New(warningHandle, "WARN:  ", log.Ldate|log.Ltime|log.Lmicroseconds|log.Lshortfile)
	Error = log.New(errorHandle, "ERROR: ", log.Ldate|log.Ltime|log.Lmicroseconds|log.Lshortfile)
	Fatal = log.New(fatalHandle, "FATAL: ", log.Ldate|log.Ltime|log.Lmicroseconds|log.Lshortfile)
}
