import * as crypto from "crypto";
import * as mkdirp from "mkdirp";
import {config as configureDotenv} from "dotenv";

import {ConfigError} from "./errors";
import {UsersDB} from "./models/users";

configureDotenv();

interface GithubConfig {
  readonly client_id: string;
  readonly client_secret: string;
  readonly login_uri: string;
  readonly callback_uri: string;
  readonly state: string;
}

interface Config {
  readonly port: number|string;
  readonly host: string;
  readonly protocol: string;
  readonly corpora_path: string;
  readonly secret: string;
  readonly environment: string;
  readonly github: GithubConfig;
  readonly users_db_path: string;
  readonly users: UsersDB;
}

// basic app config
const port = process.env.ANNOTATRIX_PORT || process.env.PORT || 5316;
const host = process.env.ANNOTATRIX_HOST || process.env.HOST || "localhost";
const protocol = process.env.ANNOTATRIX_PROTOCOL || process.env.PROTOCOL || "http";
const corpora_path =
    process.env.ANNOTATRIX_CORPORA_PATH || process.env.CORPORA_PATH || process.env.PATH_TO_CORPORA || "corpora";
const secret = process.env.ANNOTATRIX_SECRET || process.env.SECRET || "dev secret";
const environment = process.env.ANNOTATRIX_ENV || process.env.NODE_ENV || "development";

// oauth config
let github = {
  client_id: process.env.ANNOTATRIX_GH_CLIENT_ID || process.env.GH_CLIENT_ID ||
                 "298b7a22eb8bc53567d1", // keggsmurph21 'UD-Annotatrix test 2'
  client_secret: process.env.ANNOTATRIX_GH_CLIENT_SECRET || process.env.GH_CLIENT_SECRET,
  login_uri: `${protocol}://${host}:${port}/oauth/login`,
  callback_uri: `${protocol}://${host}:${port}/oauth/callback`,
  state: crypto.randomBytes(8).toString("hex")
};
if (!github.client_secret) {
  new ConfigError("Please provide ANNOTATRIX_GH_CLIENT_SECRET");
  github = null;
}

// database config
mkdirp(corpora_path);
const users_db_path = process.env.ANNOTATRIX_USERS_DB_PATH || ".users";
const users = UsersDB.create(users_db_path);

export const cfg: Config = {
  port,
  host,
  protocol,
  corpora_path,
  secret,
  environment,
  github,
  users_db_path,
  users,
};
