'use strict';

const $ = require('jquery');
var _gui = null;

/**
 * Show the modal.
 */
function show() {
  console.log('show')
  console.trace();
  $('#upload-file-modal')
    .show()
    .find('[type="submit"]')
      .prop('disabled', !_gui.app.server.is_running);
}

/**
 * Hide the modal.
 */
function hide() {
  $('#upload-file-modal').hide();
}

/**
 * Bind the click-handler.
 */
function bind() {

  $('#upload-file-modal')
    .find('[name="close"]')
    .click(hide);

}

module.exports = gui => {

  _gui = gui;
  bind();

  return {
    hide,
    show,
  };
};
