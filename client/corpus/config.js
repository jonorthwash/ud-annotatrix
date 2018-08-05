'use strict';

const _ = require('underscore');
const utils = require('../utils');

var _corpus = {

	default_filename: 'ud-annotatrix-corpus',
	format_preferences: [
		'CoNLL-U',
		'CG3',
		'SD',
		'plain text',
		'Brackets',
	],

  set: params => {
  	_.each((value, key) => {
  		if (_corpus[key] !== undefined)
  			_corpus[key] = value;
  	});
  },

};


module.exports = _corpus;
