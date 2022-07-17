import * as _ from "underscore";

import {DetectorError} from "../../utils/errors";
import {isJSONSerializable} from "../../utils/funcs";
import {nxSentenceFields, nxSentenceTokensFields} from "../../utils/constants";
import type {Input} from "../../base";
import type {Options} from "../../nx/options";
import type {SentenceSerial} from "../../nx/sentence";
import type {TokenSerial} from "../../nx/base-token";

export function detect(textOrSerial: string|SentenceSerial, options: Options): string {
  options = {
    allowZeroTokens: true,
    allowZeroFields: true,
    ...options,
  };

  function restrict<O = SentenceSerial|TokenSerial>(obj: O, fields: {[fieldName: string]: string}, allowUndefined: boolean = false): void {
    if (obj === undefined)
      throw new DetectorError(`Illegal notatrix serial: missing field`, obj as unknown as Input,
                              options);

    // @ts-ignore: This is (probably) never true, since `omit()` returns an Object, not an Array.
    if (_.omit(obj, Object.keys(fields)).length)
      throw new DetectorError(`Illegal notatrix serial: unexpected field`, obj as unknown as Input,
                              options);

    _.each(fields, (fieldType: string, fieldName: string) => {
      const value = obj[fieldName as keyof O];

      switch (fieldType) {
      case ("number"):
        if (value !== undefined || !allowUndefined)
          if (isNaN(parseFloat(value as unknown as string)))
            throw new DetectorError(
                `Illegal notatrix serial: could not parse ${value} as float`,
                obj as unknown as Input, options);
        break;

      case ("string"):
        if (value !== undefined || !allowUndefined)
          if (typeof value !== "string")
            throw new DetectorError(
                `Illegal notatrix serial: expected 'string', got ${
                    typeof value}`,
                obj as unknown as Input, options);
        break;

      case ("string*"):
        if (value !== undefined || !allowUndefined)
          if (value !== null && typeof value !== "string")
            throw new DetectorError(
                `Illegal notatrix serial: expected 'string', got ${
                    typeof value}`,
                obj as unknown as Input, options);
        break;

      case ("object"):
        // pass
        break;

      case ("array"):
        if (value != undefined || !allowUndefined)
          if (!Array.isArray(value))
            throw new DetectorError(
                `Illegal notatrix serial: expected Array, got ${typeof value}`,
                obj as unknown as Input, options);
        break;
      }
    });
  }

  if (!isJSONSerializable(textOrSerial))
    throw new DetectorError(`Illegal notatrix serial: not JSON object`, textOrSerial,
                            options);

  const obj: SentenceSerial = typeof textOrSerial === "string" ? JSON.parse(textOrSerial) : textOrSerial;

  restrict(obj, nxSentenceFields);
  _.each(obj.comments, comment => {
    if (typeof comment !== "string")
      throw new DetectorError(
          `Illegal notatrix serial: comments should be strings`, obj, options);
  });
  _.each(obj.tokens,
         token => { restrict(token, nxSentenceTokensFields, true); });
  if (obj.tokens.length === 0 && !options.allowZeroTokens)
    throw new DetectorError(
        `Illegal notatrix serial: cannot have empty token list`, obj, options);

  _.each(obj.tokens, token => {
    if (Object.keys(token).length === 0 && !options.allowZeroFields)
      throw new DetectorError(
          `Illegal notatrix serial: cannot have token without fields`, obj,
          options);

    if (token.analyses)
      _.each(token.analyses, analysis => {
        const analysisKeys = Object.keys(analysis);
        if (analysisKeys.length !== 1 || analysisKeys[0] !== "subTokens")
          throw new DetectorError(
              `Illegal notatrix serial: got unexpected analyses field`, obj,
              options);

        _.each(analysis.subTokens, subToken => {
          restrict(subToken, nxSentenceTokensFields, true);
          if (subToken.analyses !== undefined)
            throw new DetectorError(
                `Illegal notatrix serial: subTokens can only have one analysis`,
                obj, options);
        });
      });
  });

  return "notatrix serial";
}
