import * as re from "../utils/regex";
import {NxBaseClass} from "./base-class";
import {Label} from "./label";
import type {Sentence} from "./sentence";

/**
 * Abstraction over a CoNLL-U or CG3 comment, allows us to extract and then
 *  manipulate data in some useful ways across a Corpus.
 */
export class Comment extends NxBaseClass {
  id: string|undefined;
  type: string;
  body: string;
  labels: string[]|undefined;

  constructor(sent: Sentence, body: string) {
    super("Comment");

    this.type = "normal";
    this.body = body;

    const label = body.match(re.commentLabel),
          sentId = body.match(re.commentSentId);

    if (label) {
      let labels: string[] = [];
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

  serialize(): string { return this.body; }
}
