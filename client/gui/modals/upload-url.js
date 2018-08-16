'use strict';

const $ = require('jquery');
var _gui = null;

/**
 * Show the modal.
 */
function show() {
  $('#upload-url-modal')
    .show()
    .find('[type="submit"]')
      .prop('disabled', !_gui.app.server.is_running);
}

/**
 * Hide the modal.
 */
function hide() {
  $('#upload-url-modal').hide();
}

/**
 * Bind the click-handler.
 */
function bind() {

  $('#upload-url-modal')
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
