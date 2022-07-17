import * as _ from "underscore";

import {DetectorError} from "../../utils/errors";
import {isJSONSerializable} from "../../utils/funcs";
import {fields} from "../../utils/constants";
import type {Options} from "../../nx/options";

export function detect(textOrArray: string|any[], options: Options): string {
  options = {
    allowEmptyList: false,
    allowTrailingWhitespace: true,
    allowLeadingWhitespace: true,
    ...options,
  };

  if (!isJSONSerializable(textOrArray))
    throw new DetectorError(`Illegal Params: not JSON object`, textOrArray, options);

  const obj: any[] = typeof textOrArray === "string" ? JSON.parse(textOrArray) : textOrArray;

  if (Array.isArray(obj)) {
    if (!obj.length && !options.allowEmptyList)
      throw new DetectorError(`Illegal Params: contains no tokens`, obj,
                              options);

    obj.forEach(obj => {
      const omitted = Object.keys(_.omit(obj, fields));
      if (omitted.length)
        throw new DetectorError(
            `Illegal Params: contains illegal keys (${omitted.join(", ")})`,
            obj, options);

      const picked = Object.keys(_.pick(obj, fields));
      if (!picked.length)
        throw new DetectorError(`Illegal Params: missing required keys`, obj,
                                options);
    });

  } else {
    throw new DetectorError(
        `Illegal Params: expected array of parameters, got ${typeof obj}`, obj,
        options)
  }

  return "Params";
}
