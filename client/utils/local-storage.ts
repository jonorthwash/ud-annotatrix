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

function formatUploadSize(fileSize: number) {
  if (fileSize < 1024)
    return `${fileSize} B`;

  if (fileSize < 1048576)
    return `${(fileSize / 1024).toFixed(1)} kB`;

  return `${(fileSize / 1048576).toFixed(1)} mB`;
}

export function backup(value: any): void {
  if (!isAvailable())
    return;
  const serial = JSON.stringify(value);
  localStorage.setItem(KEY + "backup", serial);
}

export function restore(): any {
  if (!isAvailable())
    return null;
  let serial = localStorage.getItem(KEY + "backup");
  return JSON.parse(serial);
}

export function save(value: any): void {
  if (!isAvailable())
    return;
  const serial = JSON.stringify(value);
  localStorage.setItem(getTreebankId(), serial);
}

export function load(): any {
  if (!isAvailable())
    return null;
  let serial = localStorage.getItem(getTreebankId());
  return JSON.parse(serial);
}

export function clear(): void {
  if (!isAvailable())
    return;
  localStorage.removeItem(getTreebankId());
}

export function setPrefs(item: string, prefs: string): void {
  if (!isAvailable() || !item)
    return;
  localStorage.setItem(KEY + item, prefs);
}

export function getPrefs(item: string): string {
  if (!isAvailable() || !item)
    return null;
  return localStorage.getItem(KEY + item);
}
