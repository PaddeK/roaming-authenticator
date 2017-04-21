'use strict';

const
    Database = require('better-sqlite3'),
    fs = require('fs'),
    db = new Database(__dirname + '/nymiroaming.db'),
    sql = fs.readFileSync(__dirname + '/nymiroaming.sql', 'utf8');

sql.split(';').slice(0, -1).forEach(sql => db.prepare(sql).run());