import {detect} from "./detector";
import {DetectorError, ParserError} from "../../utils/errors";
import type {Options} from "../../nx/options";
import type {SentenceSerial} from "../../nx/sentence";

export function parse(textOrArray: string|any[], options: Options): SentenceSerial {
  try {
    detect(textOrArray, options);
  } catch (e) {
    if (e instanceof DetectorError)
      throw new ParserError(e.message, textOrArray, options);

    throw e;
  }

  return {
    input: JSON.stringify(textOrArray),
    options: options,
    comments: [],
    tokens: (textOrArray as any[]).map((token, i) => {
      token.index = `${i}`;
      return token;
    }),
  };
}
