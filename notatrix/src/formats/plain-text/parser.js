"use strict";

const _ = require("underscore");

const utils = require("../../utils");
const ParserError = utils.ParserError;
const detect = require("./detector").detect;

module.exports = (text, options) => {
  options = _.defaults(options, {
    allowEmptyString: true,
  });

  text = text || "";

  try {
    detect(text, options);
  } catch (e) {
    if (e instanceof utils.DetectorError)
      throw new ParserError(e.message);

    throw e;
  }

  // console.log();
  // console.log(text);

  let chunks = [];
  let word = "";

  _.each(text, (char, i) => {
    if (utils.re.whitespace.test(char)) {
      chunks.push(word);
      word = "";

    } else if (utils.re.punctuation.test(char)) {
      if (!utils.re.allPunctuation.test(word)) {
        chunks.push(word);
        word = "";
      }
      word += char;

    } else {
      word += char;
    }
  });

  chunks.push(word);

  // console.log(chunks);

  let tokens = chunks.filter(utils.thin).map((chunk, i) => {
    return {
      form: chunk,
      index: i,
    };
  });

  // console.log(comments);
  // console.log(tokens);

  return {
    input: text,
    options: options,
    comments: [],
    tokens: tokens,
  };
};
