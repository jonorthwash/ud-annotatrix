"use strict"

var SERVER_RUNNING = false;


function checkServer() {
    /* Tries to read a file from /running. If it works, sets SERVER_RUNNING
    to true and loads data from server. */

    // TODO: to get rid of the error, read about promisses:
    // https://qntm.org/files/promise/promise.html
    fetch('running').then(function(data){
        console.log("Response from server, status: " + data["status"]);
        SERVER_RUNNING = true;
    });
}


function saveOnServer() {
    var finalcontent = getContent();

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


function getSentence(sentNum) {
    var treebank_id = location.href.split('/')[4];
    $.ajax({
        type: "POST",
        url: "/load",
        data: {"treebank_id": treebank_id, "sentNum": sentNum},
        dataType: "json",
        success: loadSentence
    });
    $('#currentsen').val(sentNum);
    CURRENTSENTENCE = sentNum;
}


function loadSentence(data) {
    console.log('loadSentence');
    if (data['content']) {
        var sentence = data['content'];
        var max = data['max'];
        $('#indata').val(sentence);
        $('#totalsen').html(max);
        AVAILABLESENTENCES = max;
    }
    updateTable(); // Update the table view at the same time
    formatTabsView(document.getElementById('indata')); // update the format taps
    fitTable(); // make table's size optimal
    drawTree();
}
