'use strict';

require('./test/utils').setupLogger();

const _ = require('underscore');
const data = require('./test/data/brackets')[0];
const ParseError = require('./errors').ParseError;

function printWord(word, level) {
  if (!word)
    return;

  console.log(`${' '.repeat(level * 2)}${word}`);
}

function parse(text) {

  class Token {
    constructor(parent) {
      this.parent = parent;

      this.deprel = null;
      this.before = [];
      this.words  = [];
      this.after  = [];
    }

    toString() {
      return `[${this.deprel}${
        this.before.length
          ? ` [${this.before.map(token => token.toString())}] `
          : ' '
      }${this.words.join(' ')}${
        this.after.length
          ? ` [${this.after.map(token => token.toString())}] `
          : ' '
      }]`;
    }

    toJSON() {
      return {
        name: 'Token',
        deprel: this.deprel,
        before: this.before.map(token => token.toJSON()),
        form: this.words.join(' '),
        after: this.after.map(token => token.toJSON())
      };
    }

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

  class Sentence {
    constructor() {
      this.parent = null;
      this.root = [];
      this.comments = [];
    }

    toString() {
      return this.root.toString();
    }

    toJSON() {
      return {
        name: 'Sentence',
        comments: this.comments,
        ROOT: this.root.toJSON()
      };
    }

    push(token) {
      this.root = token;
    }
  }

  let sent = new Sentence(),
    parsing = sent,
    parent = null,
    word = '';

  _.each(text, char => {
    switch (char) {
      case ('['):
        parent = parsing;
        parsing = new Token(parent);
        if (parent && parent.push)
          parent.push(parsing)
        word = '';
        break;

      case (']'):
        if (parsing.addWord)
          parsing.addWord(word);
        parsing = parsing.parent;
        parent = parsing.parent;
        word = '';
        break;

      case (' '):
        if (parsing.addWord)
          parsing.addWord(word);
        word = '';
        break;

      default:
        word += char;
        break;
    }
  });

  return sent;
}

function convert(text) {

  let parsed;
  try {
    parsed = parse(text);
  } catch (e) {
    if (e instanceof ParseError) {
      console.log('parse error');
    } else {
      throw e;
    }
  }

  return parsed;
}


module.exports = convert(data);
console.log(convert(data).toString())
