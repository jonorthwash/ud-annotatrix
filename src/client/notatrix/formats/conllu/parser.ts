import * as _ from "underscore";

import * as re from "../../utils/regex";
import {detect} from "./detector";
import {DetectorError, ParserError} from "../../utils/errors";
import {thin} from "../../utils/funcs";
import type {Options} from "../../nx/options";
import type {SentenceSerial} from "../../nx/sentence";
import type {TokenSerial} from "../../nx/base-token";

interface ParsedIndex {
  major: number;
  minor: number|null;
}

interface Head {
  index: number|string;
  deprel: string|null;
}

interface CommentChunk {
  type: "comment";
  body: string;
}

interface SuperTokenChunk {
  type: "super-token";
  index: string;
  startIndex: string;
  stopIndex: string;
  form: string|null;
  misc: string[]|null;
}

interface TokenChunk {
  type: "token";
  index: string;
  isEmpty: boolean;
  form: string|null;
  lemma: string|null;
  upostag: string|null;
  xpostag: string|null;
  feats: string[]|null;
  heads: Head[]|null;
  misc: string[]|null;
}

type Chunk = CommentChunk|SuperTokenChunk|TokenChunk;

interface SuperToken {
  form: string|null;
  misc: string[]|null;
  analyses: {subTokens: TokenSerial[]}[];
  index: string;
  currentIndex: string|null;
  stopIndex: string;
}

function getHeads(isEmpty: boolean, head: string, deprel: string, deps: string): Head[]|null {
  head = re.fallback.test(head) ? null : head;
  deprel = re.fallback.test(deprel) ? null : deprel;
  deps = re.fallback.test(deps) ? null : deps;

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
      const depParts = dep.split(":");

      if (!seen.has(depParts[0]))
        heads.push({
          index: depParts[0],
          deprel: depParts[1] || null,
        });

      seen.add(depParts[0]);
    });
  } else if (isEmpty) {
    // FIXME: Add this as a "strict mode" requirement?
    // throw new ParserError(`Missing "deps" for empty node:
    // ${line}`, text, options);
  }

  return heads.length ? heads : null;
}

export function parse(text: string, options: Options): SentenceSerial {
  options = {
    allowEmptyString: false,
    requireTenParams: false,
    allowWhiteLines: true,
    enhanced: false,
    ...options,
  };


  function assertNext(supStr: string, subStr: string): void {
    function parseIndex(str: string): ParsedIndex|null {
      const match = (str || "").match(re.conlluEmptyIndex);
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
            sup.minor === null ? "" : "." + sup.minor})`, text, options);

    } else if (sup.minor === null) {
      if (sub.minor !== 1)
        throw new ParserError(`unexpected token index (at: ${sup.major}${
            sup.minor === null ? "" : "." + sup.minor}, got: ${sup.major}${
            sup.minor === null ? "" : "." + sup.minor})`, text, options);

    } else {
      if (sub.minor - sup.minor !== 1)
        throw new ParserError(`unexpected token index (at: ${sup.major}${
            sup.minor === null ? "" : "." + sup.minor}, got: ${sup.major}${
            sup.minor === null ? "" : "." + sup.minor})`, text, options);
    }
  }

  try {
    detect(text, options);
  } catch (e) {
    if (e instanceof DetectorError)
      throw new ParserError(e.message, text, options);

    throw e;
  }

  // console.log();
  // console.log(text);

  // "tokenize" into chunks
  let i = 0
  let chunks: Chunk[] = [];
  const lines = text.split("\n");
  const tokenRegex = options.requireTenParams
                         ? re.conlluTokenLineTenParams
                         : re.conlluTokenLine;

  lines.forEach(line => {
    const whiteline = line.match(re.whiteline),
          comment = line.match(re.comment),
          tokenLine = line.match(tokenRegex);

    if (whiteline) {
    } else if (comment) {
      chunks.push({type: "comment", body: comment[2]});

    } else if (tokenLine) {
      let chunk: Chunk;

      let fieldsAsString = tokenLine[7];
      let fields;
      if (/(\t|[ ]{2,})/g.test(fieldsAsString)) {
        fields =
            fieldsAsString.replace(/[ ]{2,}/g, "\t").split(/\t/g).filter(thin);

      } else {
        fields = fieldsAsString.split(/[\t ]+/g).filter(thin);
      }

      if (tokenLine[4]) {
        chunk = {
          type: "super-token",
          index: tokenLine[1],
          startIndex: tokenLine[2],
          stopIndex: tokenLine[5],
          form: re.fallback.test(fields[0]) ? null : fields[0],
          misc: re.fallback.test(fields[8]) ? null : fields[8].split("|"),
        };

      } else {

        const isEmpty = !!tokenLine[3];
        if (isEmpty) {
          options.enhanced = true;
        }

        chunk = {
          type: "token",
          index: tokenLine[1],
          isEmpty: isEmpty,
          form: !fields[0] || re.fallback.test(fields[0]) ? null
                                                                : fields[0],
          lemma: !fields[1] || re.fallback.test(fields[1]) ? null
                                                                 : fields[1],
          upostag: !fields[2] || re.fallback.test(fields[2]) ? null
                                                                   : fields[2],
          xpostag: !fields[3] || re.fallback.test(fields[3]) ? null
                                                                   : fields[3],
          feats: !fields[4] || re.fallback.test(fields[4])
                     ? null
                     : fields[4].split("|"),
          heads: getHeads(isEmpty, fields[5], fields[6], fields[7]),
          misc: !fields[8] || re.fallback.test(fields[8])
                    ? null
                    : fields[8].split("|"),
        };
      }
      chunks.push(chunk);

    } else {
      throw new ParserError(`unable to match line: ${line}`, text, options);
    }
  });

  // console.log(chunks);

  let tokens: TokenSerial[] = [];
  let comments: string[] = [];
  let expecting = ["comment", "super-token", "token"];
  let superToken: SuperToken|null = null;

  chunks.filter(thin).forEach(chunk => {
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
}
