'use strict';

const mkdirp = require('mkdirp');
const errors = require('./errors');
const crypto = require('crypto');

require('dotenv').config();

let cfg = {};

// basic app config
cfg.port = process.env.ANNOTATRIX_PORT
  || process.env.PORT
  || 5316;
cfg.host = process.env.ANNOTATRIX_HOST
  || process.env.HOST
  || 'localhost';
cfg.protocol = process.env.ANNOTATRIX_PROTOCOL
  || process.env.PROTOCOL
  || 'http';
cfg.corpora_path = process.env.ANNOTATRIX_CORPORA_PATH
  || process.env.CORPORA_PATH
  || process.env.PATH_TO_CORPORA
  || 'corpora';
cfg.secret = process.env.ANNOTATRIX_SECRET
  || process.env.SECRET
  || 'dev secret';
cfg.environment = process.env.ANNOTATRIX_ENV
  || process.env.NODE_ENV
  || 'development';

// oauth config
cfg.github = {
  client_id: process.env.ANNOTATRIX_GH_CLIENT_ID
    || process.env.GH_CLIENT_ID
    || '298b7a22eb8bc53567d1', // keggsmurph21 'UD-Annotatrix test 2'
  client_secret: process.env.ANNOTATRIX_GH_CLIENT_SECRET
    || process.env.GH_CLIENT_SECRET,
  login_uri: `${cfg.protocol}://${cfg.host}:${cfg.port}/oauth/login`,
  callback_uri: `${cfg.protocol}://${cfg.host}:${cfg.port}/oauth/callback`,
  state: crypto.randomBytes(8).toString('hex')
};

if (!cfg.github.client_secret) {
  new errors.ConfigError('Please provide ANNOTATRIX_GH_CLIENT_SECRET');
  cfg.github = null;
}

// database config
mkdirp(cfg.corpora_path);
cfg.users_db_path = process.env.ANNOTATRIX_USERS_DB_PATH
  || '.users';
cfg.users = require('./models/users')(cfg.users_db_path);

module.exports = cfg;
