"use strict";

module.exports = {

  fields: [
    "index", "form", "lemma", "upostag", "xpostag", "feats", "head", "deprel",
    "deps", "misc"
  ],

  formats: [
    //'apertium stream',
    "Brackets", "CG3", "CoNLL-U", "notatrix serial", "Params", "plain text",
    "SD"
  ],

  nxSentenceFields: {
    input: "string",
    options: "object",
    comments: "array",
    tokens: "array",
  },

  nxSentenceTokensFields: {
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
  },

  nxAllOptions: {

  },

  fallback: "_",

  hexConstant: 16777215, // = 0xffffff

};
