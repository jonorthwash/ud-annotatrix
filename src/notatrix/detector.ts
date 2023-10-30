import {FORMAT_BY_NAME} from "./formats";
import {DetectorError} from "./utils/errors";
import {formats} from "./utils/constants";
import {thin} from "./utils/funcs";
import type {DetectByName, DetectOutput, Input} from "./base";
import type {Options} from "./nx/options";

export const DETECT_BY_NAME: DetectByName = {
  "CoNLL-U": FORMAT_BY_NAME.conllu.detect,
  conllu: FORMAT_BY_NAME.conllu.detect,
  "notatrix serial": FORMAT_BY_NAME.notatrixSerial.detect,
  notatrixSerial: FORMAT_BY_NAME.notatrixSerial.detect,
  "plain text": FORMAT_BY_NAME.plainText.detect,
  plainText: FORMAT_BY_NAME.plainText.detect,
};

export function detect(input: Input, options?: Options): DetectOutput|DetectOutput[] {
  options = {
    suppressDetectorErrors: true,
    returnAllMatches: true,
    requireOneMatch: false,
    ...options,
  };

  const matches = formats
    .map(format => {
      const detect = FORMAT_BY_NAME[format].detect;
      try {
        return detect(input, options);
      } catch (e) {
        if (e instanceof DetectorError)
          return undefined;

        throw e;
      }
    })
    .filter(thin);

  if (!matches.length && !options.suppressDetectorErrors)
    throw new DetectorError("Unable to detect format", input, options);

  if (matches.length > 1 && !options.suppressDetectorErrors &&
      options.requireOneMatch)
    throw new DetectorError("Detected multiple formats", input, options);

  return options.returnAllMatches ? matches : matches[0];
}
