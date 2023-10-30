import * as conllu from "./conllu";
import * as plainText from "./plain-text";

import type {FormatByName} from "../base";

export const FORMAT_BY_NAME: FormatByName = {
  "CoNLL-U": conllu,
  conllu: conllu,
  "plain text": plainText,
  plainText: plainText,
};
