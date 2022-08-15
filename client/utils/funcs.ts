import * as _ from "underscore";
import * as $ from "jquery";
import * as uuidv4 from "uuid/v4";

export function check_if_browser() {
  try {
    return !!window;
  } catch (e) {
    return false;
  }
}

export function download(filename, mimetype, uriComponent) {
  const link = $("<a>")
                   .attr("download", filename)
                   .attr("href", `data:${mimetype}; charset=utf-8,${encodeURIComponent(uriComponent)}`);
  $("body").append(link);
  link[0].click();
  return true;
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

export function link(href, target = "_blank") {
  const link = $("<a>").attr("href", href).attr("target", target);
  $("body").append(link);
  console.log(href, target);
  link[0].click();
}

export function noop(arg) {
  return arg;
}

export function thin(arg) {
  return !!arg ? arg : undefined;
}

export function getPresentUsers(room) {
  return Object.keys(room.users).length;
}

export function dedup(master, slave) {
  let dedup = {};

  _.each(slave, (value, key) => {
    if (master[key] !== value)
      dedup[key] = value;
  });

  return dedup;
}

export function forEachFormat(callback) {
  ["Brackets", "CG3", "CoNLL-U", "plain text", "SD"].forEach(callback);
}
