'use strict';

const $ = require('jquery');
const UndoManager = require('undo-manager');

module.exports = () => {
	window.undoManager = new UndoManager();

	$('#btnUndo').click(() => {
		undoManager.undo();
	});
	$('#btnRedo').click(() => {
		undoManager.redo();
	});
}
