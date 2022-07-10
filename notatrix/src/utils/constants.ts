"use strict";

export const fields = [
  "index", "form", "lemma", "upostag", "xpostag", "feats", "head", "deprel",
  "deps", "misc"
];

export const formats = [
  //'apertium stream',
  "Brackets", "CG3", "CoNLL-U", "notatrix serial", "Params", "plain text",
  "SD"
];

export const nxSentenceFields = {
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

export const hexConstant = 16777215; // = 0xffffff
