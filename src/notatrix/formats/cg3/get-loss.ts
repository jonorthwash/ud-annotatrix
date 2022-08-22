import * as _ from "underscore";

import {FIELDS} from "./fields";
import type {Sentence} from "../../nx/sentence";
import type {TokenSerial} from "../../nx/base-token";

export function getLoss(sent: Sentence): string[] {
  const serial = sent.serialize();
  let losses: Set<string> = new Set();

  const tokenCalcLoss = (token: TokenSerial) => {
    if (token.heads && token.heads.length > 1)
      losses.add("enhanced dependencies");

    Object.keys(_.omit(token, FIELDS)).forEach(field => {
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
}
