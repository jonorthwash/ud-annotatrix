import * as _ from "underscore";

import {FIELDS} from "./fields";
import type {Sentence} from "../../nx/sentence";

export function getLoss(sent: Sentence): string[] {
  const serial = sent.serialize();
  let losses: Set<string> = new Set();

  if (serial.comments.length)
    losses.add("comments");

  serial.tokens.forEach(
      token => {Object.keys(_.omit(token, FIELDS)).forEach(field => {
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
}
