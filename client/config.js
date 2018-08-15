const _ = require('underscore');
const utils = require('./utils');


var _config = {

	version: '0.0.0',
	treebank_id: utils.getTreebankId(),

	graph: require('./graph/config'),
	gui: require('./gui/config'),

};

const prefs = utils.storage.getPrefs();

module.exports = _config;
