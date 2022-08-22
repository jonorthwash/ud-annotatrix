import * as $ from "jquery";

import * as nx from "../../notatrix";

export interface MousePosition {
  x: number;
  y: number;
}

export interface UserData {
  username: string|null;
  id: string;
  address: string;
  index: number|null;
  mouse: MousePosition|null;
  locked: string|null; // cytoscape selector to locate the node currently being edited
}

/**
 * Data structure to keep track of state and methods associated with a particular
 *  socket connection.
 */
export class User {
  public name: string;
  public id: string;
  public ip: string;
  public color: string;
  public _viewing: number|null;
  public mouse: MousePosition|null;
  public locked: string|null; // cytoscape selector to locate the node currently being edited

  constructor(data: UserData) {
    this.name = data.username || "anonymous";
    this.id = data.id;
    this.ip = data.address;
    this.color = nx.funcs.hashStringToHex(data.id);
    this._viewing = data.index;
    this.mouse = data.mouse;
    this.locked = data.locked;
  }

  /**
   * Helper function for `this::dom`, gives the index-part associated with a
   *  user in #chat.
   */
  get viewing(): string {
    return this._viewing === null ? "" : ` (${this._viewing + 1}) `;
  }

  /**
   * Wrapper for setting the corpus index of the user.  Sanitizes input.
   */
  set viewing(index: string) {
    let parsedIndex = parseInt(index);
    this._viewing = isNaN(parsedIndex) ? null : parsedIndex;
  }

  /**
   * Wrapper for setting the mosue position of the user.  Sanitizes input.
   */
  setMouse(pos: {x: number|null, y: number|null}) {
    // if x and y not both given, don't save it
    this.mouse = (pos.x == null && pos.y == null) ? null : pos;
  }

  /**
   * Get a DOM object containing some of the user's data (this gets rendered in #chat)
   *
   * NB: this looks a bit messy, but it should have this structure:
   *  <span class="message-sender-info" name="{ id }">
   *    <i class="message-color-blob fa fa-circle" style="color: #{ color };" />
   *    <span class="message-sender-name" title="IP Address: { ip }">
   *      { name }
   *    </span>
   *    <span class="message-sender-viewing" title="Currently viewing">
   *      { viewing }
   *    </span>
   *  </span>
   */
  dom(): JQuery<HTMLElement> {
    return $("<span>")
        .addClass("message-sender-info")
        .attr("name", this.id)
        .append($("<i>").addClass("message-color-blob fa fa-circle").css("color", "#" + this.color))
        .append($("<span>").addClass("message-sender-name").text(this.name).attr("title", "IP Address: " + this.ip))
        .append($("<span>").addClass("message-sender-viewing").text(this.viewing).attr("title", "Currently viewing"));
  }
}
