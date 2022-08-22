import * as $ from "jquery";

import type {GUI} from "..";

var _gui: GUI|null = null;

/**
 * Show the modal.
 */
function show() {
  console.log("show")
  console.trace();
  $("#upload-file-modal").show().find("[type=\"submit\"]").prop("disabled", !_gui.app.server.is_running);
}

/**
 * Hide the modal.
 */
function hide() {
  $("#upload-file-modal").hide();
  $("#upload-filename").val(null);
}

/**
 * Bind the click-handler.
 */
function bind() { $("#upload-file-modal").find("[name=\"close\"]").click(hide); }

export function uploadFile(gui: GUI) {
  _gui = gui;
  bind();
  return {
    hide,
    show,
  };
}
