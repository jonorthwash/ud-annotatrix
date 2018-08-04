'use strict';

const _ = require('underscore');
const fs = require('fs');
const uuidv4 = require('uuid/v4');
const request = require('request');

const UploadError = require('./errors').UploadError;
const nx = require('notatrix');
const CorpusDB = require('./models/corpus-json');


function upload(treebank, filename, contents, next) {

  console.log('uploading')
  try {

    const corpus = nx.Corpus.fromString(contents);
    return CorpusDB(treebank).save(filename, corpus.serialize(), next);

  } catch (e) {

    next(new UploadError(e.message));

  }
}

function fromFile(treebank, file, next) {

  if (!file)
    return next(new UploadError(`No file provided.`));

  const contents = file.data.toString();
  return upload(treebank, file.name, contents, next);

}

function fromGitHub(treebank, url, next) {

  if (!url)
    return next(new UploadError(`No URL provided.`));

  request.get(url, (err, _res, body) => {
    if (err)
      return next(err);

    return upload(treebank, null, body, next);

  });

}

module.exports = {
  fromFile,
  fromGitHub,
};
