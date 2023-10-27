import * as _ from "underscore";

import {FIELDS} from "./fields";
import type {Sentence} from "../../nx/sentence";
import type {TokenSerial} from "../../nx/base-token";

export function getLoss(sent: Sentence): string[] {
  const serial = sent.serialize();
  let losses: Set<string> = new Set();

  serial.tokens.forEach(token => {
    if (token.heads && token.heads.length > 1)
      losses.add("enhanced dependencies");

    Object.keys(_.omit(token, FIELDS)).forEach(field => {
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
        if (token[field as keyof TokenSerial])
          losses.add(field);
      }
    })
  });

  return Array.from(losses);
}
