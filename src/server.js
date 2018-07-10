'use strict';

const $ = require('jquery');
const storage = require('./local-storage');

class Server {
	constructor() {
		this.treebank_id = getTreebankId();
		this.check();
	}

	check() {
		this.is_running = false;
		try {
			$.ajax({
				type: 'POST',
				url: '/annotatrix/running',
				data: {
					content: 'check'
				},
				dataType: 'json',
				success: data => {
					log.info(`checkServer AJAX response: ${JSON.stringify(data)}`);
					this.is_running = true;
					gui.update();
					this.load();
				},
				error: data => {
					log.error('Unable to complete AJAX request for check()');
				}
			});
		} catch (e) {
			log.error(`AJAX error in check(): ${e.message}`);
		}
	}

	save(state) {

		if (!this.is_running)
			return null;

		try {
			$.ajax({
				type: 'POST',
				url: '/save',
				data: {
					state: state,
					treebank_id: this.treebank_id
				},
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
				url: `/load/${this.treebank_id}/`,
				success: data => {
					if (data.status === 'failure') {
						log.error('Unable to load(): server error');
					} else {
						log.info('Successfully loaded from server');

						manager.load({
							filename: data.filename,
							gui: JSON.parse(data.gui),
							sentences: data.sentences.map(JSON.parse),
							index: 0
						});
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

	download() {
		if (!this.is_running)
			return null;

		const treebank_id = location.href.split('/')[4];
		window.open(`./download?treebank_id=${treebank_id}`, '_blank');
	}
}

function getTreebankId() {
	return location.href.split('/')[4];
}

module.exports = Server;
