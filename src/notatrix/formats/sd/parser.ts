import * as _ from "underscore";

import * as re from "../../utils/regex";
import {detect} from "./detector";
import {DetectorError, ParserError} from "../../utils/errors";
import {parse as parseText} from "../plain-text/parser";
import type {Options} from "../../nx/options";
import type {SentenceSerial} from "../../nx/sentence";
import type {TokenSerial} from "../../nx/base-token";

interface CommentChunk {
  type: "comment";
  body: string;
}

interface DependencyChunk {
  type: "dependency";
  deprel: string;
  head: string;
  dep: string;
}

interface TextChunk {
  type: "text";
  body: string;
}

type Chunk = CommentChunk|DependencyChunk|TextChunk;

export function parse(text: string|undefined, options: Options): SentenceSerial {
  function getTokenIndexFromString(tokens: TokenSerial[], token: string): number|null {
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].form.toLowerCase() === token.toLowerCase())
        return i;
    }

    return null;
  }

  // console.log();
  // console.log(text);

  options = {
    allowEmptyString: false,
    allowBookendWhitespace: true,
    allowWhiteLines: true,
    ...options,
  };

  try {
    detect(text, options);
  } catch (e) {
    if (e instanceof DetectorError)
      throw new ParserError(e.message, text, options);

    throw e;
  }

  const lines = text.split("\n");
  const depRegex = options.allowBookendWhitespace
                       ? re.sdDependencyNoWhitespace
                       : re.sdDependency;

  let chunks: Chunk[] = [];
  lines.forEach(line => {
    const whiteline = line.match(re.whiteline),
          comment = line.match(re.comment), dep = line.match(depRegex);

    if (whiteline) {
    } else if (comment) {
      chunks.push({type: "comment", body: comment[2]});

    } else if (dep) {
      chunks.push(
          {type: "dependency", deprel: dep[1], head: dep[2], dep: dep[3]});

    } else {
      chunks.push({
        type: "text",
        body: line,
      });
    }
  });

  // console.log(chunks);

  let tokens: TokenSerial[];
  let comments: string[] = [];
  let expecting = ["comment", "text"];

  chunks.forEach(chunk => {
    if (expecting.indexOf(chunk.type) === -1)
      throw new ParserError(
          `expecting ${expecting.join("|")}, got ${chunk.type}`, text, options);

    if (chunk.type === "comment") {
      comments.push(chunk.body);
      expecting = ["comment", "text"];

    } else if (chunk.type === "text") {
      tokens = parseText(chunk.body, options).tokens;
      expecting = ["dependency"];

    } else if (chunk.type === "dependency") {
      let index = getTokenIndexFromString(tokens, chunk.dep);
      if (index === null)
        throw new ParserError(`unable to find token with form ${chunk.dep}`,
                              text, options);

      tokens[index].heads = [{
        index: getTokenIndexFromString(tokens, chunk.head),
        deprel: chunk.deprel,
      }];
      expecting = ["dependency"];
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
