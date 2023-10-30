import * as conllu from "./conllu";
import * as notatrixSerial from "./notatrix-serial";
import * as plainText from "./plain-text";

import type {FormatByName} from "../base";

export const FORMAT_BY_NAME: FormatByName = {
  "CoNLL-U": conllu,
  conllu: conllu,
  "notatrix serial": notatrixSerial,
  notatrixSerial: notatrixSerial,
  "plain text": plainText,
  plainText: plainText,
};
