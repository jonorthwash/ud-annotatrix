"use strict";

const _ = require("underscore");

const utils = require("../../utils");
const fields = require("./fields");

module.exports = sent => {
  const serial = sent.serialize();
  let losses = new Set();

  const tokenCalcLoss = token => {
    if (token.heads && token.heads.length > 1)
      losses.add("enhanced dependencies");

    Object.keys(_.omit(token, fields.FIELDS)).forEach(field => {
      switch (field) {
      case ("uuid"):
      case ("index"):
      case ("deps"):
      case ("feats"):
      case ("misc"):
        break;

      case ("upostag"):
        if (token.xpostag && token.upostag)
          losses.add(field);
        break;

      case ("isEmpty"):
        if (token.isEmpty)
          losses.add(field);
        break;

      default:
        losses.add(field);
      }
    });
  };

  serial.tokens.map(token => {
    tokenCalcLoss(token);

    (token.analyses || []).forEach(analysis => {
      const analysisKeys = Object.keys(analysis);
      if (analysisKeys.length > 1 || analysisKeys[0] !== "subTokens") {
        losses.add("analyses");
      } else {
        analysis.subTokens.map(subToken => {
          tokenCalcLoss(subToken);

          if (subToken.form != undefined)
            losses.add("form");
        });
      }
    });
  });

  return Array.from(losses);
};
