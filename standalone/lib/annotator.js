"use strict"

var FORMAT = "";
var FILENAME = 'corpora.txt'; // default name
var ROOT = './lib/';
var CONTENTS = "";
var AVAILABLESENTENCES = 0;
var CURRENTSENTENCE = 0;
var RESULTS = [];
var LOC_ST_AVALIABLE = false;
 

function main() {
    head.js(
        ROOT + 'ext/jquery.min.js',
        ROOT + 'ext/jquery-ui.min.js',
        ROOT + 'ext/cytoscape.min.js',
        ROOT + 'ext/undomanager.js',

        // CoNLL-U parser from https://github.com/FrancessFractal/conllu
        ROOT + 'conllu/conllu.js',

        // native project code
        ROOT + 'CG2conllx.js',
        ROOT + 'CG2conllu.js',
        ROOT + 'converters.js',
        ROOT + 'gui.js',
        ROOT + 'visualiser.js',
        ROOT + 'cy-style.js'
    );

    head.ready(function() {

        fetch('running').then(
            function(data) {
                console.log("Response from server, status: " + data["status"]);
                getCorpusData();
            }); // TODO: to get rid of the error, read about promisses: https://qntm.org/files/promise/promise.html

        $(document).keyup(keyUpClassifier); // TODO: causes errors if called before the cy is initialised

        // undo support
        window.undoManager = new UndoManager();
        setUndos(window.undoManager);

        // trying to load the corpus from localStorage
        if (storageAvailable('localStorage')) {
            LOC_ST_AVALIABLE = true;
            if (localStorage.getItem("corpus")) {
                CONTENTS = localStorage.getItem("corpus");
                loadDataInIndex();
            };
        }
        else {
            console.log("localStorage is not avaliable :(")
        }

        $("#indata").keyup(drawTree);
        loadFromUrl();
    });

    document.getElementById('filename').addEventListener('change', loadFromFile, false);
}


function addHandlers() {
    cy.on('click', 'node.wf', drawArcs);
    cy.on('click', 'edge', selectArc);
    cy.on('click', 'node.pos', changeNode);
    cy.on('click', '$node > node', selectSup);
    cy.on('cxttapend', 'node.wf', changeNode);
    cy.on('cxttapend', 'edge.dependency', changeNode);
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


function loadDataInIndex() {
    RESULTS = [];
    AVAILABLESENTENCES = 0;
    CURRENTSENTENCE = 0;

    if (FORMAT == "plain text") {
        var splitted = CONTENTS.match(/[^ ].+?[.!?](?=( |$))/g);
    } else {
        var splitted = CONTENTS.split("\n\n");
    }

    AVAILABLESENTENCES = splitted.length;
            
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
    document.getElementById('indata').value = (RESULTS[CURRENTSENTENCE]);
    document.getElementById('currentsen').innerHTML = (CURRENTSENTENCE+1);
    document.getElementById('totalsen').innerHTML = AVAILABLESENTENCES;
    drawTree();
}

function prevSenSent() {
    RESULTS[CURRENTSENTENCE] = document.getElementById("indata").value;
    CURRENTSENTENCE--;
    if (CURRENTSENTENCE < (AVAILABLESENTENCES - 1)) {
        document.getElementById("nextSenBtn").disabled = false;
    }
    if (CURRENTSENTENCE == 0) {
        document.getElementById("prevSenBtn").disabled = true;
    }
    showDataIndiv();
}

//When Navigate to next item
function nextSenSent() {
    RESULTS[CURRENTSENTENCE] = document.getElementById("indata").value;
    CURRENTSENTENCE++;
    if (CURRENTSENTENCE == (AVAILABLESENTENCES - 1)) {
        document.getElementById("nextSenBtn").disabled = true;
    }
    if (CURRENTSENTENCE > 0) {
        document.getElementById("prevSenBtn").disabled = false;
    }
    showDataIndiv();
}


//Export Corpora to file
function exportCorpora() {
    var finalcontent = getTreebank();
            
    var link = document.createElement('a');
    var mimeType = 'text/plain';

    link.setAttribute('download', FILENAME);
    link.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(finalcontent));
    link.click();
}


function getTreebank() {
    /* Returns the current treebank. */
    RESULTS[CURRENTSENTENCE] = document.getElementById("indata").value;
    var finalcontent = "";
    for(var x=0; x < RESULTS.length; x++){
        finalcontent = finalcontent + RESULTS[x];
        if(x != ((RESULTS.length)-1)){
            finalcontent = finalcontent + "\n\n";
        }
    }
    return finalcontent;
}
        

function drawTree() {

    var content = $("#indata").val();
    FORMAT = detectFormat(content);

    $("#detected").html("Detected: " + FORMAT + " format");


    if (FORMAT == "CoNLL-U") {
        conlluDraw(content);

        var inpSupport = $("<div id='mute'>"
            + "<input type='text' id='edit' class='hidden-input'/></div>");
        $("#cy").prepend(inpSupport);
        addHandlers();
    }
    if (LOC_ST_AVALIABLE) {
        localStorage.setItem("corpus", getTreebank()); // saving the data
    }
}


function detectFormat(content) {
    //TODO: too many "hacks" and presuppositions. refactor.

    var firstWord = content.replace(/\n/g, " ").split(" ")[0];
    
    // handling # comments at the beginning
    if (firstWord[0] === '#'){
        var following = 1;
        while (firstWord[0] === '#' && following < content.length){
            firstWord = content.split("\n")[following];
            following ++;
        }
    }

    if (firstWord.match(/"<.*/)) {
        FORMAT = "CG3";
    } else if (firstWord.match(/1/)) {
        FORMAT = "CoNLL-U";

    // TODO: better plaintext recognition
    } else if (!content.trim("\n").includes("\n")) {
        FORMAT = "plain text";

    } else {
        FORMAT = "SD";
    }

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
    CONTENTS = data["content"];
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


main()
