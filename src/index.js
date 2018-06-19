'use strict';

const $ = require('jquery');
const _ = require('underscore');
const nx = require('notatrix');

const Log = require('./browser-logger');
const Manager = require('./manager');

const cfg = require('./config')
const errors = require('./errors');
const server = require('./server');
const setupUndos = require('./undo-manager');

// on ready
$(() => {

	window.log = new Log(cfg.defaultLoggingLevel);
	window.manager = new Manager();

	setupUndos();
	server.check();
	manager.gui.bind();

});

module.exports = {
	nx,
	errors,
	Log
};
