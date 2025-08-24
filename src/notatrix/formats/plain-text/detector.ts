import * as _ from "underscore";

import * as re from "../../utils/regex";
import {DetectorError} from "../../utils/errors";
import {isJSONSerializable} from "../../utils/funcs";
import type {Options} from "../../nx/options";

export function detect(text: string, options: Options): string {
  options = {
    allowEmptyString: true,
    allowNewlines: false,
    bracketsAllowanceTreshold: 0.2,  // set to <0 or >1 to avoid
    ...options,
  };

  /*
  if (!text && !options.allowEmptyString)
    throw new DetectorError(`Illegal plain text: empty string`, text,
  options);
    */

  if (isJSONSerializable(text))
    throw new DetectorError(`Illegal plain text: JSON object`, text, options);

  if (/\n/.test(text) && !options.allowNewlines)
    throw new DetectorError(`Illegal plain text: contains newlines`, text,
                            options);

  if (options.bracketsAllowanceTreshold >= 0) {
    const numWords = text.split(re.whitespace).length;
    const numBrackets = (text.match(/[\[\]]/g) || []).length;
    const ratio = numBrackets / numWords;

    if (ratio > options.bracketsAllowanceTreshold)
      throw new DetectorError(
          `Illegal plain text: contains too many brackets (${ratio})`, text,
          options);
  }

  return "plain text";
}
