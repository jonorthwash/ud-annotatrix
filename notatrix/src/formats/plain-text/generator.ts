import * as _ from "underscore";
import * as re from "../../utils/regex";
import {GenerateResult} from "../base";
import {GeneratorError} from "../../utils/errors";
import {getLoss} from "./get-loss";
import type {Options} from "../../nx/options";
import type {Sentence} from "../../nx/sentence";

export function generate(sent: Sentence, options: Options): GenerateResult<string> {
  if (!sent.isParsed)
    return {
      output: null,
      loss: undefined,
    };

  if (!sent || sent.name !== "Sentence")
    throw new GeneratorError(`Unable to generate, input not a Sentence`, sent,
                             options);

  options = _.defaults(options, sent.options,
                       {

                       });

  sent.index();

  const output =
      sent.tokens
          .map(token => {
            return token.isSuperToken
                       ? token.subTokens.map(subToken => subToken.value)
                             .join(" ")
                       : token.form;
          })
          .join(" ")
          .replace(re.spaceBeforePunctuation, "$1");

  return {
    output: output,
    loss: getLoss(sent),
  };
}
