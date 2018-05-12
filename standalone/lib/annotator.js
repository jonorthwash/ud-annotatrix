'use strict'

var FORMAT = '',
    FILENAME = 'ud-annotatrix-corpus.conllu', // default name
    CONTENTS = '',
    // var TEMPCONTENTS = '';
    AVAILABLE_SENTENCES = 0,
    LOCALSTORAGE_AVAILABLE = -1,
    CURRENT_SENTENCE = 0,
    RESULTS = [],
    LABELS = [];

window.onload = () => {

  /* Loads all the js libraries and project modules, then calles onReady.
  If server is running, makes a button for saving data.*/
  let path = './lib';
  head.js(
    `${path}/ext/jquery-3.2.1.min.js`,
    `${path}/ext/jquery-ui-1.12.1/jquery-ui.min.js`,
    `${path}/ext/cytoscape.min.js`,
    `${path}/ext/undomanager.js`,
    //`${path}/ext/popper.min.js`,
    `${path}/ext/jquery.autocomplete.js`,
    //`${path}/ext/bootstrap.min.js`,
    `${path}/ext/l20n.js`,
    `${path}/ext/canvas2svg.js`,
    `${path}/ext/conllu/conllu.js`, // CoNLL-U parser from https://github.com/FrancessFractal/conllu

    // native project code
    `${path}/CG2conllu.js`,
    `${path}/SD2conllu.js`,
    `${path}/Brackets2conllu.js`,
    `${path}/converters.js`,
    `${path}/server_support.js`,
    `${path}/gui.js`,
    `${path}/conllu_table.js`,
    `${path}/cy-style.js`,
    `${path}/visualiser.js`,
    `${path}/validation.js`,

    // KM classes
    `${path}/logger.js`,
    `${path}/tester.js`,
    `${path}/errors.js`
  );
  head.ready(onReady);
}


function onReady() {
    /*
    Called when all the naive code and libraries are loaded.
    - checks if server is running
    - sets undo manager
    - loads data from localStorage, if avaliable and server is not running
    - checks if someone loads data in url
    - binds handlers to DOM emements
    */

    window.log = new Logger('DEBUG');
    window.test = new Tester();
    window.test.all();
    resetCy(CY_OPTIONS); // initialize w/ defaults to avoid cy.$ is not a function errors

    checkServer(); // check if server is running
    window.undoManager = new UndoManager();  // undo support
    setUndos(window.undoManager);
    loadFromUrl();
    bindHandlers();

}


function saveData() { // TODO: rename to updateData
    if (IS_SERVER_RUNNING) {
        updateOnServer()
    } else {
        localStorage.setItem('corpus', getContents()); // TODO: get rid of 'corpus', move the treebank updating here from getContents
    }
}


function getContents() {
    /* Gets the corpus data saving the changes in current sentence,
    dependlessly of whether it's on server or in localStorage. */

    // if (IS_SERVER_RUNNING) {
    //     // TODO: implement
    // } else {
    var splitted = localStorage.getItem('treebank'); // TODO: implement a more memory-friendly func?
    splitted = JSON.parse(splitted) || new Array(); // string to array
    splitted[CURRENT_SENTENCE] = $('#indata').val();
    localStorage.setItem('treebank', JSON.stringify(splitted)); // update the treebank
    return splitted.join('\n\n');
    // }
}


function loadFromLocalStorage() {
    /* Checks if localStorage is avaliable. If yes, tries to load the corpus
    from localStorage. If no, warn user that localStorage is not avaliable. */

    if (storageAvailable('localStorage')) {
        getLocalStorageMaxSize();
        $('#localStorageAvailable').text(LOCALSTORAGE_AVAILABLE / 1024 + 'k');
        if (localStorage.getItem('corpus') != null) {
            CONTENTS = localStorage.getItem('corpus');
            loadDataInIndex();
        };
    }
    else {
        log.warn('localStorage is not available :(');
        // add a nice message so the user has some idea how to fix this
        var warnMsg = document.createElement('p');
        warnMsg.innerHTML = 'Unable to save to localStorage, maybe third-party cookies are blocked?';
        var warnLoc = document.getElementById('warning');
        warnLoc.appendChild(warnMsg);

    }
}



function loadFromUrl() {
    /* Check if the URL contains arguments. If it does, takes first
    and writes it to the textbox. */

    var parameters = window.location.search.slice(1);
    if (parameters){
        parameters = parameters.split('&')
        var variables = parameters.map(
            function(arg){
                return arg.split('=')[1].replace(/\+/g, ' ');
            })

        $('#indata').val(variables);
        drawTree();
    }
}


function loadFromFile(e) {
    /*
    Loads a corpus from a file from the user's computer,
    puts the filename into localStorage.
    If the server is running, ... TODO
    Else, loads the corpus to localStorage.
    */
    var file = e.target.files[0];
    if (!file) {return}
    var reader = new FileReader();
    localStorage.setItem('filename', file.name);

    reader.onload = function(e) {
        if (IS_SERVER_RUNNING) {
            // TODO: do something
        } else {
            localStorage.setItem('corpus', e.target.result);
            CONTENTS = localStorage.getItem('corpus');
            loadDataInIndex();
        }
    }
    reader.readAsText(file);
}


function formatUploadSize(fileSize) {
    if(fileSize < 1024) {
        return fileSize + ' B';
    }
    else if(fileSize >= 1024 && fileSize < 1048576) {
        return (fileSize/1024).toFixed(1) + ' kB';
    }
    else {
        return (fileSize/1048576).toFixed(1) + ' mB';
    }
}

function isQuotaExceeded(e) {
  var quotaExceeded = false;
  if (e) {
    if (e.code) {
      switch (e.code) {
        case 22:
          quotaExceeded = true;
          break;
        case 1014:
          // Firefox
          if (e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            quotaExceeded = true;
          }
          break;
      }
    } else if (e.number === -2147024882) {
      // Internet Explorer 8
      quotaExceeded = true;
    }
  }
  return quotaExceeded;
}

function handleUploadButtonPressed() {

    throw new NotImplementedError('handle upload button not implemented');
    /*
    // Replaces current content
    CONTENTS = TEMPCONTENTS;
    localStorage.setItem('corpus', CONTENTS);
    getLocalStorageMaxSize()
    $('#localStorageAvailable').text(LOCALSTORAGE_AVAILABLE / 1024 + 'k');
    loadDataInIndex();
    $('#uploadFileButton').attr('disabled', 'disabled');
    $('#uploadFileSizeError').hide();
    $('#fileModal').modal('hide');*/
}


function addSent() { // TODO: this is probably not what we want? what if we turn it into 'insert a new sentence _here_'?
    AVAILABLE_SENTENCES = AVAILABLE_SENTENCES + 1;
    showDataIndiv();
}

function removeCurSent() {
    /* Called when the button 'remove sentence' is pressed.
    Calls confirm window. If affirmed, */
    var conf = confirm('Do you want to remove the sentence?');
    if (conf) {
        saveData();
        var curSent = CURRENT_SENTENCE; // это нужно, т.к. в loadDataInIndex всё переназначается. это как-то мега костыльно, и надо исправить.
        $('#indata').val('');
        localStorage.setItem('corpus', getContents());
        loadDataInIndex();
        CURRENT_SENTENCE = curSent;
        if (CURRENT_SENTENCE >= AVAILABLE_SENTENCES) {CURRENT_SENTENCE--};
        showDataIndiv();
    }
}


function loadDataInIndex() {
    RESULTS = [];
    AVAILABLE_SENTENCES = 0;
    CURRENT_SENTENCE = 0;

    var corpus = localStorage.getItem('corpus');
    var splitted = splitIntoSentences(corpus);
    localStorage.setItem('treebank', JSON.stringify(splitted));
    RESULTS = splitted; // TODO: get rid of RESULTS

    AVAILABLE_SENTENCES = splitted.length;
    if (AVAILABLE_SENTENCES == 1 || AVAILABLE_SENTENCES == 0) {
        document.getElementById('nextSenBtn').disabled = true;
    } else {
        document.getElementById('nextSenBtn').disabled = false;
    }

    showDataIndiv();
}


function splitIntoSentences(corpus) {
    /* Takes a string with the corpus and returns an array of sentences. */
    var format = detectFormat(corpus);

    // splitting
    if (format == 'plain text') {
        var splitted = corpus.match(/[^ ].+?[.!?](?=( |$))/g);
    } else {
        var splitted = corpus.split('\n\n');
    }

    // removing empty lines
    for (var i = splitted.length - 1; i >= 0; i--) {
        if (splitted[i].trim() === '') {
            splitted.splice(i, 1);
        }
    }
    return splitted;
}


function showDataIndiv() {
    /* This function is called each time the current sentence is changed
    to update the CoNLL-U in the textarea and the indices. */

    if(RESULTS[CURRENT_SENTENCE] != undefined) {
      document.getElementById('indata').value = (RESULTS[CURRENT_SENTENCE]);
    } else {
      document.getElementById('indata').value = '';
    }
    if(AVAILABLE_SENTENCES != 0) {
        document.getElementById('currentsen').value = (CURRENT_SENTENCE+1);
    } else {
        document.getElementById('currentsen').value = 0;
    }
    document.getElementById('totalsen').innerHTML = AVAILABLE_SENTENCES;
    updateTable(); // Update the table view at the same time
    formatTabsView(document.getElementById('indata')); // update the format taps
    fitTable(); // make table's size optimal
    drawTree();
}


function goToSentence() { // TODO: refactor goToSenSent and merge to this func
    if (IS_SERVER_RUNNING) {
        // saveData();
        console.log('goToSentence');
        var sentNum = $('#currentsen').val();
        getSentence(sentNum);
    } else {
        goToSenSent();
    }
}


function prevSentence() { // TODO: refactor prevSenSent and merge to this func
    if (IS_SERVER_RUNNING) {
        // saveData();
        var sentNum = $('#currentsen').val() - 1;
        getSentence(sentNum);
    } else {
        prevSenSent();
    }
}


function nextSentence() {
    if (IS_SERVER_RUNNING) {
        var sentNum = Number($('#currentsen').val()) + 1;
        getSentence(sentNum);
    } else {
        nextSenSent();
    }
}


function goToSenSent() {
    saveData();

    RESULTS[CURRENT_SENTENCE] = document.getElementById('indata').value;
    CURRENT_SENTENCE = parseInt(document.getElementById('currentsen').value) - 1;
    if (CURRENT_SENTENCE < 0)  {
        CURRENT_SENTENCE = 0;
    }
    if (CURRENT_SENTENCE > (AVAILABLE_SENTENCES - 1))  {
        CURRENT_SENTENCE = AVAILABLE_SENTENCES - 1;
    }
    if (CURRENT_SENTENCE < (AVAILABLE_SENTENCES - 1)) {
        document.getElementById('nextSenBtn').disabled = false;
    }
    if (CURRENT_SENTENCE == 0) {
        document.getElementById('prevSenBtn').disabled = true;
    }

    clearLabels();
    showDataIndiv();
}

function prevSenSent() {
    saveData();

    RESULTS[CURRENT_SENTENCE] = document.getElementById('indata').value;
    CURRENT_SENTENCE--;
    if (CURRENT_SENTENCE < 0)  {
        CURRENT_SENTENCE = 0;
    }
    if (CURRENT_SENTENCE < (AVAILABLE_SENTENCES - 1)) {
        document.getElementById('nextSenBtn').disabled = false;
    }
    if (CURRENT_SENTENCE == 0) {
        document.getElementById('prevSenBtn').disabled = true;
    }
    clearLabels();
    showDataIndiv();
}

function nextSenSent() {
    /* When the user navigates to the next sentence. */
    saveData();

    RESULTS[CURRENT_SENTENCE] = document.getElementById('indata').value;
    CURRENT_SENTENCE++;
    if(CURRENT_SENTENCE >= AVAILABLE_SENTENCES) {
      CURRENT_SENTENCE = AVAILABLE_SENTENCES;
    }
    if (CURRENT_SENTENCE >= (AVAILABLE_SENTENCES - 1)) {
        document.getElementById('nextSenBtn').disabled = true;
    }
    if (CURRENT_SENTENCE > 0) {
        document.getElementById('prevSenBtn').disabled = false;
    }
    clearLabels();
    showDataIndiv();
}

function clearLabels() {
    LABELS = [];
    var htmlLabels = document.getElementById('treeLabels');
    while (htmlLabels.firstChild) {
      htmlLabels.removeChild(htmlLabels.firstChild);
    }
}

function exportCorpora() {
    //Export Corpora to file
    if (IS_SERVER_RUNNING) {
        console.log('exportCorpora');
        downloadCorpus();
    } else {
        var finalcontent = getContents();

        var link = document.createElement('a');
        var mimeType = 'text/plain';
        document.body.appendChild(link); // needed for FF
        var fname = localStorage.getItem('filename');
        if (!fname) {fname = 'ud-annotatrix-corpus.conllu'} // default name
        link.setAttribute('download', fname);
        link.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(finalcontent));
        link.click();
    }
}


function clearCorpus() {
    /* Removes all the corpus data from CONTENTS and localStorage,
    clears all the ralated global variables. */
    CONTENTS = '';
    AVAILABLE_SENTENCES = 0;
    CURRENT_SENTENCE = 0;
    RESULTS = [];
    FORMAT = '';
    localStorage.setItem('corpus', '');
    $('#indata').val('');
    showDataIndiv()
    window.location.reload();
    drawTree();
}


function drawTree() {
    /* This function is called whenever the input area changes.
    1. removes the previous tree, if there's one
    2. takes the data from the textarea
    3. */

    IS_EDITING = false;

    // TODO: update the sentence
    try {cy.destroy()} catch (err) {}; // remove the previous tree, if there is one

    var content = $('#indata').val(); // TODO: rename
    var format = detectFormat(content);

    // -- to be moved out--
    // content = content.replace(/ +\n/, '\n'); // remove extra spaces at the end of lines. #89
    // $('#indata').val(content); // TODO: what is this line for?

    // $('#detected').html('Detected: ' + format + ' format');
    // to be moved out --

    if (format == 'CG3') {
        content = CG2conllu(content)
        if (content == undefined) { // it means that the CG is ambiguous
            cantConvertCG(); // showing the worning
            return; // escaping
        } else {
            clearWarning();
        }
    } else if (format == 'SD') {
        content = SD2conllu(content)
    } else if (format == 'Brackets') {
        content = Brackets2conllu(content)
    } else if (format == 'plain text' || format == 'Unknown'){
        return; // it neans, the format is either 'plain text' or 'Unknown' and it wasn't converted to conllu
    }


    // -- to be moved out --
    var newContent = cleanConllu(content); // TODO: move this one inside of this func

    // If there are >1 CoNLL-U format sentences is in the input, treat them as such
    // conlluMultiInput(newContent); // TODO: move this one also inside of this func, and make a separate func for calling them all at the same time

    if(newContent != content) {
        content = newContent;
        $('#indata').val(content);
    }
    // -- to be moved out --

    conlluDraw(content);
    showProgress();
    var inpSupport = $('<div id="mute">'
        + '<input type="text" id="edit" class="hidden-input"/></div>');
    $('#cy').prepend(inpSupport);
    bindCyHandlers(); // moved to gui.js
    saveData();
    return content;
}


function formatTabsView() {
    /* The function handles the format tabs above the textarea.
    Takes a string with a format name, changes the classes on tabs. */
    var format = detectFormat($('#indata').val());
    if (format == 'CoNLL-U') {
        $('#viewOther').hide();
        $('#viewCG').removeClass('active');
        $('#viewOther').removeClass('active');
        $('#viewConllu').addClass('active');
    } else if (format == 'CG3') {
        $('#viewOther').hide();
        $('#viewConllu').removeClass('active');
        $('#viewOther').removeClass('active');
        $('#viewCG').addClass('active');
    } else {
        $('#viewOther').show();
        $('#viewOther').addClass('active');
        $('#viewConllu').removeClass('active');
        $('#viewCG').removeClass('active');
        $('#viewOther').text(format);
    }
}


function detectFormat(content) {
    clearLabels();
    //TODO: too many 'hacks' and presuppositions. refactor.

    content = content.trim();

    if(content == '') {
        // console.log('[0] detectFormat() WARNING EMPTY CONTENT');
        return  'Unknown';
    }

    var firstWord = content.replace(/\n/g, ' ').split(' ')[0];

    //console.log('[0] detectFormat() ' + content.length + ' | ' + FORMAT);
    //console.log('[1] detectFormat() ' + content);

    // handling # comments at the beginning
    if (firstWord[0] === '#'){
        var following = 1;
        while (firstWord[0] === '#' && following < content.length){
            // TODO: apparently we need to log the thing or it won't register???
            firstWord = content.split('\n')[following];
            // pull out labels and put them in HTML, TODO: this probably
            // wants to go somewhere else.
            if(firstWord.search('# labels') >= 0) {
                var labels = firstWord.split('=')[1].split(' ');
                for(var i = 0; i < labels.length; i++) {
                    var seen = false;
                    for(var j = 0; j < LABELS.length; j++) {
                        if(labels[i] == LABELS[j]) {
                            seen = true;
                        }
                    }
                    if(!seen) {
                        LABELS.push(labels[i]);
                    }
                }
                var htmlLabels = $('#treeLabels');
                for(var k = 0; k < LABELS.length; k++) {
                    if(LABELS[k].trim() == '') {
                        continue;
                    }
                    htmlLabels.append($('<span></span>')
                        .addClass('treebankLabel')
                        .text(LABELS[k])
                    );
                }
                //console.log('FOUND LABELS:' + LABELS);
            }
            following ++;
        }
    }

    var trimmedContent = content.trim('\n');
    //console.log(trimmedContent + ' | ' + trimmedContent[trimmedContent.length-1]);
    if (firstWord.match(/'<.*/)) {
    // SAFE: The first token in the string should start with '<
        FORMAT = 'CG3';
    } else if (firstWord.match(/1/)) {
    // UNSAFE: The first token in the string should be 1
        FORMAT = 'CoNLL-U';
    } else if (trimmedContent.includes('(') && trimmedContent.includes('\n') && (trimmedContent.includes(')\n') || trimmedContent[trimmedContent.length-1] == ')')) {
    // SAFE: To be SDParse as opposed to plain text we need at least 2 lines.
    // UNSAFE: SDParse should include at least one line ending in ) followed by a newline
    // UNSAFE: The last character in the string should be a )
        FORMAT = 'SD';
    // UNSAFE: The first character is an open square bracket
    } else if (firstWord.match(/\[/)) {
                FORMAT = 'Brackets';
    // TODO: better plaintext recognition
    } else if (!trimmedContent.includes('\t') && trimmedContent[trimmedContent.length-1] != ')') {
    // SAFE: Plain text and SDParse should not include tabs. CG3/CoNLL-U should include tabs
    // UNSAFE: SDParse should end the line with a ), but plain text conceivably could too
        FORMAT = 'plain text';
    } else {
        FORMAT = 'Unknown';
    }
    //console.log('[3] detectFormat() ' + FORMAT);

    return FORMAT
}


function showHelp() {
    /* Opens help in the same tab. */
    var win = window.open('help.html', '_blank');
    win.focus();
}


function storageAvailable(type) {
    /* Taken from https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API */
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}



function getLocalStorageMaxSize(error) {
  /* Returns the remaining available space in localStorage */

  if (localStorage) {
    var max = 10 * 1024 * 1024,
        i = 64,
        string1024 = '',
        string = '',
        // generate a random key
        testKey = 'size-test-' + Math.random().toString(),
        minimalFound = 0,
        error = error || 25e4;

    // fill a string with 1024 symbols / bytes
    while (i--) string1024 += 1e16;

    i = max / 1024;

    // fill a string with 'max' amount of symbols / bytes
    while (i--) string += string1024;

    i = max;

    // binary search implementation
    while (i > 1) {
      try {
        localStorage.setItem(testKey, string.substr(0, i));
        localStorage.removeItem(testKey);

        if (minimalFound < i - error) {
          minimalFound = i;
          i = i * 1.5;
        }
        else break;
      } catch (e) {
        localStorage.removeItem(testKey);
        i = minimalFound + (i - minimalFound) / 2;
      }
    }

    LOCALSTORAGE_AVAILABLE = minimalFound;
  }
}
