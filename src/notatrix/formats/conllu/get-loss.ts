import * as _ from "underscore";

import {FIELDS} from "./fields";
import type {Sentence} from "../../nx/sentence";
import type {TokenSerial} from "../../nx/base-token";

export function getLoss(sent: Sentence): string[] {
  const serial = sent.serialize();
  let losses: Set<string> = new Set();

  const tokenCalcLoss = (token: TokenSerial) => {
    if (token.heads.length > 1 && !sent.options.enhanced)
      losses.add("enhanced dependencies");

    Object.keys(_.omit(token, FIELDS)).forEach(field => {
      switch (field) {
      case ("uuid"):
      case ("index"):
      case ("other"):
        break;

      case ("analyses"):
        if (token.analyses.length > 1) {
          losses.add("analyses");
        } else {
          const analysis = token.analyses[0],
                analysisKeys = Object.keys(analysis);

          if (analysisKeys.length > 1 || analysisKeys[0] !== "subTokens") {
            losses.add("analyses");
          } else {
            analysis.subTokens.map(tokenCalcLoss);
          }
        }
        break;

      default:
        losses.add(field);
      }
    });
  };

  serial.tokens.map(tokenCalcLoss);

  return Array.from(losses);
}
