'use strict';

class Annotatrix extends Object {
  constructor() {
    super();
    this.reset();
  }
  reset() {
    this._current = -1;
    this._filename = 'ud-annotatrix-corpus';
    this._sentences = [];

    this.gui = new GUI(this);
    this.is_textarea_visible = true;
    this.is_vertical = false;
    this.is_ltr = true;
    this.is_enhanced = false;

    this.graph = new Graph(this);
    this.graph_options = {
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
    this.eles = [];
    this.pan = this.pan || null;
    this.zoom = this.zoom || null;
    this.graph_disabled = false;
    this.intercepted = false;
    this.moving_dependency = false;
    this.editing = null;

    this.insertSentence();
    //updateGui();
  }
  get length() {
    return this.sentences.length;
  }
  each(callback) {
    return this._sentences.map((sentence, i) => {
      return callback(i, sentence);
    });
  }

  get index() {
    return this._current;
  }
  set index(index) {

    index = parseInt(index);
    if (isNaN(index)) {
      log.warn(`Annotatrix: index out of range: ${index}`);
      index = this.index;

    } else if (index < 0) {
      log.warn(`Annotatrix: index out of range: ${index + 1}`);
      index = 0;

    } else if (index > this.length - 1) {
      log.warn(`Annotatrix: index out of range: ${index + 1}`);
      index = this.length - 1;
    }

    this._current = Math.floor(index); // enforce integer
    $('#text-data').val(this.sentence);
    $('#current-sentence').val(this.index + 1);
    $('#btnPrevSentence').attr('disabled', (this.index));
    $('#btnNextSentence').attr('disabled', (this.index === this.length));

    return index;
  }
  first() {
    this.index = 0;
  }
  prev() {
    if (this.index === 0) {
      log.error(`Annotatrix: already at the first sentence!`);
      return null;
    }

    this.index--;
    return this.sentence;
  }
  next() {
    if (this.index === this.sentences.length - 1) {
      log.error(`Annotatrix: already at the last sentence!`);
      return null;
    }

    this.index++;
    return this.sentence;
  }
  last() {
    this.index = this.length - 1;
  }

  set filename(filename) {
    this._filename = filename;
    return this;
  }
  get filename() {
    return this._filename;
  }

  zoomIn() {
    //
    return this;
  }
  zoomOut() {
    //
    return this;
  }

  get current() {
    return this._sentences[this.index];
  }

  get sentence() {
    return this.current.text;
  }
  set sentence(text) {
    this.current = new Sentence(text);
    $('#text-data').val(this.sentence);

    return this.current.text;
  }
  get sentences() {
    return this.each((i, sent) => {
      return sent.text;
    });
  }
  setSentence(index, text) {

    // don't use this w/o an index param
    // instead, use .parse()

    this._sentences[index] = new Sentence(text);
    $('#text-data').val(this.sentence);

    return this._sentences[index].text;
  }
  getSentence(index) {
    index = index || 0;
    return this.sentences[index];
  }
  insertSentence(index, text) {

    if (text === null || text === undefined) { // if only passed 1 arg
      text = index;
      index = this.index;
    }

    const sent = new Sentence(text)
    this._sentences = this._sentences
        .slice(0, index + 1).concat(sent, this._sentences.slice(index + 1));
    this.index++;

    $('#text-data').val(this.sentence);
    $('#total-sentences').text(this.length);

    return sent.text;
  }
  removeSentence(index) {
    index = index === undefined ? this.index : index // default

    const removed = this._sentences.splice(index, 1);
    if (!this.length)
      this.insertSentence();

    this.index--;

    $('#text-data').val(this.sentence);
    $('#total-sentences').text(this.length);

    return removed;
  }

  split(text) {

    // split into sentences
    let splitted;
    if (detectFormat(text) === 'plain text') {
      // ( old regex: /[^ ].+?[.!?](?=( |$))/g )
      // match non-punctuation (optionally) followed by punctuation
      const matched = text.match(/[^.!?]+[.!?]*/g);
      log.debug(`parse(): match group: ${matched}`);
      splitted = matched === null
        ? [ text.trim() ]
        : matched.map((chunk) => {
          return chunk;
        });
    } else {
      splitted = text.split(/\n{2,}/g).map((chunk) => {
        return chunk.trim();
      });
    }

    // removing extra whitespace
    for (let i = splitted.length - 1; i >= 0; i--) {
        if (splitted[i].trim() === '')
            splitted.splice(i, 1);
    }
    return splitted.length ? splitted : [ '' ]; // need a default if empty

  }
  parse(text) {

    // if not passed explicitly, read from the textarea
    text = text || $('#text-data').val();
    let splitted = this.split(text);

    // overwrite contents of #text-data
    this.setSentence(this.index, splitted[0]);

    // iterate over all elements except the first
    $.each(splitted, (i, split) => {
      if (!i) return; // skip first
      this.insertSentence(split);
    });

    updateGui();
  }
  get lines() {
    return this.sentence.split('\n');
  }

  get format() {
    return this.current.format;
  }
  get formats() {
    return this.each((i, sent) => {
      return sent.format;
    });
  }

  get conllu() {
    return this.current.conllu;
  }
  set conllu(serial) {
    return this.current.conllu = convert2Conllu(serial);
  }
  get tokens() {
    if (!this.conllu.processed)
      this.conllu = this.sentence;
    return this.conllu.tokens;
  }
  iterTokens(callback) { // sugar
    if (!this.conllu.processed)
      this.conllu = this.sentence;
    return this.conllu.iterTokens(callback);
  }
  iterComments(callback) { // sugar
    if (!this.conllu.processed)
      this.conllu = this.sentence;
    return this.conllu.iterComments(callback);
  }

  get is_table_view() {
    return this.current._is_table_view;
  }
  set is_table_view(bool) {
    if (typeof bool === 'boolean')
      this.current._is_table_view = bool;

    return this.current._is_table_view;
  }

  column_visible(col, bool) {
    if (typeof bool === 'boolean')
      this.current._column_visibilities[col] = bool;

    return this.current._column_visibilities[col];
  }

  export() {
    return this.each((i, sent) => {
      return `[UD-Annotatrix: id="${i+1}" format="${sentence.format}"]
      ${sentence.text}`;
    }).join('\n\n');
  }
  encode() {
    return encodeURIComponent(this.export());
  }

}

class GUI extends Object {
  constructor(annotatrix) {
    super();
    this._ = annotatrix;
  }

  reset() {
  }

}

class Graph extends Object {
  constructor() {
    super();
    this.reset();
  }

  reset() {
    this._eles = [];
    this._options = {
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
    this._pan = this._pan || null;
    this._zoom = this._zoom || null;
  }
}

class Sentence extends Object {
  constructor(text) {
    super();
    this.reset();
    this.text = text;
  }

  reset() {
    this._text = null;
    this._format = null;
    this._conllu = new CoNLLU();
    this._cg3 = null;

    this._is_table_view = false;
    this._column_visibilities = new Array(10).fill(true);
  }

  set text(text) {
    if (!typeof text === 'string') {
      log.critical('Annotatrix: unable to set sentence to non-string value.');
      return null;
    }

    this._text = text
    this.format = detectFormat(text);
    return text;
  }
  get text() {
    return this._text || '';
  }

  set format(format) {
    if (this._format !== format) {
      // do stuff
    }

    this._format = format;
    return this.text;
  }
  get format() {
    return this._format || 'Unknown';
  }

  get conllu() {
    return this._conllu;
  }
  set conllu(serial) {
    this._conllu.set(serial);
    return this._conllu;
  }

  get cg3() {
    return this.cg3;
  }

}

class Token extends Object {

}
// wrapper around conllu.Sentence
class CoNLLU extends Object {
  constructor() {
    super();
    this.sentence = new conllu.Sentence();
    this.processed = false;
  }

  set(serial) {
    this.processed = true;

    if (detectFormat(serial) !== 'CoNLL-U')
      return;

    this.sentence.serial = serial;
    this.comments = this.sentence.comments;
    this.tokens = this.sentence.tokens;
  }

  /**
   *  iterate over a list of CoNLL-U tokens to a callback function with params:
   *  @param {Number} num absolute token number (like for cy elements)
   *  @param {Token}  token the token currently being iterated (could be a subToken or superToken)
   *  @param {Number} superTokenId
   *  @param {Token}  superToken
   *  @param {Number || null} subTokenId will be null if not iterating subToken
   *  @param {Token || null}  subToken   will be null if not iterating subToken
   */
  iterTokens(callback) {
    let num = 0;
    for (let i=0; i<(this.tokens || []).length; i++) {
      const token = this.tokens[i];
      callback(num, token, i, token
        , token.tokens ? null : undefined
        , token.tokens ? null : undefined);
      num++;
      for (let j=0; j<(token.tokens || []).length; j++) {
        const subToken = token.tokens[j];
        callback(num, subToken, i, token, j, subToken);
        num++;
      }
    }
    return this.tokens; // chaining?
  }

  iterComments(callback) {
    for (let i=0; i<(this.comments || []).length; i++) {
      callback(i, this.comments[i]);
    }
    return this.comments;
  }

  /**
   *  ~~ helper function for createDependency and createEnhancedDependency()
   *  Returns the token pointed to by a given CoNLL-U index-string
   *  @param  id  string giving the index for a CoNLL-U token
   *  @return {Token || null}
   */
  getById(id) {
    let match = null;
    this.iterTokens((num, token) => {
      if (token.id == id)
        match = token;
    });
    return match;
  }

  get serial() {
    return this.sentence.serial;
  }

  set serial(serial) {
    this.set(serial);
    return this.serial;
  }


}
