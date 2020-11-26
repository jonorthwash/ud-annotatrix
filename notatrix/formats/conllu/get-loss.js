"use strict";

const _ = require("underscore");

const utils = require("../../utils");
const fields = require("./fields");

module.exports = sent => {
  const serial = sent.serialize();
  let losses = new Set();

  const tokenCalcLoss = token => {
    if (token.heads.length > 1 && !sent.options.enhanced)
      losses.add("enhanced dependencies");

    Object.keys(_.omit(token, fields)).forEach(field => {
      switch (field) {
      case ("uuid"):
      case ("index"):
      case ("other"):
        break;

      case ("analyses"):
        if (token.analyses.length > 1) {
          losses.add("analyses");
        } else {
          const analysis = token.analyses[0],
                analysisKeys = Object.keys(analysis);

          if (analysisKeys.length > 1 || analysisKeys[0] !== "subTokens") {
            losses.add("analyses");
          } else {
            analysis.subTokens.map(tokenCalcLoss);
          }
        }
        break;

      default:
        losses.add(field);
      }
    });
  };

  serial.tokens.map(tokenCalcLoss);

  return Array.from(losses);
};
