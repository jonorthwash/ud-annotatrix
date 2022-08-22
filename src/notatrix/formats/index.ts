import * as apertiumStream from "./apertium-stream";
import * as brackets from "./brackets";
import * as cg3 from "./cg3";
import * as conllu from "./conllu";
import * as notatrixSerial from "./notatrix-serial";
import * as params from "./params";
import * as plainText from "./plain-text";
import * as sd from "./sd";

import type {FormatByName} from "../base";

export const FORMAT_BY_NAME: FormatByName = {
  "apertium stream": apertiumStream,
  apertiumStream: apertiumStream,
  Brackets: brackets,
  brackets: brackets,
  CG3: cg3,
  cg3: cg3,
  "CoNLL-U": conllu,
  conllu: conllu,
  "notatrix serial": notatrixSerial,
  notatrixSerial: notatrixSerial,
  Params: params,
  params: params,
  "plain text": plainText,
  plainText: plainText,
  SD: sd,
  sd: sd,
};
