'use strict';

const
    NeaHelpers = require('nea-helpers'),
    RoamingAuth = NeaHelpers.RoamingAuth,
    UserModel = require('./UserModel'),
    Server = require('./../lib/Server'),
    fs = require('fs'),
    path = require('path'),
    Database = path.resolve(__dirname, '../database/nymiroaming.db'),
    PemFile = path.resolve(__dirname, './roaming.pem');

(!fs.existsSync(PemFile) ? RoamingAuth.generatePem(PemFile, Infinity, 'roamingauth') : Promise.resolve()).then(() => {
    let server = new Server(),
        respond = (req, res, data, succ) => res.send({request: req.body, response: data, successful: succ}),
        error = (req, res, error) => res.send({response: `error: general error: ${error}`, successful: false}),
        success = (data) => (req, res) => respond(req, res, data, true),
        router = server.router('roamingauth');

    router.get('shutdown', (req, res) => !res.send({successful: true}) && setTimeout(() => process.exit(), 1000));

    router.get('provision/getpubkey', success({partnerPublicKey: RoamingAuth.getPublicKey(PemFile)}));

    router.post('provision/newuser', (req, res) => {
        let um = new UserModel(Database);

        if (um.getUserIDFromKeyID(req.body.nbPublicKeyID) !== '') {
            return error(req, res, `User with Key ID ${req.body.nbPublicKeyID} already exists`);
        }

        if (um.createNewUser(req.body.userID, req.body.nbPublicKey, req.body.nbPublicKeyID)) {
            return respond(req, res, `User ${req.body.userID} successfully added`, true);
        }

        return error(req, res, 'Failed to create new user');
    });



    server.listen(9090, '127.0.0.1', () => process.stdout.write('Listening on http://localhost:9090'));
}).catch(err => process.stderr.write(err) && process.exit(1));
