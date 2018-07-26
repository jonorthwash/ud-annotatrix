'use strict';

const $ = require('jquery');
const _ = require('underscore');
const funcs = require('./funcs');


function getTableRow(selfid, userid, username, address, index) {

  console.log(selfid, userid)
  if (selfid === userid)
    username = '<me>';

  return $('<tr>')
    .addClass('online-user')
    .addClass(selfid === userid ? 'self' : 'other')
    .append($('<td>')
      .addClass('online-user-data username')
      .text(username)
    )
    .append($('<td>')
      .addClass('online-user-data ip-address')
      .text(address)
    )
    .append($('<td>')
      .addClass('online-user-data view-index')
      .text(isNaN(index) ? '?' : index)
    );
}

function update(selfid, room) {
  if (!gui.inBrowser)
    return;

  // update the number first
  const num = funcs.getPresentUsers(room);
  $('#currently-online-number').text(num);

  // then update the list
  const tbody = $('#currently-online-list tbody');
  tbody.children().detach();
  _.each(room.users, (user, userid) => {
    const tr = getTableRow(selfid, userid, funcs.getUsername(user), user.address, user.index);
    tbody.append(tr);
  });
}

module.exports = {
  update
};
