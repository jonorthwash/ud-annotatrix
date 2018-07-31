'use strict';

const _ = require('underscore');
const fs = require('fs');
const uuidv4 = require('uuid/v4');
const request = require('request');

const UploadError = require('./errors').UploadError;
const CorpusDB = require('./models/corpus');
const Logger = require('../client/node-logger');
const Manager = require('../client/manager');


function upload(treebank, contents, next) {

  try {

    global.log = new Logger('SILENT');
    global.server = null;
    global.manager = new Manager();
    manager.save = () => {}; // avoid autosave garbage
    manager.emit = () => {};
    manager.parse(contents);

    CorpusDB(treebank).save(manager.state, next);

  } catch (e) {

    next(new UploadError(e.message));

  } finally {

    // clean up our global stuff
    global.log = undefined;
    global.server = undefined;
    global.manager = undefined;

  }
}

function fromFile(treebank, file, next) {

  if (!file)
    return next(new UploadError(`No file provided.`));

  const contents = file.data.toString();
  return upload(treebank, contents, next);

}

function fromGitHub(treebank, url, next) {

  if (!url)
    return next(new UploadError(`No URL provided.`));

  request.get(url, (err, _res, body) => {
    if (err)
      return next(err);

    return upload(treebank, body, next);

  });

}

module.exports = {
  fromFile,
  fromGitHub,
};
