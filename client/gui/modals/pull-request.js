'use strict';

const $ = require('jquery');
var _gui = null;

/**
 * Show the modal.
 */
function show() {
  console.log('show')
  console.trace();
  $('#pr-modal')
    .show();
}

/**
 * Hide the modal.
 */
function hide() {
  $('#pr-modal').hide();
  $('#pr-title').val(null);
  $('#pr-body').val(null);
  $("#pr-result").addClass("d-none");
  $("#pr-editor").removeClass("d-none");
  $("#pr-button").removeClass("d-none");
}

/**
 * Process pressing button to commit changes with the message provided by user.
 */
function processPR() {

  const title  = $('#pr-title').val();

  if (title && title.replace(/\s/g, '').length) {
    const content  = $("#pr-content").val();
    const allowModify = $("#allow-modify").is(':checked');
    const isDraft = $("#is-draft").is(':checked');

    let params={};
    window.location.search
      .replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str,key,value) {
        params[key] = value;
      }
    );

      $.post( "/pullreq", {
            "title": title,
            "content": content,
            "allowModify": allowModify,
            "isDraft": isDraft,
            "treebank":  params["treebank_id"]
          },
          function( data ) {
            const msg  = data.hasOwnProperty("url") ?
              `Link of the pull request: <a href="${data.url}">${data.url}</a>` :
              JSON.stringify(data);

           $("#pr-result").removeClass("d-none").html(msg);
           $("#pr-editor").addClass("d-none");
           $("#pr-button").addClass("d-none");
           _gui.app.git = "PR";
           _gui.app.gui.menu.refresh();
      });

    }

}
/**
 * Bind the click-handler.
 */
function bind() {

  $('#pr-modal')
    .find('[name="close"]')
    .click(hide);

  $("#pr-button").click(processPR);

}

module.exports = gui => {

  _gui = gui;
  bind();

  return {
    hide,
    show,
  };
};
