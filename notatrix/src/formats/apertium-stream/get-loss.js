"use strict";

const _ = require("underscore");

const utils = require("../../utils");
const fields = require("./fields");

module.exports = sent => {
  throw new Error("not implemented");
  const serial = sent.serialize();

  let losses = new Set();

  if (!fields.hasComments && serial.comments.length)
    losses.add("comments");

  serial.tokens.forEach(token => {
    Object.keys(_.omit(token, fields)).forEach(field => {
      switch (field) {
      case ("index"):
        break;

      default:
        losses.add(field);
      }
    });
  });

  return Array.from(losses);
};
