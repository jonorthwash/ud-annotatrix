'use strict';

require('./test/utils').setupLogger();

const _ = require('underscore');
const nx = require('notatrix');
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

    eachBefore(callback) {
      for (let i=0; i<this.before.length; i++) {
        callback(this.before[i], i);
      }
    }

    eachAfter(callback) {
      for (let i=0; i<this.after.length; i++) {
        callback(this.after[i], i);
      }
    }

    tokenize(sent) {

      this.eachBefore(before => {
        sent = before.tokenize(sent);
      });

      let token = nx.Token.fromParams(sent, {
        form: this.words.join('-'),
        deprel: this.deprel
      });
      sent.insertTokenAt(Infinity, token);

      this.eachAfter(after => {
        sent = after.tokenize(sent);
      });

      this.analysis = token.analysis;

      return sent;
    }

    dependize(sent, id) {

      this.eachBefore(before => {
        sent = before.dependize(sent, this.analysis.id);
      });

      const head = sent.getById(id);
      if (head)
        this.analysis.addHead(head, this.deprel);

      this.eachAfter(after => {
        sent = after.dependize(sent, this.analysis.id);
      });

      return sent;
    }

    toString() {
      return `[${this.deprel}${
        this.before.length
          ? ` ${this.before.map(token => token.toString()).join(' ')}`
          : ''
      } ${this.words.join(' ')}${
        this.after.length
          ? ` ${this.after.map(token => token.toString()).join(' ')}`
          : ''
      }]`;
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

    encode() {
      let sent = new nx.Sentence();

      sent = this.root.tokenize(sent);
      sent.index();
      sent = this.root.dependize(sent, 0);
      sent.comments = this.comments;

      return sent;
    }

    toString() {
      return `${this.root.toString()}`;
    }

    push(token) {
      this.root = token;
    }
  }

  let sent = new Sentence(),
    parsing = sent,
    parent = null,
    word = '';

  try {
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

  } catch (e) {

    if (!(e instanceof ParseError))
      throw e;

    return null;
  }
}

function convert(text) {

  const parsed = parse(text);
  const converted = parsed.encode();

  return converted;
}


module.exports = convert(data);
console.log('  before:');
console.log(data);
console.log('  parsed:');
//console.log('', parse(data));
console.log(parse(data).toString());
console.log('  converted:');
//console.log('', convert(data)).nx;
console.log(convert(data).conllu);
