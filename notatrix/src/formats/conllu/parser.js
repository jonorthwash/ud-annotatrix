"use strict";

const _ = require("underscore");

const utils = require("../../utils");
const ParserError = utils.ParserError;
const detect = require("./detector").detect;

module.exports = (text, options) => {
  function assertNext(supStr, subStr) {
    function parseIndex(str) {
      const match = (str || "").match(utils.re.conlluEmptyIndex);
      if (!match)
        return null;

      return match[2] ? {
        major: parseInt(match[1]),
        minor: parseInt(match[2].slice(1)),
      }
                      : {
                          major: parseInt(match[1]),
                          minor: null,
                        };
    }

    if (supStr === null)
      return;

    const sup = parseIndex(supStr), sub = parseIndex(subStr);

    if (sub.minor === null) {
      if (sub.major - sup.major !== 1)
        throw new ParserError(`unexpected token index (at: ${sup.major}${
            sup.minor === null ? "" : "." + sup.minor}, got: ${sup.major}${
            sup.minor === null ? "" : "." + sup.minor})`);

    } else if (sup.minor === null) {
      if (sub.minor !== 1)
        throw new ParserError(`unexpected token index (at: ${sup.major}${
            sup.minor === null ? "" : "." + sup.minor}, got: ${sup.major}${
            sup.minor === null ? "" : "." + sup.minor})`);

    } else {
      if (sub.minor - sup.minor !== 1)
        throw new ParserError(`unexpected token index (at: ${sup.major}${
            sup.minor === null ? "" : "." + sup.minor}, got: ${sup.major}${
            sup.minor === null ? "" : "." + sup.minor})`);
    }
  }

  options = _.defaults(options, {
    allowEmptyString: false,
    requireTenParams: false,
    allowWhiteLines: true,
    enhanced: false,
  });

  try {
    detect(text, options);
  } catch (e) {
    if (e instanceof utils.DetectorError)
      throw new ParserError(e.message);

    throw e;
  }

  // console.log();
  // console.log(text);

  // "tokenize" into chunks
  let i = 0, chunks = [];
  const lines = text.split("\n");
  const tokenRegex = options.requireTenParams
                         ? utils.re.conlluTokenLineTenParams
                         : utils.re.conlluTokenLine;

  lines.forEach(line => {
    const whiteline = line.match(utils.re.whiteline),
          comment = line.match(utils.re.comment),
          tokenLine = line.match(tokenRegex);

    if (whiteline) {
    } else if (comment) {
      chunks.push({type: "comment", body: comment[2]});

    } else if (tokenLine) {
      let token;

      let fields = tokenLine[7];
      if (/(\t|[ ]{2,})/g.test(fields)) {
        fields =
            fields.replace(/[ ]{2,}/g, "\t").split(/\t/g).filter(utils.thin);

      } else {
        fields = fields.split(/[\t ]+/g).filter(utils.thin);
      }

      if (tokenLine[4]) {
        token = {
          type: "super-token",
          index: tokenLine[1],
          startIndex: tokenLine[2],
          stopIndex: tokenLine[5],
          form: utils.re.fallback.test(fields[0]) ? null : fields[0],
          misc: utils.re.fallback.test(fields[8]) ? null : fields[8].split("|"),
        };

      } else {
        function getHeads(isEmpty, head, deprel, deps) {
          head = utils.re.fallback.test(head) ? null : head;
          deprel = utils.re.fallback.test(deprel) ? null : deprel;
          deps = utils.re.fallback.test(deps) ? null : deps;

          let heads = [];
          let seen = new Set();

          if (head && !isEmpty) {
            heads.push({
              index: head,
              deprel: deprel || null,
            });
            seen.add(head);
          }

          if (deps) {
            deps.split("|").forEach(dep => {
              dep = dep.split(":");

              if (!seen.has(dep[0]))
                heads.push({
                  index: dep[0],
                  deprel: dep[1] || null,
                });

              seen.add(dep[0]);
            });
          } else if (isEmpty) {
            // FIXME: Add this as a "strict mode" requirement?
            // throw new ParserError(`Missing "deps" for empty node:
            // ${line}`, text, options);
          }

          return heads.length ? heads : null;
        }

        const isEmpty = !!tokenLine[3];
        if (isEmpty) {
          options.enhanced = true;
        }

        token = {
          type: "token",
          index: tokenLine[1],
          isEmpty: isEmpty,
          form: !fields[0] || utils.re.fallback.test(fields[0]) ? null
                                                                : fields[0],
          lemma: !fields[1] || utils.re.fallback.test(fields[1]) ? null
                                                                 : fields[1],
          upostag: !fields[2] || utils.re.fallback.test(fields[2]) ? null
                                                                   : fields[2],
          xpostag: !fields[3] || utils.re.fallback.test(fields[3]) ? null
                                                                   : fields[3],
          feats: !fields[4] || utils.re.fallback.test(fields[4])
                     ? null
                     : fields[4].split("|"),
          heads: getHeads(isEmpty, fields[5], fields[6], fields[7]),
          misc: !fields[8] || utils.re.fallback.test(fields[8])
                    ? null
                    : fields[8].split("|"),
        };
      }
      chunks.push(token);

    } else {
      throw new ParserError(`unable to match line: ${line}`, text, options);
    }
  });

  // console.log(chunks);

  let tokens = [];
  let comments = [];
  let expecting = ["comment", "super-token", "token"];
  let superToken = null;

  chunks.filter(utils.thin).forEach(chunk => {
    if (expecting.indexOf(chunk.type) === -1)
      throw new ParserError(
          `expecting ${expecting.join("|")}, got ${chunk.type}`, text, options);

    if (chunk.type === "comment") {
      comments.push(chunk.body);
      expecting = ["comment", "super-token", "token"];

    } else if (chunk.type === "super-token") {
      superToken = {
        form: chunk.form,
        misc: chunk.misc,
        analyses: [{subTokens: []}],
        index: chunk.index,
        currentIndex: null,
        stopIndex: chunk.stopIndex
      };

      expecting = ["token"];

    } else if (chunk.type === "token") {
      if (superToken) {
        assertNext(superToken.currentIndex, chunk.index);
        superToken.currentIndex = chunk.index;

        superToken.analyses[0].subTokens.push(_.omit(chunk, ["type"]));

        if (superToken.currentIndex === superToken.stopIndex) {
          tokens.push(_.omit(superToken, ["currentIndex", "stopIndex"]));
          superToken = null;
          expecting = ["super-token", "token"];

        } else {
          expecting = ["token"];
        }

      } else {
        tokens.push(_.omit(chunk, ["type"]));
        expecting = ["super-token", "token"];
      }

    } else {
      throw new ParserError(`unrecognized chunk type: ${chunk.type}`, text,
                            options);
    }
  });

  // console.log(comments);
  // console.log(tokens);

  return {
    input: text,
    options: options,
    comments: comments,
    tokens: tokens,
  };
};
