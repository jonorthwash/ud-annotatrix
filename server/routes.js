'use strict';

const cfg = require('./config');
const errors = require('./errors');
const uuidv4 = require('uuid/v4');
const crypto = require('crypto');
const CorpusDB = require('./db');
const request = require('request');

// middleware for annotatrix
function get_treebank(req, res, next) {
  const treebank = req.query.treebank_id;
  if (!treebank)
    res.json({ error: 'Missing required argument: treebank_id' });

  req.treebank = treebank;
  next();
}

/*
// github oauth handling
cfg.github.oauth.on('error', err => {
  console.error('GitHub-OAuth error:', err);
});

cfg.github.oauth.on('token', (token, res) => {
  console.log('token!', token);
  res.end();
})
*/

// http endpoints
module.exports = app => {

  app.get('/annotatrix', (req, res) => {
    let treebank = req.query.treebank_id;
    if (!treebank) {
      treebank = uuidv4();
      res.redirect(`/annotatrix?treebank_id=${treebank}`);
    } else {
      res.render('annotatrix');
    }
  });

  app.post('/save', get_treebank, (req, res) => {
    const state = req.body;

    new CorpusDB(req.treebank);
    res.json({ success: true });

  });

  app.get('/load', get_treebank, (req, res) => {

  });

  app.post('/upload', get_treebank, (req, res) => {

  });

  app.post('/logout', get_treebank, (req, res) => {

  });

  app.get('/running', (req, res) => {
    res.json({ status: 'running' });
  });


  app.post("/oauth/login", get_treebank, function(req, res){
    console.log("started oauth");

    const url = 'http://github.com/login/oauth/authorize'
      + `?client_id=${cfg.github.client_id}`
      + `&redirect_uri=${cfg.github.callback_uri}`
      + `&state=${get_state()}`;

    request.get(url);
    res.end();
  });

  app.get("/oauth/callback", function(req, res){
    console.log("received callback");
    console.log(req.body);
  });

  app.get('/', (req, res) => {
    res.render('index.ejs');
  });

};

function get_state() {
  return crypto.randomBytes(8).toString('hex');
}

/*
function login(req, resp) {
  var u = 'https://github.com/login/oauth/authorize'
      + '?client_id=' + opts.githubClient
      + (opts.scope ? '&scope=' + opts.scope : '')
      + '&redirect_uri=' + redirectURI
      + '&state=' + state
      ;
  resp.statusCode = 302
  resp.setHeader('location', u)
  resp.end()
}

function callback(req, resp, cb) {
  var query = url.parse(req.url, true).query
  var code = query.code
  if (!code) return emitter.emit('error', {error: 'missing oauth code'}, resp)
  var u = 'https://github.com/login/oauth/access_token'
     + '?client_id=' + opts.githubClient
     + '&client_secret=' + opts.githubSecret
     + '&code=' + code
     + '&state=' + state
     ;
  request.get({url:u, json: true}, function (err, tokenResp, body) {
    if (err) {
      if (cb) {
        err.body = body
        err.tokenResp = tokenResp
        return cb(err)
      }
      return emitter.emit('error', body, err, resp, tokenResp, req)
    }
    if (cb) {
      cb(null, body)
    }
    emitter.emit('token', body, resp, tokenResp, req)
  })
}

*/
