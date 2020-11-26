"use strict";

const _ = require("underscore");

const utils = require("../../utils");
const fields = require("./fields");

module.exports = sent => {
  const serial = sent.serialize();
  let losses = new Set();

  serial.tokens.forEach(token => {
    if (token.heads && token.heads.length > 1)
      losses.add("enhanced dependencies");

    Object.keys(_.omit(token, fields)).forEach(field => {
      switch (field) {
      case ("uuid"):
      case ("index"):
      case ("deps"):
        break;

      case ("heads"):
        if (token.heads.length > 1)
          losses.add(field);
        break;

      case ("feats"):
      case ("misc"):
        if (token[field] && token[field].length)
          losses.add(field);
        break;

      default:
        if (token[field])
          losses.add(field);
      }
    })
  });

  return Array.from(losses);
};
