'use strict';

const
    Client = require('./../lib/Client'),
    ServiceConnector = require('./ServiceConnector'),
    Setup = require('./Setup'),
    ProvisionStorage = require('./ProvisionStorage'),
    NeaHelpers = require('nea-helpers'),
    Nea = NeaHelpers.Nea,
    NeaConfig = NeaHelpers.NeaConfig;

let nea,
    config = new NeaConfig(__dirname + '/config.json'),
    storage = new ProvisionStorage(__dirname + '/provisions.json');

config.
    setName('roamingNea').
    setLogLevel(NeaHelpers.Const.LogLevel.NONE).
    useNymulator(true).                             // use nymulator (true) or physical band (false)
    setPort(9088).                                  // nymulator port usually 9088 / physical band 9089
    save();

nea = new Nea(config, storage);

module.exports = {
    Setup: (url) => new Setup(nea, new ServiceConnector(new Client(url)))
};
