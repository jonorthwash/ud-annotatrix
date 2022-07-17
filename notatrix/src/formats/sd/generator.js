"use strict";

const _ = require("underscore");

const utils = require("../../utils");
const GeneratorError = utils.GeneratorError;
const generateText = require("../plain-text").generate;
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

  lines.push(generateText(sent).output);

  [sent.root].concat(sent.tokens).forEach(token => {
    token.mapDependents(dependent => {
      lines.push(
          `${dependent.deprel || "_"}(${token.form}, ${dependent.token.form})`);
    });
  });

  /*
  sent.root.mapDependents(dependent => lines.push(`${dependent.deprel}(${})`))
  if (sent.root)
    lines.push(`root(ROOT, ${sent.root.form})`);

  sent.tokens.forEach(token => {

    if (token._head && token.deprel && token._head.name !== 'RootToken')
      lines.push(`${token.deprel}(${token._head.form}, ${token.form})`);

  });
  */

  return {
    output: lines.join("\n"),
    loss: getLoss(sent),
  };
};
