import * as _ from "underscore";
import {GeneratorError} from "../../utils/errors";
import {getLoss} from "./get-loss";
import type {GenerateResult} from "../../base";
import type {Options} from "../../nx/options";
import type {Sentence, SentenceSerial} from "../../nx/sentence";

export function generate(sent: Sentence, options: Options): GenerateResult<SentenceSerial> {
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

  return {
    output: sent.serialize(),
    loss: getLoss(sent),
  };
};
