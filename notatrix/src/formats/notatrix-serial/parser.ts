import {detect} from "./detector";
import {DetectorError, ParserError} from "../../utils/errors";
import type {Options} from "../../nx/options";
import type {SentenceSerial} from "../../nx/sentence";

export function parse(textOrSerial: string|SentenceSerial, options: Options): SentenceSerial {
  try {
    detect(textOrSerial, options);
  } catch (e) {
    if (e instanceof DetectorError)
      throw new ParserError(e.message, textOrSerial, options);

    throw e;
  }

  return textOrSerial as SentenceSerial;
}
