import * as $ from "jquery";

import type {GUI} from "..";

var _gui: GUI|null = null;

/**
 * Show the modal.
 */
function show() {
  console.log("show")
  console.trace();
  $("#help-modal").show();
}

/**
 * Hide the modal.
 */
function hide() {
  $("#help-modal").hide();
}

/**
 * Bind the click-handler.
 */
function bind() { $("#help-modal").find("[name=\"close\"]").click(hide); }

export function helpInfo(gui: GUI) {
  _gui = gui;
  bind();
  return {
    hide,
    show,
  };
}
