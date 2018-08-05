'use strict';

const $ = require('jquery');


var _progress = {
  done: 0,
  total: 0,
};


function refresh() {

  const percent = (this.total ? this.done / this.total : 0) * 100;
  $('#progressBar')
    .css('width', `${percent}%`);
}


module.exports = _progress;
module.exports.refresh = refresh;
