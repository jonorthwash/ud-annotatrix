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


function updateOnServer() {
    var curSent = $('#indata').val()
    var sentNum = $('#currentsen').val()

    // sending data on server
    var treebank_id = location.href.split('/')[4];
    $.ajax({
        type: 'POST',
        url: '/save',
        data: {
            'content': curSent,
            'treebank_id': treebank_id,
            'sentNum': sentNum
        },
        dataType: "json",
        success: function(data){
            console.log('Update was performed.');
        }
    });
}


function getSentence(sentNum) {
    var treebank_id = location.href.split('/')[4];
    console.log('getSentence');
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
    formatTabsView(); // update the format taps
    fitTable(); // make table's size optimal
    drawTree();
}


function downloadCorpus() {
    var treebank_id = location.href.split('/')[4];
    var link = document.createElement('a');
    document.body.appendChild(link); // needed for FF
    link.setAttribute('href', './download?treebank_id=' + treebank_id);
    link.setAttribute('target', '_blank')
    link.click();
}
