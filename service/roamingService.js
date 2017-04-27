'use strict';

const
    NeaHelpers = require('nea-helpers'),
    RoamingAuth = NeaHelpers.RoamingAuth,
    UserModel = require('./UserModel'),
    Authorize = require('./Authorize'),
    NonceModel = require('./NonceModel'),
    Server = require('./../lib/Server'),
    fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    Database = path.resolve(__dirname, '../database/nymiroaming.db'),
    PemFile = path.resolve(__dirname, './roaming.pem');

(!fs.existsSync(PemFile) ? RoamingAuth.generatePem(PemFile, Infinity, 'roamingauth') : Promise.resolve()).then(() => {
    let server = new Server(),
        respond = (req, res, data) => res.send({request: req.body, response: data, successful: true}),
        error = (req, res, error) => res.send({response: `error: ${error}`, successful: false}),
        router = server.router('roamingauth');

    router.get('shutdown', (req, res) => !res.send({successful: true}) && setTimeout(() => process.exit(), 1000));
    router.get('ping', (req, res) => res.send({successful: true}));

    router.get('provision/getpubkey', (req, res) => {
        return respond(req, res, {partnerPublicKey: RoamingAuth.getPublicKey(PemFile)});
    });

    router.post('provision/newuser', (req, res) => {
        let um = new UserModel(Database),
            request = req.body.request;

        if (request !== undefined) {
            if (request.nbPublicKeyID === undefined) {
                return error(req, res, 'Request field "nbPublicKeyID" missing"');
            }

            if (request.nbPublicKey === undefined) {
                return error(req, res, 'Request field "nbPublicKey" missing"');
            }

            if (request.userID === undefined) {
                return error(req, res, 'Request field "userID" missing"');
            }

            if (um.getUserIDFromKeyID(request.nbPublicKeyID) !== '') {
                return error(req, res, `User with Key ID ${request.nbPublicKeyID} already exists`);
            }

            if (um.createNewUser(request.userID, request.nbPublicKey, request.nbPublicKeyID)) {
                return respond(req, res, `User ${request.userID} successfully added`);
            }

            return error(req, res, 'Failed to create new user');
        }

        return error(req, res, 'Request field missing');
    });

    router.post('sign', (req, res) => {
        let request = req.body.request;

        if (request !== undefined) {
            if (request.nymibandNonce === undefined) {
                return error(req, res, 'Missing nymibandNonce field');
            }

            if (request.exchange === undefined) {
                return error(req, res, 'Missing exchange field');
            }

            let nm = new NonceModel(Database),
                serverNonce = crypto.randomBytes(32).toString('hex'),
                hashSig = RoamingAuth.sign(PemFile, request.nymibandNonce + serverNonce);

            if (!nm.saveNonce(request.exchange, serverNonce)) {
                return error(req, res, 'Failed to save server nonce');
            }

            return respond(req, res, {
                serverSignature: hashSig,
                serverNonce: serverNonce,
                partnerPublicKey: RoamingAuth.getPublicKey(PemFile)
            });
        }

        return error(req, res, 'Request field missing');
    });

    router.post('auth', (req, res) => {
        let request = req.body.request;

        if (request !== undefined) {
            if (request.nbPublicKeyID === undefined) {
                return error(req, res, 'Request field "nbPublicKeyID" missing');
            }

            if (request.signedNonces === undefined) {
                return error(req, res, 'Request field "signedNonces" missing');
            }

            if (request.exchange === undefined) {
                return error(req, res, 'Request field "exchange" missing');
            }

            let serverNonce, userId,
                um = new UserModel(Database),
                nm = new NonceModel(Database),
                nbPublicKey = um.getUserKeyFromKeyID(request.nbPublicKeyID);

            if (nbPublicKey.length === 0) {
                return error(req, res, `User with Key ID ${request.nbPublicKeyID} not found`);
            }

            serverNonce = nm.getNonce(request.exchange);

            if (serverNonce.length === 0) {
                return error(req, res, `Could not find saved nonce for exchange ${request.exchange}`);
            }

            if (RoamingAuth.verify(serverNonce, request.signedNonces, nbPublicKey)) {
                if (!nm.deleteNonceByExchange(request.exchange)) {
                    process.stderr.write(
                        'WARNING: Unable to remove used nonce from database. It should clean up on its own shortly'
                    );
                }

                userId = um.getUserIDFromKeyID(request.nbPublicKeyID);

                Authorize.user(userId);

                return respond(req, res, {userId});
            }

            if (!nm.deleteNonceByExchange(request.exchange)) {
                process.stderr.write(
                    'WARNING: Unable to remove used nonce from database. It should clean up on its own shortly'
                );
            }

            return error(
                req,
                res,
                `Signature verification failed so user with keyid ${request.nbPublicKeyID} is not authenticated`
            );
        }

        return error(req, res, 'Request field missing');
    });

    server.listen(9090, '127.0.0.1', () => process.stdout.write('Listening on http://localhost:9090'));
}).catch(err => process.stderr.write(err) && process.exit(1));
