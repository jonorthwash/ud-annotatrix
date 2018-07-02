'use strict';

const $ = require('jquery');

class Server {
	constructor() {
		this.is_running = false;
		try {
			$.ajax({
				type: 'POST',
				url: '/annotatrix/running',
				data: {
					content: 'check'
				},
				dataType: 'json',
				success: (data) => {
					log.info(`checkServer AJAX response: ${JSON.stringify(data)}`);
					this.is_running = true;
					gui.update();
					//getSentence(1);
				},
				error: function(data){
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

		const content = manager.sentence,
			sentNum = manager.index,
			treebank_id = location.href.split('/')[4];

		console.log(sent, num, treebank)

		$.ajax({
			type: 'POST',
			url: '/save',
			data: {
				content: sent,
				sentNum: sentNum,
				treebank_id: treebank_id
			},
			dataType: 'json',
			success: function(data){
				console.log(data);
				log.info('Update was performed');
			}
		});
	}

	pull(sentNum) {
		if (!this.is_running)
			return null;

		/*
		const treebank_id = location.href.split('/')[4];

		$.ajax({
			type: 'POST',
			url: '/load',
			data: {
				treebank_id: treebank_id,
				sentNum: sentNum
			},
			dataType: 'json',
			success: (data) => {
				if (data['content']) {
					const sentence = data['content'],
							max = data['max'];
					$('#text-data').val(sentence);
					$('#total-sentences').html(max);
					AVAILABLE_SENTENCES = max;
				}
			}
		});

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


module.exports = Server;
