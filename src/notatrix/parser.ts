import {FORMAT_BY_NAME} from "./formats";
import {formats} from "./utils/constants";
import {ParserError} from "./utils/errors";
import {thin} from "./utils/funcs";
import type {Input, ParseByName, ParseOutput} from "./base";
import type {Options} from "./nx/options";

export const PARSE_BY_NAME: ParseByName = {
//  "apertium stream": FORMAT_BY_NAME.apertiumStream.parse,
//  apertiumStream: FORMAT_BY_NAME.apertiumStream.parse,
//  Brackets: FORMAT_BY_NAME.brackets.parse,
//  brackets: FORMAT_BY_NAME.brackets.parse,
//  CG3: FORMAT_BY_NAME.cg3.parse,
//  cg3: FORMAT_BY_NAME.cg3.parse,
  "CoNLL-U": FORMAT_BY_NAME.conllu.parse,
  conllu: FORMAT_BY_NAME.conllu.parse,
  "notatrix serial": FORMAT_BY_NAME.notatrixSerial.parse,
  notatrixSerial: FORMAT_BY_NAME.notatrixSerial.parse,
  Params: FORMAT_BY_NAME.params.parse,
  params: FORMAT_BY_NAME.params.parse,
  "plain text": FORMAT_BY_NAME.plainText.parse,
  plainText: FORMAT_BY_NAME.plainText.parse,
//  SD: FORMAT_BY_NAME.sd.parse,
//  sd: FORMAT_BY_NAME.sd.parse,
};

export function parse(input: Input, options: Options): ParseOutput|ParseOutput[] {
  options = {
    suppressDetectorErrors: true,
    suppressParserErrors: true,
    returnAllPossibilities: true,
    requireOne: false,
    ...options,
  };

  const possibilities = formats
    .map(format => {
      const parse = FORMAT_BY_NAME[format].parse;
      try {
        return parse(input, options);
      } catch (e) {
        if (e instanceof ParserError && options.suppressParserErrors)
          return undefined;
        throw e;
      }
    })
    .filter(thin);

  if (!possibilities.length && !options.suppressDetectorErrors)
    throw new ParserError("Unable to detect format", input, options);

  if (options.requireOne && possibilities.length > 1)
    throw new ParserError("Unable to detect, ambiguous input", input, options);

  return options.returnAllPossibilities ? possibilities : possibilities[0];
}
