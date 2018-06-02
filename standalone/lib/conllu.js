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
    this._conllu.serial = serial;
    return this._conllu;
  }

  get cg3() {
    return this.cg3;
  }

}

// wrapper around conllu.Sentence
class CoNLLU extends Object {
  constructor() {
    super();
    this.sentence = new conllu.Sentence();
    this.processed = false;
  }
  get length() {
    return this.tokens.length;
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
    if (id === null || id === undefined)
      return null;

    if (id == 0)
      return 'ROOT';

    let match = null;
    this.iterTokens((num, token) => {
      if (token.id == id)
        match = token;
    });
    return match;
  }

  get serial() {

    // custom serializer
    let lines = this.comments.map((comment, i) => {
      return `# ${comment}`;
    });
    this.iterTokens((num, token) => {
      lines.push(token.serial)
    });

    return lines.join('\n');

  }
  set serial(serial) {
    this.processed = true;

    if (detectFormat(serial) !== 'CoNLL-U')
      return;

    this.sentence.serial = serial;
    this.comments = this.sentence.comments;
    this.tokens = [];

    for (let i=0; i<(this.sentence.tokens || []).length; i++) {
      let token = new Token(this.sentence.tokens[i]), subTokens = [];
      for (let j=0; j<(this.sentence.tokens[i].tokens || []).length; j++) {
        const subToken = new Token(this.sentence.tokens[i].tokens[j]);
        subTokens.push(subToken);
      }
      token.tokens = subTokens;
      this.tokens.push(token);
    }

    this.renumber();
    this.setHeads();
    console.log(this.tokens);
    return this.serial;
  }

  merge(major, minor, strategy) {

    if (major.tokens || minor.tokens) {
        const message = 'Sorry, major subtokens is not supported!';
        log.error(message);
        alert(message);
        return;
    }

    major.form = major.superTokenId < minor.superTokenId
      ? `${major.form || ''}${minor.form || ''}`
      : `${minor.form || ''}${major.form || ''}`;
    major.lemma = major.superTokenId < minor.superTokenId
      ? `${major.lemma || ''}${minor.lemma || ''}`
      : `${minor.lemma || ''}${major.lemma || ''}`;

    major.deprel  = major.deprel || minor.deprel;
    major.deps    = major.deps || minor.deps;
    major.feats   = major.feats || minor.feats;
    major.pos     = major.pos || minor.pos;
    major.upostag = major.upostag || minor.upostag;
    major.xpostag = major.xpostag || minor.xpostag;
    console.log(major, minor);
    return;

    modifyConllu(major.superTokenId, major.subTokenId, 'form', dir === 'left'
        ? `${minor.form || ''}${major.form || ''}`
        : `${major.form || ''}${minor.form || ''}`);

    modifyConllu(major.superTokenId, major.subTokenId, 'lemma', dir === 'left'
        ? `${minor.lemma || ''}${major.lemma || ''}`
        : `${major.lemma || ''}${minor.lemma || ''}`);

    if (strategy === 'subtoken') {

        modifyConllu(major.superTokenId, major.subTokenId, 'deprel',  major.deprel  || minor.deprel);
        modifyConllu(major.superTokenId, major.subTokenId, 'deps',    major.deps || minor.deps);
        modifyConllu(major.superTokenId, major.subTokenId, 'feats',   major.feats || minor.feats);
        modifyConllu(major.superTokenId, major.subTokenId, 'pos',     major.pos || minor.pos);
        modifyConllu(major.superTokenId, major.subTokenId, 'upostag', major.upostag || minor.upostag);
        modifyConllu(major.superTokenId, major.subTokenId, 'xpostag', major.xpostag || minor.xpostag);

        const smallerIndex = Math.min(major.superTokenId, minor.superTokenId);
        a.iterTokens((num, token) => {
            if (token.head == minor.id)
                modifyConllu(token.superTokenId, token.subTokenId, 'head', major.id);
            if (token.superTokenId >= smallerIndex)
                modifyConllu(token.superTokenId, token.subTokenId, 'id', parseInt(token.id) - 1);
        })

        let newSentence = a.lines;
        newSentence.splice(minor.num + a.conllu.comments.length, 1);
        newSentence = newSentence.join('\n');
        a.parse(newSentence);
        cy.$('.merge').removeClass('merge');



    } else {

        throw new NotImplementedError('supertoken major not supported');

    }

  }
  insert(superTokenId, subTokenId=null) { // insert BEFORE this index
    log.error(`${superTokenId}, ${subTokenId}`);

    if (superTokenId < 0)
      superTokenId = 0;

    if (superTokenId > this.length)
      superTokenId = this.length;

    // inserting a superToken
    if (!this.tokens[superTokenId] || !this.tokens[superTokenId].tokens)
      subTokenId = null;
    if (subTokenId === null) {

      this.tokens = this.tokens.slice(0, superTokenId)
        .concat(new Token({})
        , this.tokens.slice(superTokenId));

      this.renumber();

    // inserting a subToken
    } else {

      let subTokens = this.tokens[superTokenId].tokens;

      if (subTokenId < 0)
        subTokenId = 0;

      if (subTokenId > subTokens.length)
        subTokenId = subTokens.length;

      subTokens = subTokens.slice(0, subTokenId)
        .concat(new Token({})
        , subTokens.slice(subTokenId));
      this.tokens[superTokenId].tokens = subTokens;

      this.renumber();
      /*
      this.tokens[superTokenId].tokens = this.tokens[superTokenId]
      console.log(this.tokens[superTokenId].id)
      let maxSubTokenId = parseInt(
        this.tokens[superTokenId].id.match(/^[0-9]+-([0-9]+)/)[1] );
      const x = `${this.tokens[superTokenId].id}`.replace(
        `-${maxSubTokenId}`, `-${maxSubTokenId + 1}`);
      console.log(x);
      this.tokens[superTokenId].id = `${this.tokens[superTokenId].id}`.replace(
        `-${maxSubTokenId}`, `-${maxSubTokenId + 1}`);
      this.tokens[superTokenId].id = x;
      console.log(this.tokens[superTokenId].id)
      const newToken = {*/

      //}
    }

    this.serial = this.serial; // make sure changes are saved, just in case
  }
  remove(superTokenId, subTokenId) {
    if (superTokenId < 0 || superTokenId > this.tokens.length - 1) {
      log.error(`Annotatrix: remove index out of range: ${index}`);
      return;
    }


  }
  renumber() {
    let num = 0, id = 1;
    for (let i=0; i<this.tokens.length; i++) {
      const token = this.tokens[i];
      if (token.tokens) {

        // multiword token
        token.indices = {
          num: num,
          id: null,
          super: i,
          sub: null
        };
        num++;
        for (let j=0; j<token.tokens.length; j++) {

          // sub token
          console.log(token.tokens)
          const subToken = token.tokens[j];
          subToken.indices = {
            num: num,
            id: id,
            super: i,
            sub: j
          };
          num++;
          id++;
        }
      } else {

        // regular token
        token.indices = {
          num: num,
          id: id,
          super: i,
          sub: null
        };
        num++;
        id++;
      }
    }
  }
  setHeads() {
    for (let i=0; i<this.tokens.length; i++) {
      const head = this.getById(this.sentence.tokens[i].head)
      this.tokens[i].head = head;
      for (let j=0; j<(this.tokens[i].tokens || []).length; j++) {
        const head = this.getById(this.sentence.tokens[i].tokens[j].head)
        this.tokens[i].tokens[j].head = head;
      }
    }
  }
}
class Token extends Object {
  constructor(obj) {
    super();

    this.tokens = null; // init subtokens to null
    this.form = obj.form;
    this.lemma = obj.lemma;
    this._head = null;

    this.fields = {
      upostag : obj.upostag,
      xpostag : obj.xpostag,
      feats   : obj.feats,
      head    : obj.head,
      deprel  : obj.deprel,
      deps    : obj.deps,
      misc    : obj.misc
    };
  }

  get tokens() {
    return this._tokens;
  }
  set tokens(tokens) {
    if (tokens && tokens.length) {
      this._tokens = tokens;
    } else {
      this._tokens = null;
    }
  }

  get serial() {
    let fields = [ this.id, this.form, this.lemma ];
    $.each(this.fields, key => {
      fields.push(this[key]);
    });
    return fields.join('\t');
  }
  /*set serial(serial) {
    serial = serial.split('\t');
    this.form    = serial[1];
    this.lemma   = serial[2];
    this.upostag = serial[3];
    this.xpostag = serial[4];
    this.feats   = serial[5];
    this.head    = serial[6];
    this.deprel  = serial[7];
    this.deps    = serial[8];
    this.misc    = serial[9];
  }*/

  get id() {
    if (this._id === null) {
      return `${this.tokens[0].id}-${this.tokens[this.tokens.length-1].id}`;
    } else {
      return this._id;
    }
  }
  set indices(indices) {
    this.num = indices.num;
    this._id = indices.id;
    this.superTokenId = indices.super;
    this.subTokenId = indices.sub;
  }

  get form() {
    return this._form || '_';
  }
  set form(form) {
    this._form = form;
    if (this.lemma === '_' && form)
      this.lemma = form;
  }

  get lemma() {
    return this._lemma || '_';
  }
  set lemma(lemma) {
    this._lemma = lemma;
    if (this.form === '_' && lemma)
      this.form = lemma;
  }

  get head() {
    return this._head
      ? this._head == 'ROOT'
        ? 0 : this._head.id
      : '_';
  }
  set head(head) {
    this._head = head;
  }

  get upostag() {
  	return this.fields.upostag || '_';
  }
  get xpostag() {
  	return this.fields.xpostag || '_';
  }
  get feats() {
  	return this.fields.feats || '_';
  }
  get deprel() {
  	return this.fields.deprel || '_';
  }
  get deps() {
  	return this.fields.deps || '_';
  }
  get misc() {
  	return this.fields.misc || '_';
  }

  set upostag(value) {
  	this.fields.upostag = value;
  }
  set xpostag(value) {
  	this.fields.xpostag = value;
  }
  set feats(value) {
  	this.fields.feats = value;
  }
  set deprel(value) {
  	this.fields.deprel = value;
  }
  set deps(value) {
  	this.fields.deps = value;
  }
  set misc(value) {
  	this.fields.misc = value;
  }

}
