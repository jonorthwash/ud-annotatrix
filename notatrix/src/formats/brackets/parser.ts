import * as _ from "underscore";

import {detect} from "./detector";
import {DetectorError, ParserError} from "../../utils/errors";
import type {Options} from "../../nx/options";
import type {SentenceSerial} from "../../nx/sentence";
import type {TokenSerial} from "../../nx/base-token";

export function parse(text: string, options: Options): SentenceSerial {
  // console.log();
  // console.log(text);

  options = {
    allowEmptyString: false,
    ...options,
  };

  try {
    detect(text, options);
  } catch (e) {
    if (e instanceof DetectorError)
      throw new ParserError(e.message, text, options);

    throw e;
  }

  class _Sentence {
    input: string;
    options: Options;
    parent: _Token|null;
    root: _Token|null;
    comments: string[];

    constructor(text: string, options: Options) {
      this.input = text;
      this.options = options;
      this.parent = null;
      this.root = null;
      this.comments = [];
    }

    serialize(): SentenceSerial {
      this.root.index(0);

      return {
        input: this.input,
        options: this.options,
        comments: this.comments,
        tokens: this.root.serialize([])
      };
    }

    push(token: _Token) { this.root = token; }
  }

  class _Token {
    parent: _Token;
    deprel: string|null;
    before: _Token[];
    words: string[];
    after: _Token[];
    num: number|undefined;

    constructor(parent: _Token) {
      this.parent = parent;
      this.deprel = null;
      this.before = [];
      this.words = [];
      this.after = [];
    }

    eachBefore(callback: (token: _Token, index: number) => void): void {
      for (let i = 0; i < this.before.length; i++) {
        callback(this.before[i], i);
      }
    }

    eachAfter(callback: (token: _Token, index: number) => void): void {
      for (let i = 0; i < this.after.length; i++) {
        callback(this.after[i], i);
      }
    }

    index(num: number): number {
      this.eachBefore(before => { num = before.index(num); });
      this.num = ++num;
      this.eachAfter(after => {num = after.index(num)});

      return num;
    }

    serialize(tokens: TokenSerial[]): TokenSerial[] {
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

    get form(): string { return this.words.join("_"); }

    push(token: _Token): void {
      if (this.words.length) {
        this.after.push(token);
      } else {
        this.before.push(token);
      }
    }

    addWord(word: string): void {
      if (!word)
        return;

      if (this.deprel) {
        this.words.push(word);
      } else {
        this.deprel = word;
      }
    }
  }

  let sent = new _Sentence(text, options);
  let parsing: _Sentence|_Token = sent;
  let parent: _Sentence|_Token|null = null;
  let word = "";

  _.each(text, char => {
    switch (char) {
    case ("["):
      parent = parsing;
      parsing = new _Token(parent as _Token);
      if (parent && parent.push)
        parent.push(parsing)
        word = "";
      break;

    case ("]"):
      if ((parsing as _Token).addWord)
        (parsing as _Token).addWord(word);
      parsing = parsing.parent;
      parent = parsing.parent;
      word = "";
      break;

    case (" "):
      if ((parsing as _Token).addWord)
        (parsing as _Token).addWord(word);
      word = "";
      break;

    default:
      word += char;
      break;
    }
  });

  // console.log(sent.serialize())
  return sent.serialize();
}
