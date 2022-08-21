import * as _ from "underscore";

interface User {
  id: string;
  index: unknown|null;
  mouse: unknown|null;
  locked: unknown|null;
  address: unknown;
  username: unknown;
}

export class Room {
  private users: {[id: string]: User};
  constructor() { this.users = {}; }

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
    _.each(fields, (value, key) => { user[key] = value; });

    return user;
  }

  removeUser(socketData) {

    const user = this.users[socketData.id];
    delete this.users[socketData.id];

    return user;
  }
}
