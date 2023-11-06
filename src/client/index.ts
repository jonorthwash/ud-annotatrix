require("babel-polyfill");

import * as $ from "jquery";

import {App} from "./app";

// on ready
$(() => {

  (window as any).app = new App(location.protocol !== "file:");

  window.onmessage = function(event){
     if(event.data !== null) {
       if(window.top != window) {
         console.log('window.onmessage');
         app.corpus.insertSentence(0, event.data);
       }
     }
  };

});
