"use strict";

const _ = require("underscore");

const utils = require("../../utils");
const ParserError = utils.ParserError;
const detect = require("./detector");

module.exports = (text, options) => {
  // console.log();
  // console.log(text);

  options = _.defaults(options, {
    allowEmptyString: false,
  });

  try {
    detect(text, options);
  } catch (e) {
    if (e instanceof utils.DetectorError)
      throw new ParserError(e.message);

    throw e;
  }

  class Sentence {
    constructor(text, options) {
      this.input = text;
      this.options = options;
      this.parent = null;
      this.root = [];
      this.comments = [];
    }

    serialize() {
      this.root.index(0);

      return {
        input: this.input,
        options: this.options,
        comments: this.comments,
        tokens: this.root.serialize([])
      };
    }

    push(token) { this.root = token; }
  }

  class Token {
    constructor(parent) {
      this.parent = parent;

      this.deprel = null;
      this.before = [];
      this.words = [];
      this.after = [];
    }

    eachBefore(callback) {
      for (let i = 0; i < this.before.length; i++) {
        callback(this.before[i], i);
      }
    }

    eachAfter(callback) {
      for (let i = 0; i < this.after.length; i++) {
        callback(this.after[i], i);
      }
    }

    index(num) {
      this.eachBefore(before => { num = before.index(num); });
      this.num = ++num;
      this.eachAfter(after => {num = after.index(num)});

      return num;
    }

    serialize(tokens) {
      this.eachBefore(before => { before.serialize(tokens); });

      tokens.push({
        form: this.form,
        heads: [{
          index: this.parent.num || 0,
          deprel: this.deprel,
        }],
        index: this.num,
      });

      this.eachAfter(after => { after.serialize(tokens); });

      return tokens;
    }

    get form() { return this.words.join("_"); }

    push(token) {
      if (this.words.length) {
        this.after.push(token);
      } else {
        this.before.push(token);
      }
    }

    addWord(word) {
      if (!word)
        return;

      if (this.deprel) {
        this.words.push(word);
      } else {
        this.deprel = word;
      }
    }
  }

  let sent = new Sentence(text, options), parsing = sent, parent = null,
      word = "";

  _.each(text, char => {
    switch (char) {
    case ("["):
      parent = parsing;
      parsing = new Token(parent);
      if (parent && parent.push)
        parent.push(parsing)
        word = "";
      break;

    case ("]"):
      if (parsing.addWord)
        parsing.addWord(word);
      parsing = parsing.parent;
      parent = parsing.parent;
      word = "";
      break;

    case (" "):
      if (parsing.addWord)
        parsing.addWord(word);
      word = "";
      break;

    default:
      word += char;
      break;
    }
  });

  // console.log(sent.serialize())
  return sent.serialize();
};
