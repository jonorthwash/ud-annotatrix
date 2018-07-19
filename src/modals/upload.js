'use strict';

const _ = require('underscore');
const $ = require('jquery');

const modal = $('#upload-modal');

function show() {
  modal.show();
}

function hide() {
  modal.hide();
}

/*function submit() {
  const file = getFile();

}*/

function enable() {
  modal.find('[type="submit"]').prop('disabled', false);
}

/*function getFile() {
  return document.getElementById('upload-filename').files[0];
}*/

modal.find('[name="close"]').click(hide);

module.exports = {
  show,
  hide,
  enable
};
