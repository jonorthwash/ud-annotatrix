import * as _ from "underscore";

import * as re from "../../utils/regex";
import {detect} from "./detector";
import {DetectorError, ParserError} from "../../utils/errors";
import {thin} from "../../utils/funcs";
import type {Options} from "../../nx/options";
import type {SentenceSerial} from "../../nx/sentence";

export function parse(text: string|undefined, options: Options): SentenceSerial {
  options = {
    allowEmptyString: true,
    ...options,
  };

  text = text || "";

  try {
    detect(text, options);
  } catch (e) {
    if (e instanceof DetectorError)
      throw new ParserError(e.message, text, options);

    throw e;
  }

  // console.log();
  // console.log(text);

  let chunks = [];
  let word = "";

  _.each(text, (char, i) => {
    if (re.whitespace.test(char)) {
      chunks.push(word);
      word = "";

    } else if (re.punctuation.test(char)) {
      if (!re.allPunctuation.test(word)) {
        chunks.push(word);
        word = "";
      }
      word += char;

    } else {
      word += char;
    }
  });

  chunks.push(word);

  // console.log(chunks);

  let tokens = chunks.filter(thin).map((chunk, i) => {
    return {
      form: chunk,
      index: i,
    };
  });

  // console.log(comments);
  // console.log(tokens);

  return {
    input: text,
    options: options,
    comments: [],
    tokens: tokens,
  };
}
