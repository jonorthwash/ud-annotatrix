"use strict"

var SERVER_RUNNING;


function checkServer() {
    /* Tries to send a request to /annotatrix/running. If it works, sets SERVER_RUNNING
    to true and loads data from server. */
    log.debug('called checkServer()');
    SERVER_RUNNING = false;
    try {
        $.ajax({
            type: 'POST',
            url: '/annotatrix/running',
            data: {
                'content': 'check'
            },
            dataType: "json",
            success: (data) => {
                log.info(`checkServer AJAX response: ${JSON.stringify(data)}`);
                SERVER_RUNNING = true;
                getSentence(1);
            },
            error: function(data){
                log.info('Unable to complete AJAX request for checkServer()');
                loadFromLocalStorage();
            }
        })
    } catch (e) {
      log.error(`AJAX error in checkServer: ${e.message}`);
    }
}


function updateOnServer() {
    log.debug('called updateOnServer()');

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
            log.info('Update was performed');
        }
    });
}


function getSentence(sentNum) {
    log.debug(`called getSentence(${sentNum})`);

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
    log.debug(`called loadSentence(${JSON.stringify(data)})`);

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
    log.debug(`called downloadCorpus()`);

    var treebank_id = location.href.split('/')[4];
    window.open(`./download?treebank_id=${treebank_id}`, '_blank');
}
