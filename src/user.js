'use strict';

const _ = require('underscore');

const status = require('./status');
const funcs = require('./funcs')

var _username = null;

function get() {
  return _username;
}

function set(username) {
  _username = username;

  if (username)
    status.normal(`logged in as ${username}`);

  gui.update();
}

function login() {
  if (!server.is_running)
    return null;

  funcs.link(`/oauth/login?treebank_id=${funcs.getTreebankId()}`, '_self');
}

function logout() {
  if (!server.is_running)
    return null;

  funcs.link(`/logout`, '_self');
}

function repos() {
  funcs.link('/repos');
}

function permissions() {
  funcs.link('/permissions');
}

module.exports = {
  get,
  set,
  login,
  logout,
  manage: {
    permissions,
    repos
  }
};
