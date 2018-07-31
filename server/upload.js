'use strict';

const _ = require('underscore');
const fs = require('fs');
const uuidv4 = require('uuid/v4');

const UploadError = require('./errors').UploadError;
const CorpusDB = require('./models/corpus');
const Logger = require('../client/node-logger');
const Manager = require('../client/manager');


function upload(treebank, file, next) {

  if (!file)
    return next(new UploadError(`No file provided.`));

  try {

    global.log = new Logger('SILENT');
    global.server = null;
    global.manager = new Manager();
    manager.save = () => {}; // avoid autosave garbage

    const contents = file.data.toString();
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


module.exports = upload;
