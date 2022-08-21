import * as _ from "underscore";

interface SocketData {
  id: string;
  address: string;
  username: string;
}

interface User {
  id: string;
  index: unknown|null;
  mouse: unknown|null;
  locked: unknown|null;
  address: unknown;
  username: unknown;
  room?: {users: {[id: string]: User}};
}

export class Room {
  public users: {[id: string]: User};
  constructor() { this.users = {}; }

  serialize() {
    return {
      users: this.users,
    };
  }

  addUser(socketData: SocketData) {

    const user: User = {
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

  editUser(socketData: SocketData, fields: Partial<User>): User {

    const user = this.users[socketData.id] || this.addUser(socketData);
    _.each(fields, (value, key) => { (user as any)[key] = value; });

    return user;
  }

  removeUser(socketData: SocketData) {

    const user = this.users[socketData.id];
    delete this.users[socketData.id];

    return user;
  }
}
