'use strict';

const _ = require('underscore');
const fs = require('fs');
const uuidv4 = require('uuid/v4');
const request = require('request');

const UploadError = require('./errors').UploadError;
const nx = require('notatrix');
const CorpusDB = require('./models/corpus-json');


function upload(treebank, filename, contents, next) {

  console.log('uploading');
  try {

    const corpus = nx.Corpus.fromString(contents);
    corpus.filename = filename;
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

  // regex magic
  const match = url.match(/^(https?:\/\/)?(github\.com|raw\.githubusercontent\.com)\/([\w\d]*)\/([^/]*)\/(tree\/|blob\/)?([^/]*)\/(.*)$/);
  if (!match)
    return next(new UploadError(`Unsupported URL format: ${url}`));

  const [
    string,
    protocol,
    domain,
    owner,
    repo,
    blob_or_tree,
    branch,
    filepath
  ] = match;

  const filename = `${repo}__${branch}__${filepath.replace(/\//g, '__')}`;
  const rawURL = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filepath}`;

  request.get(rawURL, (err, _res, body) => {
    if (err)
      return next(err);

    return upload(treebank, filename, body, next);

  });

}

module.exports = {
  fromFile,
  fromGitHub,
};
