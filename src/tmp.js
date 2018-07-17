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

    toJSON() {
      return {
        name: 'Token',
        deprel: this.deprel,
        before: this.before.map(token => token.toJSON()),
        form: this.words.join(' '),
        after: this.after.map(token => token.toJSON())
      };
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

    get nx() {
      let sent = new nx.Sentence();

      return sent.nx;
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
  const converted = parsed.nx;

  return converted;
}


module.exports = convert(data);
console.log('before:');
console.log('', data);
console.log('parsed:')
console.log('', parse(data).toString());
console.log('converted:');
console.log('', convert(data));
