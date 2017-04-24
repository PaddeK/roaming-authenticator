'use strict';

const
    NeaHelpers = require('nea-helpers'),
    RoamingAuth = NeaHelpers.RoamingAuth,
    Server = require('./../lib/server'),
    fs = require('fs'),
    PemFile = __dirname + '/roaming.pem',
    Database = require('better-sqlite3');

let db = new Database('./database/nymiroaming.db');

(!fs.existsSync(PemFile) ? RoamingAuth.generatePem(PemFile, Infinity, 'roamingauth') : Promise.resolve()).then(() => {
    let server = new Server(),
        success = (data) => (req, res) => res.send({request: req.body, response: data, successful: true}),
        router = server.router('roamingauth');

    router.get('shutdown', (req, res) => !res.send({successful: true}) && setTimeout(() => process.exit(), 1000));

    router.get('provision/getpubkey', success({partnerPublicKey: RoamingAuth.getPublicKey(PemFile)}));



    server.listen(9090, '127.0.0.1', () => process.stdout.write('Listening on http://localhost:9090'));
}).catch(err => process.stderr.write(err) && process.exit(1));
