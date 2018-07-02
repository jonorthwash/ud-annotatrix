'use strict';

const $ = require('jquery');

class Server {
	constructor() {
		this.treebank_id = location.href.split('/')[4];
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
					//getSentence(1);
				},
				error: data => {
					log.info('Unable to complete AJAX request for checkServer()');
					//loadFromLocalStorage();
				}
			});
		} catch (e) {
			log.error(`AJAX error in checkServer: ${e.message}`);
		}
	}

	push() {
		if (!this.is_running)
			return null;

		// TODO: instead of taking manager.sentence, we should instead save some
		//   object like { nx: Object, settings: Object } or something

		const content = manager.sentence,
			sentNum = manager.index;

		$.ajax({
			type: 'POST',
			url: '/save',
			data: {
				content: content,
				sentNum: sentNum,
				treebank_id: this.treebank_id
			},
			dataType: 'json',
			success: data => {
				console.log(data);
				log.info('Update was performed');
			}
		});
	}

	async pull(sentNum) {
		if (!this.is_running)
			return null;

		return $.ajax({
			type: 'POST',
			url: '/load',
			data: {
				treebank_id: this.treebank_id,
				sentNum: sentNum
			},
			dataType: 'json',
			success: data => {
				console.log(data);
				return data;

				/*
				if (data['content']) {
					const sentence = data['content'],
							max = data['max'];
					$('#text-data').val(sentence);
					$('#total-sentences').html(max);
					AVAILABLE_SENTENCES = max;
				}*/
			}
		});

		/*
		$('#current-sentence').val(sentNum);
		CURRENT_SENTENCE = sentNum;*/

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
