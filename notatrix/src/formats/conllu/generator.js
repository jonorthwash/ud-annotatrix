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

  options = _.defaults(options, sent.options,
                       {

                       });

  sent.index();

  let lines = [];
  sent.comments.forEach(comment => { lines.push("# " + comment.body); });
  sent.tokens.forEach(token => {
    const toString = token => {
      const head = !token.isEmpty && token.heads.first;

      return [

        token.indices.conllu,
        token.form || utils.fallback,
        token.lemma || utils.fallback,
        token.upostag || utils.fallback,
        token.xpostag || utils.fallback,
        token.feats || utils.fallback,
        head ? head.token.indices.conllu : utils.fallback,
        head && head.deprel ? head.deprel : utils.fallback,
        token._getDeps("CoNLL-U").join("|") || utils.fallback,
        token.misc || utils.fallback,

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
