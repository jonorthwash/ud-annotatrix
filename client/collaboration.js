'use strict';

const $ = require('jquery');
const _ = require('underscore');
const funcs = require('./funcs');


function getTableRow(selfid, userid, user) {

  let name = (selfid === userid)
    ? '<me>'
    : funcs.getUsername(user);
  const address = user.address;
  const index = isNaN(parseInt(user.index)) ? '?' : user.index + 1;

  return $('<tr>')
    .addClass('online-user')
    .addClass(selfid === userid ? 'self' : 'other')
    .append($('<td>')
      .addClass('online-user-data username')
      .text(name)
    )
    .append($('<td>')
      .addClass('online-user-data ip-address')
      .text(address)
    )
    .append($('<td>')
      .addClass('online-user-data view-index')
      .text(index)
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
    const tr = getTableRow(selfid, userid, user);
    tbody.append(tr);
  });
}

module.exports = {
  update
};
