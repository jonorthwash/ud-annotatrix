import {detect} from "./detector";
import {FORMAT_BY_NAME} from "./formats";
import {split as defaultSplit} from "./formats/default-splitter";
import type {Input, SplitByName, SplitOutput} from "./base";
import type {Options} from "./nx/options";

export const SPLIT_BY_NAME: SplitByName = {
  "CoNLL-U": FORMAT_BY_NAME.conllu.split,
  conllu: FORMAT_BY_NAME.conllu.split,
  "plain text": FORMAT_BY_NAME.plainText.split,
  plainText: FORMAT_BY_NAME.plainText.split,
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
