import {detect} from "./detector";
import {FORMAT_BY_NAME} from "./formats";
import {split as defaultSplit} from "./formats/default-splitter";
import type {Input, SplitByName, SplitOutput} from "./base";
import type {Options} from "./nx/options";

export const SPLIT_BY_NAME: SplitByName = {
//  "apertium stream": FORMAT_BY_NAME.apertiumStream.split,
//  apertiumStream: FORMAT_BY_NAME.apertiumStream.split,
//  Brackets: FORMAT_BY_NAME.brackets.split,
//  brackets: FORMAT_BY_NAME.brackets.split,
//  CG3: FORMAT_BY_NAME.cg3.split,
//  cg3: FORMAT_BY_NAME.cg3.split,
  "CoNLL-U": FORMAT_BY_NAME.conllu.split,
  conllu: FORMAT_BY_NAME.conllu.split,
  "notatrix serial": FORMAT_BY_NAME.notatrixSerial.split,
  notatrixSerial: FORMAT_BY_NAME.notatrixSerial.split,
//  Params: FORMAT_BY_NAME.params.split,
//  params: FORMAT_BY_NAME.params.split,
  "plain text": FORMAT_BY_NAME.plainText.split,
  plainText: FORMAT_BY_NAME.plainText.split,
//  SD: FORMAT_BY_NAME.sd.split,
//  sd: FORMAT_BY_NAME.sd.split,
};

export function split(input: Input, options: Options): SplitOutput {
  let fromDefault = new Set();
  const splitAsDefault = defaultSplit(input as string, options);
  splitAsDefault.forEach(line => {
    const detected = detect(line, options);
    const detecteds = Array.isArray(detected) ? detected : [detected];
    detecteds.forEach(format => fromDefault.add(format));
  });

  let fromPlainText = new Set();
  const splitAsPlainText = SPLIT_BY_NAME.plainText(input as string, options);
  (splitAsPlainText || []).forEach(line => {
    const detected = detect(line, options);
    const detecteds = Array.isArray(detected) ? detected : [detected];
    detecteds.forEach(format => fromPlainText.add(format));
  });

  if (fromDefault.size !== 1 && fromPlainText.size === 1 &&
      fromPlainText.has("plain text"))
    return splitAsPlainText;

  return splitAsDefault;
}
