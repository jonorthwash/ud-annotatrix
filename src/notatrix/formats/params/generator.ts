import * as _ from "underscore";
import {GeneratorError} from "../../utils/errors";
import {getLoss} from "./get-loss";
import type {GenerateResult, ParamsOutput} from "../../base";
import type {Options} from "../../nx/options";
import type {Sentence} from "../../nx/sentence";

export function generate(sent: Sentence, options: Options): GenerateResult<Partial<ParamsOutput>[]> {
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

  const output = sent.tokens.map(token => {
    if (token.analysis)
      throw new GeneratorError(
          "Unable to generate, contains ambiguous analyses or multiword tokens", sent, options);

    let params: ParamsOutput = {
      form: token.form,
      lemma: token.lemma,
      upostag: token.upostag,
      xpostag: token.xpostag,
      feats: token.feats,
      misc: token.misc,
      head: token.getHead(),
    };

    return _.pick(params, value => value != undefined);
  });

  return {
    output: output,
    loss: getLoss(sent),
  };
}
