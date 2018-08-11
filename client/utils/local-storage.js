'use strict';

const funcs = require('./funcs');
const KEY = '__ud_annotatrix_prefs_';


function isAvailable() {

  try {
    localStorage;
  } catch (e) {
    return false;
  }

  // Taken from https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API

  try {
    const x = '__storage_test__';

    localStorage.setItem(x, x);
    localStorage.removeItem(x);
    return true;

  } catch (e) {

    return e instanceof DOMException
      && ( e.code === 1014 // Firefox
        || e.code === 22 // everything else

        // test name field too, because code might not be present
        || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' // Firefox
        || e.name === 'QuotaExceededError' )       // everything else

      // acknowledge QuotaExceededError only if there's something already stored
      && localStorage.length !== 0;
  }

}

function getAvailableSpace() {

  // Returns the remaining available space in localStorage
  if (!isAvailable())
    return 0;

  const max = 10 * 1024 * 1024,
    testKey = `size-test-${Math.random().toString()}`; // generate random key
  let i = 64,
    string1024 = '',
    string = '',
    found = 0;

  if (localStorage) {

    error = error || 25e4;

    // fill a string with 1024 symbols/bytes
    while (i--) string1024 += 1e16

    // fill a string with "max" amount of symbols/bytes
    i = max/1024;
    while (i--) string += string1024;
    i = max;

    // binary search
    while (i > 1) {
      try {
        localStorage.setItem(testKey, string.substr(0, i));
        localStorage.removeItem(testKey);

        if (found < i - error) {
          found = i;
          i *= 1.5;
        } else {
          break;
        }

      } catch (e) {
        localStorage.removeItem(testKey);
        i = found + (i - found) / 2;
      }
    }
  }

  return found;
}

function isQuotaExceeded(event) {

    if (event && event.code === 22) {
      return true;

    } else if (event && event.code === 1014) {
      return (event.name === 'NS_ERROR_DOM_QUOTA_REACHED');

    } else if (event) {
      return (event.number === -2147024882); // IE8
    }

    return false;
}

function formatUploadSize(fileSize) {

  if (fileSize < 1024)
    return `${fileSize} B`;

  if (fileSize < 1048576)
    return `${(fileSize/1024).toFixed(1)} kB`;

  return `${(fileSize/1048576).toFixed(1)} mB`;
}

function save(value) {

  if (!isAvailable())
    return null;

  value = JSON.stringify(value);
  return localStorage.setItem(funcs.getTreebankId(), value);
}

function load() {

  if (!isAvailable())
    return null;

  let serial = localStorage.getItem(funcs.getTreebankId());
  return JSON.parse(serial);
}

function clear() {

  if (!isAvailable())
    return null;

  return localStorage.removeItem(funcs.getTreebankId());
}

function setPrefs(item, prefs) {

  if (!isAvailable() || !item)
    return null;

  return localStorage.setItem(KEY + item, prefs);
}

function getPrefs(item) {

  if (!isAvailable() || !item)
    return null;

  return localStorage.getItem(KEY + item);
}

module.exports = {
  isAvailable,
  //isQuotaExceeded,
  getAvailableSpace,
  //formatUploadSize,
  save,
  load,
  clear,
  getPrefs,
  setPrefs,
};
