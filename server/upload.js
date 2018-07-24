'use strict';

const _ = require('underscore');
const fs = require('fs');
const uuidv4 = require('uuid/v4');

const UploadError = require('./errors').UploadError;
const CorpusDB = require('./models/corpus');
const Logger = require('../client/node-logger');
const Manager = require('../client/manager');
global.log = new Logger('SILENT');
global.server = null;
global.manager = new Manager();
manager.save = () => {}; // avoid autosave garbage


function upload(treebank, file, next) {
  if (!file)
    return next(new UploadError(`No file provided.`));

  try {

    const contents = file.data.toString();
    manager.parse(contents);

    CorpusDB(treebank).save(manager.state, next);

  } catch (e) {
    return next(new UploadError(e.message));
  }
}


module.exports = upload;
