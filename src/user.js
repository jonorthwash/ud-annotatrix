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

  try {
    $.ajax({
      type: 'POST',
      url: `/oauth/login?treebank_id=${funcs.getTreebankId()}`,
      success: data => {
        console.log(data);

        /*
        if (data.status === 'failure') {
          log.error('Unable to load(): server error');
        } else {
          log.info('Successfully loaded from server');
          console.log(data);
          manager.load({
            filename: data.filename,
            gui: JSON.parse(data.gui),
            sentences: data.sentences.map(JSON.parse),
            labeler: JSON.parse(data.labeler),
            index: 0
          });
          user.set(data.username);
        }*/
      },
      error: data => {
        log.critical('Unable to complete AJAX request for login()');
      }
    })
  } catch (e) {
    log.critical(`AJAX error in login(): ${e.message}`);
  }
}

function logout() {

}

module.exports = {
  get,
  set,
  login,
  logout
};
