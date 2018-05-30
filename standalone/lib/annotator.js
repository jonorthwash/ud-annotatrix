'use strict'

var FORMAT = '',
    FILENAME = 'ud-annotatrix-corpus.conllu', // default name
    CONTENTS = '',
    // var TEMPCONTENTS = '';
    AVAILABLE_SENTENCES = 0,
    CURRENT_SENTENCE = 0,
    RESULTS = [],
    LABELS = [],

    L20N_LOGGING = false;

var _ = { // main object to hold our current stuff

    // init & reset
    reset: () => {
        log.debug(`called _.reset()`)

        // per-sentence data
        _.sentences = [ null ];
        _.formats = [ null ];
        _.is_table_views = [ false ];
        _.column_visibilities = [ new Array(10).fill(true) ];
        _.graphs = [ null ];
        _.conllus = [ null ];
        _.cg3s = [ null ];

        // global-ish data
        _.current = 0;
        _.filename_ = 'ud-annotatrix-corpus';
        _.is_textarea_visible = true;
        _.is_vertical = false;
        _.is_ltr = true;
        _.is_enhanced = false;
        _.graph_data = null;
        _.graph_options = {
            container: $('#cy'),
            boxSelectionEnabled: false,
            autounselectify: true,
            autoungrabify: true,
            zoomingEnabled: true,
            userZoomingEnabled: false,
            wheelSensitivity: 0.1,
            style: CY_STYLE,
            layout: null,
            elements: []
        };
        _.editing = null;

        updateSentences();
    },

    // getters & setters
    filename: (filename) => {
        if (filename !== undefined)
            _.filename_ = filename;
        return `${_.filename_}.udac`;
    },
    sentence: (sentence) => {
        if (sentence !== undefined)
            _.sentences[_.current] = sentence;
        return _.sentences[_.current];
    },
    format: (format) => {
        if (format !== undefined)
            _.formats[_.current] = format;
        return _.formats[_.current];
    },
    is_table_view: (bool) => {
        if (bool !== undefined)
            _.is_table_views[_.current] = bool;
        return _.is_table_views[_.current];
    },
    column_visible: (col, bool) => {
        if (bool !== undefined)
            _.column_visibilities[_.current][col] = bool;
        return _.column_visibilities[_.current][col];
    },
    graph: (graph) => {
        if (graph !== undefined)
            _.graphs[_.current] = graph;
        return _.graphs[_.current];
    },
    conllu: (conllu) => {
        if (conllu !== undefined)
            _.conllus[_.current] = conllu;
        return _.conllus[_.current];
    },
    tokens: () => {
        return _.conllu() ? _.conllu().tokens : [];
    },
    cg3: (cg3) => {
        if (cg3 !== undefined)
            _.cg3s[_.current] = cg3;
        return _.cg3s[_.current];
    },

    // external things
    export: () => {
        return _.sentences.map((sentence, i) => {
            return `[UD-Annotatrix: id="${i+1}" format="${_.formats[i]}"]
            ${sentence || ''}`;
        }).join('\n\n');
    },
    encode: () => {
        return encodeURIComponent(_.export());
    }

};

window.onload = () => {

    /* Loads all the js libraries and project modules, then calles onReady.
    If server is running, makes a button for saving data.*/
    const path = './lib';
    head.js(

        // extensions
        `${path}/ext/jquery-3.2.1.min.js`,
        `${path}/ext/jquery-ui-1.12.1/jquery-ui.min.js`,
        `${path}/ext/cytoscape.min.js`,
        `${path}/ext/undomanager.js`,
        //`${path}/ext/popper.min.js`,
        `${path}/ext/jquery.autocomplete.js`,
        //`${path}/ext/bootstrap.min.js`,
        `${path}/ext/l20n.js`,
        `${path}/ext/canvas2svg.js`,
        `${path}/ext/conllu/conllu.js`, // CoNLL-U parser from https://github.com/FrancessFractal/conllu
        `${path}/ext/js-treex-view.js`, // Treex from https://github.com/ufal/js-treex-view

        // functions, globals
        `${path}/conllu_table.js`,
        `${path}/converters.js`,
        `${path}/cy-style.js`,
        `${path}/graph.js`,
        `${path}/gui.js`,
        `${path}/sd2Conllu.js`,
        `${path}/server_support.js`,
        `${path}/storage.js`,
        `${path}/validation.js`,
        `${path}/visualiser.js`,

        // classes
        `${path}/errors.js`,
        `${path}/logger.js`,
        `${path}/tester.js`

    );
    head.ready(() => {

        /*
        Called when all the naive code and libraries are loaded.
          - initializes some global objects
          - checks if server is running
          - sets undo manager
          - loads data from localStorage, if available and server is not running
          - checks if someone loads data in url
          - binds handlers to DOM emements
        */

        console.log('UD-Annotatrix is loading ...');

        window.conllu = require('conllu');
        window.log = new Logger('WARN');
        window.test = new Tester();

        checkServer(); // check if server is running

        _.reset();

        bindHandlers();
        setUndos();
        //loadFromUrl();

        //test.all();
        //test.utils.splitAndSet('this is a test');
        //$('#tabConllu').click()
        test.utils.splitAndSet(TEST_DATA.texts_by_format['CoNLL-U'].from_cg3_with_spans);
        //test.run('modifyConllu');
        //test.utils.splitAndSet('this is a test');

    });
};







/**
 * functions for navigating available sentences
 */
function insertSentence() {
    log.debug(`called insertSentence()`);

    // insert null at (incremented) current index
    _.current++;
    _.sentences = _.sentences.slice(0, _.current)
        .concat(null, _.sentences.slice(_.current));
    _.formats = _.formats.slice(0, _.current)
        .concat(null, _.formats.slice(_.current));
    _.is_table_views = _.is_table_views.slice(0, _.current)
        .concat(null, _.is_table_views.slice(_.current));
    _.column_visibilities = _.column_visibilities.slice(0, _.current)
        .concat([ new Array(10).fill(true) ], _.column_visibilities.slice(_.current));
    _.graphs = _.graphs.slice(0, _.current)
        .concat(null, _.graphs.slice(_.current));
    _.conllus = _.conllus.slice(0, _.current)
        .concat(null, _.conllus.slice(_.current));
    _.cg3s = _.cg3s.slice(0, _.current)
        .concat(null, _.cg3s.slice(_.current));

    updateSentences();
}
function removeSentence(event, force=false) { // force param for testing
    log.debug(`called removeSentence()`);

    if (!force) {
        const conf = confirm('Do you want to remove the sentence?');
        if (!conf) {
              log.info('removeSentence(): not removing sentence');
              return;
        }
    }

    _.sentences.splice(_.current, 1);
    _.formats.splice(_.current, 1);
    _.is_table_views.splice(_.current, 1);
    _.column_visibilities.splice(_.current, 1);
    _.graphs.splice(_.current, 1);
    _.conllus.splice(_.current, 1);
    _.cg3s.splice(_.current, 1);
    _.current--;

    updateSentences();
}
function prevSentence() {
    log.debug(`called prevSentence()`);

    if (_.current === 0) {
        log.warn(`prevSentence(): already at the first sentence!`);
        return;
    }

    _.current--;

    updateSentences();
}
function goToSentence() {
    log.debug(`called goToSentence()`);

    let jump = parseInt($('#current-sentence').val());

    if (isNaN(jump) || jump < 1 || jump > _.sentences.length) {
        log.warn(`goToSentence(): unable to go to input: ${$('#current-sentence').val()}`);
    } else {
        jump = Math.floor(jump); // enforce integer
        _.current = jump - 1;
    }

    updateSentences();
}
function nextSentence() {
    log.debug(`called nextSentence()`);

    if (_.current === _.sentences.length - 1) {
        log.warn(`nextSentence(): already at the last sentence!`);
        return;
    }

    _.current++;

    updateSentences();
}
function setSentence(id, text) {
    log.debug(`called setSentence(id:${id}, text:"${text}")`);

    if (id < 0 || id >= _.sentences.length) {
        log.warn(`setSentence(): unable to set sentence at id:${id}, out of range`);
        return;
    }

    _.sentences[id] = text;

    updateFormat(id);
}
function updateSentences() {
    log.debug(`called updateSentences()`);

    if (_.current < 0) { // ensure we always have something
        log.warn(`updateSentences(): current is ${_.current}`);
        insertSentence();
    }

    $('#current-sentence').val(_.current + 1);
    $('#total-sentences').text(_.sentences.length);
    $('#text-data').val(_.sentences[_.current] || ''); // handle null

    $('#btnPrevSentence').attr('disabled', (_.current === 0));
    $('#btnNextSentence').attr('disabled', (_.current === _.sentences.length));

    updateFormat(_.current);
    updateGui();
}
function updateFormat(id) {
    log.debug(`called updateFormat(id:${id})`);

    const content = _.sentences[id],
        format = detectFormat(content);

    // detect changed format
    if (format !== _.formats[id]) {
        log.info(`updateFormat(): detected change in format: ${_.formats[id]} => ${format}`);

        // TODO other stuff goes here (CG3/CoNLL-U conversion ugliness TBD)
        _.formats[id] = format;
    }
}
function parseText() {
    log.debug(`called parseText()`);

    // read from the textarea
    let content = $('#text-data').val();

    // split into sentences
    let splitted;
    if (detectFormat(content) === 'plain text') {
        // ( old regex: /[^ ].+?[.!?](?=( |$))/g )
        // match non-punctuation (optionally) followed by punctuation
        const matched = content.match(/[^.!?]+[.!?]*/g);
        log.debug(`parseText(): match group: ${matched}`);
				splitted = matched === null
  					? [ content.trim() ]
  					: matched.map((chunk) => {
  						return chunk;
  					});
    } else {
        splitted = content.split(/\n{2,}/g).map((chunk) => {
            return chunk.trim();
				});
    }

    // removing extra whitespace
    for (let i = splitted.length - 1; i >= 0; i--) {
        if (splitted[i].trim() === '')
            splitted.splice(i, 1);
    }
    splitted = splitted.length ? splitted : ['']; // need a default if empty

    // set the first
    setSentence(_.current, splitted[0]);

    // iterate in reverse order over all elements except the first
    for (let i = splitted.length - 1; i > 0; i--) {
        insertSentence();
        setSentence(i, splitted[i]);
    }

    // enforce that only CoNLL-U can be in table view
    if (_.formats[_.current] !== 'CoNLL-U')
        _.is_table_view(false);

    updateSentences();

    // return splitted for testing purposes
    return splitted;
}


// NOTE: uploadCorpus() is in /standalone/lib/server_support.js
function exportCorpus() {
    log.debug(`called exportCorpus()`);

    //Export Corpora to file
    if (IS_SERVER_RUNNING) {
        throw new NotImplementedError('exportCorpus() not implemented for server interaction');
        //downloadCorpus();
    } else {

        const link = $('<a>')
            .attr('download', _.filename())
            .attr('href', `data:text/plain; charset=utf-8,${_.encode()}`);
        $('body').append(link);
        link[0].click();

    }
}
function clearCorpus(event, force=false) { // force param for testing
    log.debug(`called clearCorpus()`);

    if (!force) {
        const conf = confirm('Do you want to clear the corpus (remove all sentences)?');
        if (!conf) {
              log.info('clearCorpus(): not removing sentence');
              return;
        }
    }

    _.reset();
    return;
}
function printCorpus(event) {
		log.debug(`called printCorpus()`);
		throw new NotImplementedError('printCorpus() not implemented');
}

function convertText(converter) {
		log.debug(`called viewAsText()`);

		let sentence = _.sentence();
		sentence = converter(sentence) || sentence;
		$('#text-data').val(sentence);
		parseText();

}







/*
function addSent() { // TODO: this is probably not what we want? what if we turn it into 'insert a new sentence _here_'?
    log.debug(`called addSent()`);
    AVAILABLE_SENTENCES += 1;
    showDataIndiv();
}

function removeCurSent() {
    log.debug(`called removeCurSent()`);

    /* Called when the button 'remove sentence' is pressed.
    Calls confirm window. If affirmed, */
    /*const conf = confirm('Do you want to remove the sentence?');
    if (conf) {
        saveData();
        const realCurrentSentence = CURRENT_SENTENCE; // это нужно, т.к. в loadDataInIndex всё переназначается. это как-то мега костыльно, и надо исправить.
        $('#text-data').val('');
        localStorage.setItem('corpus', getContents());
        loadDataInIndex();
        CURRENT_SENTENCE = realCurrentSentence;
        if (CURRENT_SENTENCE >= AVAILABLE_SENTENCES)
            CURRENT_SENTENCE--;

        showDataIndiv();
    }
}


function loadDataInIndex() {
    log.debug(`called loadDataInIndex`);

    RESULTS = [];
    AVAILABLE_SENTENCES = 0;
    CURRENT_SENTENCE = 0;


    const corpus = localStorage.getItem('corpus');
    const splitted = splitIntoSentences(corpus);
    localStorage.setItem('treebank', JSON.stringify(splitted));
    RESULTS = splitted; // TODO: get rid of RESULTS

    AVAILABLE_SENTENCES = splitted.length;
    $('#btnNextSentence').prop('disabled', (AVAILABLE_SENTENCES < 2));

    showDataIndiv();
}


function splitIntoSentences(corpus) {
    log.debug(`called splitIntoSentences(<Corpus>)`);

    // Takes a string with the corpus and returns an array of sentences.
    const format = detectFormat(corpus);

    // splitting
    let splitted;
    if (format === 'plain text') {
        splitted = corpus.match(/[^ ].+?[.!?](?=( |$))/g) || [corpus];
    } else {
        splitted = corpus.split('\n\n');
    }

    // removing empty lines
    for (let i = splitted.length - 1; i >= 0; i--) {
        if (splitted[i].trim() === '')
            splitted.splice(i, 1);
    }

    log.debug(`splitIntoSentences(): splitted: ${JSON.stringify(splitted)}`);
    return splitted;
}


function showDataIndiv() {
    log.debug(`called showDataIndiv()`);

    /* This function is called each time the current sentence is changed
    to update the CoNLL-U in the textarea and the indices. */
    /*
    $('#text-data').val(RESULTS[CURRENT_SENTENCE] || '');
    $('#current-sentence').val(AVAILABLE_SENTENCES === 0 ? 0 : CURRENT_SENTENCE + 1);
    $('#total-sentences').val(AVAILABLE_SENTENCES);

    updateTable(); // Update the table view at the same time
    updateGui(); // update the format taps
    fitTable(); // make table's size optimal
    drawTree();
}


function goToSenSent() {
    log.debug(`called goToSenSent()`);

    saveData();

    RESULTS[CURRENT_SENTENCE] = $('#text-data').val();
    CURRENT_SENTENCE = parseInt($('#current-sentence').val()) - 1;

    if (CURRENT_SENTENCE < 0)
        CURRENT_SENTENCE = 0;

    if (CURRENT_SENTENCE > (AVAILABLE_SENTENCES - 1))
        CURRENT_SENTENCE = AVAILABLE_SENTENCES - 1;

    $('#btnNextSentence').prop('disabled', !(CURRENT_SENTENCE < (AVAILABLE_SENTENCES - 1)));
    $('#btnPrevSentence').prop('disabled', !CURRENT_SENTENCE);

    clearLabels();
    showDataIndiv();
}

function prevSenSent() {
    log.debug(`called prevSenSent()`);

    saveData();

    RESULTS[CURRENT_SENTENCE] = $('#text-data').val();
    CURRENT_SENTENCE--;

    if (CURRENT_SENTENCE < 0)
        CURRENT_SENTENCE = 0;

    $('#btnNextSentence').prop('disabled', !(CURRENT_SENTENCE < (AVAILABLE_SENTENCES - 1)));
    $('#btnPrevSentence').prop('disabled', !CURRENT_SENTENCE);

    clearLabels();
    showDataIndiv();
}

function nextSenSent() {
    log.debug(`called nextSenSent()`);

    /* When the user navigates to the next sentence. */
    /*saveData();

    RESULTS[CURRENT_SENTENCE] = $('#text-data').val();
    CURRENT_SENTENCE++;

    if (CURRENT_SENTENCE >= AVAILABLE_SENTENCES)
        CURRENT_SENTENCE = AVAILABLE_SENTENCES;

    $('#btnNextSentence').prop('disabled', !(CURRENT_SENTENCE < (AVAILABLE_SENTENCES - 1)));
    $('#btnPrevSentence').prop('disabled', !CURRENT_SENTENCE);

    clearLabels();
    showDataIndiv();
}*/

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
    content = content === null ? '' : content.trim();

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
    FORMAT = format;
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
