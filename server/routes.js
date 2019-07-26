'use strict';

const logger = require('./logger');
const cfg = require('./config');
const uuidv4 = require('uuid/v4');
const CorpusDB = require('./models/corpus-json');
const axios = require('axios');
const querystring = require('querystring');
const upload = require('./upload');
const getTreebanksList = require('./list-treebanks');
const ConfigError = require('./errors').ConfigError;
const path = require('path');
const fs = require('fs');


// --------------------------------------------------------------------------
// middleware

function get_treebank(req, res, next) {
  logger.info("getting treebank");
  const treebank = req.query.treebank_id||req.session.treebank;
  // if (!treebank){ // setting response headers!
    // res.json({ error: 'Missing required argument: treebank_id' });
  // }

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

async function getdata(url) {
  try {
    const response = await axios.get(url);
  	const data = response.data;
  	// console.log(response.headers);
  	return data;
  } catch (error) {
    console.error(error.response.data.message);
  }
}

async function github(token, method, url, data) {
  const host  = "https://api.github.com";
  const query = {
    method: method,
    headers: {
      "Authorization": "token " + token,
      "User-Agent": "UD Annotatrix"
    },
     url: url.includes(host)?url:host+url,
     data: data
  };
  console.log("github", url);
  // logger.info("query", query);
  try {
    const response = await axios(query);
  	const data = response.data;
  	console.log(response.headers.status);
  	return data;
  } catch (error) { // https://gist.github.com/fgilio/230ccd514e9381fafa51608fcf137253
    // Error 😨
    logger.info(error);
    if (error.response) {
        /*
         * The request was made and the server responded with a
         * status code that falls out of the range of 2xx
         */
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        return error.response.data;
    } else if (error.request) {
        /*
         * The request was made but no response was received, `error.request`
         * is an instance of XMLHttpRequest in the browser and an instance
         * of http.ClientRequest in Node.js
         */
        console.log(error.request);
        return {"message": "No response received from Github"};
    } else {
        // Something happened in setting up the request and triggered an Error
        console.log('Error', error.message);
        return {"message": "Request issue with Github"};
    }
    // console.log(error);
  }
}

async function getrandomtext(){
  try {
    const data = await getdata("http://numbersapi.com/random/trivia");
    return ["commit " + data.split(' ')[0], data];
  } catch(error){
    console.log(error);
    return ["autocommit message", "nothing"];
  }
}

async function commit(token, owner, repo, branch, content, filename, message){
  logger.info("in commit function");
  try {
      const blob_obj = {
       "content": content,
       "encoding": "utf-8"
      };

      const git =  `/repos/${owner}/${repo}/git/`;
      const head_url = `${git}refs/heads/${branch}`;

      const head_data = await github(token, "get", head_url);
      logger.info(">>head", head_data);
      const com_data = await github(token, "get", head_data["object"]["url"]);
      logger.info(">>commit", com_data);
      const blob_data = await github(token, "post", `${git}blobs`, blob_obj);
      logger.info(">>blob", blob_data);
      const tree_data = await github(token, "get", com_data["tree"]["url"]);
      logger.info(">>tree", tree_data);
      const tree_obj = {
       "base_tree": tree_data["sha"],
       "tree": [
         {
           "path": filename,
           "mode": "100644",
           "type": "blob",
           "sha": blob_data["sha"]
         }
       ]
      };

      const newtree_data = await github(token, "post", `${git}trees`, tree_obj);
      logger.info(">>new tree", newtree_data);
      const newcom_obj = {
       "message": message,
       "committer": {
         "name": "UD Annotatrix", "email": "annotatrix@gmail.com",
       },
       "parents": [head_data["object"]["sha"]],
       "tree": newtree_data["sha"],
      };

      const newcom_data = await github(token, "post", `${git}commits`, newcom_obj);
      logger.info(">>new commit", newcom_data);
      const patch_obj = {
       "sha": newcom_data["sha"],
       "force": true
      };

      const newhead_data = await github(token, "patch", head_url, patch_obj);
      logger.info(">>new head", newhead_data);
      const sha = newhead_data["object"]["sha"];
      const commit_url = `https://github.com/${owner}/${repo}/commit/${sha}`;

      return({"url": commit_url});

 }  catch (e) {

     return({ error: 'Github commit error' });

 }

}
// --------------------------------------------------------------------------
// urls
module.exports = app => {

  // ---------------------------
  // core
  app.get('/index.html', (req, res) => {
    res.redirect('/');
  });
  app.get('/', (req, res) => {
    getTreebanksList((err, treebanks) => {
      res.render('index.ejs', {
        // base: `${cfg.protocol}://${cfg.host}:${cfg.port}`,
        // leave relative path instead absolute one
        // for correct urls when it works behind a frontend proxy
        base: '',
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
        username: req.session.username,
        path: path
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

  app.post('/delete', (req, res) => {
    if (req.body.hasOwnProperty("id")){
      const filepath = path.join(cfg.corpora_path, req.body.id+'.json');
        console.log("delete",  filepath, req.body.id);
        fs.unlink(filepath, (err) => {
          if (err) {
            return res.json({ error: err.message });
          }

          cfg.corpora.remove(req.body.id, (err, data) => {
            if (err){
              return res.json({ error: "Error with database" });
            }

            res.json({ success: true });
          });
        });

    }
  });

  app.get('/load', get_treebank, (req, res) => {
      logger.info("load corpus");
      cfg.corpora.query(req.treebank, (err, data) => {
        if (err){
          throw err;
        }
        console.log("db", data);
        let msg  = "";
        if (data){
            msg = data.pr_at? "PR": data.committed_at ? "commited": "fork";
        }
        res.set("git", msg)
        // to make the app more responsive
        res.sendFile(path.join(__dirname, "..", cfg.corpora_path, req.treebank+".json"));
      });
    // CorpusDB(req.treebank).load((err, data) => {
    //   if (err)
    //     res.json({ error: err.message });
    //
    //   res.json(data);
    //
    // });
  });

  app.post('/fork', is_logged_in, async (req, res) => {
   const treebank = uuidv4();
   const token = req.session.token;

   logger.info("fork item clicked");

   if (req.body.url) {
     const match = req.body.url.match(/^(https?:\/\/)?(github\.com|raw\.githubusercontent\.com)\/([\w\d]*)\/([^/]*)\/(tree\/|blob\/)?([^/]*)\/(.*)$/);

     if (!match) {
       res.json({"error": "URL does not match"})
     }

     const [ string, protocol, domain, owner, repo, blob_or_tree, branch, filepath ] = match;
     const filename = `${repo}__${branch}__${filepath.replace(/\//g, '__')}`;
     console.log("filename", filename);
     // const rawURL = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filepath}`;
     // console.log("raw url", rawURL);
     // const githubURL = `https://github.com/${owner}/${repo}/${branch}/${filepath}`;
     // console.log("git url", githubURL);
     // const repoURL = `https://github.com/${owner}/${repo}`;
     const fork_url = `/repos/${owner}/${repo}/forks`;
     logger.info("fork url", fork_url);
     const content_url = `/repos/${owner}/${repo}/contents/${filepath}`;
     logger.info("content url", content_url);
     const content_dir = content_url.substr(0, content_url.lastIndexOf("/"));
     logger.info("content dir url", content_dir);
     try {
        const dir_data = await github(token, "get", content_dir);
        const dir_data_filtered = dir_data.filter(x => x.path === filepath);
        if(dir_data_filtered){
          const file_info = dir_data_filtered.pop();
          logger.info("dir", file_info);
          const blob_url = file_info["git_url"];
          logger.info("blob", blob_url);
          const blob = await github(token, "get", blob_url);
          logger.info("size", blob["size"]);
          const content = Buffer.from(blob.content, blob["encoding"]).toString('utf8');

          const fork_data = await github(token, "post", fork_url);
          logger.info("fork data", fork_data);
          if (!fork_data){
            return res.json({ error: 'Github fork error' });
          }

          upload.fromContent(treebank, content, filename, err => {
            if (err) {
              return res.json({ error: err.message });
            }

            cfg.corpora.insert([owner, repo, branch, req.session.username, req.body.url,
              filepath, filepath, blob["size"], blob["sha"], treebank], (err, data) => {
              if (err){
                throw err;
              }

              if (req.body.hasOwnProperty("src") && req.body["src"] === "main"){
                res.json({ success: 'File is stored' });
              } else {
                res.redirect('/annotatrix?' + querystring.stringify({
                  treebank_id: treebank,
                }));
              }
            });

          });

        }
     }  catch (e) {
         return res.json({ error: 'Github fork error' });
     }
    } else {
      res.json({ error: 'Please provide a file or URL.' });
    }
  });

  app.post('/upload', (req, res) => {
    const treebank = uuidv4();

    if (req.files) {
      upload.fromFile(treebank, req.files.file, err => {
        if (err) {
          return res.json({ error: err.message });
        }
        if (req.body.hasOwnProperty("src") && req.body["src"] === "main"){
          res.json({ success: 'File is stored' });
        } else {
          res.redirect('/annotatrix?' + querystring.stringify({
            treebank_id: treebank,
          }));
        }

      });

    } else if (req.body.url) {

      upload.fromURL(treebank, req.body.url, err => {
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
  app.get('/login', get_token, get_treebank, async (req, res) => {
    logger.info("logging in");
    const token = req.session.token;
    try {
        const body = await github(token, "get", "/user");
        const username = body.login;

        cfg.users.update({
          username: username
        }, {
          token: token
        }, (err, data) => {
          if (err)
            throw err;

          console.log('/login changes to Users:', data.changes);
          req.session.username = username;
          // req.session.treebank = req.treebank;
          res.redirect('/annotatrix?' + querystring.stringify({
            treebank_id: req.treebank
          }));
        });

    } catch(error) {
        res.json({"error":"Github login error"});
    }
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

  app.get('/repos', is_logged_in, async (req, res) => {

    const result = await github(req.session.token, "get", "/user/repos");
    res.json(result);

  });

  app.get('/permissions', is_logged_in, (req, res) => {
      res.json({ error: 'Not implemented' });
  });

  app.post('/commit', is_logged_in, async (req, res) => {
    logger.info("commit item click");
    if (req.body.hasOwnProperty("corpus") && req.body.hasOwnProperty("message") ){
          // console.log(req.body.corpus);
          const treebank = req.query.treebank_id||req.session.treebank;
          cfg.corpora.query(treebank, (err, data) => {
            if (err){
              throw(err)
            }
            logger.info("data for commit", treebank, data);

            (async() => {

              const result  = await commit(req.session.token, data.username, data.repo, data.branch, req.body.corpus, data.filepath, req.body.message);

              if (result.hasOwnProperty("url")){
                cfg.corpora.update(treebank, "committed_at", (err, data) => {
                  if (err){
                    throw(err)
                  }
                });
              }
              return res.json(result);

            })();

            });

    } else {
      res.json({"error": "Error of retrieving corpus from browser"});
    }
  });

  app.post('/pullreq', get_treebank, is_logged_in, (req, res) => {
    const treebank = req.query.treebank_id||req.session.treebank;
    const token = req.session.token;
    cfg.corpora.query(treebank, (err, data) => {
      if (err){
        throw(err)
      }
      (async() => {
        const title =  req.body.hasOwnProperty("title") ?
          req.body.title : `Corpus update`;
        const content  =  req.body.hasOwnProperty("content") ?
          req.body.content : "Please pull this in!";

        const pr_obj = {
          "title": title,
          "body": content,
          "head": `${data.username}:${data.branch}`,
          "base": data.branch,
          "maintainer_can_modify": true,
          "draft": false
        };
        const git_url = `/repos/${data.owner}/${data.repo}/pulls`;
        const pr_data = await github(token, "post", git_url, pr_obj);
        // console.log(pr_data);

        if (pr_data.hasOwnProperty("html_url")){

          cfg.corpora.update(treebank, "pr_at", (err, data) => {
            if (err){
              throw(err)
            }

          });

          res.json({"url": pr_data.html_url});
        } else {

          res.json({"error": "Error with pull request", "data": pr_data})

        }

      })();

    });
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

  app.post('/fork', (req, res) => {
    res.json(req.body);
  });


  // ---------------------------
  // GitHub OAuth
  app.get("/oauth/login", get_treebank, (req, res) => {
    logger.info("logging in (OAuth)");
    console.log("oauth", req["session"]);
    if (!cfg.github) {
      new ConfigError('Unable to use GitHub OAuth without client secret');
      res.redirect('/annotatrix');
    }

    req.session.treebank = req.treebank;

    const url = 'https://github.com/login/oauth/authorize?'
      + querystring.stringify({
        client_id:  cfg.github.client_id,
        state:      cfg.github.state,
        // https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/
        scope: ['user', 'public_repo']
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

    axios.post(url)
      .catch(function (error) {
        return res.json({ error: `Unable to authenticate: invalid GitHub server response` });
      })
      .then(function (response) {
        const token = response.data.match(/access_token=([a-f0-9]{40})/);
        if (!token) {
          return res.json({ error: `Unable to authenticate: invalid GitHub server response` });
        }
        res.redirect('/login?' + querystring.stringify({
          token: token[1],
          treebank_id: req.session.treebank
        }));
    });
  });

};
