"use strict";

const _ = require("underscore");

const utils = require("../../utils");
const GeneratorError = utils.GeneratorError;
const getLoss = require("./get-loss").getLoss;

module.exports = (sent, options) => {
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

  let lines = [];
  sent.comments.forEach(comment => lines.push("# " + comment.body));
  sent.tokens.forEach(token => {
    const isSet =
        field => { return field && field !== utils.fallback ? field : null; };

    const push = (token, indent) => {
      if (!token.lemma && !options.allowMissingLemma)
        throw new GeneratorError(`Unable to generate, token has no lemma`, sent,
                                 options);

      indent = (token.semicolon ? ";" : "") + "\t".repeat(indent);

      const head = token.heads.first;
      const dependency =
          options.omitIndices
              ? null
              : "#" + token.indices.cg3 + "->" +
                    (head == undefined ? "" : head.token.indices.cg3);

      let line =
          [`"${isSet(token.lemma) || isSet(token.form) || utils.fallback}"`]
              .concat(isSet(token.xpostag) || isSet(token.upostag))
              .concat((token._feats || []).join(" "))
              .concat((token._misc || []).join(" "))
              .concat(head && isSet(head.deprel) ? "@" + head.deprel : null)
              .concat(dependency);

      line = indent + line.filter(utils.thin).join(" ");
      lines.push(line);
    };

    lines.push(`"<${token.form || utils.fallback}>"`);

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
