import * as re from "../../utils/regex";
import {DetectorError} from "../../utils/errors";
import {isJSONSerializable} from "../../utils/funcs";
import type {Options} from "../../nx/options";

export function detect(text: string, options: Options): string {
  options = {
    allowEmptyString: false,
    allowTrailingWhitespace: true,
    allowLeadingWhitespace: true,
    ...options,
  };

  if (!text && !options.allowEmptyString)
    throw new DetectorError("Illegal CG3: empty string", text, options);

  if (isJSONSerializable(text))
    throw new DetectorError("Illegal CG3: JSON object", text, options);

  // internal stuff
  let parsing: string|null = null;

  // iterate over the lines and check each one
  text.split(/\n/).forEach(line => {
    if (re.whiteline.test(line)) {
      if (parsing === null) {
        if (!options.allowLeadingWhitespace)
          throw new DetectorError("Illegal CG3: contains leading whitespace",
                                  text, options);

      } else {
        if (parsing !== "token-body" || !options.allowTrailingWhitespace)
          throw new DetectorError("Illegal CG3: contains trailing whitespace",
                                  text, options);
      }

      parsing = "whitespace";

    } else if (re.comment.test(line)) {
      if (parsing === "token-start" || parsing === "token-body")
        throw new DetectorError(
            `Illegal CG3: invalid sequence ${parsing}=>comment`, text, options);

      parsing = "comment";

    } else if (re.cg3TokenStart.test(line)) {
      if (parsing === "token-start")
        throw new DetectorError(
            `Illegal CG3: invalid sequence ${parsing}=>token-start`, text,
            options);

      parsing = "token-start";

    } else if (re.cg3TokenContent.test(line)) {
      if (parsing === "comment" || parsing === "whitespace")
        throw new DetectorError(
            `Illegal CG3: invalid sequence ${parsing}=>token-body`, text,
            options);

      parsing = "token-body";

    } else {
      throw new DetectorError(`Illegal CG3: unmatched line`, text, options);
    }
  });

  return "CG3";
}
