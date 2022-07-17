"use strict";

module.exports = {

  name: "notatrix serial",
  fields: require("./fields"),
  split: require("./splitter").split,
  detect: require("./detector").detect,
  parse: require("./parser"),
  generate: require("./generator").generate,

};

/*
INPUT:
{
  input: String,
  options: Object,
  comments: [
    String
  ],
  tokens: [
    (
      // #1 (default)
      {
        isEmpty: Boolean || undefined,
        index: String || undefined,
        form: String || null || undefined,
        lemma: String || null || undefined,
        upostag: String || null || undefined,
        xpostag: String || null || undefined,
        feats: String || null || undefined,
        head: (
          String
          ||
          null
          ||
          undefined
          ||
          {
            index: String,
            type: String || null,
          }
        ),
        deprel: String || null || undefined,
        deps: (
          String
          ||
          null
          ||
          undefined
          ||
          {
            index: String,
            type: String || null,
          }
        ),
        misc: String || null || undefined,
      }
      ||
      // #2 (CoNLL-U superToken)
      {
        index: String,
        form: String || null,
        misc: String || null,
        subTokens: [
          <#1>
        ]
      }
      ||
      // #3 (CG3)
      {
        form: String || null,
        analyses: [
          [
            semicolon: Boolean,
            lemma: String || null,
            head: String || null,
            index: String || null,
            deprel: String || null,
            xpostag: String || null,
            other: [
              String
            ]
          ]
        ]
      }
      ||
      // #4 (notatrix serial)
      {

      }
    )
  ]
}


OUTPUT:
{
  input: String,
  options: 'plain object',
  comments: [
    {
      type: String,
      body: String,
      value: <any>
    }
  ],
*/
