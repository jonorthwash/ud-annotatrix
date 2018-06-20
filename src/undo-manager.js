'use strict';

const $ = require('jquery');
const UndoManager = require('undo-manager');

function updateUndoButtons() {

	$('#btnUndo, #btnRedo').addClass('disabled');

	if (undoManager.hasUndo())
		$('#btnUndo').removeClass('disabled');
	if (undoManager.hasRedo())
		$('#btnRedo').removeClass('disabled');
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
