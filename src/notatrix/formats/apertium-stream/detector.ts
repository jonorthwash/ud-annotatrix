import {DetectorError} from "../../utils/errors";
import type {Options} from "../../nx/options";

export function detect(text: string, options: Options): string {
  throw new DetectorError("not implemented", text, options);
}
