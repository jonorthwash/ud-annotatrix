"use strict"

var FORMAT = "";
var FILENAME = 'ud-annotatrix-corpus.conllu'; // default name
var ROOT = './lib/';
var CONTENTS = "";
var TEXTAREA_ROWS_DEFAULT = 20;
var AVAILABLESENTENCES = 0;
var LOCALSTORAGE_AVAILABLE = -1;
var CURRENTSENTENCE = 0;
var TABLE_VIEW = false;
var TABLE_COLUMNS_HEADERS = {"ID":0,"FORM":1,"LEMMA":2,"UPOSTAG":3,"XPOSTAG":4,"FEATS":5,"HEAD":6,"DEPREL":7,"DEPS":8,"MISC":9};
var TABLE_COLUMNS_VISIBILITY = {0:true,1:true,2:true,3:true,4:true,5:true,6:true,7:true,8:true,9:true};
var RESULTS = [];
var LOC_ST_AVAILABLE = false;
var SERVER_RUNNING = false;
var AMBIGUOUS = false;
var VIEW_ENHANCED = false;
var LABELS = [];


function main() {
    /* Loads all the js libraries and project modules, then calles onReady.
    If server is running, makes a button for saving data.*/

    head.js(
        ROOT + 'ext/jquery-3.2.1.min.js',
        ROOT + 'ext/jquery-ui-1.12.1/jquery-ui.min.js',
        ROOT + 'ext/cytoscape.min.js',
        ROOT + 'ext/undomanager.js',
        ROOT + 'ext/popper.min.js',
        ROOT + 'ext/jquery.autocomplete.js',
        ROOT + 'ext/bootstrap.min.js',
        ROOT + 'ext/l20n.js',

        // CoNLL-U parser from https://github.com/FrancessFractal/conllu
        ROOT + 'ext/conllu/conllu.js',

        // native project code
        ROOT + 'CG2conllu.js',
        ROOT + 'SD2conllu.js',
        ROOT + 'Brackets2conllu.js',
        ROOT + 'converters.js',
        ROOT + 'gui.js',
        ROOT + 'visualiser.js',
        ROOT + 'validation.js',
        ROOT + 'cy-style.js'
    );

    head.ready(onReady);

    // if server is running, make a button for saving data on server
    setTimeout(function(){
        if (SERVER_RUNNING) {
            $("#save").css("display", "block")
                      .css("background-color", NORMAL);
        }
    }, 500);
}


function onReady() {
    /*
    Called when all the naive code and libraries are loded.
    - checks if server is running
    - sets undo manager
    - loads data from localStorage, if avaliable
    - checks if someone loads data in url
    - binds handlers to DOM emements
    */
    fetch('running').then(
        function(data) {
            console.log("Response from server, status: " + data["status"]);
            getCorpusData();
            SERVER_RUNNING = true;
        }); // TODO: to get rid of the error, read about promisses: https://qntm.org/files/promise/promise.html

    window.undoManager = new UndoManager();  // undo support
    setUndos(window.undoManager);

    loadFromLocalStorage(); // trying to load the corpus from localStorage
    loadFromUrl();
    bindHanlers()
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


function bindHanlers() {
    /* Binds handlers to DOM elements. */

    // TODO: causes errors if called before the cy is initialised
    $(document).keyup(keyUpClassifier);

    $("#indata").bind("keyup", drawTree);
    $("#indata").bind("keyup", focusOut);
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
    cy.on('zoom', changeZoom);
}


function changeZoom() {
    console.log('zoom event');
//if(event.shiftKey) {
//    console.log('zoom event+SHIFT');
//}
    cy.center();
}

function loadFromUrl(argument) {
    //check if the URL contains arguments

    var parameters = window.location.search.slice(1);
    parameters = parameters.split('&')[1]
    if (parameters){
        var variables = parameters.map(function(arg){
            return arg.split('=')[1].replace(/\+/g, " ");
        });

        $("#indata").val(variables[0]);

        drawTree();
    }
}


//Load Corpora from file
function loadFromFile(e) {
    CONTENTS = "";
    var file = e.target.files[0];
    FILENAME = file.name;

    // check if the code is invoked
    var ext = FILENAME.split(".")[FILENAME.split(".").length - 1]; // TODO: should be more beautiful way
    if (ext == "txt") {
        FORMAT = "plain text";
    }

    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        CONTENTS = e.target.result;
        localStorage.setItem("corpus", CONTENTS);
        loadDataInIndex();
    };
    reader.readAsText(file);
}


function addSent() {
        AVAILABLESENTENCES = AVAILABLESENTENCES + 1;
        showDataIndiv();
}

function removeCurSent() {
    var conf = confirm("Do you want to remove the sentence?");
    if (conf) {
        var curSent = CURRENTSENTENCE;
        $("#indata").val("");
        CONTENTS = getTreebank();
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

    if (FORMAT == "plain text") {
        var splitted = CONTENTS.match(/[^ ].+?[.!?](?=( |$))/g);
    // } else if (FORMAT == undefined) {
    //     var splitted = [];
    } else {
        var splitted = CONTENTS.split("\n\n");
    }

    // console.log('loadDataInIndex |' + FORMAT + " | " + splitted.length)
    for (var i = splitted.length - 1; i >= 0; i--) {
        if (splitted[i].trim() === "") {
            splitted.splice(i, 1);
        }
    }

    AVAILABLESENTENCES = splitted.length;
    //console.log('loadDataInIndex |' + FORMAT + " | AVAILABLESENTENCES = " + AVAILABLESENTENCES)

    if (AVAILABLESENTENCES == 1 || AVAILABLESENTENCES == 0) {
        document.getElementById('nextSenBtn').disabled = true;
    } else {
        document.getElementById('nextSenBtn').disabled = false;
    }

    for (var i = 0; i < splitted.length; ++i) {
        var check = splitted[i];
        RESULTS.push(check);
    }
    showDataIndiv();
}

function showDataIndiv() {
    // This function is called each time the current sentence is changed to update
    // the CoNLL-U in the textarea.
    //console.log('showDataIndiv() ' + RESULTS.length + " // " + CURRENTSENTENCE);

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
    drawTree();
}

function goToSenSent() {
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
    //When Navigate to next item
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
    var finalcontent = getTreebank();

    var link = document.createElement('a');
    var mimeType = 'text/plain';
    document.body.appendChild(link); // needed for FF
    link.setAttribute('download', FILENAME);
    link.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(finalcontent));
    link.click();
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


function getTreebank() {

    RESULTS[CURRENTSENTENCE] = document.getElementById("indata").value;
    var finalcontent = "";
    // loop through all the trees
    for(var x=0; x < RESULTS.length; x++){
        // add them to the final file, but get rid of any trailing whitespace
        finalcontent = finalcontent + RESULTS[x].trim();
        // if it's not the last tree, add two ewlines (e.g. one blank line)
        if(x != ((RESULTS.length)-1)){
            finalcontent = finalcontent + "\n\n";
        }
    }
    // output final newline
    return finalcontent + "\n\n";
}


function drawTree() {
    // This function is called whenever the input area changes
    //
    try {
        cy.destroy();
    } catch (err) {};

    var content = $("#indata").val();
    // remove extra spaces at the end of lines. #89
    content = content.replace(/ +\n/, '\n');
    if(content.split('\n').length < TEXTAREA_ROWS_DEFAULT) {
        $("#indata").attr('rows', content.split('\n').length+1);
    } else {
        $("#indata").attr('rows', TEXTAREA_ROWS_DEFAULT);
    }
    $("#indata").val(content);
    FORMAT = detectFormat(content);

    $("#detected").html("Detected: " + FORMAT + " format");
    //console.log('drawTree() ' + FORMAT);
    if (FORMAT == "CoNLL-U") {
        $("#viewOther").hide();
        $("#viewCG").removeClass("active");
        $("#viewOther").removeClass("active");
        $("#viewConllu").addClass("active");
    } else if (FORMAT == "CG3") {
        $("#viewOther").hide();
        $("#viewConllu").removeClass("active");
        $("#viewOther").removeClass("active");
        $("#viewCG").addClass("active");
    } else {
        $("#viewOther").show();
        $("#viewOther").addClass("active");
        $("#viewConllu").removeClass("active");
        $("#viewCG").removeClass("active");
        $("#viewOther").text(FORMAT);
    }


    if (FORMAT == "CG3") {
        content = CG2conllu(content)
        if (content == undefined) {
            AMBIGUOUS = true;
        } else {
            AMBIGUOUS = false;
        }
    };

    if (FORMAT == "SD") {
        content = SD2conllu(content);
    }

    if (FORMAT == "Brackets") {
        content = Brackets2conllu(content);
    }


    if (FORMAT == "CoNLL-U" || (FORMAT == "CG3" && !AMBIGUOUS) || FORMAT == "SD" || FORMAT == "Brackets") {
        var newContent = cleanConllu(content);
        // If there are >1 CoNLL-U format sentences is in the input, treat them as such
        if(newContent.match(/\n\n/)) {
            conlluMultiInput(newContent);
        }
        if(newContent != content) {
            content = newContent;
            $("#indata").val(content);
        }

        conlluDraw(content);
        var inpSupport = $("<div id='mute'>"
            + "<input type='text' id='edit' class='hidden-input'/></div>");
        $("#cy").prepend(inpSupport);
        bindCyHandlers();
    }

    if (LOC_ST_AVAILABLE) {
        localStorage.setItem("corpus", getTreebank()); // saving the data
    }

    if (AMBIGUOUS) {
        cantConvertCG();
    } else {
        clearWarning();
    }
}


function detectFormat(content) {
    clearLabels();
    //TODO: too many "hacks" and presuppositions. refactor.

    content = content.trim();

    if(content == "") {
        console.log('[0] detectFormat() WARNING EMPTY CONTENT');
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


function saveOnServer(evt) {
    var finalcontent = getTreebank();

    // sending data on server
    var treebank_id = location.href.split('/')[4];
    $.ajax({
        type: "POST",
        url: '/save',
        data: {
            "content": finalcontent,
            "treebank_id": treebank_id
        },
        dataType: "json",
        success: function(data){
            console.log('Load was performed.');
        }
    });
}


function getCorpusData() {
    var treebank_id = location.href.split('/')[4];
    $.ajax({
        type: "POST",
        url: "/load",
        data: {"treebank_id": treebank_id},
        dataType: "json",
        success: loadData
    });
}


function loadData(data) {
    console.log("loadData");
    if (data["content"]) {
        CONTENTS = data["content"];
    }
    loadDataInIndex();
}


function showHelp() {
    /* Opens help in a new tab. */
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

function tableEditCell(loc) { 
    // Yes I'm sorry I don't know Jquery, I'm sure this could be done much better.
    loc = loc.trim();
    var table = document.getElementById("indataTable");
    var cell = document.getElementById(loc).innerHTML;
    console.log("tableEditCell() " + loc + " " + cell);

    // Update the CoNLL-U and set the value in the textbox 

    var conllu = "";
    
    for (var r = 1, n = table.rows.length; r < n; r++) {
        for (var c = 0, m = table.rows[r].cells.length; c < m; c++) {
            var thisCell = table.rows[r].cells[c].childNodes[0].innerHTML;
            if(thisCell.trim() == "") {
                thisCell = "_";
            }
            thisCell = thisCell.replace(/<br>/, ''); // Get rid of extra spaces
//            console.log("@" + table.rows[r].cells[c].innerHTML + " // " + thisCell);
            if(c > 0) {
              conllu = conllu + "\t" + thisCell;
            } else {
              conllu = conllu + thisCell;
            }
        }
        conllu = conllu + "\n";
    }
    console.log("!@", conllu);
    $("#indata").val(conllu);
 
    drawTree();
}

function toggleTableView() {
    // This function toggles the table view
    $("#tableViewButton").toggleClass('fa-code', 'fa-table');
    $("#indata").toggle();
    $("#indataTable").toggle();
    if(TABLE_VIEW) {
        TABLE_VIEW = false;
    } else { 
        TABLE_VIEW = true;
    }
}

function updateTable() {
    // Update the data in the table from the data in the textarea
    $("#indataTable tbody").empty();
    var conlluLines = $("#indata").val().split("\n");
    var row = 0;

    for(let line of conlluLines) {
        if(line.trim() == "") {
            continue;
        }
        //console.log(line);
        if(line[0] == '#') {
            $("#indataTable tbody").append('<tr style="display:none" id="table_"' + row + '"><td colspan="10"><span>' + line + '</span></td></tr>'); 
        } else if(line.split('\t').length != 10) { 
            // console.log('WEIRDNESS:', line.split('\t').length ,line);
            $("#indataTable tbody").append('<tr style="display:none" id="table_"' + row + '"><td colspan="10"><span>' + line + '</span></td></tr>'); 
        } else { 
            var lineRow = $("<tr>");
            var cells = line.split("\t");
            for(var col = 0; col < 10; col++) {
                var valid = [true, "", {}];
                var loc = "table_" + row + ":" + col;
                if(cells[col].trim() == "") { 
                    cells[col] = "_";
                } 
                if(cells[col] != "_") {
                    if(col == 3) {
                        valid = is_upos(cells[col]);
                    }
                    if(col == 7) {
                        valid = is_udeprel(cells[col]);
                    }
                }

                let td = $("<td>");
                let span0 = $('<span data-value="' + cells[col] + '"onBlur="updateTable();" onKeyUp="tableEditCell(\''+loc+'\');" id="' + loc + '" contenteditable>' + cells[col] + '</span>');
                td.append(span0);
                if(!valid[0]) { 
                    let span1 = $('<span><i class="fa fa-exclamation-triangle" aria-hidden="true"></i></span>');
                    document.l10n.formatValue(valid[1], valid[2]).then(function(t) { span1.attr("title", t);});
                    td.append(span1);
                }
                lineRow.append(td);
            }
            $("#indataTable tbody").append(lineRow); 
        }
        row += 1;
    }

    // Make sure hidden columns stay hidden
    // This could probably go in the for loop above
    for(var col = 0; col < 10; col++) {
        if(!TABLE_COLUMNS_VISIBILITY[col]) {
            $("[id^=table_][id$=" + col+"]").css("display","none");
        }
    }
// Sushain's original, more beautiful code:
//    $("#indataTable tbody").append(
//        $("#indata").val().split("\n")
//            .filter(line => line.length && !line.startsWith("#"))
//            .map(rowText => $("<tr>").append(
//                rowText.split("\t").map(cellText => $("<td>").text(cellText))
//            ))
//    );
}

function toggleTableColumn(col) {
   // Toggle the visibility of a table column. It only hides the values in the cells,
   // not the column header. 
   // @col = the column that was clicked

   // the HTML id of the table cell is #table_<ROW>:<COLUMN>, the hash maps 
   // from column ID to column offset
   var colId = TABLE_COLUMNS_HEADERS[col];
   var button = $("#tableCol_" + col).text();  // The text (e.g. dot)

   console.log("toggleTableColumn() " + " " + col + " " + button);
   // $("#tableCol_" + col).empty(); // Empty the text

   $("#tableCol_" + col + " i").toggleClass("fa-angle-double-right", "fa-angle-double-left"); 
   $("#tableHead_" + col).toggle();
   $("[id^=table_][id$=" + colId+"]").toggle();
   TABLE_COLUMNS_VISIBILITY[colId] = !TABLE_COLUMNS_VISIBILITY[colId] ;

   if(button == "⚪") {  // If the column is currently hidden, make it visible
     //$("#tableCol_" + col).append("⚫");
     //$("#tableHead_" + col).css("display","inline-block");
     //$("[id^=table_][id$=" + colId+"]").css("display","inline-block");
     //TABLE_COLUMNS_VISIBILITY[colId] = true;
   } else { // If the column is visible make it hidden
     //$("#tableCol_" + col).append("⚪");
     //$("#tableHead_" + col).css("display","none");
     //$("[id^=table_][id$=" + colId+"]").css("display","none");
     //TABLE_COLUMNS_VISIBILITY[colId] = false;
   }

   // TODO: Maybe use greying out of the headers in addition to/instead of 
   // the filled/empty dots to indicate hidden or not
}

function toggleCodeWindow() {
    $("#codeVisibleButton").toggleClass('fa-chevron-down', 'fa-chevron-up');
    //console.log('toggleCodeWindow()');
    $(".indataarea").toggle();
    $("#tabBox").toggle();
    $("#viewButton").toggle();
    /**
    if(TABLE_VIEW) {
        $("#indataTable").toggle('show');
    } else { 
        $("#indata").toggle('show');
    }
    **/
}

function getLocalStorageMaxSize(error) {
  // Returns the remaining available space in localStorage
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

function focusOut(key) {
    if (key.which == ESC) {
        this.blur();
    }
}

window.onload = main;
