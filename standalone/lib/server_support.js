"use strict"

var SERVER_RUNNING = false;


function checkServer() {
    /* Tries to read a file from /running. If it works, sets SERVER_RUNNING
    to true and loads data from server. */

    // TODO: to get rid of the error, read about promisses:
    // https://qntm.org/files/promise/promise.html
    fetch('running').then(function(data){
        console.log("Response from server, status: " + data["status"]);
        getCorpusData();
        SERVER_RUNNING = true;
    });
}


function saveOnServer() {
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
