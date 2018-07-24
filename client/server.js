'use strict';

const $ = require('jquery');
const storage = require('./local-storage');
const status = require('./status');
const user = require('./user');
const funcs = require('./funcs');

class Server {
	constructor() {
		this.treebank_id = funcs.getTreebankId();
		this.check();
	}

	check() {
		this.is_running = false;
		try {
			$.ajax({
				type: 'GET',
				url: '/running',
				success: data => {
					status.normal('connected to server');
					log.info(`checkServer AJAX response: ${JSON.stringify(data)}`);
					this.is_running = true;
					gui.update();
					gui.modals.upload.enable();
					this.load();
				},
				error: data => {
					status.error('unable to connect to server');
					log.error('Unable to complete AJAX request for check()');
					gui.menu.update();
				}
			});
		} catch (e) {
			status.error('unable to connect to server');
			log.error(`AJAX error in check(): ${e.message}`);
			gui.menu.update();
		}
	}

	save(state) {

		if (!this.is_running)
			return null;

		try {
			$.ajax({
				type: 'POST',
				url: `/save?treebank_id=${this.treebank_id}`,
  			contentType: "application/json; charset=utf-8",
				data: state,
				dataType: 'json',
				success: data => {
					if (data.status === 'failure') {
						log.error('Unable to save(): server error');
					} else {
						log.info('Successfully saved to server');
					}
				},
				error: data => {
					log.error('Unable to complete AJAX request for save()')
				}
			});
		} catch (e) {
			log.error(`AJAX error in save(): ${e.message}`);
		}
	}

	load() {

 		if (!this.is_running)
			return null;

		try {
			$.ajax({
				type: 'GET',
				url: `/load?treebank_id=${this.treebank_id}`,
				success: data => {
					if (data.status === 'failure') {
						log.error('Unable to load(): server error');
					} else {
						log.info('Successfully loaded from server');
						manager.load(data);
					}
				},
				error: data => {
					log.critical('Unable to complete AJAX request for load()');
				}
			})
		} catch (e) {
			log.critical(`AJAX error in load(): ${e.message}`);
		}

		return null; // want the loading to fail
	}
}

module.exports = Server;
