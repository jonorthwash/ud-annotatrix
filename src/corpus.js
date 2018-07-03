'use strict';

const $ = require('jquery');

function upload(event) {
  return server.push();
}

function export_(event) {

  if (!gui.inBrowser)
    return null;

  //Export Corpora to file
  if (server.is_running) {
    server.download();
  } else {

    const link = $('<a>')
      .attr('download', manager.filename)
      .attr('href', `data:text/plain; charset=utf-8,${manager.encode()}`);
    $('body').append(link);
    link[0].click();

  }
}

function clear(event, force=false) {

  if (!force) {
    const conf = confirm('Do you want to clear the corpus (remove all sentences)?');
    if (!conf) {
      log.info('corpus::clear(): not clearing corpus');
      return;
    }
  }

  manager.reset();
  return;
}

function print(event) {
  throw new Error('corpus::print() not implemented');
}

function fromLocalStorage() {
  console.log('load from local storage');
}

function fromServer() {
  console.log('load from server');
}

module.exports = {
  upload,
  export: export_,
  clear,
  print,
  load: {
    from: {
      localStorage: fromLocalStorage,
      server: fromServer
    }
  }
}
