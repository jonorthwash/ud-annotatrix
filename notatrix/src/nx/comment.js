"use strict";

const _ = require("underscore");

const utils = require("../utils");
const NxBaseClass = require("./base-class");
const Label = require("./label");

/**
 * Abstraction over a CoNLL-U or CG3 comment, allows us to extract and then
 *  manipulate data in some useful ways across a Corpus.
 */
class Comment extends NxBaseClass {
  constructor(sent, body) {
    super(sent, "Comment");

    this.type = "normal";
    this.body = body;

    const label = body.match(utils.re.commentLabel),
          sentId = body.match(utils.re.commentSentId);

    if (label) {
      let labels = [];
      label[3].split(/\s/).forEach(label => {
        if (label && labels.indexOf(label) === -1)
          labels.push(label)
      });

      this.type = "label";
      this.labels = labels;

    } else if (sentId) {
      this.type = "sent-id";
      this.id = sentId[2];
    }
  }

  serialize() { return this.body; }
}

module.exports = Comment;
