"use strict";

import * as _ from "underscore";
import {NxError, ToolError} from "../utils/errors";

import {Analysis} from "./analysis";
import {BaseToken, TokenSerial} from "./base-token";
import {Comment} from "./comment";
import {GENERATE_BY_NAME as generate} from "../generator";
import {NxBaseClass} from "./base-class";
import {Options} from "./options";
import {PARSE_BY_NAME, parse} from "../parser";
import {RootToken} from "./root-token";
import {SubToken} from "./sub-token";
import {Token} from "./token";
import type {Corpus} from "./corpus";

export interface SentenceSerial {
  meta?: SentenceMeta;
  input: string;
  isParsed?: boolean;
  options: Options;
  comments: string[];
  tokens: TokenSerial[];
}

interface SentenceMeta {
  format?: string;
}

interface SuperToken {
  token: Token;
  start: string|number|null;
  stop: string|number|null;
  analysis: number|null;
}

/**
 * Abstraction over a Sentence.  Holds an array of comments and of tokens,
 *  plus some metadata.
 */
export class Sentence extends NxBaseClass {
  _meta: SentenceMeta;
  input: string|undefined;
  isParsed: boolean;
  Error: Error|null;
  options: Options;
  root: RootToken;
  comments: Comment[];
  tokens: Token[];
  size: number;
  _index: number|undefined;
  corpus: Corpus|undefined;

  constructor(serial: SentenceSerial|string, options?: Options) {
    super("Sentence");

    this._meta = {};

    serial = serial || "";
    options = options || {};
    options = _.defaults(options, {
      interpretAs: null,
      addHeadOnModifyFailure: true,
      depsShowDeprel: true,
      showRootDeprel: true,
      enhanced: false,
      useTokenDeprel: true,
      autoAddPunct: true,
    });

    this.input = (serial as SentenceSerial).input == null
      ? (serial as string)
      : (serial as SentenceSerial).input;

    this.isParsed = false;
    this.Error = null;

    try {
      let parsed: SentenceSerial;
      if (options.interpretAs) {
        // interpret as a particular format if passed option
        console.log('options.interpretAs: ' + options.interpretAs);
        parsed = PARSE_BY_NAME[options.interpretAs](serial, options) as SentenceSerial;
      } else {
        // otherwise, get an array of possible interpretations
        let parseds = parse(serial, options);
        parseds = Array.isArray(parseds) ? parseds : [parseds];

        // choose one of them if possible
        if (parseds.length === 0) {
          throw new NxError("Unable to parse: unrecognized format");
        } else if (parseds.length === 1) {
          parsed = parseds[0] as SentenceSerial;
        } else {
          throw new NxError(`Unable to parse: ambiguous format (${parseds.join(", ")})`);
        }

        if (parsed.isParsed === false)
          throw new NxError("Cannot parse explicitly unparsed serial");
      }

      this.options = parsed.options;

      this.root = new RootToken(this);
      this.comments = parsed.comments.map(com => new Comment(this, com));
      this.tokens = parsed.tokens.map(tok => new Token(this, tok));

      this.attach();
      this.isParsed = true;

    } catch (e) {
      if ((e instanceof NxError || e instanceof ToolError)) {
        this.options = (serial as SentenceSerial).options || options;
        this.comments = [];
        this.tokens = [];
        this.Error = e;

      } else {
        throw e;
      }
    }
  }

  /**
   * Output Sentence to a given format
   */
  to(format: string, options?: Options): any {
    console.log('===');
    console.log('sentence.to:');
    console.log(format);
    console.log(options);
    console.log('---');
    if(format in generate) {
        return generate[format](this, options);
    } else {
        return generate["CoNLL-U"](this, options);
    }
  }

  /**
   * Output Sentence to a notatrix-serial string
   */
  serialize(optionsToOmit: Options = {}): SentenceSerial {

    // Create a copy of 'options' where we skip all the key/value pairs
    // for which 'optionsToOmit' has the same values.  This way, we can
    // avoid storing a ton of redundant options for each Sentence.
    const options = Object.fromEntries(
        Object
          .entries(this.options)
          .filter(([key, value]) => optionsToOmit[key as keyof Options] !== value));

    return {
      meta: this._meta,
      input: this.input,
      isParsed: this.isParsed,
      options,
      comments: this.isParsed ? this.comments.map(com => com.serialize()) : [],
      tokens: this.isParsed ? this.tokens.map(token => token.serialize()) : [],
    };
  }

  /**
   * Apply a callback function for every token in the sentence
   */
  iterate(callback: (token: BaseToken, sup?: number, ana?: number|null, sub?: number|null) => void): void {
    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      callback(token, i, null, null);

      for (let j = 0; j < token._analyses.length; j++) {
        for (let k = 0; k < token._analyses[j]._subTokens.length; k++) {
          const subToken = token._analyses[j]._subTokens[k];
          callback(subToken, i, j, k);
        }
      }
    }
  }

  /**
   * Return all tokens where `predicate(token)` is truth-y
   */
  query(predicate: (token: BaseToken) => boolean): BaseToken[] {
    let matches: BaseToken[] = [];
    this.iterate(token => {
      if (predicate(token))
        matches.push(token);
    });
    return matches;
  }

  index(): Sentence {
    let absolute = 0
    let majorToken: Token|null = null
    let superToken: SuperToken|null = null
    let empty = 0

    let conllu = 0
//    let cg3 = 0
    let cytoscape = -1;

    this.iterate((token, i, j, k) => {
      token.indices.sup = i;
      token.indices.ana = j;
      token.indices.sub = k;
      token.indices.absolute = ++absolute;

//      if (!token._analyses || !token._analyses.length)
//        token.indices.cg3 = ++cg3;

      // @ts-ignore: `'Analysis' and 'number' have no overlap`
      if (!token.isSuperToken && superToken && superToken.analysis === j)
        token.indices.cytoscape = ++cytoscape;

      if ((token as Token).subTokens && (token as Token).subTokens.length === 0)
        token.indices.cytoscape = ++cytoscape;

      if (j === null || k === null) {
        let castedToken = token as Token;
        majorToken = castedToken;

        if (superToken) {
          superToken.token.indices.conllu =
              superToken.start + "-" + superToken.stop;
          superToken = null;
        }

        if (castedToken.subTokens.length) {
          superToken = {
            token: castedToken,
            start: null,
            stop: null,
            analysis: castedToken._i,
          };
        } else {
          if (castedToken.isEmpty) {
            empty += 1;
          } else {
            empty = 0;
            conllu += 1;
          }

          castedToken.indices.conllu = empty ? conllu + "." + empty : conllu;
        }

      } else {
        if (majorToken._i === j) {
          if (token.isEmpty) {
            empty += 1;
          } else {
            empty = 0;
            conllu += 1;
          }

          token.indices.conllu = empty ? conllu + "." + empty : conllu;
        }

        if (superToken) {
          if (superToken.start === null) {
            superToken.start = empty ? conllu + "." + empty : conllu;
          } else {
            superToken.stop = empty ? conllu + "." + empty : conllu;
          }
        }
      }
    });

    if (superToken) {
      superToken.token.indices.conllu =
          `${superToken.start}-${superToken.stop}`;
      superToken = null;
    }

    this.size = absolute;
    return this;
  }

  attach(): Sentence {
    this.iterate(token => {
      (token._heads || []).forEach((dependency, i) => {
        if (i)
          token.sent.options.enhanced = true;

        // @ts-ignore: This should probably be `0`, not `"0"`...
        if (dependency.index == "0") {
          token.addHead(token.sent.root, "root");

        } else {
          const query = token.sent.query(token => token.indices.serial ===
                                                  dependency.index);
          if (query.length !== 1) {
            // console.log(token)
            throw new NxError(
                `cannot locate token with serial index "${dependency.index}"`);
          }

          token.addHead(query[0], dependency.deprel);
        }
      });

      delete token._heads;
    });

    return this.index();
  }

  /**
   * Tell Sentence to output in enhanced dependency format
   */
  enhance(): Sentence {
    this.options.enhanced = true;

    this.iterate(token => {
      // @ts-ignore: There is no `_head` property anymore: it was removed in [1].
      //
      // [1] https://github.com/keggsmurph21/notatrix/commit/5322a353c1ad35b353d4c7692d3d071459136819
      if (!token._head)
        return;

      // @ts-ignore: Unreachable because of the bug directly above..
      token.addDep(token._head, token.deprel);
    });

    return this;
  }

  /**
   * Tell Sentence to stop outputting in enhanced dependency format
   */
  unenhance(): Sentence {
    this.options.enhanced = false;
    return this;
  }

  /**
   * Get the superToken for a given token
   */
  getSuperToken(token: BaseToken): BaseToken|null {
    let superToken = null;

    this.iterate(tok => {
      if (!tok._analyses)
        return;

      tok._analyses.forEach(ana => {
        if (!ana._subTokens)
          return;

        ana._subTokens.forEach(sub => {
          if (sub === token)
            superToken = tok;
        });
      });
    });

    return superToken;
  }

  /**
   * Merge tokens into a single, regular token
   */
  merge(src: BaseToken, tar: BaseToken): Sentence {
    if (!(src instanceof BaseToken) || !(tar instanceof BaseToken))
      throw new NxError("unable to merge: src and tar must both be tokens");

    if (src.isSuperToken || tar.isSuperToken)
      throw new NxError("unable to merge: cannot merge superTokens");

    if (src.name === "SubToken" || tar.name === "SuperToken")
      throw new NxError("unable to merge: cannot merge subTokens");

    if (Math.abs(tar.indices.absolute - src.indices.absolute) > 1)
      throw new NxError("unable to merge: tokens too far apart");

    const [left, right] = BaseToken.sortTokenPair(src, tar, "CoNLL-U"); // TODO: We probably shouldn't hard-code the format here ...

    // basic copying
    left.semicolon = left.semicolon || right.semicolon;
    left.isEmpty = left.isEmpty || right.isEmpty;
    left.form = (left.form || "") + (right.form || "") || null;
    left.lemma = left.lemma || right.lemma;
    left.upostag = left.upostag || right.upostag;
    left.xpostag = left.xpostag || right.xpostag;

    // array-type copying
    left._feats_init = left._feats_init || right._feats_init;
    left._feats = left._feats_init ? (left._feats || []).concat(right._feats || [])
                                  : undefined;
    left._misc_init = left._misc_init || right._misc_init;
    left._misc =
        left._misc_init ? (left._misc || []).concat(right._misc || []) : undefined;

    // make sure they don't depend on each other
    left.removeHead(right);
    right.removeHead(left);

    // migrate dependent things to the new token
    right.mapDependents(dep => {
      dep.token.removeHead(right);
      dep.token.addHead(left, dep.deprel);
    });

    // remove heads from the old token
    right.removeAllHeads();

    // now that all references are gone, safe to splice the target out
    this.tokens.splice(right.indices.sup, 1);

    return this.index();
  }

  /**
   * Combine tokens into subTokens of some superToken
   */
  combine(src: BaseToken, tar: BaseToken): Sentence {
    if (!(src instanceof BaseToken) || !(tar instanceof BaseToken))
      throw new NxError("unable to combine: src and tar must both be tokens");

    if (src.isSuperToken || tar.isSuperToken)
      throw new NxError("unable to combine: cannot combine superTokens");

    if (src.name === "SubToken" || tar.name === "SuperToken" || tar.name === "SubToken")
      throw new NxError("unable to combine: cannot combine subTokens");

    if (Math.abs(tar.indices.absolute - src.indices.absolute) > 1)
      throw new NxError("unable to combine: tokens too far apart");

    // get a new token to put things into
    let superToken = new Token(this, {});
    superToken._analyses = [new Analysis(this, {subTokens: []})];
    superToken._i = 0;

    // get the new superToken form from the subTokens
    const [left, right] = BaseToken.sortTokenPair(src, tar, "CoNLL-U"); // TODO: We probably shouldn't hard-code the format here ...
    superToken.form = (left.form || "") + (right.form || "") || null;

    // make new subToken objects from src and tar
    let _src = new SubToken(this, {});

    // basic copying
    _src.semicolon = src.semicolon;
    _src.isEmpty = src.isEmpty;
    _src.form = src.form;
    _src.lemma = src.lemma;
    _src.upostag = src.upostag;
    _src.xpostag = src.xpostag;

    // array-type copying
    _src._feats_init = src._feats_init;
    _src._feats = _src._feats_init ? src._feats.slice() : undefined;
    _src._misc_init = src._misc_init;
    _src._misc = _src._misc_init ? src._misc.slice() : undefined;

    // make new subToken objects from src and tar
    let _tar = new SubToken(this, {});

    // basic copying
    _tar.semicolon = tar.semicolon;
    _tar.isEmpty = tar.isEmpty;
    _tar.form = tar.form;
    _tar.lemma = tar.lemma;
    _tar.upostag = tar.upostag;
    _tar.xpostag = tar.xpostag;

    // array-type copying
    _tar._feats_init = tar._feats_init;
    _tar._feats = _tar._feats_init ? tar._feats.slice() : undefined;
    _tar._misc_init = tar._misc_init;
    _tar._misc = _tar._misc_init ? tar._misc.slice() : undefined;

    if (src.indices.absolute < tar.indices.absolute) {
      superToken.analysis._subTokens.push(_src, _tar);

    } else {
      superToken.analysis._subTokens.push(_tar, _src);
    }

    // remove within-superToken dependencies
    src.removeHead(tar);
    tar.removeHead(src);

    // transfer all the heads and dependents to the new subTokens
    src.mapHeads(head => {
      src.removeHead(head.token);
      _src.addHead(head.token, head.deprel);
    });

    src.mapDependents(dep => {
      dep.token.removeHead(src);
      dep.token.addHead(_src, dep.deprel);
    });

    tar.mapHeads(head => {
      tar.removeHead(head.token);
      _tar.addHead(head.token, head.deprel);
    });

    tar.mapDependents(dep => {
      dep.token.removeHead(tar);
      dep.token.addHead(_tar, dep.deprel);
    });

    // overwrite the src with the new token
    this.tokens[src.indices.sup] = superToken;

    // splice out the old target
    this.tokens.splice(tar.indices.sup, 1);

    return this.index();
  }

  /**
   * Split a given token into two tokens.  If the given token is a
   *  superToken, make each of its subTokens into a regular token and
   *  delete the superToken.  Otherwise, split the token at the given
   *  index.
   */
  split(src: BaseToken, splitAtIndexInput?: string|number): Sentence {
    if (!(src instanceof BaseToken))
      throw new NxError("unable to split: src must be a token");

    if (src.isSuperToken) {
      const tokens = (src as Token).subTokens.map(subToken => {
        let token = new Token(this, {});

        // basic copying
        token.semicolon = subToken.semicolon;
        token.isEmpty = subToken.isEmpty;
        token.form = subToken.form;
        token.lemma = subToken.lemma;
        token.upostag = subToken.upostag;
        token.xpostag = subToken.xpostag;

        // array-type copying
        token._feats_init = subToken._feats_init;
        token._feats = (subToken._feats || []).slice();
        token._misc_init = subToken._misc_init;
        token._misc = (subToken._misc || []).slice();

        // transfer all the heads and dependents from subToken to token
        subToken.mapHeads(head => {
          subToken.removeHead(head.token);
          token.addHead(head.token, head.deprel);
        });

        subToken.mapDependents(dep => {
          dep.token.removeHead(subToken);
          dep.token.addHead(token, dep.deprel);
        });

        return token;
      });

      const index = src.indices.sup;

      // splice out the old superToken
      this.tokens.splice(index, 1);

      // insert the new tokens into its place
      this.tokens = this.tokens.slice(0, index).concat(tokens).concat(
          this.tokens.slice(index));

    } else if (src.name === "SubToken") {
      let splitAtIndex = parseInt(splitAtIndexInput as string);
      if (isNaN(splitAtIndex))
        throw new NxError(
            `unable to split: cannot split at index ${splitAtIndex}`);

      let subToken = new SubToken(this, {});

      const beginning = (src.form || "").slice(0, splitAtIndex) || "_";
      const ending = (src.form || "").slice(splitAtIndex) || "_";

      src.form = beginning;
      subToken.form = ending;

      const superToken = this.getSuperToken(src);
      const subTokens = superToken._analyses[src.indices.ana]._subTokens;
      const index = src.indices.sub;

      // insert the new subToken after it
      superToken._analyses[src.indices.ana]._subTokens =
          subTokens.slice(0, index + 1)
              .concat(subToken)
              .concat(subTokens.slice(index + 1));

    } else {
      let splitAtIndex = parseInt(splitAtIndexInput as string);
      if (isNaN(splitAtIndex))
        throw new NxError(
            `unable to split: cannot split at index ${splitAtIndex}`);

      let token = new Token(this, {});

      const beginning = (src.form || "").slice(0, splitAtIndex) || "_";
      const ending = (src.form || "").slice(splitAtIndex) || "_";

      src.form = beginning;
      token.form = ending;

      const index = src.indices.sup;

      // insert the new token after it
      this.tokens = this.tokens.slice(0, index + 1)
                        .concat(token)
                        .concat(this.tokens.slice(index + 1));
    }

    return this.index();
  }
}
