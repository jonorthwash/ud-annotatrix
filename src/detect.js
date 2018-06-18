'use strict';

const _ = require('underscore');

/**
 * detect and return the format on passed text
 *
 * @param {String} text
 * @return {String}
 */
function detectFormat(text) {
  log.debug(`called detectFormat(${text})`);

  let format = 'Unknown';
  text = (text || '').trim();

  if (text === '') {
  	log.info('detectFormat() received empty text');
  	return format;
  }

  // get `word` to point to the first non-comment word
  const lines = text.split('\n');
  let wordIndex = 0, word = lines[wordIndex];

  while (word.startsWith('#')) {
	  log.debug(`detectFormat(): detected a comment: ${word}`);
	  wordIndex++;
	  if (wordIndex === lines.length)
		  break;
	  word = lines[wordIndex];
  }

  if (word.match(/^\W*[\'|\"]</)) {
	  format = 'CG3';
  } else if (word.match(/^\W*1/)) {
	  format = 'CoNLL-U'; // UNSAFE: the first token in the string should start with "1"
  } else if (text.includes('(')
	  && text.includes('\n')  // SD needs to be at least two lines
	  && (text.includes(')\n') || text[text.length-1] === ')')) {

	  format = 'SD'; // UNSAFE

  } else if (word.match(/\[/)) {
	  format = 'Brackets'; // UNSAFE: this will catch any plain text string starting with "[" :/
  } else if (text[text.length-1] !== ')') {
	  format = 'plain text'; // UNSAFE
  }

  log.debug(`detectFormat(): detected ${format}`);
  return format;
}

module.exports = detectFormat;
