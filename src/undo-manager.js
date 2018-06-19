'use strict';

const $ = require('jquery');
const UndoManager = require('undo-manager');

function updateUndoButtons() {
	undoManager.btnUndo.prop('disabled', !undoManager.hasUndo());
	undoManager.btnRedo.prop('disabled', !undoManager.hasRedo());
}

module.exports = () => {
	window.undoManager = new UndoManager();
	
	undoManager.btnUndo = $('#btnUndo').click(() => {
		undoManager.undo();
	});
	undoManager.btnRedo = $('#btnRedo').click(() => {
		undoManager.redo();
	});

	undoManager.setCallback(updateUndoButtons);
	updateUndoButtons();
}
