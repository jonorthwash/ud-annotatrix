const _ = require('underscore');
const utils = require('../utils');


var _config = {

	version: '0.0.0',
	localStorageKey: '__ud_annotatrix_prefs',
	treebank_id: utils.getTreebankId(),

	corpus: require('../corpus/config'),
	graph: require('../graph/config'),
	gui: require('../gui/config'),

};

const prefs = utils.storage.load_preferences();

module.exports = _config;
