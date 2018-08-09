'use strict';

const $ = require('jquery');
const _ = require('underscore');
const utils = require('./utils');


class Server {
	constructor(app) {

		this.app = app;
		this.is_running = false;
		this.treebank_id = utils.getTreebankId();

	}

	connect() {
		try {
			$.ajax({
				type: 'GET',
				url: '/running',
				success: data => {

					console.info('AJAX connect success with response:', data);

					this.is_running = true;
					this.app.gui.status.normal('connected to server');
					this.load();

				},
				error: data => {

					console.info('AJAX connect failed with response:', data)
					this.app.gui.status.error('unable to connect to server');

					const serial = utils.storage.load();
					if (serial)
						this.app.load(serial);

				}
			});
		} catch (e) {

			console.info('AJAX connected failed with response:', e.message);
			this.app.gui.status.error('unable to connect to server');

			const serial = utils.storage.load();
			if (serial)
				this.app.load(serial);

		}
	}

	save(serial) {

		if (!this.is_running)
			return null;

		try {

			serial = JSON.stringify(serial);

			$.ajax({
				type: 'POST',
				url: `/save?treebank_id=${this.treebank_id}`,
  			contentType: "application/json; charset=utf-8",
				data: serial,
				dataType: 'json',
				success: data => {

					if (data.error) {

						console.info('AJAX save failed with response:', data);
						this.app.gui.status.error('unable to save to server');

					} else {
						console.info('AJAX save success with response:', data);
					}

				},
				error: data => {

					console.info('AJAX save failed with response:', data);
					this.app.gui.status.error('unable to save to server');

				}
			});
		} catch (e) {

			console.info('AJAX save failed with response:', data);
			this.app.gui.status.error('unable to save to server');

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

					if (data.error) {

						console.info('AJAX load failed with response:', data);
						this.app.gui.status.error('unable to load from server');

						const serial = utils.storage.load();
						if (serial)
							this.app.load(serial);

					} else {

						//console.info('AJAX load success with response:', data);
						data = JSON.parse(data);
						this.app.load(data);

					}

				},
				error: data => {

					console.info('AJAX load failed with response:', data);
					this.app.gui.status.error('unable to load from server');

					const serial = utils.storage.load();
					if (serial)
						this.app.load(serial);


				}
			});
		} catch (e) {

			console.info('AJAX load failed with response:', data);
			this.app.gui.status.error('unable to load from server');

			const serial = utils.storage.load();
			if (serial)
				this.app.load(serial);

		}
	}
}


module.exports = Server;
