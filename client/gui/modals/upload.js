'use strict';

const $ = require('jquery');


var _gui;


function show() {
  $('#upload-modal')
    .show()
    .find('[type="submit"]')
      .prop('disabled', !_gui.app.server.is_running);
}

function hide() {
  $('#upload-modal').hide();
}

function bind() {

  $('#upload-modal')
    .find('[name="close"]')
    .click(hide);

}

module.exports = gui => {

  _gui = gui;
  bind();

  return {
    bind,
    hide,
    show,
  };
};
