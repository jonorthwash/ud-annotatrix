"use strict";

import type {SentenceSerial} from "../nx/sentence";

export const fields = [
  "index", "form", "lemma", "upostag", "xpostag", "feats", "head", "deprel",
  "deps", "misc"
];

export const formats = [
  //'apertium stream',
  "Brackets", "CG3", "CoNLL-U", "notatrix serial", "Params", "plain text",
  "SD"
];

type _SentenceFields = {[k in keyof Partial<SentenceSerial>]: string};
export const nxSentenceFields: _SentenceFields = {
  input: "string",
  options: "object",
  comments: "array",
  tokens: "array",
};

export const nxSentenceTokensFields = {
  semicolon: "boolean",
  isEmpty: "boolean",
  index: "number",
  form: "string*",
  lemma: "string*",
  upostag: "string*",
  xpostag: "string*",
  feats: "array",
  heads: "array",
  analyses: "array",
};

export const nxAllOptions = {

};

export const fallback = "_";

export const hexConstant = 0xffffff;
