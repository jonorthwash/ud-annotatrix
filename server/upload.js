'use strict';

const _ = require('underscore');
const fs = require('fs');
const uuidv4 = require('uuid/v4');
const axios = require('axios');
const logger = require('./logger');

const UploadError = require('./errors').UploadError;
const nx = require('notatrix');
const CorpusDB = require('./models/corpus-json');


function upload(treebank, filename, contents, next) {

  logger.info('uploading');
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

function fromURL(treebank, url, next) {

  if (!url) {
    return next(new UploadError(`No URL provided.`));
  }

  logger.info("url to load", url);

  let filename  = url.split('?')[0].replace(/\/+$/, '').split("/").slice(-1)[0];

  if (!filename) {
    return next(new UploadError(`File has not a proper name.`));
  }

  logger.info("filename in URL", filename);

  axios.get(url)
  .catch(function (error) {
    return next(error);
  })
  .then(function (response) {
	  if(response.data){
		  return upload(treebank, filename, response.data, next);
	  }
  });

}
function fromContent(treebank, content, filename, next) {

  if (!content) {
    return next(new UploadError(`No data were provided.`));
  }

  if (!filename) {
    return next(new UploadError(`File has not a proper name.`));
  }

  return upload(treebank, filename, content, next);


}

module.exports = {
  fromFile,
  fromURL,
  fromContent,
};
