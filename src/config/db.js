'use strict';

const { Pool } = require('pg');

const connectionString = process.env.PG_CONNECTION_STRING;

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
    })
  : new Pool({
      host:     process.env.PGHOST     || 'localhost',
      port:     Number(process.env.PGPORT) || 5432,
      user:     process.env.PGUSER     || 'postgres',
      password: process.env.PGPASSWORD || '',
      database: process.env.PGDATABASE || 'mgmotors',
      max: 10,
    });

module.exports = pool;
