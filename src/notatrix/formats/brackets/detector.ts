import * as re from "../../utils/regex";
import {DetectorError} from "../../utils/errors";
import {isJSONSerializable} from "../../utils/funcs";
import type {Options} from "../../nx/options";

export function detect(text: string, options: Options): string {
  options = {
    allowEmptyString: false,
    allowTrailingWhitespace: true,
    allowLeadingWhitespace: true,
    allowNoDependencies: false,
    allowNewlines: false,
    ...options,
  };

  if (!text && !options.allowEmptyString)
    throw new DetectorError("Illegal Brackets: empty string", text, options);

  if (isJSONSerializable(text))
    throw new DetectorError("Illegal Brackets: JSON object", text, options);

  if (/\n/.test(text) && !options.allowNewlines)
    throw new DetectorError("Illegal Brackets: contains newlines", text,
                            options);

  // internal stuff
  let parsing: string|null = null;
  let depth = 0;
  let sawBracket = false;

  text.split("").forEach((char, i) => {
    switch (char) {
    case ("["):
      if (parsing === "]")
        throw new DetectorError("Illegal Brackets: invalid sequence \"][\"",
                                text, options);

      sawBracket = true;
      depth += 1;
      break;

    case ("]"):
      if (parsing === "[")
        throw new DetectorError("Illegal Brackets: invalid sequence \"[]\"",
                                text, options);

      sawBracket = true;
      depth -= 1;
      break;

    case (" "):
    case ("\t"):
    case ("\n"):

      if (!options.allowLeadingWhitespace) {
        if (parsing !== null && !re.whitespace.test(parsing))
          throw new DetectorError(
              "Illegal Brackets: contains leading whitespace", text, options);
      }
      break;
    }

    parsing = char;
  });

  if (!sawBracket && !options.allowNoDependencies)
    throw new DetectorError("Illegal Brackets: contains no dependencies", text,
                            options);

  if (depth !== 0)
    throw new DetectorError("Illegal Brackets: bracket mismatch", text,
                            options);

  if (re.whitespace.test(parsing) && !options.allowTrailingWhitespace)
    throw new DetectorError("Illegal Brackets: contains trailing whitespace",
                            text, options);

  return "Brackets";
}
