import * as _ from "underscore";

import * as re from "../../utils/regex";
import {detect} from "./detector";
import {DetectorError, ParserError} from "../../utils/errors";
import {thin} from "../../utils/funcs";
import type {Options} from "../../nx/options";
import type {SentenceSerial} from "../../nx/sentence";
import type {TokenSerial} from "../../nx/base-token";

interface Head {
  index: number;
  deprel: string|null;
}

interface CommentChunk {
  type: "comment";
  body: string;
}

interface FormChunk {
  type: "form";
  form: string;
}

interface ContentChunk {
  type: "content";
  semicolon: boolean;
  indent: number;
  lemma: string;
  misc: string[];
  heads?: Head[];
  index?: number;
}

type Chunk = CommentChunk|FormChunk|ContentChunk;

interface SubToken {
  semicolon: boolean;
  lemma: string|null;
  heads: Head[]|null;
  index: number|null;
  xpostag: string|null;
  misc: string[]|null;
}

interface Analysis {
  subTokens: SubToken[];
}

interface Token {
  form: string;
  currentIndent?: number;
  analyses: Analysis[];
  index?: number;
}

export function parse(text: string, options: Options): SentenceSerial {
  options = {
    allowEmptyString: false,
    allowMissingIndices: true,
    coerceMultipleSpacesAfterSemicolonToTab: true,
    equalizeWhitespace: true,
    indentString: null,
    spacesPerTab: null,
    useTabIndent: false,
    ...options,
  };

  function getIndentNum(str: string, options: Options): number {
    const count = (str: string, reg: RegExp) => str.match(reg).length;

    if (options.indentString) {
      const regex = options.indentString instanceof RegExp
                        ? options.indentString
                        : new RegExp(options.indentString, "g");

      return count(str, regex);

    } else if (options.useTabIndent) {
      return count(str, /\t/g);

    } else if (options.spacesPerTab) {
      const regex = new RegExp(` {${options.spacesPerTab}}`, "g");
      return count(str, regex);

    } else if (options.equalizeWhitespace) {
      return count(str, /\s/g);

    } else {
      throw new ParserError(
          "can't get the indent number, insufficient options set", text,
          options);
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
  while (i < text.length) {
    const remains = text.slice(i),
          whiteline = remains.match(re.whiteline),
          comment = remains.match(re.comment),
          tokenStart = remains.match(re.cg3TokenStart),
          tokenContent = remains.match(re.cg3TokenContent);

    if (whiteline) {
      i += whiteline[0].length;

    } else if (comment) {
      chunks.push({type: "comment", body: comment[2]});
      i += comment[1].length;

    } else if (tokenStart) {
      chunks.push({type: "form", form: tokenStart[1]});
      i += tokenStart[0].length;

      while (re.whitespace.test(text[i]) && text[i] !== "\n")
        i++;
      i++;

    } else if (tokenContent) {
      // some real BS right here, overfitting my data hard
      const indent = options.coerceMultipleSpacesAfterSemicolonToTab
                         ? !!tokenContent[1]
                               ? tokenContent[2].replace(/ +/, "\t")
                               : tokenContent[2]
                         : tokenContent[2];

      let chunk: ContentChunk = {
        type: "content",
        semicolon: !!tokenContent[1],
        indent: getIndentNum(indent, options),
        lemma: tokenContent[3],
        misc: [],
      };

      const deprel = tokenContent[5].match(re.cg3Deprel);

      tokenContent[5].split(/\s+/).filter(thin).forEach(subChunk => {
        let dependency = subChunk.match(re.cg3Dependency),
            head = subChunk.match(re.cg3Head),
            index = subChunk.match(re.cg3Index),
            misc = subChunk.match(re.cg3Other);

        if (dependency && (head || index)) {
          if (head) {
            if (chunk.heads)
              throw new ParserError("unexpected subChunk, heads already set",
                                    text, options);

            const headIndex = parseInt(head[1]);
            if (!isNaN(headIndex))
              chunk.heads = [{
                index: headIndex,
                deprel: deprel && deprel[1] ? deprel[1] : null,
              }];

          } else if (index) {
            if (chunk.index)
              throw new ParserError("unexpected subChunk, index already set",
                                    text, options);

            chunk.index = parseInt(index[1]);
          }

        } else if (misc) {
          if (!misc[0].startsWith("@"))
            chunk.misc.push(misc[0]);
        }
      });

      if (deprel && deprel[1] && !chunk.heads)
        chunk.misc.push("@" + deprel[1]);

      chunks.push(chunk);
      i += tokenContent[0].length;

    } else {
      throw new ParserError(`unable to match remains: ${remains}`, text,
                            options);
    }
  }

  // console.log(chunks);

  // turn the chunks into tokens and comments
  let tokens: Token[] = [];
  let comments: string[] = [];
  let expecting = ["comment", "form"];
  let token: Token|null = null;
  let analysis: Analysis|null = null;
  let missingIndices = false;

  chunks.forEach(chunk => {
    if (expecting.indexOf(chunk.type) === -1)
      throw new ParserError(
          `expecting ${expecting.join("|")}, got ${chunk.type}`, text, options);

    if (chunk.type === "comment") {
      comments.push(chunk.body);
      expecting = ["comment", "form"];
      token = null;
      analysis = null;

    } else if (chunk.type === "form") {
      if (analysis)
        token.analyses.push(analysis);

      if (token) {
        if (token.analyses.length === 1 &&
            token.analyses[0].subTokens.length === 1)
          token = _.omit(_.extend(token, token.analyses[0].subTokens[0]),
                         "analyses");

        tokens.push(_.omit(token, "currentIndent"));
      }

      token = {
        form: chunk.form,
        currentIndent: 0,
        analyses: [],
      };
      analysis = null;

      expecting = ["content"];

    } else if (chunk.type === "content") {
      if (!token)
        throw new ParserError("cannot parse content chunk without a token",
                              text, options);

      if (chunk.indent > token.currentIndent + 1)
        throw new ParserError(
            `invalid indent change (${token.currentIndent}=>${chunk.indent})`,
            text, options)

        if (chunk.indent === 1) {
          if (analysis)
            token.analyses.push(analysis);

          if (chunk.index === undefined) {
            if (!options.allowMissingIndices)
              throw new ParserError("cannot parse token without index", text,
                                    options);

            missingIndices = true;

          } else {
            if (missingIndices)
              throw new ParserError("cannot parse partially indexed CG3", text,
                                    options);
          }

          analysis = {
            subTokens: [{
              semicolon: chunk.semicolon,
              lemma: chunk.lemma || null,
              heads: chunk.heads || null,
              index: chunk.index || null,
              xpostag: chunk.misc.shift() || null,
              misc: chunk.misc || null,
            }]
          };
        }
      else {
        if (!analysis)
          throw new ParserError(
              "cannot parse content chunk without an analysis", text, options);

        if (chunk.index === undefined && !options.allowMissingIndices)
          throw new ParserError("cannot parse token without index", text,
                                options);

        analysis.subTokens.push({
          semicolon: chunk.semicolon,
          lemma: chunk.lemma || null,
          heads: chunk.heads || null,
          index: chunk.index || null,
          xpostag: chunk.misc.shift() || null,
          misc: chunk.misc || null,
        });
      }

      token.currentIndent = chunk.indent;
      expecting = ["content", "form"];
    }
  });

  if (analysis)
    token.analyses.push(analysis);

  if (token) {
    if (token.analyses.length === 1 && token.analyses[0].subTokens.length === 1)
      token =
          _.omit(_.extend(token, token.analyses[0].subTokens[0]), "analyses");

    tokens.push(_.omit(token, "currentIndent"));
  }

  if (missingIndices) {
    let index = 0;
    tokens.forEach(token => {
      if (token.analyses) {
        token.analyses.forEach(analysis => {
          analysis.subTokens.forEach(subToken => { subToken.index = ++index; });
        });
      } else {
        token.index = ++index;
      }
    });
  }

  // console.log(comments);
  // console.log(tokens);

  return {
    input: text,
    options: options,
    comments: comments,
    tokens: tokens,
  };
}
