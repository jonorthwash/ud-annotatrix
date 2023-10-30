import {FORMAT_BY_NAME} from "./formats";
import type {GenerateByName} from "./base";

export const GENERATE_BY_NAME: GenerateByName = {
  "CoNLL-U": FORMAT_BY_NAME.conllu.generate,
  conllu: FORMAT_BY_NAME.conllu.generate,
  "plain text": FORMAT_BY_NAME.plainText.generate,
  plainText: FORMAT_BY_NAME.plainText.generate,
};
