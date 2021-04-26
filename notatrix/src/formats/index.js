/**
 * Supported output formats:
 *  * ApertiumStream (coming soon!)
 *  * Brackets
 *  * CG3
 *  * CoNLL-U
 *  * NotatrixSerial
 *  * Params
 *  * Plain text
 *  * SDParse
 */

module.exports = {

  "apertium stream": require("./apertium-stream"),
  apertiumStream: require("./apertium-stream"),
  Brackets: require("./brackets"),
  brackets: require("./brackets"),
  CG3: require("./cg3"),
  cg3: require("./cg3"),
  "CoNLL-U": require("./conllu"),
  conllu: require("./conllu"),
  "notatrix serial": require("./notatrix-serial"),
  notatrixSerial: require("./notatrix-serial"),
  Params: require("./params"),
  params: require("./params"),
  "plain text": require("./plain-text"),
  plainText: require("./plain-text"),
  SD: require("./sd"),
  sd: require("./sd"),

};
