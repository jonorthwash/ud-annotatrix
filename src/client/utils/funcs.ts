import * as _ from "underscore";
import * as $ from "jquery";
import { v4 as uuidv4 } from "uuid";

export function check_if_browser() {
  try {
    return !!window;
  } catch (e) {
    return false;
  }
}

export function download(filename: string, mimetype: string, uriComponent: string) {
  const link = $("<a>")
                   .attr("download", filename)
                   .attr("href", `data:${mimetype}; charset=utf-8,${encodeURIComponent(uriComponent)}`);
  $("body").append(link);
  link[0].click();
}

export function getTreebankId(): string {
  if (!check_if_browser())
    return null;

  const match = location.href.match(/treebank_id=([0-9a-f-]{36})(#|\/|$|&)/);
  return match ? match[1] : uuidv4();
}

export function getRootPath() {
  let pageURL = window.location.href;
  return pageURL.substr(0, pageURL.lastIndexOf("/") + 1);
}

export function link(href: string, target: string = "_blank") {
  const link = $("<a>").attr("href", href).attr("target", target);
  $("body").append(link);
  console.log(href, target);
  link[0].click();
}

export function noop<T>(arg: T): T {
  return arg;
}

export function thin<T>(arg: T): T|undefined {
  return !!arg ? arg : undefined;
}

export function forEachFormat(callback: (format: string) => void) {
  ["Brackets", "CG3", "CoNLL-U", "plain text", "SD"].forEach(callback);
}
