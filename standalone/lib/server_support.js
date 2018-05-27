'use strict'

var IS_SERVER_RUNNING;


function checkServer() {
    /* Tries to send a request to /annotatrix/running. If it works, sets IS_SERVER_RUNNING
    to true and loads data from server. */
    log.debug('called checkServer()');

    IS_SERVER_RUNNING = false;
    try {
        $.ajax({
            type: 'POST',
            url: '/annotatrix/running',
            data: {
                content: 'check'
            },
            dataType: 'json',
            success: (data) => {
                log.info(`checkServer AJAX response: ${JSON.stringify(data)}`);
                IS_SERVER_RUNNING = true;
                getSentence(1);
            },
            error: function(data){
                log.info('Unable to complete AJAX request for checkServer()');
                //loadFromLocalStorage();
            }
        })
    } catch (e) {
      log.error(`AJAX error in checkServer: ${e.message}`);
    }
}


function updateOnServer() {
    log.debug('called updateOnServer()');

    const curSent = $('#text-data').val(),
        sentNum = $('#current-sentence').val(),
        treebank_id = location.href.split('/')[4];

    $.ajax({
        type: 'POST',
        url: '/save',
        data: {
            content: curSent,
            treebank_id: treebank_id,
            sentNum: sentNum
        },
        dataType: 'json',
        success: function(data){
            log.info('Update was performed');
        }
    });
}


function getSentence(sentNum) {
    log.debug(`called getSentence(${sentNum})`);

    const treebank_id = location.href.split('/')[4];

    $.ajax({
        type: 'POST',
        url: '/load',
        data: {
            treebank_id: treebank_id,
            sentNum: sentNum
        },
        dataType: 'json',
        success: loadSentence
    });

    $('#current-sentence').val(sentNum);
    CURRENT_SENTENCE = sentNum;
}


function loadSentence(data) {
    log.debug(`called loadSentence(${JSON.stringify(data)})`);

    if (data['content']) {
        const sentence = data['content'],
            max = data['max'];
        $('#text-data').val(sentence);
        $('#total-sentences').html(max);
        AVAILABLE_SENTENCES = max;
    }

    //updateTable(); // Update the table view at the same time
    updateTabs(); // update the format taps
    //fitTable(); // make table's size optimal
    drawTree();
}


function downloadCorpus() {
    log.debug(`called downloadCorpus()`);

    const treebank_id = location.href.split('/')[4];
    window.open(`./download?treebank_id=${treebank_id}`, '_blank');
}

function uploadCorpus() {
    log.debug(`called uploadCorpus()`);
    throw new NotImplementedError('uploadCorpus() not implemented');
}
