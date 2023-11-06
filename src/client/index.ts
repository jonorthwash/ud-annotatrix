require("babel-polyfill");

import * as $ from "jquery";

import {App} from "./app";

// on ready
$(() => {

  (window as any).app = new App(location.protocol !== "file:");

  window.addEventListener("message", function (e) {
       if(window.top != window) {
         if(e.data.message == "load") {
             console.log("loading:");
             console.log(e.data.conllu);
             app.corpus.insertSentence(0, e.data.conllu);
  	}
       }
    window.top.postMessage({message: "ready"});
    console.log("sent ready");
  });

});
