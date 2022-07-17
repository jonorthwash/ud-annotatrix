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

  if (!sent.root)
    throw new GeneratorError("Unable to generate, could not find root");

  // build the tree structure
  let seen = new Set([sent.root]);
  let root = {
    token: sent.root,
    deprel: null,
    deps: [],
  };

  const visit = node => {
    node.token.mapDependents(dep => {
      if (seen.has(dep.token))
        throw new GeneratorError(
            "Unable to generate, dependency structure non-linear");

      dep.deps = [];
      node.deps.push(dep);
      seen.add(dep.token);
      visit(dep);
    });
  };
  visit(root);

  // console.log(root);

  if (seen.size < sent.size + 1)
    throw new GeneratorError(
        "Unable to generate, sentence not fully connected");

  // parse the tree into a string
  let output = "";
  const walk = node => {
    output += "[" + (node.deprel || "_") + " ";

    node.deps.forEach(dep => {
      if (dep.token.indices.absolute < node.token.indices.absolute)
        walk(dep);
    });

    output += " " + node.token.form + " ";

    node.deps.forEach(dep => {
      if (dep.token.indices.absolute > node.token.indices.absolute)
        walk(dep);
    });

    output += " ] ";
  };
  root.deps.forEach(dep => walk(dep));

  // clean up the output
  output = output.replace(/\s+/g, " ")
               .replace(/ \]/g, "]")
               .replace(/\[ /g, "[")
               .replace(/(\w)_(\w)/, "$1 $2")
               .trim();

  // console.log(output);

  return {
    output: output,
    loss: getLoss(sent),
  };
};
