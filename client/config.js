'use strict';

module.exports = {
	version: '0.0.0',

	defaultFilename: 'ud-annotatrix-corpus',
	defaultSentence: '',
	defaultInsertedSentence: '',
	defaultLoggingLevel: 'ERROR',
	defaultEdgeHeight: 40,
	defaultEdgeCoeff: 1,

	localStorageKey: 'ud-annotatrix',
	saveInterval: 100000, // msecs

	downloadHasFileHeader: true,
	downloadHasSentenceHeader: true,

	statusNormalFadeout: 3000,
	statusErrorFadeout: 5000
}
