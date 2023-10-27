import {FORMAT_BY_NAME} from "./formats";
import type {GenerateByName} from "./base";

export const GENERATE_BY_NAME: GenerateByName = {
  "apertium stream": FORMAT_BY_NAME.apertiumStream.generate,
  apertiumStream: FORMAT_BY_NAME.apertiumStream.generate,
  Brackets: FORMAT_BY_NAME.brackets.generate,
  brackets: FORMAT_BY_NAME.brackets.generate,
  CG3: FORMAT_BY_NAME.cg3.generate,
  cg3: FORMAT_BY_NAME.cg3.generate,
  "CoNLL-U": FORMAT_BY_NAME.conllu.generate,
  conllu: FORMAT_BY_NAME.conllu.generate,
  "notatrix serial": FORMAT_BY_NAME.notatrixSerial.generate,
  notatrixSerial: FORMAT_BY_NAME.notatrixSerial.generate,
  Params: FORMAT_BY_NAME.params.generate,
  params: FORMAT_BY_NAME.params.generate,
  "plain text": FORMAT_BY_NAME.plainText.generate,
  plainText: FORMAT_BY_NAME.plainText.generate,
  SD: FORMAT_BY_NAME.sd.generate,
  sd: FORMAT_BY_NAME.sd.generate,
};
