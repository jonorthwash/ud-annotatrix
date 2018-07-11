'use strict';

require('babel-polyfill');

const Log = require('./browser-logger');
const Manager = require('./manager');
const Server = require('./server');

const funcs = require('./funcs');

// on ready
$(() => {

	funcs.global().log = new Log();
	funcs.global().server = new Server();
	funcs.global().manager = new Manager();

	manager.parse(require('./test/data/conllu').labels_1);

});
