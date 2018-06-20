'use strict';

const $ = require('jquery');
const server = require('./server');

module.exports = () => {

  if (!gui.inBrowser)
    return null;

  //Export Corpora to file
  if (server.is_running) {
      throw new NotImplementedError('exportCorpus() not implemented for server interaction');
      //downloadCorpus();
  } else {

      const link = $('<a>')
          .attr('download', manager.filename)
          .attr('href', `data:text/plain; charset=utf-8,${manager.encode()}`);
      $('body').append(link);
      link[0].click();

  }

}
