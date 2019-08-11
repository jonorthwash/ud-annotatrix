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

function get_user(req, res, next) {
  logger.debug("checking for user/token");
  // const token = req.query.token;
  // if (!token)
  //   res.json({ error: 'Missing required argument: token' });
  //
  // req.session.token = token;
  const token = req.session.token;
  const username = req.cookies.github;
  if (!token && username) {
    cfg.users.query({
      username: username,
      token: null
    }, (err, data) => {
      if (err) {
        throw err;
        }

        logger.debug(data, "users data");

        if (data && data.token) {
          logger.debug("token is in database");
          req.session.token = data.token;
          req.session.username = data.username;
        }
        next();
    });
  } else {
    next();
  }

}

// --------------------------------------------------------------------------
// helper funcs

async function getdata(url) {
  try {
    const response = await axios.get(url);
  	const data = response.data;
  	// logger.info(response.headers);
  	return data;
  } catch (error) {
    logger.error(error.response.data.message);
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
  logger.debug("github", method, url);
  // logger.info("query", query);
  try {
    const response = await axios(query);
  	const data = response.data;
  	logger.info("STATUS", response.headers.status);
  	return data;
  } catch (error) { // https://gist.github.com/fgilio/230ccd514e9381fafa51608fcf137253
    // Error 😨
	   logger.error("GITHUB ERROR");
    // logger.info(error);
    if (error.response) {
        /*
         * The request was made and the server responded with a
         * status code that falls out of the range of 2xx
         */
        logger.error(error.response.data);
        logger.error(error.response.status);
        logger.error(error.response.headers);
        return error.response.data;
    } else if (error.request) {
        /*
         * The request was made but no response was received, `error.request`
         * is an instance of XMLHttpRequest in the browser and an instance
         * of http.ClientRequest in Node.js
         */
        logger.error(error.request);
        return {"message": "No response received from Github"};
    } else {
        // Something happened in setting up the request and triggered an Error
        logger.error('Error', error.message);
        return {"message": "Request issue with Github"};
    }
    // logger.error(error);
  }
}

async function commit(token, owner, repo, branch, content, filename, message, filesha, treebank,userinfo){
  logger.info("in commit function");
  try {
      let sha, commit_url;
      const author = {
        "name": userinfo.realname, "email": userinfo.email,
      };
      const committer = {
        "name": "UD Annotatrix", "email": "annotatrix@gmail.com",
      };
      const filesize  = Buffer.byteLength(content, 'utf8');
      logger.info(filename, filesize);
      // if content file size is above 1 Mb one has to use low-level Tree API,
      // but, if possible, it is better to deal with simpler Contents API
      if (filesize < 1000000) {

        logger.debug("Commit via Contents API");

        const contents_com_data = {
          "message": message,
          "author": author,
          "committer": committer,
          "content": Buffer.from(content).toString('base64'),
          "sha": filesha
        }
        const contents_url =  `/repos/${owner}/${repo}/contents/${filename}`;
        const contents_data = await github(token, "put", contents_url, contents_com_data);
        logger.debug(contents_data, ">>contents");
        if (contents_data.hasOwnProperty("message")){
          return({"error": contents_data.message});
        }
        sha = contents_data["content"]["sha"];
        commit_url = contents_data["commit"]["html_url"];

      } else {

        logger.debug("Commit via Tree API");

        const blob_obj = {
         "content": content,
         "encoding": "utf-8"
        };

        const git =  `/repos/${owner}/${repo}/git/`;
        const head_url = `${git}refs/heads/${branch}`;

        const head_data = await github(token, "get", head_url);
        logger.debug(head_data, ">>head");
        const com_data = await github(token, "get", head_data["object"]["url"]);
        logger.debug(com_data, ">>commit");
        const blob_data = await github(token, "post", `${git}blobs`, blob_obj);
        logger.debug(blob_data, ">>blob");
        const tree_data = await github(token, "get", com_data["tree"]["url"]);
        logger.debug(tree_data, ">>tree");
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
        logger.debug(newtree_data, ">>new tree");
        const newcom_obj = {
         "message": message,
         "author": author,
         "committer": committer,
         "parents": [head_data["object"]["sha"]],
         "tree": newtree_data["sha"],
        };

        const newcom_data = await github(token, "post", `${git}commits`, newcom_obj);
        logger.debug(newcom_data, ">>new commit");
        const patch_obj = {
         "sha": newcom_data["sha"],
         "force": true
        };

        const newhead_data = await github(token, "patch", head_url, patch_obj);
        logger.debug(newhead_data, ">>new head");
        sha = newhead_data["object"]["sha"];
        commit_url = `https://github.com/${owner}/${repo}/commit/${sha}`;
        logger.debug(commit_url);

      }
      return({"url": commit_url, "sha": sha});

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
  app.get('/', get_user, (req, res) => {
    getTreebanksList((err, treebanks_from_files) => {

      cfg.corpora.all((err, treebanks_from_db) => {
        if (err){
          logger.error("Error with corpora database");
          throw err;
        }
        const treebanks_merged = [];

        treebanks_from_files.forEach(x => {
          let pushed = false;
          treebanks_from_db.forEach(y => {
            if (x.id === y.id) {
              treebanks_merged.push({ ...x, ...y });
              pushed = true;
            }
          });
          if (!pushed){
              treebanks_merged.push(x);
          }
        });

        // logger.debug(treebanks_merged, "treebanks listed for " + (req.session.username||"all") );

        res.render('index.ejs', {
          // base: `${cfg.protocol}://${cfg.host}:${cfg.port}`,
          // leave relative path instead absolute one
          // for correct urls when it works behind a frontend proxy
          base: '',
          error: err,
          treebanks: treebanks_merged,
          github: req.session.username,
        });

      });

    });
  });
  app.get('/help(.html)?', (req, res) => res.render('help.ejs'));
  app.get('/annotatrix(.html)?', get_user, (req, res) => {
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
        github_configured: !!cfg.github, // object or null
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
        logger.info("delete",  filepath, req.body.id);
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
        logger.info("This file in database" + (data ? ': ID is '+ data.id : " does not exist"));
        logger.debug(data, "data");
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

   if (!(req.session.hasOwnProperty("username") && req.session.username)){
     return res.json({ error: 'Session info has no username' });
   }

   logger.debug("prepare fork by", req.session.username);

   logger.info("fork item clicked");

   if (req.body.url) {
     const match = req.body.url.match(/^(https?:\/\/)?(github\.com|raw\.githubusercontent\.com)\/([\w\d]*)\/([^/]*)\/(tree\/|blob\/)?([^/]*)\/(.*)$/);

     if (!match) {
       res.json({"error": "URL does not match"})
     }

     const [ string, protocol, domain, owner, repo, blob_or_tree, branch, filepath ] = match;
     const filename = `${repo}__${branch}__${filepath.replace(/\//g, '__')}`;
     logger.debug("filename", filename);
     // const rawURL = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filepath}`;
     // logger.debug("raw url", rawURL);
     // const githubURL = `https://github.com/${owner}/${repo}/${branch}/${filepath}`;
     // logger.debug("git url", githubURL);
     // const repoURL = `https://github.com/${owner}/${repo}`;
     const fork_url = `/repos/${owner}/${repo}/forks`;
     logger.info("fork url", fork_url);

     let isForked = false;
     const forklist_data = await github(token, "get", fork_url);
     logger.debug(forklist_data, "forklist data");

     for (let fork_num in forklist_data) {
       logger.debug(fork_num);
       logger.debug(forklist_data[fork_num]);

       const new_fork_url = `https://api.github.com/repos/${req.session.username}/${repo}`;
       if (forklist_data[fork_num]["url"] === new_fork_url) {
         logger.info("user already has repo forked");
         isForked = true;
         break;
       }
     }

     const content_owner  = isForked ? req.session.username : owner;
     logger.info("getting content from", content_owner);
     const content_url =  `/repos/${content_owner}/${repo}/contents/${filepath}`;
     logger.info("content url", content_url);

     // Github throws an error when one requests a file bigger than 1 Mb
     // so it is not reasonable to try with Contents API
     // (it is not ok to ignore errors)
     //
     // const file_data = await github(token, "get", content_url);
     // logger.debug(file_data, "file data");
     // if (file_data.hasOwnProperty("message")){
     //   logger.warn(file_data.message)
     // }
     // let content = Buffer.from(file_data.content, 'base64').toString('utf8');
     //
     // I call it a day on using only Data API for all files.

     const content_dir = content_url.substr(0, content_url.lastIndexOf("/"));
     logger.info("content dir url", content_dir);

     try {
        const dir_data = await github(token, "get", content_dir);
        const dir_data_filtered = dir_data.filter(x => x.path === filepath);

        if (dir_data_filtered) {

          const file_info = dir_data_filtered.pop();
          logger.debug(file_info, "content dir");
          const blob_url = file_info["git_url"];
          logger.info("blob", blob_url);
          const blob = await github(token, "get", blob_url);
          logger.info("size", blob["size"]);
          const content = Buffer.from(blob.content, blob["encoding"]).toString('utf8');

          if (!isForked){
            const fork_data = await github(token, "post", fork_url);
            logger.debug(fork_data, "fork data");
            if (!fork_data){
              return res.json({ error: 'Github fork error' });
            }
          }

          upload.fromContent(treebank, content, filename, err => {
            if (err) {
              return res.json({ error: err.message });
            }

            cfg.corpora.insert([owner, repo, branch, req.session.username, req.body.url,
              filepath, filepath, blob["size"], blob["sha"], treebank], (err, data) => {
              if (err){
                logger.info("Error saving user data in database");
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
        logger.debug(body, "github user info");
        const username = body.login;

        cfg.users.update({
          username: username,
          email: body.email,
          realname: body.name
        }, {
          token: token
        }, (err, data) => {
          if (err)
            throw err;

          logger.info('/login changes to Users:', data.changes);
          res.cookie('github', username, { path: '/', expires: new Date(Date.now() + 9000000), httpOnly: false });
          req.session.username = username;
          // req.session.treebank = req.treebank;
          logger.debug("treebank on login", req.treebank);
          res.redirect(req.treebank ? '/annotatrix?' + querystring.stringify({
            treebank_id: req.treebank
          }) : '/');
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
      if (err) {
        throw err;
      }

      logger.info('/logout changes to Users:', data.changes);
      logger.debug("treebank on logout", req.treebank);
      req.session.username = null;
      req.session.token = null;
      res.clearCookie('github');
      res.redirect(req.treebank ? '/annotatrix?' + querystring.stringify({
        treebank_id: req.treebank
      }) : '/');

    });
  });

  app.get('/repos', is_logged_in, async (req, res) => {

    const result = await github(req.session.token, "get", "/user/repos");
    res.json(result);

  });

  app.get('/permissions', is_logged_in, (req, res) => {
      res.json({ error: 'Not implemented' });
  });

  app.post('/commit', get_user, is_logged_in, async (req, res) => {
    logger.debug("commit item click");
    if (req.body.hasOwnProperty("corpus")
          && req.body.hasOwnProperty("message")
          && req.body.hasOwnProperty("treebank")
        ){
          // logger.info(req.body.corpus);
          // const treebank = req.query.treebank_id||req.session.treebank;
          const treebank = req.body.treebank;
        cfg.corpora.query(treebank, (err, data) => {
          if (err || !data){
            // throw(err)
            logger.error("Error with database", treebank, data);
            return res.json({"error": "Error with database"});
          }
          logger.debug(data, "data for commit", treebank);

          cfg.users.query({username: data.username }, (err, userdata) => {
            if (err || !userdata){
              logger.error("Error with database", data.username);
              return res.json({"error": "Error with database"});
            }
            logger.debug(userdata, "user data");

            (async() => {

              const result  = await commit(req.session.token, data.username, data.repo, data.branch, req.body.corpus, data.filepath, req.body.message, data.sha, treebank, userdata);

              if (result.hasOwnProperty("url")){
                cfg.corpora.update_commit(treebank, result.sha, (err, data) => {
                  if (err){
                    logger.error("Error on saving commit data", treebank, sha);
                    throw(err)
                  }
                });
              }
              return res.json(result);

            })();

            });
          });

    } else {
      res.json({"error": "Error of retrieving corpus from browser"});
    }
  });

  app.post('/pullcheck', get_treebank, get_user, is_logged_in, (req, res) => {

    const token = req.session.token;
    const treebank = req.body.treebank_id;
    cfg.corpora.query(treebank, (err, data) => {
      if (err){
        logger.error("Error with database", treebank);
        throw(err)
      }

      (async() => {

        const prlist_obj = {
          "state": "open",
          "head": `${data.username}:${data.branch}`,
          "base": data.branch
        };
        logger.debug(prlist_obj, "PR list object");

        const git_url = `/repos/${data.owner}/${data.repo}/pulls`;
        const prlist_data = await github(token, "get", git_url, prlist_obj);

        logger.debug(prlist_data, "PR list");

        let isOkToPR = true;

        if (prlist_data.hasOwnProperty("message")){
          return res.json({"error": prlist_data.message});
        } else {
          for (let pr_num in prlist_data) {

            // logger.debug("PR number:", pr_num);
            // logger.debug(prlist_data[pr_num]);

            if (prlist_data[pr_num]["head"]["repo"]["full_name"] === `${data.username}/${data.repo}`) {
              logger.info("open PR already to this repo exists");
              isOkToPR =  false;
              break;
            }

           }
        }

        return res.json({"success": isOkToPR});

      })();
    });
  });

  app.post('/pullreq', get_treebank, get_user, is_logged_in, (req, res) => {
    const token = req.session.token;

    logger.info("pull request is clicked");

    if (req.body.hasOwnProperty("title") && req.body.hasOwnProperty("treebank")) {

      const treebank = req.body.treebank;
      const title = req.body.title;
      const content  = req.body.hasOwnProperty("content") ? req.body.content: "";
      const allowModify = req.body.hasOwnProperty("allowModify") ?
        req.body.allowModify == "true" ? true : false
        : true;
      const isDraft = req.body.hasOwnProperty("isDraft") ?
        req.body.isDraft == "false" ? false : true
         : false;

      cfg.corpora.query(treebank, (err, data) => {
        if (err){
          logger.error("Error with database", treebank);
          throw(err)
        }

      (async() => {

        const pr_obj = {
          "title": title,
          "body": content,
          "head": `${data.username}:${data.branch}`,
          "base": data.branch,
          "maintainer_can_modify": allowModify,
          "draft": isDraft
        };
        logger.debug(pr_obj, "PR object");

        const git_url = `/repos/${data.owner}/${data.repo}/pulls`;
        const pr_data = await github(token, "post", git_url, pr_obj);
        logger.debug(pr_data, "PR data");

        if (pr_data.hasOwnProperty("html_url")){

          cfg.corpora.update_pr(treebank, true, (err, data) => {
            if (err){
              logger.error("Error with database", treebank);
              throw(err)
            }

          });

          res.json({"url": pr_data.html_url});
        } else {

          res.json({"error": "Error with pull request", "data": pr_data})

        }

      })();

    });
   }
  });

  app.get('/settings', get_treebank, get_user, /*is_logged_in,*/ (req, res) => {
    cfg.corpora.query(req.treebank, (err, data) => {
      if (err){
        throw err;
      }

      logger.debug(data, "treebank data");

      res.render('settings.ejs', {
        treebank: req.treebank,
        username: req.session.username,
        data: data
      });

    });
    // CorpusDB(req.treebank).load((err, data) => {
    //   if (err)
    //     throw err;
    //
    //   res.render('settings.ejs', {
    //     treebank: req.treebank,
    //     username: req.session.username,
    //     meta: data.meta
    //   });
    // });
  });

  app.post('/settings', get_treebank, /*is_logged_in,*/ (req, res) => {
    res.json(req.body);
  });

  // ---------------------------
  // GitHub OAuth
  app.get("/oauth/login", get_treebank, (req, res) => {
    logger.info("logging in (OAuth)");
    logger.debug(req["session"], "session");
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
    logger.info("redirect", url);
    res.redirect(url);
  });

  app.get("/oauth/callback", (req, res) => {

    logger.info("callback");
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
