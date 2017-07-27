"use strict"

var FORMAT = "";
var FILENAME = 'corpora.txt'; // default name
var ROOT = './lib/';
var CONTENTS = "";
var AVAILABLESENTENCES = 0;
var CURRENTSENTENCE = 0;
var RESULTS = [];


function main() {
    head.js(
        ROOT + 'ext/jquery.min.js',
        ROOT + 'ext/jquery-ui.min.js',
        ROOT + 'ext/cytoscape.min.js',

        // CoNLL-U parser from https://github.com/FrancessFractal/conllu
        ROOT + 'conllu/conllu.js',

        // native project code
        ROOT + 'CG2conllx.js',
        ROOT + 'converters.js',
        ROOT + 'gui.js',
        ROOT + 'visualiser.js'
    );

    head.ready(function() {

        fetch('running').then(
            function(data) {
                console.log("Response from server, status: " + data["status"]);
                getCorpusData();
                redefineHandlers();
            });

        $("#indata").keyup(drawTree);
        loadFromUrl();
    });

    document.getElementById('filename').addEventListener('change', loadFromFile, false);
}


function addHandlers() {
    cy.on('click', 'node', drawArcs);
    cy.on('click', 'edge', selectArc);
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
        
//KeyUp function
function drawTree() {

    var content = $("#indata").val();
    FORMAT = detectFormat(content);

    $("#detected").html("Detected: " + FORMAT + " format");

    if (FORMAT == "CoNLL-U") {
        conlluDraw(content);
        // setTimeout(addHandlers, 500);
        addHandlers();
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


function guid() {
    /* Note: such values are not genuine GUIDs */
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}


function saveOnServer(evt) {
    var finalcontent = getTreebank();

    // editing url to create a unique link
    // if (!location.search){
    //     location.search = "treebank_id=" + guid();
    // } else if (!location.search.includes("treebank_id")) {
    //     location.search = location.search + "&treebank_id=" + guid();
    // };
    

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


function redefineHandlers() {
    // body...
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


main()
