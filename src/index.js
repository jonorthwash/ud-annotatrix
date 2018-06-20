'use strict';

const $ = require('jquery');
const _ = require('underscore');
const nx = require('notatrix');

const Log = require('./browser-logger');
const Manager = require('./manager');
const Server = require('./server');

const cfg = require('./config')
const errors = require('./errors');
const setupUndos = require('./undo-manager');

// on ready
$(() => {

	window.log = new Log(cfg.defaultLoggingLevel);
	window.server = new Server();
	window.manager = new Manager();

	setupUndos();
	manager.gui.bind();

});

module.exports = {
	nx,
	errors,
	Log
};
