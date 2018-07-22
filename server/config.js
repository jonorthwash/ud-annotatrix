'use strict';

const mkdirp = require('mkdirp');
const errors = require('./errors');
const crypto = require('crypto');

require('dotenv').config();

const port = process.env.ANNOTATRIX_PORT
  || process.env.PORT
  || 5316;
const host = process.env.ANNOTATRIX_HOST
  || process.env.HOST
  || 'localhost';
const protocol = process.env.ANNOTATRIX_PROTOCOL
  || process.env.PROTOCOL
  || 'http';
const corpora_path = process.env.ANNOTATRIX_CORPORA_PATH
  || process.env.CORPORA_PATH
  || process.env.PATH_TO_CORPORA
  || 'corpora';
const secret = process.env.ANNOTATRIX_SECRET
  || process.env.SECRET
  || 'dev secret';
const environment = process.env.ANNOTATRIX_ENV
  || process.env.NODE_ENV
  || 'development';

let github = {
  client_id: process.env.ANNOTATRIX_GH_CLIENT_ID
    || process.env.GH_CLIENT_ID
    || '298b7a22eb8bc53567d1', // keggsmurph21 'UD-Annotatrix test 2'
  client_secret: process.env.ANNOTATRIX_GH_CLIENT_SECRET
    || process.env.GH_CLIENT_SECRET,
  login_uri: `${protocol}://${host}:${port}/oauth/login`,
  callback_uri: `${protocol}://${host}:${port}/oauth/callback`,
  state: crypto.randomBytes(8).toString('hex')
};

if (!github.client_secret)
  throw new errors.ConfigError('Please provide ANNOTATRIX_GH_CLIENT_SECRET');

mkdirp(corpora_path);

module.exports = {
  port,
  host,
  protocol,
  corpora_path,
  secret,
  environment,
  github
};
