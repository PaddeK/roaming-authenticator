#!/usr/bin/env node
'use strict';

// module.exports = require('./lib/ra.js');

const
    Database = require('better-sqlite3'),
    fs = require('fs');

let db = new Database('./database/nymiroaming.db');
let sql = fs.readFileSync('./database/main_nonces.sql', 'utf8');

sql.split(';').slice(0, -1).map(query => query += ';').forEach(sql => db.prepare(sql).run());
