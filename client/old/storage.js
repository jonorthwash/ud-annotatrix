'use strict';

/**
 *  LOADING functions
 */
function loadFromLocalStorage() {
    log.debug(`called loadFromLocalStorage()`);

    /* Checks if localStorage is avaliable. If yes, tries to load the corpus
    from localStorage. If no, warn user that localStorage is not avaliable. */

    if (storageAvailable('localStorage')) {

        const localStorageMaxSize = getLocalStorageMaxSize();
        $('#localStorageAvailable').text(`${localStorageMaxSize/1024}k`);
        if (localStorage.getItem('corpus') !== null) {
            CONTENTS = localStorage.getItem('corpus');
            loadDataInIndex();
        }

    }
    else {

        log.warn('localStorage is not available :(');

        // add a nice message so the user has some idea how to fix this.
        $('#warning').append(
            $('<p>Unable to save to localStorage, maybe third-party cookies are blocked?</p>') );

    }
}
function loadFromUrl() {
    log.debug(`called loadFromUrl`);

    /* Check if the URL contains arguments. If it does, takes first
    and writes it to the textbox. */

    let parameters = window.location.search.slice(1);
    if (parameters) {
        parameters = parameters.split('&');
        const variables = parameters.map( (arg) => {
            return arg.split('=')[1].replace(/\+/g, ' ');
        });

        $('#text-data').val(variables);
        drawTree();
    }
}
function loadFromFile(event) {
    log.debug(`called loadFromFile(${JSON.stringify(event)})`);

    /*
    Loads a corpus from a file from the user's computer,
    puts the filename into localStorage.
    If the server is running, ... TODO
    Else, loads the corpus to localStorage.
    */

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    localStorage.setItem('filename', file.name);

    reader.onload = (event) => {
        if (IS_SERVER_RUNNING) {
            // TODO: do something
        } else {
            localStorage.setItem('corpus', event.target.result);
            CONTENTS = localStorage.getItem('corpus');
            loadDataInIndex();
        }
    }
    reader.readAsText(file);
}





/**
 * SAVING functions
 */
function saveData() { // TODO: rename to updateData
    log.debug(`called saveData()`);

    throw new NotImplementedError('saveData() not implemented');

    /*
    if (IS_SERVER_RUNNING) {
        updateOnServer()
    } else {
        localStorage.setItem('corpus', getContents()); // TODO: get rid of 'corpus', move the treebank updating here from getContents
    }*/
}
function formatUploadSize(fileSize) {
    log.debug(`called formatUploadSize(${fileSize})`);

    if (fileSize < 1024)
        return `${fileSize} B`;
    if (fileSize < 1048576)
        return `${(fileSize/1024).toFixed(1)} kB`;

    return `${(fileSize/1048576).toFixed(1)} mB`;
}
function handleUploadButtonPressed() {
    log.debug(`called handleUploadButtonPressed()`);

    throw new NotImplementedError('handle upload button not implemented');
    /*
    // Replaces current content
    CONTENTS = TEMPCONTENTS;
    localStorage.setItem('corpus', CONTENTS);
    getLocalStorageMaxSize()
    $('#localStorageAvailable').text(LOCALSTORAGE_AVAILABLE / 1024 + 'k');
    loadDataInIndex();
    $('#uploadFileButton').attr('disabled', 'disabled');
    $('#errorUploadFileSize').hide();
    $('#fileModal').modal('hide');*/
}





/**
 *  LOCALSTORAGE functions
 */
function isQuotaExceeded(event) {
    log.debug(`called isQuotaExceeded(${JSON.stringify(event)})`);

    let quotaExceeded = false;
    if (event) {
        if (event.code) {
            switch (event.code) {
                case 22:
                    quotaExceeded = true;
                    break;
                case 1014: // Firefox
                    quotaExceeded = (event.name === 'NS_ERROR_DOM_QUOTA_REACHED');
                    break;
            }
        } else {
            quotaExceeded = (event.number === -2147024882) // IE8
        }
    }

    return quotaExceeded;
}
function storageAvailable(type) {
    log.debug(`called storageAvailable(${type})`);

    /* Taken from https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API */
    try {
        const storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return e instanceof DOMException
            && ( e.code === 1014 // Firefox
                || e.code === 22 // everything else
                // test name field too, because code might not be present
                || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' // Firefox
                || e.name === 'QuotaExceededError' )       // everything else

            // acknowledge QuotaExceededError only if there's something already stored
            && storage.length !== 0;
    }
}
function getLocalStorageMaxSize(error) {
    log.debug(`called getLocalStorageMaxSize(${error})`);

    /* Returns the remaining available space in localStorage */

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
