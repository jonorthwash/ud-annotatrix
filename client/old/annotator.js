'use strict'









// NOTE: uploadCorpus() is in /standalone/lib/server_support.js
function exportCorpus() {
    log.debug(`called exportCorpus()`);

    //Export Corpora to file
    if (IS_SERVER_RUNNING) {
        throw new NotImplementedError('exportCorpus() not implemented for server interaction');
        //downloadCorpus();
    } else {

        const link = $('<a>')
            .attr('download', a.filename)
            .attr('href', `data:text/plain; charset=utf-8,${a.encode()}`);
        $('body').append(link);
        link[0].click();

    }
}
function clearCorpus(event, force=false) { // force param for testing
    log.debug(`called clearCorpus()`);

    if (!force) {
        const conf = confirm('Do you want to clear the corpus (remove all sentences)?');
        if (!conf) {
              log.info('clearCorpus(): not clearing corpus');
              return;
        }
    }

    a.reset();
    return;
}
function printCorpus(event) {
		log.debug(`called printCorpus()`);
		throw new NotImplementedError('printCorpus() not implemented');
}













function clearLabels() {
    log.debug(`called clearLabels()`);

    LABELS = [];
    $('#treeLabels').children().detach();
}


function drawTree() {
    log.critical(`called drawTree()`);

    return;
    /* This function is called whenever the input area changes.
    1. removes the previous tree, if there's one
    2. takes the data from the textarea
    3. */

    IS_EDITING = false;

    // TODO: update the sentence
    try {
        cy.destroy(); // remove the previous tree if there is one
    } catch (e) {
        log.warn(`drawTree(): Error while destroying cy: ${e.message}`);
    }

    let content = $('#text-data').val();
    content = convert2Conllu(content) || content; // handle returning null

    conlluDraw(content);
    showProgress();
    const inpSupport = $('<div id="mute"><input type="text" id="edit" class="hidden-input"/></div>');
    $('#cy').prepend(inpSupport);
    bindCyHandlers(); // moved to gui.js
    saveData();
    return content;
}


function detectFormat(content) {
    log.debug(`called detectFormat(${content})`);

    // returns one of [ 'Unknown', 'CG3', 'CoNLL-U', 'SD', 'Brackets', 'plain text' ]
    //resetLabels(); // do we need this?

    let format = 'Unknown';
    content = content ? content.trim() : '';

    if (content === '') {
        log.info('detectFormat(): received empty content');
    } else {

        // get `word` to point to the first non-comment word
        const newlinesAndSpacesToList = content.split('\n');//.replace(/\n/g, ' ').split(' ');
        let wordIndex = 0, word = newlinesAndSpacesToList[wordIndex];

        while (word.startsWith('#')) {
            log.debug(`detectFormat(): detected a comment: ${word}`);
            wordIndex++;
            if (wordIndex === newlinesAndSpacesToList.length)
                break;
            word = newlinesAndSpacesToList[wordIndex];
        }

        content = content.trim('\n');

        if (word.match(/^\W*[\'|\"]</)) {
            format = 'CG3';
        } else if (word.match(/^\W*1/)) {
            format = 'CoNLL-U'; // UNSAFE: the first token in the string should start with "1"
        } else if (content.includes('(')
            && content.includes('\n')  // SD needs to be at least two lines
            && (content.includes(')\n') || content[content.length-1] === ')')) {

            format = 'SD'; // UNSAFE

        } else if (word.match(/\[/)) {
            format = 'Brackets'; // UNSAFE: this will catch any plain text string starting with "[" :/
        } else if (content[content.length-1] !== ')') {
            format = 'plain text'; // UNSAFE
        }
    }

    log.debug(`detectFormat(): detected ${format}`);
    //_.formats[_.current] = format;
    return format;
}

function resetLabels() { // TODO: refactor
    // handling # comments at the beginning
    if (word[0] === '#'){
        var following = 1;
        while (word[0] === '#' && following < content.length){
            // TODO: apparently we need to log the thing or it won't register???
            word = content.split('\n')[following];
            // pull out labels and put them in HTML, TODO: this probably
            // wants to go somewhere else.
            if (word.search('# labels') >= 0) {
                var labels = word.split('=')[1].split(' ');
                for(var i = 0; i < labels.length; i++) {
                    var seen = false;
                    for(var j = 0; j < LABELS.length; j++) {
                        if (labels[i] == LABELS[j]) {
                            seen = true;
                        }
                    }
                    if (!seen) {
                        LABELS.push(labels[i]);
                    }
                }
                var htmlLabels = $('#treeLabels');
                for(var k = 0; k < LABELS.length; k++) {
                    if (LABELS[k].trim() == '') {
                        continue;
                    }
                    htmlLabels.append($('<span></span>')
                        .addClass('treebankLabel')
                        .text(LABELS[k])
                    );
                }
                //console.log('FOUND LABELS:' + LABELS);
            }
            following ++;
        }
    }
}
