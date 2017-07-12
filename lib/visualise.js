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
        ROOT + 'cytoscape/cytoscape.min.js',

        // CoNLL-U parser from https://github.com/FrancessFractal/conllu
        ROOT + './conllu/conllu.js',

        // native project code
        ROOT + 'CG2conllx.js',
        ROOT + 'converters.js',
        ROOT + 'gui.js',
        ROOT + 'cytoscape/visualisation.js'
    );

    head.ready(function() {
        // set up UI tabs on page
        setupTabs();
        $("#indata").keyup(keyUpFunc);
        loadFromUrl();
    });

    document.getElementById('filename').addEventListener('change', loadFromFile, false);
}


function setupTabs() {
    // standard jQuery UI "tabs" element initialization
    $(".jquery-ui-tabs").tabs({
        heightStyle: "auto"
    });
    // use jQuery address to preserve tab state
    // (see https://github.com/UniversalDependencies/docs/issues/65,
    // http://stackoverflow.com/a/3330919)
    if ($(".jquery-ui-tabs").length > 0) {
        $.address.change(function(event) {
            $(".jquery-ui-tabs").tabs("select", window.location.hash)
        });
        $(".jquery-ui-tabs").bind("tabsselect", function(event, ui) {
            window.location.hash = ui.tab.hash;
        });
    }
};


function loadFromUrl(argument) {
    //check if the URL contains arguments

    var parameters = window.location.search.slice(1);
    parameters = parameters.split('&')[1]
    if (parameters){
        var variables = parameters.map(function(arg){
            return arg.split('=')[1].replace(/\+/g, " "); 
        });

        $("#indata").val(variables[0]);

        keyUpFunc();
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
    keyUpFunc();
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
            
    RESULTS[CURRENTSENTENCE] = document.getElementById("indata").value;
    var finalcontent = "";
    for(var x=0; x < RESULTS.length; x++){
        finalcontent = finalcontent + RESULTS[x];
        if(x != ((RESULTS.length)-1)){
            finalcontent = finalcontent + "\n\n";
        }
    }
            
    var link = document.createElement('a');
    var mimeType = 'text/plain';

    link.setAttribute('download', FILENAME);
    link.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(finalcontent));
    link.click();
}
        
//KeyUp function
function keyUpFunc() {
    // TODO: refactor

    var content = $("#indata").val();
    var indataPars = detectFormat(content);
    FORMAT = indataPars[0];
    var printContent = indataPars[1];
    var cssClass = indataPars[2];

    $("#detected").html("Detected: " + FORMAT + " format");
    $("#dest").removeClass("language-sdparse").removeClass("language-conllu").removeClass("language-conllx");
    $("#dest").addClass(cssClass);
    // $("#dest").html(printContent);

    if (FORMAT == "CoNLL-U") {
    	conlluDraw(content);
    	// conllu2cy(content);
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
        var cssClass = "language-conllx";
        var printContent = cgParse(content);
    } else if (firstWord.match(/1/)) {
        FORMAT = "CoNLL-U";
        var cssClass = "language-conllu";
        var printContent = content;

    // new entity: plain text
    } else if (!content.trim("\n").includes("\n")) {
        FORMAT = "plain text";
        var cssClass = "language-sdparse";
        var printContent = content; 

    } else {
        FORMAT = "SD";
        var cssClass = "language-sdparse";
        var printContent = content.replace(/\n/g, " ");
    }

    return [FORMAT, printContent, cssClass];
}


main()
