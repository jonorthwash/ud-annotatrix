'use strict';

const $ = require('jquery');


var _gui;


/**
 * Show the modal.
 */
function show() {
  $('#upload-modal')
    .show()
    .find('[type="submit"]')
      .prop('disabled', !_gui.app.server.is_running);
}

/**
 * Hide the modal.
 */
function hide() {
  $('#upload-modal').hide();
}

/**
 * Bind the click-handler.
 */
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
