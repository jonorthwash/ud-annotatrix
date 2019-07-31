'use strict';

const $ = require('jquery');
var _gui = null;

/**
 * Show the modal.
 */
function show() {
  console.log('show')
  console.trace();
  $('#commit-file-modal')
    .show();
}

/**
 * Hide the modal.
 */
function hide() {
  $('#commit-file-modal').hide();
  $('#commit-message').val(null);
  $("#commit-result").addClass("d-none");
  $("#commit-editor").removeClass("d-none");
  $("#commit-button").removeClass("d-none");
}

/**
 * Process pressing button to commit changes with the message provided by user.
 */
function processCommit() {
  const commitMessage  = $('#commit-message').val();
  if (commitMessage && commitMessage.replace(/\s/g, '').length) {
    const rawCorpus = _gui.app.download(true);
    // console.log("treebank ID", _gui.app.corpus._corpus.treebank_id);
    let params={};
    window.location.search
      .replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str,key,value) {
        params[key] = value;
      }
    );

    $.post( "/commit", {
          "corpus": rawCorpus,
          "message": commitMessage,
          "treebank":  params["treebank_id"]
        },
        function( data ) {
          const msg  = data.hasOwnProperty("url") ?
            `Link of the new commit: <a href="${data.url}">${data.url}</a>` :
            JSON.stringify(data);

         $("#commit-result").removeClass("d-none").html(msg);
         $("#commit-editor").addClass("d-none");
         $("#commit-button").addClass("d-none");
         _gui.app.gui.menu.refresh();
    });

  }

}
/**
 * Bind the click-handler.
 */
function bind() {

  $('#commit-file-modal')
    .find('[name="close"]')
    .click(hide);

  $("#commit-button").click(processCommit);

}

module.exports = gui => {

  _gui = gui;
  bind();

  return {
    hide,
    show,
  };
};
