'use strict';

const $ = require('jquery');


var _progress = {
  done: 0,
  total: 0,
};


function refresh() {

  console.log('refresh', _progress)
  const percent = (_progress.total ? _progress.done / _progress.total : 0) * 100;
  $('#progress-bar')
    .css('width', `${percent}%`);
}


module.exports = _progress;
module.exports.refresh = refresh;
