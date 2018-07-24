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

function enable() {
  modal.find('[type="submit"]').prop('disabled', false);
}

modal.find('[name="close"]').click(hide);

module.exports = {
  show,
  hide,
  enable
};
