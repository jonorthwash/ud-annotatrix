"use strict";

const _ = require("underscore");

const utils = require("../../utils");
const fields = require("./fields");

module.exports = sent => {
  const serial = sent.serialize();
  let losses = new Set();

  if (serial.comments.length)
    losses.add("comments");

  serial.tokens.forEach(
      token => {Object.keys(_.omit(token, fields)).forEach(field => {
        switch (field) {
        case ("uuid"):
        case ("index"):
          break;

        case ("heads"):
          if (token.heads.length > 1)
            losses.add("enhanced dependencies");
          break;

        default:
          losses.add(field);
        }
      })});

  return Array.from(losses);
};
