import * as _ from "underscore";

import {FIELDS} from "./fields";
import type {Sentence} from "../../nx/sentence";
import type {TokenSerial} from "../../nx/base-token";

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

        case ("feats"):
        case ("misc"):
          if (token[field] && token[field].length)
            losses.add(field);
          break;

        case ("heads"):
          if (token.heads.length)
            losses.add("heads");
          break;

        default:
          if (token[field as keyof TokenSerial])
            losses.add(field);
        }
      })});

  return Array.from(losses);
}
