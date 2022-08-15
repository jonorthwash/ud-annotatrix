import {getTreebankId} from "./funcs";

const KEY = "__ud_annotatrix_prefs_";

function isAvailable() {

  try {
    localStorage;
  } catch (e) {
    return false;
  }

  // Taken from https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API

  try {
    const x = "__storage_test__";

    localStorage.setItem(x, x);
    localStorage.removeItem(x);
    return true;

  } catch (e) {

    return e instanceof DOMException &&
           (e.code === 1014  // Firefox
            || e.code === 22 // everything else

            // test name field too, because code might not be present
            || e.name === "NS_ERROR_DOM_QUOTA_REACHED" // Firefox
            || e.name === "QuotaExceededError")        // everything else

           // acknowledge QuotaExceededError only if there's something already stored
           && localStorage.length !== 0;
  }
}

function isQuotaExceeded(event) {

  if (event && event.code === 22) {
    return true;

  } else if (event && event.code === 1014) {
    return (event.name === "NS_ERROR_DOM_QUOTA_REACHED");

  } else if (event) {
    return (event.number === -2147024882); // IE8
  }

  return false;
}

function formatUploadSize(fileSize) {

  if (fileSize < 1024)
    return `${fileSize} B`;

  if (fileSize < 1048576)
    return `${(fileSize / 1024).toFixed(1)} kB`;

  return `${(fileSize / 1048576).toFixed(1)} mB`;
}

export function backup(value) {

  if (!isAvailable())
    return null;

  value = JSON.stringify(value);
  return localStorage.setItem(KEY + "backup", value);
}

export function restore() {

  if (!isAvailable())
    return null;

  let serial = localStorage.getItem(KEY + "backup");
  return JSON.parse(serial);
}

export function save(value) {

  if (!isAvailable())
    return null;

  value = JSON.stringify(value);
  return localStorage.setItem(getTreebankId(), value);
}

export function load() {

  if (!isAvailable())
    return null;

  let serial = localStorage.getItem(getTreebankId());
  return JSON.parse(serial);
}

export function clear() {

  if (!isAvailable())
    return null;

  return localStorage.removeItem(getTreebankId());
}

export function setPrefs(item, prefs) {

  if (!isAvailable() || !item)
    return null;

  return localStorage.setItem(KEY + item, prefs);
}

export function getPrefs(item) {

  if (!isAvailable() || !item)
    return null;

  return localStorage.getItem(KEY + item);
}
