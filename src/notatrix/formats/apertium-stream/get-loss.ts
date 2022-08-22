import * as _ from "underscore";

import {FIELDS, HAS_COMMENTS} from "./fields";
import type {Sentence} from "../../nx/sentence";
import type {TokenSerial} from "../../nx/base-token";

export function getLoss(sent: Sentence): string[] {
  throw new Error("not implemented");
  const serial = sent.serialize();

  let losses: Set<string> = new Set();

  if (!HAS_COMMENTS && serial.comments.length)
    losses.add("comments");

  serial.tokens.forEach(token => {
    Object.keys(_.omit(token, FIELDS)).forEach(field => {
      switch (field) {
      case ("index"):
        break;

      default:
        losses.add(field);
      }
    });
  });

  return Array.from(losses);
}
