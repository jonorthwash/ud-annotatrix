import {v4 as uuidv4} from "uuid";
import {Express, Request, Response} from "express";
import * as request from "request";
import * as querystring from "querystring";
import * as path from "path";
import * as fs from "fs";
import {SessionData} from "express-session";
import {UploadedFile} from "express-fileupload";

import {cfg} from "./config"
import {CorpusDB} from "./models/corpus-json";
import {fromFile, fromGitHub} from "./upload";
import {listTreebanks} from "./list-treebanks";
import {ConfigError} from "./errors";

interface AnnotatrixSessionData extends SessionData {
  token: unknown;
  username: unknown;
  treebank: string;
  treebank_id: string;
}

// We need an intermediate interface because `session` has a different
// type on `Request` (so we can't `extends` it).
interface _AnnotatrixRequest {
  treebank: string;
  session: AnnotatrixSessionData;
}
type AnnotatrixRequest = _AnnotatrixRequest & Request;

// --------------------------------------------------------------------------
// middleware
function get_treebank(req: AnnotatrixRequest, res: Response, next: () => {}) {
  const treebank = req.query.treebank_id;
  if (!treebank)
    res.json({error: "Missing required argument: treebank_id"});

  req.treebank = treebank as string;
  next();
}

function get_token(req: AnnotatrixRequest, res: Response, next: () => {}) {
  const token = req.query.token;
  if (!token)
    res.json({error: "Missing required argument: token"});

  req.session.token = token;
  next();
}

function is_logged_in(req: AnnotatrixRequest, res: Response, next: () => {}) {
  if (!req.session.token || !req.session.username)
    res.json({error: "You must be logged in to view this page"});

  next();
}

// --------------------------------------------------------------------------
// helper funcs
function github_get(req: AnnotatrixRequest, path: string, callback: (json: any) => void) {
  request.get({
    url: `https://api.github.com${path}`,
    headers: {"Authorization": `token ${req.session.token}`, "User-Agent": "UD-Annotatrix/Express 4.0"}
  },
              (err, _res, body) => {
                const json = JSON.parse(body);
                callback(json);
              });
}

function github_post(req: AnnotatrixRequest, path: string, payload: any, callback: (json: any) => void) {
  request.post({
    url: `https://api.github.com${path}`,
    json: payload,
    headers: {"Authorization": `token ${req.session.token}`, "User-Agent": "UD-Annotatrix/Express 4.0"}
  },
               (err, _res, body) => {
                 const json = JSON.parse(body);
                 callback(json);
               });
}

// --------------------------------------------------------------------------
// urls
export function configureRoutes(app: Express) {
  // ---------------------------
  // core
  app.get("/index.html", (req: AnnotatrixRequest, res) => { res.redirect("/"); });
  app.get("/", (req: AnnotatrixRequest, res) => {
    listTreebanks((err, treebanks) => {
      res.render("index.ejs", {
        // base: `${cfg.protocol}://${cfg.host}:${cfg.port}`,
        // leave relative path instead absolute one
        // for correct urls when it works behind a frontend proxy
        base: "",
        error: err,
        treebanks: treebanks
      });
    });
  });
  app.get("/help(.html)?", (req: AnnotatrixRequest, res) => res.render("help.ejs"));
  app.get("/annotatrix(.html)?", (req: AnnotatrixRequest, res) => {
    let treebank = req.query.treebank_id;
    if (!treebank) {

      treebank = uuidv4();
      res.redirect("/annotatrix?" + querystring.stringify({
        treebank_id: treebank,
      }));

    } else {

      req.session.treebank_id = treebank as string;

      res.render("annotatrix",
                 {modalPath: "modals", github_configured: !!cfg.github, username: req.session.username, path: path});
    }
  });

  // ---------------------------
  // AJAX
  app.get("/running", (req: AnnotatrixRequest, res) => res.json({status: "running"}));

  app.post("/save", get_treebank, (req: AnnotatrixRequest, res) => {
    CorpusDB.create(req.treebank).save(null, req.body, err => {
      if (err)
        res.json({error: (err as Error).message});

      res.json({success: true});
    });
  });

  app.post("/delete", (req: AnnotatrixRequest, res) => {
    if (req.body.hasOwnProperty("id")) {
      const filepath = path.join(cfg.corpora_path, req.body.id + ".json");
      console.log("delete", filepath, req.body.id);
      fs.unlink(filepath, (err) => { err ? res.json({error: err.message}) : res.json({success: true}); });
    }
  });
  //

  app.get("/load", get_treebank, (req: AnnotatrixRequest, res) => {
    CorpusDB.create(req.treebank).load((err, data) => {
      if (err)
        res.json({error: err.message});

      res.json(data);
    });
  });

  app.post("/upload", (req: AnnotatrixRequest, res) => {
    const treebank = uuidv4();

    if (req.files) {
      fromFile(treebank, req.files.file as UploadedFile, err => {
        if (err) {
          res.json({error: err.message});
          return;
        }
        if (req.body.hasOwnProperty("src") && req.body["src"] === "main") {
          res.json({success: "File is stored"});
        } else {
          res.redirect("/annotatrix?" + querystring.stringify({
            treebank_id: treebank,
          }));
        }
      });

    } else if (req.body.url) {

      fromGitHub(treebank, req.body.url, err => {
        if (err) {
          res.json({error: err.message});
          return;
        }
        res.redirect("/annotatrix?" + querystring.stringify({
          treebank_id: treebank,
        }));
      });

    } else {
      res.json({error: "Please provide a file or URL."});
    }
  });

  // ---------------------------
  // user/account management
  app.get("/login", get_token, get_treebank, (req: AnnotatrixRequest, res) => {
    github_get(req, "/user", body => {
      const username = body.login;

      cfg.users.update({username: username}, {token: req.session.token}, (err, data) => {
        if (err)
          throw err;

        console.log("/login changes to Users:", data.changes);
        req.session.username = username;
        res.redirect("/annotatrix?" + querystring.stringify({treebank_id: req.treebank}));
      });
    });
  });

  app.get("/logout", get_treebank, (req: AnnotatrixRequest, res) => {
    cfg.users.remove({

      username: req.session.username,
      token: req.session.token

    },
                     (err, data) => {
                       if (err)
                         throw err;

                       console.log("/logout changes to Users:", data.changes);
                       req.session.username = null;
                       req.session.token = null;
                       res.redirect("/annotatrix?" + querystring.stringify({treebank_id: req.treebank}));
                     });
  });

  app.get("/repos", is_logged_in, (req: AnnotatrixRequest, res) => {
    github_get(req, "/user/repos", body => {
      res.json(body);
    });
  });

  app.get("/permissions", is_logged_in, (req: AnnotatrixRequest, res) => { res.json({error: "Not implemented"}); });

  app.get("/settings", get_treebank, /*is_logged_in,*/ (req: AnnotatrixRequest, res) => {
    CorpusDB.create(req.treebank).load((err, data) => {
      if (err)
        throw err;

      res.render("settings.ejs", {treebank: req.treebank, username: req.session.username, meta: (data as any).meta});
    });
  });
  app.post("/settings", get_treebank, /*is_logged_in,*/ (req: AnnotatrixRequest, res) => { res.json(req.body); });

  // ---------------------------
  // GitHub OAuth
  app.get("/oauth/login", get_treebank, (req: AnnotatrixRequest, res) => {
    if (!cfg.github) {
      new ConfigError("Unable to use GitHub OAuth without client secret");
      res.redirect("/annotatrix");
    }

    req.session.treebank = req.treebank;
    const url = "https://github.com/login/oauth/authorize?" +
                querystring.stringify({client_id: cfg.github.client_id, state: cfg.github.state});

    res.redirect(url);
  });

  app.get("/oauth/callback", (req: AnnotatrixRequest, res) => {
    if (!cfg.github) {
      new ConfigError("Unable to use GitHub OAuth without client secret");
      res.redirect("/annotatrix");
    }

    if (cfg.github.state !== req.query.state) {
      res.json({error: "Unable to authenticate: state mismatch"});
      return;
    }

    if (!req.query.code) {
      res.json({error: "Unable to authenticate: no code provided"});
      return;
    }

    const url = "https://github.com/login/oauth/access_token?" + querystring.stringify({
      client_secret: cfg.github.client_secret,
      client_id: cfg.github.client_id,
      state: cfg.github.state,
      code: req.query.code as string,
    });

    request.post(url, (err, _res, body) => {
      if (err) {
        res.json({error: `Unable to authenticate: invalid GitHub server response`});
        return;
      }

      const token = body.match(/access_token=([a-f0-9]{40})/);
      if (!token) {
        res.json({error: `Unable to authenticate: invalid GitHub server response`});
        return;
      }

      res.redirect("/login?" + querystring.stringify({token: token[1], treebank_id: req.session.treebank}));
    });
  });
}
