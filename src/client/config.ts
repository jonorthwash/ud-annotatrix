import {storage} from "./utils";
import {getTreebankId} from "./utils/funcs";

export const _config = {

  version: "0.0.0",
  treebank_id: getTreebankId(),

  graph: require("./graph/config"),
  gui: require("./gui/config"),

};
