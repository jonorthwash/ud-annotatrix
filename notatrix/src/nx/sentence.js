"use strict";

const _ = require("underscore");

const utils = require("../utils");
const NxError = utils.NxError;
const ToolError = utils.ToolError;
const parse = require("../parser");
const generate = require("../generator");

const NxBaseClass = require("./base-class");
const Comment = require("./comment");
const BaseToken = require("./base-token");
const Token = require("./token");
const RootToken = require("./root-token");
const Analysis = require("./analysis");
const SubToken = require("./sub-token");

/**
 * Abstraction over a Sentence.  Holds an array of comments and of tokens,
 *  plus some metadata.
 */
class Sentence extends NxBaseClass {
  constructor(serial, options) {
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

    this.input = serial.input == null ? serial : serial.input;
    this.isParsed = false;
    this.Error = null;

    try {
      if (options.interpretAs) {
        // interpret as a particular format if passed option
        serial = parse.as [options.interpretAs](serial, options);

      } else {
        // otherwise, get an array of possible interpretations
        serial = parse(serial, options);

        // choose one of them if possible
        if (serial.length === 0) {
          throw new NxError("Unable to parse: unrecognized format", this);
        } else if (serial.length === 1) {
          serial = serial[0];
        } else {
          throw new NxError(
              `Unable to parse: ambiguous format (${serial.join(", ")})`, this);
        }

        if (serial.isParsed === false)
          throw new NxError("Cannot parse explicitly unparsed serial");
      }

      this.options = serial.options;

      this.root = new RootToken(this);
      this.comments = serial.comments.map(com => new Comment(this, com));
      this.tokens = serial.tokens.map(tok => new Token(this, tok));

      this.attach();
      this.isParsed = true;

    } catch (e) {
      if ((e instanceof NxError || e instanceof ToolError)) {
        this.options = serial.options || options;
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
   *
   * @param {String} format
   * @param {Object} options
   */
  to(format, options) { return generate[format](this, options); }

  /**
   * Output Sentence to a notatrix-serial string
   */
  serialize(master = {}) {
    return {
      meta: this._meta,
      input: this.input,
      isParsed: this.isParsed,
      options: utils.dedup(master, this.options),
      comments: this.isParsed ? this.comments.map(com => com.serialize()) : [],
      tokens: this.isParsed ? this.tokens.map(token => token.serialize()) : [],
    };
  }

  /**
   * Apply a callback function for every token in the sentence
   *
   * @param {Function} callback
   */
  iterate(callback) {
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
  query(predicate) {
    let matches = [];
    this.iterate(token => {
      if (predicate(token))
        matches.push(token);
    });

    return matches;
  }

  index() {
    let absolute = 0, majorToken = null, superToken = null, empty = 0,
        conllu = 0, cg3 = 0, cytoscape = -1;

    this.iterate((token, i, j, k) => {
      token.indices.sup = i;
      token.indices.ana = j;
      token.indices.sub = k;
      token.indices.absolute = ++absolute;

      if (!token._analyses || !token._analyses.length)
        token.indices.cg3 = ++cg3;

      if (!token.isSuperToken && superToken && superToken.analysis === j)
        token.indices.cytoscape = ++cytoscape;

      if (token.subTokens && token.subTokens.length === 0)
        token.indices.cytoscape = ++cytoscape;

      if (j === null || k === null) {
        majorToken = token;

        if (superToken) {
          superToken.token.indices.conllu =
              superToken.start + "-" + superToken.stop;
          superToken = null;
        }

        if (token.subTokens.length) {
          superToken = {
            token: token,
            start: null,
            stop: null,
            analysis: token._i,
          };
        } else {
          if (token.isEmpty) {
            empty += 1;
          } else {
            empty = 0;
            conllu += 1;
          }

          token.indices.conllu = empty ? conllu + "." + empty : conllu;
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

  attach() {
    this.iterate(token => {
      (token._heads || []).forEach((dependency, i) => {
        if (i)
          token.sent.options.enhanced = true;

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
  enhance() {
    this.options.enhanced = true;

    this.iterate(token => {
      if (!token._head)
        return;

      token.addDep(token._head, token.deprel);
    });

    return this;
  }

  /**
   * Tell Sentence to stop outputting in enhanced dependency format
   */
  unenhance() {
    this.options.enhanced = false;
    return this;
  }

  /**
   * Get the superToken for a given token
   *
   * @param {BaseToken} token
   * @return {BaseToken}
   */
  getSuperToken(token) {
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
   *
   * @param {BaseToken} src
   * @param {BaseToken} tar
   */
  merge(src, tar) {
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
   *
   * @param {BaseToken} src
   * @param {BaseToken} tar
   */
  combine(src, tar) {
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
   *
   * @param {BaseToken} src
   * @param {Number} splitAtIndex
   */
  split(src, splitAtIndex) {
    if (!(src instanceof BaseToken))
      throw new NxError("unable to split: src must be a token");

    if (src.isSuperToken) {
      const tokens = src.subTokens.map(subToken => {
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
      splitAtIndex = parseInt(splitAtIndex);
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
      splitAtIndex = parseInt(splitAtIndex);
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

module.exports = Sentence;
