"use strict"

var FORMAT = "";
var FILENAME = 'ud-annotatrix-corpus.conllu'; // default name
var CONTENTS = "";
// var TEMPCONTENTS = "";
var AVAILABLESENTENCES = 0;
var LOCALSTORAGE_AVAILABLE = -1;
var CURRENTSENTENCE = 0;
var RESULTS = [];
var LOC_ST_AVAILABLE = false;
var LABELS = [];

function main() {
    /* Loads all the js libraries and project modules, then calles onReady.
    If server is running, makes a button for saving data.*/
    var pathRoot = './lib/';
    head.js(
        pathRoot + 'ext/jquery-3.2.1.min.js',
        pathRoot + 'ext/jquery-ui-1.12.1/jquery-ui.min.js',
        pathRoot + 'ext/cytoscape.min.js',
        pathRoot + 'ext/undomanager.js',
        pathRoot + 'ext/popper.min.js',
        pathRoot + 'ext/jquery.autocomplete.js',
        pathRoot + 'ext/bootstrap.min.js',
        pathRoot + 'ext/l20n.js',
        pathRoot + 'ext/canvas2svg.js',
        pathRoot + 'ext/conllu/conllu.js', // CoNLL-U parser from https://github.com/FrancessFractal/conllu

        // native project code
        pathRoot + 'CG2conllu.js',
        pathRoot + 'SD2conllu.js',
        pathRoot + 'Brackets2conllu.js',
        pathRoot + 'converters.js',
        pathRoot + 'server_support.js',
        pathRoot + 'gui.js',
        pathRoot + 'conllu_table.js',
        pathRoot + 'visualiser.js',
        pathRoot + 'validation.js',
        pathRoot + 'cy-style.js'
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

    checkServer(); // check if server is running
    window.undoManager = new UndoManager();  // undo support
    setUndos(window.undoManager);
    loadFromUrl();
    bindHandlers();
    setTimeout(function(){ // setTimeout, because we have to wait checkServer to finish working
        if (!SERVER_RUNNING) {
            loadFromLocalStorage(); // trying to load the corpus from localStorage
        } else {
            $('#upload').css('display', 'none');
            getSentence(1); // loading a sentence from the server
        }
    }, 300)
}


function saveData() { // TODO: rename to updateData
    if (SERVER_RUNNING) {
        updateOnServer()
    } else {
        localStorage.setItem("corpus", getContents()); // TODO: get rid of 'corpus', move the treebank updating here from getContents
    }
}


function getContents() {
    /* Gets the corpus data saving the changes in current sentence,
    dependlessly of whether it's on server or in localStorage. */

    // if (SERVER_RUNNING) {
    //     // TODO: implement
    // } else {
    var splitted = localStorage.getItem('treebank'); // TODO: implement a more memory-friendly func?
    splitted = JSON.parse(splitted); // string to array
    splitted[CURRENTSENTENCE] = $("#indata").val();
    localStorage.setItem('treebank', JSON.stringify(splitted)); // update the treebank
    return splitted.join('\n\n');
    // }
}


function loadFromLocalStorage() {
    /* Checks if localStorage is avaliable. If yes, tries to load the corpus
    from localStorage. If no, warn user that localStorage is not avaliable. */

    if (storageAvailable('localStorage')) {
        LOC_ST_AVAILABLE = true;
        getLocalStorageMaxSize();
        $("#localStorageAvailable").text(LOCALSTORAGE_AVAILABLE / 1024 + "k");
        if (localStorage.getItem("corpus") != null) {
            CONTENTS = localStorage.getItem("corpus");
            loadDataInIndex();
        };
    }
    else {
        console.log("localStorage is not available :(")
        // add a nice message so the user has some idea how to fix this
        var warnMsg = document.createElement('p');
        warnMsg.innerHTML = "Unable to save to localStorage, maybe third-party cookies are blocked?";
        var warnLoc = document.getElementById('warning');
        warnLoc.appendChild(warnMsg);

    }
}


function bindHandlers() {
    /* Binds handlers to DOM elements. */

    // TODO: causes errors if called before the cy is initialised
    $(document).keydown(keyDownClassifier);

    $("#indata").bind("keyup", drawTree);
    $("#indata").bind("keyup", focusOut);
    $("#indata").bind("keyup", formatTabsView);
    $("#RTL").on("click", switchRtlMode);
    $("#vertical").on("click", switchAlignment);
    $("#enhanced").on("click", switchEnhanced);
    document.getElementById('filename').addEventListener('change', loadFromFile, false);
}


function bindCyHandlers() {
    /* Binds event handlers to cy elements.
    NOTE: If you change the style of a node (e.g. its selector) then
    you also need to update it here. */
    cy.on('click', 'node.wf', drawArcs);
    cy.on('cxttapend', 'edge.dependency', selectArc);
    cy.on('click', 'node.pos', changeNode);
    cy.on('click', '$node > node', selectSup);
    cy.on('cxttapend', 'node.wf', changeNode);
    cy.on('click', 'edge.dependency', changeNode);
    cy.on('zoom', cy.center); // center the view port when the page zoom is changed
}


function loadFromUrl(argument) {
    /* Check if the URL contains arguments. If it does, takes first
    and writes it to the textbox. */

    var parameters = window.location.search.slice(1);
    if (parameters){
        parameters = parameters.split('&')
        var variables = parameters.map(
            function(arg){
                return arg.split('=')[1].replace(/\+/g, " ");
            })

        $("#indata").val(variables);
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
    localStorage.setItem("filename", file.name);

    reader.onload = function(e) {
        if (SERVER_RUNNING) {
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
        return (fileSize/1024).toFixed(1) + " kB";
    }
    else {
        return (fileSize/1048576).toFixed(1) + " mB";
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

// function handleUploadButtonPressed() {
//     // Replaces current content
//     CONTENTS = TEMPCONTENTS;
//     localStorage.setItem("corpus", CONTENTS);
//     getLocalStorageMaxSize()
//     $("#localStorageAvailable").text(LOCALSTORAGE_AVAILABLE / 1024 + "k");
//     loadDataInIndex();
//     $("#uploadFileButton").attr("disabled", "disabled");
//     $("#uploadFileSizeError").hide();
//     $('#fileModal').modal('hide');
// }


function addSent() { // TODO: this is probably not what we want? what if we turn it into "insert a new sentence _here_"?
        AVAILABLESENTENCES = AVAILABLESENTENCES + 1;
        showDataIndiv();
}

function removeCurSent() {
    /* Called when the button "remove sentence" is pressed.
    Calls confirm window. If affirmed, */
    var conf = confirm("Do you want to remove the sentence?");
    if (conf) {
        saveData();
        var curSent = CURRENTSENTENCE; // это нужно, т.к. в loadDataInIndex всё переназначается. это как-то мега костыльно, и надо исправить.
        $("#indata").val("");
        localStorage.setItem('corpus', getContents());
        loadDataInIndex();
        CURRENTSENTENCE = curSent;
        if (CURRENTSENTENCE >= AVAILABLESENTENCES) {CURRENTSENTENCE--};
        showDataIndiv();
    }
}


function loadDataInIndex() {
    RESULTS = [];
    AVAILABLESENTENCES = 0;
    CURRENTSENTENCE = 0;

    var corpus = localStorage.getItem('corpus');
    var splitted = splitIntoSentences(corpus);
    localStorage.setItem('treebank', JSON.stringify(splitted));
    RESULTS = splitted; // TODO: get rid of RESULTS

    AVAILABLESENTENCES = splitted.length;
    if (AVAILABLESENTENCES == 1 || AVAILABLESENTENCES == 0) {
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
    if (format == "plain text") {
        var splitted = corpus.match(/[^ ].+?[.!?](?=( |$))/g);
    } else {
        var splitted = corpus.split("\n\n");
    }

    // removing empty lines
    for (var i = splitted.length - 1; i >= 0; i--) {
        if (splitted[i].trim() === "") {
            splitted.splice(i, 1);
        }
    }
    return splitted;
}


function showDataIndiv() {
    /* This function is called each time the current sentence is changed
    to update the CoNLL-U in the textarea and the indices. */

    if(RESULTS[CURRENTSENTENCE] != undefined) {
      document.getElementById('indata').value = (RESULTS[CURRENTSENTENCE]);
    } else {
      document.getElementById('indata').value = "";
    }
    if(AVAILABLESENTENCES != 0) {
        document.getElementById('currentsen').value = (CURRENTSENTENCE+1);
    } else { 
        document.getElementById('currentsen').value = 0;
    }
    document.getElementById('totalsen').innerHTML = AVAILABLESENTENCES;
    updateTable(); // Update the table view at the same time
    formatTabsView(document.getElementById('indata')); // update the format taps
    fitTable(); // make table's size optimal
    drawTree();
}


function goToSentence() { // TODO: refactor goToSenSent and merge to this func
    if (SERVER_RUNNING) {
        // saveData();
        console.log('goToSentence');
        var sentNum = $('#currentsen').val();
        getSentence(sentNum);
    } else {
        goToSenSent();
    }
}


function prevSentence() { // TODO: refactor prevSenSent and merge to this func
    if (SERVER_RUNNING) {
        // saveData();
        var sentNum = $('#currentsen').val() - 1;
        getSentence(sentNum);
    } else {
        prevSenSent();
    }
}


function nextSentence() {
    if (SERVER_RUNNING) {
        var sentNum = Number($('#currentsen').val()) + 1;
        getSentence(sentNum);
    } else {
        nextSenSent();
    }
}


function goToSenSent() {
    saveData();

    RESULTS[CURRENTSENTENCE] = document.getElementById("indata").value;
    CURRENTSENTENCE = parseInt(document.getElementById("currentsen").value) - 1;
    if (CURRENTSENTENCE < 0)  {
        CURRENTSENTENCE = 0;
    }
    if (CURRENTSENTENCE > (AVAILABLESENTENCES - 1))  {
        CURRENTSENTENCE = AVAILABLESENTENCES - 1;
    }
    if (CURRENTSENTENCE < (AVAILABLESENTENCES - 1)) {
        document.getElementById("nextSenBtn").disabled = false;
    }
    if (CURRENTSENTENCE == 0) {
        document.getElementById("prevSenBtn").disabled = true;
    }

    clearLabels();
    showDataIndiv();
}

function prevSenSent() {
    saveData();

    RESULTS[CURRENTSENTENCE] = document.getElementById("indata").value;
    CURRENTSENTENCE--;
    if (CURRENTSENTENCE < 0)  {
        CURRENTSENTENCE = 0;
    }
    if (CURRENTSENTENCE < (AVAILABLESENTENCES - 1)) {
        document.getElementById("nextSenBtn").disabled = false;
    }
    if (CURRENTSENTENCE == 0) {
        document.getElementById("prevSenBtn").disabled = true;
    }
    clearLabels();
    showDataIndiv();
}

function nextSenSent() {
    /* When the user navigates to the next sentence. */
    saveData();

    RESULTS[CURRENTSENTENCE] = document.getElementById("indata").value;
    CURRENTSENTENCE++;
    if(CURRENTSENTENCE >= AVAILABLESENTENCES) {
      CURRENTSENTENCE = AVAILABLESENTENCES;
    }
    if (CURRENTSENTENCE >= (AVAILABLESENTENCES - 1)) {
        document.getElementById("nextSenBtn").disabled = true;
    }
    if (CURRENTSENTENCE > 0) {
        document.getElementById("prevSenBtn").disabled = false;
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
    if (SERVER_RUNNING) {
        console.log('exportCorpora');
        downloadCorpus();
    } else {    
        var finalcontent = getContents();

        var link = document.createElement('a');
        var mimeType = 'text/plain';
        document.body.appendChild(link); // needed for FF
        var fname = localStorage.getItem("filename");
        if (!fname) {fname = 'ud-annotatrix-corpus.conllu'} // default name
        link.setAttribute('download', fname);
        link.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(finalcontent));
        link.click();
    }
}


function clearCorpus() {
    /* Removes all the corpus data from CONTENTS and localStorage,
    clears all the ralated global variables. */
    CONTENTS = "";
    AVAILABLESENTENCES = 0;
    CURRENTSENTENCE = 0;
    RESULTS = [];
    FORMAT = ""
    localStorage.setItem("corpus", "");
    $("#indata").val("");
    showDataIndiv()
    window.location.reload();
    drawTree();
}


function drawTree() {
    /* This function is called whenever the input area changes.
    1. removes the previous tree, if there's one
    2. takes the data from the textarea
    3. */
    
    ISEDITING = false;
    
    // TODO: update the sentence
    try {cy.destroy()} catch (err) {}; // remove the previous tree, if there is one

    var content = $("#indata").val(); // TODO: rename

    // -- to be moved out-- 
    content = content.replace(/ +\n/, '\n'); // remove extra spaces at the end of lines. #89
    $("#indata").val(content); // TODO: what is this line for?

    var format = detectFormat(content);
    $("#detected").html("Detected: " + format + " format");
    // to be moved out --

    if (format == "CG3") {
        content = CG2conllu(content)
        if (content == undefined) { // it means that the CG is ambiguous
            cantConvertCG(); // showing the worning
            return; // escaping
        } else {
            clearWarning();
        }
    } else if (format == "SD") {
        content = SD2conllu(content)
    } else if (format == "Brackets") {
        content = Brackets2conllu(content)
    } else if (format == "plain text" || format == "Unknown"){
        return; // it neans, the format is either "plain text" or "Unknown" and it wasn't converted to conllu
    }


    // -- to be moved out --
    var newContent = cleanConllu(content); // TODO: move this one inside of this func

    // If there are >1 CoNLL-U format sentences is in the input, treat them as such
    conlluMultiInput(newContent); // TODO: move this one also inside of this func, and make a separate func for calling them all at the same time 

    if(newContent != content) {
        content = newContent;
        $("#indata").val(content);
    }
    // -- to be moved out -- 

    conlluDraw(content);
    showProgress();
    var inpSupport = $("<div id='mute'>"
        + "<input type='text' id='edit' class='hidden-input'/></div>");
    $("#cy").prepend(inpSupport);
    bindCyHandlers();
    saveData();
}


function formatTabsView() {
    /* The function handles the format tabs above the textarea.
    Takes a string with a format name, changes the classes on tabs. */
    var format = detectFormat($("#indata").val());
    if (format == "CoNLL-U") {
        $("#viewOther").hide();
        $("#viewCG").removeClass("active");
        $("#viewOther").removeClass("active");
        $("#viewConllu").addClass("active");
    } else if (format == "CG3") {
        $("#viewOther").hide();
        $("#viewConllu").removeClass("active");
        $("#viewOther").removeClass("active");
        $("#viewCG").addClass("active");
    } else {
        $("#viewOther").show();
        $("#viewOther").addClass("active");
        $("#viewConllu").removeClass("active");
        $("#viewCG").removeClass("active");
        $("#viewOther").text(format);
    }
}


function detectFormat(content) {
    clearLabels();
    //TODO: too many "hacks" and presuppositions. refactor.

    content = content.trim();

    if(content == "") {
        // console.log('[0] detectFormat() WARNING EMPTY CONTENT');
        return  "Unknown";
    }
 
    var firstWord = content.replace(/\n/g, " ").split(" ")[0];

    //console.log('[0] detectFormat() ' + content.length + " | " + FORMAT);
    //console.log('[1] detectFormat() ' + content);

    // handling # comments at the beginning
    if (firstWord[0] === '#'){
        var following = 1;
        while (firstWord[0] === '#' && following < content.length){
            // TODO: apparently we need to log the thing or it won't register???
            firstWord = content.split("\n")[following];
            // pull out labels and put them in HTML, TODO: this probably
            // wants to go somewhere else.
            if(firstWord.search('# labels') >= 0) {
                var labels = firstWord.split("=")[1].split(" ");
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
                    if(LABELS[k].trim() == "") {
                        continue;
                    }
                    htmlLabels.append($('<span></span>')
                        .addClass('treebankLabel')
                        .text(LABELS[k])
                    );
                }
                //console.log("FOUND LABELS:" + LABELS);
            }
            following ++;
        }
    }

    var trimmedContent = content.trim("\n");
    //console.log(trimmedContent + ' | ' + trimmedContent[trimmedContent.length-1]);
    if (firstWord.match(/"<.*/)) {
    // SAFE: The first token in the string should start with "<
        FORMAT = "CG3";
    } else if (firstWord.match(/1/)) {
    // UNSAFE: The first token in the string should be 1
        FORMAT = "CoNLL-U";
    } else if (trimmedContent.includes("(") && trimmedContent.includes("\n") && (trimmedContent.includes(")\n") || trimmedContent[trimmedContent.length-1] == ")")) {
    // SAFE: To be SDParse as opposed to plain text we need at least 2 lines.
    // UNSAFE: SDParse should include at least one line ending in ) followed by a newline
    // UNSAFE: The last character in the string should be a )
        FORMAT = "SD";
    // UNSAFE: The first character is an open square bracket
    } else if (firstWord.match(/\[/)) {
                FORMAT = "Brackets";
    // TODO: better plaintext recognition
    } else if (!trimmedContent.includes("\t") && trimmedContent[trimmedContent.length-1] != ")") {
    // SAFE: Plain text and SDParse should not include tabs. CG3/CoNLL-U should include tabs
    // UNSAFE: SDParse should end the line with a ), but plain text conceivably could too
        FORMAT = "plain text";
    } else {
        FORMAT = "Unknown";
    }
    //console.log('[3] detectFormat() ' + FORMAT);

    return FORMAT
}


function showHelp() {
    /* Opens help in the same tab. */
    var win = window.open("help.html", '_blank');
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

window.onload = main;
