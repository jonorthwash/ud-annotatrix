require("babel-polyfill");

import * as $ from "jquery";

import {App} from "./app";

function base64decode(str) {
  let decode = atob(str).replace(/[\x80-\uffff]/g, (m) => `%${m.charCodeAt(0).toString(16).padStart(2, '0')}`)
  return decodeURIComponent(decode)
}

// on ready
$(() => {

  const params = new Proxy(new URLSearchParams(window.location.search), {
       get: (searchParams, prop) => searchParams.get(prop),
  });

  (window as any).app = new App(location.protocol !== "file:");

  if (params["c"]) {
      console.log('!!! c:' + params["c"]);
      var conllu = base64decode(params["c"]);
      app.corpus.insertSentence(0, conllu)
  } 
});
