'use strict';

const cfg = require('./config');
const uuidv4 = require('uuid/v4');
const CorpusDB = require('./models/corpus-json');
const request = require('request');
const querystring = require('querystring');
const upload = require('./upload');
const getTreebanksList = require('./list-treebanks');
const ConfigError = require('./errors').ConfigError;

// --------------------------------------------------------------------------
// middleware
function get_treebank(req, res, next) {
  const treebank = req.query.treebank_id;
  if (!treebank)
    res.json({ error: 'Missing required argument: treebank_id' });

  req.treebank = treebank;
  next();
}

function get_token(req, res, next) {
  const token = req.query.token;
  if (!token)
    res.json({ error: 'Missing required argument: token' });

  req.session.token = token;
  next();
}

function is_logged_in(req, res, next) {
  if (!req.session.token || !req.session.username)
    res.json({ error: 'You must be logged in to view this page' });

  next();
}



// --------------------------------------------------------------------------
// helper funcs
function github_get(req, path, callback) {
  request.get({
    url: `https://api.github.com${path}`,
    headers: {
      'Authorization': `token ${req.session.token}`,
      'User-Agent': 'UD-Annotatrix/Express 4.0'
    }
  }, (err, _res, body) => {

    body = JSON.parse(body);
    callback(body);

  });
}

function github_post(req, path, payload, callback) {
  request.post({
    url: `https://api.github.com${path}`,
    json: payload,
    headers: {
      'Authorization': `token ${req.session.token}`,
      'User-Agent': 'UD-Annotatrix/Express 4.0'
    }
  }, (err, _res, body) => {

    body = JSON.parse(body);
    callback(body);

  });
}



// --------------------------------------------------------------------------
// urls
module.exports = app => {

  // ---------------------------
  // core
  app.get('/', (req, res) => {
    getTreebanksList((err, treebanks) => {
      res.render('index.ejs', {
        base: `${cfg.protocol}://${cfg.host}:${cfg.port}`,
        error: err,
        treebanks: treebanks
      });
    });
  });
  app.get('/help(.html)?', (req, res) => res.render('help.ejs'));
  app.get('/annotatrix(.html)?', (req, res) => {
    let treebank = req.query.treebank_id;
    if (!treebank) {

      treebank = uuidv4();
      res.redirect('/annotatrix?' + querystring.stringify({
        treebank_id: treebank,
      }));

    } else {

      req.session.treebank_id = treebank;
      res.render('annotatrix', {
        modalPath: 'modals',
        github_configured: !!cfg.github,
        username: req.session.username
      });

    }
  });



  // ---------------------------
  // AJAX
  app.get('/running', (req, res) => res.json({ status: 'running' }));

  app.post('/save', get_treebank, (req, res) => {

    CorpusDB(req.treebank).save(null, req.body, err => {
      if (err)
        res.json({ error: err.message });

      res.json({ success: true });
    });

  });

  app.get('/load', get_treebank, (req, res) => {

    CorpusDB(req.treebank).load((err, data) => {
      if (err)
        res.json({ error: err.message });

      res.json(data);
    });

  });

  app.post('/upload', (req, res) => {
    const treebank = uuidv4();

    if (req.files) {

      upload.fromFile(treebank, req.files.file, err => {
        if (err)
          return res.json({ error: err.message });

        res.redirect('/annotatrix?' + querystring.stringify({
          treebank_id: treebank,
        }));
      });

    } else if (req.body.url) {

      upload.fromGitHub(treebank, req.body.url, err => {
        if (err)
          return res.json({ error: err.message });

        res.redirect('/annotatrix?' + querystring.stringify({
          treebank_id: treebank,
        }));
      });

    } else {
      res.json({ error: 'Please provide a file or URL.' });
    }
  });



  // ---------------------------
  // user/account management
  app.get('/login', get_token, get_treebank, (req, res) => {
    github_get(req, '/user', body => {

      const username = body.login;

      cfg.users.update({
        username: username
      }, {
        token: req.session.token
      }, (err, data) => {
        if (err)
          throw err;

        console.log('/login changes to Users:', data.changes);
        req.session.username = username;
        res.redirect('/annotatrix?' + querystring.stringify({
          treebank_id: req.treebank
        }));

      });
    });
  });

  app.get('/logout', get_treebank, (req, res) => {

    cfg.users.remove({

      username: req.session.username,
      token: req.session.token

    }, (err, data) => {
      if (err)
        throw err;

      console.log('/logout changes to Users:', data.changes);
      req.session.username = null;
      req.session.token = null;
      res.redirect('/annotatrix?' + querystring.stringify({
        treebank_id: req.treebank
      }));

    });
  });

  app.get('/repos', is_logged_in, (req, res) => {
    github_get(req, '/user/repos', body => {

      res.json(body);

    });
  });

  app.get('/permissions', is_logged_in, (req, res) => {
    res.json({ error: 'Not implemented' });
  });

  app.get('/settings', get_treebank, /*is_logged_in,*/ (req, res) => {
    CorpusDB(req.treebank).load((err, data) => {
      if (err)
        throw err;

      res.render('settings.ejs', {
        treebank: req.treebank,
        username: req.session.username,
        meta: data.meta
      });
    });
  });
  app.post('/settings', get_treebank, /*is_logged_in,*/ (req, res) => {
    res.json(req.body);
  });


  // ---------------------------
  // GitHub OAuth
  app.get("/oauth/login", get_treebank, (req, res) => {

    if (!cfg.github) {
      new ConfigError('Unable to use GitHub OAuth without client secret');
      res.redirect('/annotatrix');
    }

    req.session.treebank = req.treebank;
    const url = 'https://github.com/login/oauth/authorize?'
      + querystring.stringify({
        client_id:  cfg.github.client_id,
        state:      cfg.github.state
      });

    res.redirect(url);
  });

  app.get("/oauth/callback", (req, res) => {

    if (!cfg.github) {
      new ConfigError('Unable to use GitHub OAuth without client secret');
      res.redirect('/annotatrix');
    }

    if (cfg.github.state !== req.query.state)
      return res.json({ error: 'Unable to authenticate: state mismatch' });

    if (!req.query.code)
      return res.json({ error: 'Unable to authenticate: no code provided' });

    const url = 'https://github.com/login/oauth/access_token?'
      + querystring.stringify({
        client_secret:  cfg.github.client_secret,
        client_id:      cfg.github.client_id,
        state:          cfg.github.state,
        code:           req.query.code
      });

    request.post(url, (err, _res, body) => {
      if (err)
        return res.json({ error: `Unable to authenticate: invalid GitHub server response` });

      const token = body.match(/access_token=([a-f0-9]{40})/);
      if (!token)
        return res.json({ error: `Unable to authenticate: invalid GitHub server response` });

      res.redirect('/login?' + querystring.stringify({
        token: token[1],
        treebank_id: req.session.treebank
      }));
    });
  });

};
