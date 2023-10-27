import * as _ from "underscore";
import {fallback} from "../../utils/constants";
import {GeneratorError} from "../../utils/errors";
import {getLoss} from "./get-loss";
import {thin} from "../../utils/funcs";
import type {GenerateResult} from "../../base";
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

  options = _.defaults(options, sent.options, {
    omitIndices: false,
    allowMissingLemma: true,
  });

  sent.index();

  let lines: string[] = [];
  sent.comments.forEach(comment => lines.push("# " + comment.body));
  sent.tokens.forEach(token => {
    const isSet =
        (value: string) => { return value && value !== fallback ? value : null; };

    const push = (token: BaseToken, indentLevel: number) => {
      if (!token.lemma && !options.allowMissingLemma)
        throw new GeneratorError(`Unable to generate, token has no lemma`, sent,
                                 options);

      const indent = (token.semicolon ? ";" : "") + "\t".repeat(indentLevel);

      const head = token.heads.first;
      const dependency =
          options.omitIndices
              ? null
              : "#" + token.indices.cg3 + "->" +
                    (head == undefined ? "" : head.token.indices.cg3);

      let lineParts =
          [`"${isSet(token.lemma) || isSet(token.form) || fallback}"`]
              .concat(isSet(token.xpostag) || isSet(token.upostag))
              .concat((token._feats || []).join(" "))
              .concat((token._misc || []).join(" "))
              .concat(head && isSet(head.deprel) ? "@" + head.deprel : null)
              .concat(dependency);

      const line = indent + lineParts.filter(thin).join(" ");
      lines.push(line);
    };

    lines.push(`"<${token.form || fallback}>"`);

    if (token._analyses && token._analyses.length) {
      token._analyses.forEach(analysis => {
        analysis.subTokens.forEach((subToken, i) => { push(subToken, i + 1); });
      });

    } else {
      push(token, 1);
    }
  });

  return {
    output: lines.join("\n"),
    loss: getLoss(sent),
  };
};
