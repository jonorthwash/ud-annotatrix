var root = './lib/'; // filled in by jekyll
head.js(
    // External libraries
    root + 'ext/jquery.min.js',
    root + 'ext/jquery.svg.min.js',
    root + 'ext/jquery.svgdom.min.js',
    root + 'ext/jquery-ui.min.js',
    root + 'ext/waypoints.min.js',
    root + 'ext/jquery.address.min.js',

    // brat helper modules
    root + 'brat/configuration.js',
    root + 'brat/util.js',
    root + 'brat/annotation_log.js',
    root + 'ext/webfont.js',

    // brat modules
    root + 'brat/dispatcher.js',
    root + 'brat/url_monitor.js',
    root + 'brat/visualizer.js',
    // embedding configuration
    root + 'local/config.js',
    // project-specific collection data
    root + 'local/collections.js',

    // NOTE: non-local libraries
    document.location.protocol + '//spyysalo.github.io/annodoc/lib/local/annodoc.js',
    document.location.protocol + '//spyysalo.github.io/conllu.js/conllu.js',
    //JNW stuff
    root + 'visualise.js'
);
var webFontURLs = [
    root + 'static/fonts/PT_Sans-Caption-Web-Regular.ttf',
    root + 'static/fonts/Liberation_Sans-Regular.ttf'
];
var setupTabs = function() {
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

head.ready(function() {
    // set up UI tabs on page
    setupTabs();
    // mark current collection (filled in by Jekyll)
    Collections.listing['_current'] = 'u-overview';

    //check if the URL contains a sentence
    var url = decodeURI(window.location.href);
    var qindex = url.indexOf("?");
    if (qindex != -1){
        var uri = url.substring(qindex + 1, url.length);
        var arguments = uri.split("&");
        var variables = [];
        for (var i = 0; i < arguments.length; i++) {
            variables[i] = arguments[i].split("=")[1].replace(/\+/g, " ");
            // do this as many times as there are variables
            // add vars for all the next variables you want
        };
        // variables is now an array populated with the values of the variables you want, in order
            // variables[0] is the text for the textbox
            // variables[1] could be the format to be forced

        $("#indata").val(variables[0]);

        keyUpFunc(); // activate it in the display
    }

    // perform all embedding and support functions
    Annodoc.activate(Config.bratCollData, Collections.listing);
    $("#indata").keyup(
        keyUpFunc
    );
    $("#cgin").keyup(
        cgParse
    );
    $("#conlluin").keyup(
        function() {
            var content = $("#conlluin").val();
            $("#dest").removeClass("language-sdparse").addClass("language-conllu");
            $("#dest").html(content); // $("#source");
            Annodoc.activate(Config.bratCollData, Collections.listing);
        }
    );
});

var format = "";

//Listener to Load file
document.getElementById('filename').addEventListener('change', loadFromFile, false);

//Load Corpora from file
var contents = "";
function loadFromFile(e) {
	contents = "";
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        contents = e.target.result;
        loadDataInIndex();
    };
    reader.readAsText(file);
}

var availablesentences = 0;
var currentsentence = 0;
var results = new Array();
		
function loadDataInIndex() {
	results = [];
    availablesentences = 0;
    currentsentence = 0;
    var splitted = contents.split("\n\n");
    availablesentences = splitted.length;
			
    if (availablesentences == 1 || availablesentences == 0) {
        document.getElementById('nextSenBtn').disabled = true;
    } else {
		document.getElementById('nextSenBtn').disabled = false;
	}
			
    for (var i = 0; i < splitted.length; ++i) {
        var check = splitted[i];
        results.push(check);
    }
    showDataIndiv();
}

function showDataIndiv() {
	document.getElementById('indata').value = (results[currentsentence]);
	document.getElementById('currentsen').innerHTML = (currentsentence+1);
	document.getElementById('totalsen').innerHTML = availablesentences;
    keyUpFunc();
}

function prevSenSent() {
	results[currentsentence] = document.getElementById("indata").value;
    currentsentence--;
    if (currentsentence < (availablesentences - 1)) {
        document.getElementById("nextSenBtn").disabled = false;
    }
    if (currentsentence == 0) {
        document.getElementById("prevSenBtn").disabled = true;
    }
    showDataIndiv();
}

//When Navigate to next item
function nextSenSent() {
	results[currentsentence] = document.getElementById("indata").value;
    currentsentence++;
    if (currentsentence == (availablesentences - 1)) {
        document.getElementById("nextSenBtn").disabled = true;
    }
    if (currentsentence > 0) {
        document.getElementById("prevSenBtn").disabled = false;
    }
    showDataIndiv();
}

//Export Corpora to file
function exportCorpora() {
    var type = ".txt";
    if (format == "CoNLL-U") {
        type = ".conllu";
    }
			
	results[currentsentence] = document.getElementById("indata").value;
	var finalcontent = "";
	for(var x=0; x < results.length; x++){
		finalcontent = finalcontent + results[x];
		if(x != ((results.length)-1)){
			finalcontent = finalcontent + "\n\n";
		}
	}
			
    var link = document.createElement('a');
    var mimeType = 'text/plain';
    link.setAttribute('download', 'corpora' + type);
    link.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(finalcontent));
    link.click();
}
		
//KeyUp function
function keyUpFunc() {
    var content = $("#indata").val();
    var firstWord = content.replace(/\n/g, " ").split(" ")[0];

    // dealing with # comments at the beginning
    if (firstWord[0] === '#'){
        var following = 1;
        while (firstWord[0] === '#' && following < content.length){
            firstWord = content.split("\n")[following];
            following ++;
        }
    }
    if (firstWord.match(/"<.*/)) {
        format = "CG3";
        var cssClass = "language-conllx";
        var printContent = cgParse(content);
    } else if (firstWord.match(/1/)) {
        format = "CoNLL-U";
        var cssClass = "language-conllu";
        var printContent = content;
    } else {
        format = "SD"
        var cssClass = "language-sdparse";
        var printContent = content.replace(/\n/g, " ");
    }
    $("#detected").html("Detected: " + format + " format");
    $("#dest").removeClass("language-sdparse").removeClass("language-conllu").removeClass("language-conllx");
    $("#dest").addClass(cssClass);
    $("#dest").html(printContent); // $("#source");
    Annodoc.activate(Config.bratCollData, Collections.listing);
}
