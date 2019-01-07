'use strict';

const _ = require('underscore');


class Room {
  constructor() {

    this.users = {};

  }

  serialize() {
    return {
      users: this.users,
    };
  }

  addUser(socketData) {

    const user = {
      id: socketData.id,
      index: null,
      mouse: null,
      locked: null,
      address: socketData.address,
      username: socketData.username,
    };

    this.users[socketData.id] = user;
    return user;
  }

  editUser(socketData, fields) {

    const user = this.users[socketData.id] || this.addUser(socketData);
    _.each(fields, (value, key) => {
      user[key] = value;
    });

    return user;
  }

  removeUser(socketData) {

    const user = this.users[socketData.id];
    delete this.users[socketData.id];

    return user;
  }
}


module.exports = Room;
