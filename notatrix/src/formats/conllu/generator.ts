import * as _ from "underscore";
import {fallback} from "../../utils/constants";
import {GenerateResult} from "../base";
import {GeneratorError} from "../../utils/errors";
import {getLoss} from "./get-loss";
import type {Options} from "../../nx/options";
import type {Sentence} from "../../nx/sentence";
import type {BaseToken} from "../../nx/base-token";

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

  let lines: string[] = [];
  sent.comments.forEach(comment => { lines.push("# " + comment.body); });
  sent.tokens.forEach(token => {
    const toString = (token: BaseToken) => {
      const head = !token.isEmpty && token.heads.first;

      return [

        token.indices.conllu,
        token.form || fallback,
        token.lemma || fallback,
        token.upostag || fallback,
        token.xpostag || fallback,
        token.feats || fallback,
        head ? head.token.indices.conllu : fallback,
        head && head.deprel ? head.deprel : fallback,
        token._getDeps("CoNLL-U").join("|") || fallback,
        token.misc || fallback,

      ].join("\t");
    };

    lines.push(toString(token));
    token.subTokens.forEach(subToken => { lines.push(toString(subToken)); });
  });

  return {
    output: lines.join("\n"),
    loss: getLoss(sent),
  };
};
