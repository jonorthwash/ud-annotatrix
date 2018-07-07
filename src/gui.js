'use strict';

const $ = require('jquery');

const convert = require('./convert');
const corpus = require('./corpus');
const funcs = require('./funcs');
const errors = require('./errors');
const setupUndos = require('./undo-manager');
const table = require('./table');

const KEYS = {
  DELETE: 46,
  BACKSPACE: 8,
  ENTER: 13,
  ESC: 27,
  TAB: 9,
  RIGHT: 39,
  LEFT: 37,
  UP: 38,
  DOWN: 40,
  MINUS: 173,
  MINUS_: 189,
  EQUALS: 61,
  EQUALS_: 187,
  SHIFT: 16,
  CTRL: 17,
  OPT: 18,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  META: 224,
  D: 68,
  I: 73,
  J: 74,
  K: 75,
  M: 77,
  P: 80,
  R: 82,
  S: 83,
  X: 88,
  Y: 89,
  Z: 90,
  0: 48
};
const toggle = {
  table: (event) => {
    gui.is_table_view = !gui.is_table_view;
    gui.update();
  },

  tableColumn: (event) => {

    const target = $(event.target),
      col = target.attr('col-id');

    gui.column_visible(col, !gui.column_visible(col));
    target.toggleClass('column-hidden')
      .find('i')
        .toggleClass('fa-angle-double-right')
        .toggleClass('fa-angle-double-left');

    $(`td[col-id=${col}]`)
      .css('visibility', gui.column_visible(col) ? 'visible' : 'hidden');

    gui.update();
  },

  textarea: (event) => {

    $('#btnToggleTextarea i')
			.toggleClass('fa-chevron-up')
			.toggleClass('fa-chevron-down')
    gui.is_textarea_visible = !gui.is_textarea_visible;

    gui.update();
  },

  rtl: (event) => {

    $('#RTL .fa')
			.toggleClass('fa-align-right')
			.toggleClass('fa-align-left');
		gui.is_ltr = !gui.is_ltr;

    gui.update();
  },

  vertical: (event) => {

    $('#vertical .fa').toggleClass('fa-rotate-90');
    gui.is_vertical = !gui.is_vertical;

    gui.update();
  },

  enhanced: (event) => {

    $('#enhanced .fa')
			.toggleClass('fa-tree')
			.toggleClass('fa-magic');
    gui.is_enhanced = !gui.is_enhanced;

    gui.update();
  }
}

var pressed = {}; // used for onCtrlKeyup

class GUI {
  constructor(mgr) {

    this.keys = KEYS;
    this.toggle = toggle;

    this.is_textarea_visible = true;
    this.is_vertical = false;
    this.is_ltr = true;
    this.is_enhanced = false;

    this.pan = this.pan || null;
    this.zoom = this.zoom || null;
    this.graph_disabled = false;
    this.intercepted = false;
    this.moving_dependency = false;
    this.editing = null;

    this.inBrowser = funcs.inBrowser();

    if (this.inBrowser) {
      setupUndos();
      undoManager.setCallback(this.update);
    }

  }

  update() {
    if (!gui.inBrowser)
      return;

    // textarea
    $('#text-data').val(manager.sentence);

    // navigation buttons
    $('.btn').removeClass('disabled');
    $('#total-sentences').text(manager.length);
    $('#current-sentence').val(manager.index + 1);
    if (!manager.index)
      $('#btnPrevSentence').addClass('disabled');
    if (manager.index === manager.length - 1)
      $('#btnNextSentence').addClass('disabled');
    if (!server.is_running)
      $('#btnUploadCorpus').addClass('disabled');
    if (manager.format !== 'CoNLL-U')
      $('#btnToggleTable').addClass('disabled');

    $('#btnUndo').prop('disabled', !undoManager.hasUndo());
    $('#btnRedo').prop('disabled', !undoManager.hasRedo());

    $('.nav-link').removeClass('active').show();
    switch (manager.format) {
      case ('Unknown'):
        $('.nav-link').hide();
        $('#tabOther').addClass('active').show().text(manager.format);
        break;
      case ('CoNLL-U'):
        $('#tabConllu').addClass('active');
        $('#tabOther').hide();
        break;
      case ('CG3'):
        $('#tabCG3').addClass('active');
        $('#tabOther').hide();
        break;
      case ('plain text'):
        $('#tabText').hide(); // NOTE: no break here
      default:
        $('#tabOther').addClass('active').show().text(manager.format);
        break;
    }

    if (manager.format !== 'CoNLL-U')
      gui.is_table_view = false;

    if (gui.is_table_view) {
      $('#btnToggleTable i').removeClass('fa-code');
      $('#text-data').hide();
      $('#table-data').show();
      table.build();
    } else {
      $('#btnToggleTable i').addClass('fa-code');
      $('#text-data').show();
      $('#table-data').hide();
    }

    if (gui.is_textarea_visible) {
      $('#data-container').show();
      $('#top-buttons-container').removeClass('extra-space');
      $('#btnToggleTable').show();
    } else {
      $('#data-container').hide();
      $('#top-buttons-container').addClass('extra-space');
      $('.nav-link').not('.active').hide();
      $('#btnToggleTable').hide();
    }

    try { // need this in case `cy` DNE
      gui.zoom = cy.zoom();
      gui.pan  = cy.pan();
    } catch (e) {
      gui.zoom = null;
      gui.pan  = null;
    }
    graph.update();
  }

  read(id) {
    if (!this.inBrowser)
      return;

    switch (id) {
      case ('text-data'):
      case ('current-sentence'):
        return $(`#${id}`).val();
      default:
        throw new TypeError(`unable to read "${id}"`);
    }
  }

  bind() {
    if (!this.inBrowser)
      return;

    $('#btnPrevSentence').click(e => {
      manager.prev();
    });
    $('#btnNextSentence').click(e => {
      manager.next();
    });
    $('#current-sentence').blur(e => {
      const index = parseInt(this.read('current-sentence')) - 1;
      manager.index = index;
    });
    $('#btnRemoveSentence').click(e => {
      manager.removeSentence();
    });
    $('#btnAddSentence').click(e => {
      manager.insertSentence('');
    });

    $('#btnUploadCorpus').click(corpus.upload);
    $('#btnExportCorpus').click(corpus.export);
    //$('#btnSaveServer').click(saveOnServer);
    $('#btnDiscardCorpus').click(corpus.clear);
    $('#btnPrintCorpus').click(corpus.print);

    $('#btnHelp').click(e => {
      window.open('help.html', '_blank').focus();
    });
    $('#btnSettings').click(e => {
      throw new errors.NotImplementedError('show settings not implemented');
    });

    $('#tabText').click(e => {
      manager.parse(convert.to.plainText(manager.sentence));
    });
    $('#tabConllu').click(e => {
      manager.parse(convert.to.conllu(manager.sentence));
    });
    $('#tabCG3').click(e => {
      manager.parse(convert.to.cg3(manager.sentence));
    });

    $('#btnToggleTable').click(this.toggle.table);
    $('#btnToggleTextarea').click(this.toggle.textarea);
    $('.thead-default th').click(this.toggle.tableColumn);
    $('#RTL').click(this.toggle.rtl);
    $('#vertical').click(this.toggle.vertical);
    $('#enhanced').click(this.toggle.enhanced);

    $('#current-sentence').keyup(this.onKeyupInCurrentSentence);
    $('#text-data').keyup(this.onEditTextData);

    // onkeyup is a global variable for JS runtime
    onkeyup = this.onKeyupInDocument;

    // direct graph-editing stuff
    $('#edit').keyup(this.onKeyupInEditLabel);

    // prevent accidentally leaving the page
    window.onbeforeunload = () => {
      // DEBUG: uncomment this line for production
      // return 'Are you sure you want to leave?';
    };

  }

  get is_table_view() {
    return manager.current.is_table_view;
  }
  set is_table_view(bool) {

    manager.current.is_table_view = false;
    if (typeof bool === 'boolean' && manager.format === 'CoNLL-U')
      manager.current.is_table_view = bool;

    return manager.current.is_table_view;
  }

  column_visible(col, bool) {
    if (typeof bool === 'boolean')
      manager.current.column_visibilities[col] = bool;

    return manager.current.column_visibilities[col];
  }

  zoomIn() {
    cy.zoom(gui.zoom * 1.1);
    gui.update();

    return this;
  }
  zoomOut() {
    cy.zoom(gui.zoom / 1.1);
    gui.update();

    return this;
  }

  onKeyupInDocument(event) {
		log.info(`called onKeyupInDocument(${event.which})`);

		// returns true if it caught something
		if (gui.onCtrlKeyup(event))
			return;

		// editing an input
		if ($('#text-data').is(':focus') || $('#edit').is(':focus'))
			return;

		// if we get here, we're handling a keypress without an input-focus or ctrl-press
		// (which means it wasn't already handled)
		log.debug(`onKeyupInDocument(): handling event.which:${event.which}`);

		switch (event.which) {
  		case (KEYS.DELETE):
  		case (KEYS.BACKSPACE):
  		case (KEYS.X):
				if (cy.$('.selected').length) {
					graph.removeDependency(cy.$('.selected'));
				}/* else if (cy.$('.supAct').length) {
					removeSup(st);
				}*/
				break;

  		case (KEYS.D):
				if (cy.$('.selected').length) {
					cy.$('.selected').toggleClass('moving');
					gui.moving_dependency = !gui.moving_dependency;
				}
				break;

  		case (KEYS.M):
				/*if (cy.$('node.form.activated').length) {
					cy.$('node.form.activated')
						.removeClass('activated')
						.addClass('merge');

				} else if (cy.$('node.form.merge').length)
					cy.$('node.form.merge')
						.addClass('activated')
						.removeClass('merge');*/

        break;

  		case (KEYS.P):
				/* if (text not focused)
					setPunct();*/
				break;

  		case (KEYS.R):
				if (cy.$('node.form.activated'))
					graph.setRoot(cy.$('node.form.activated'));
				break;

  		case (KEYS.S):
				// wf.addClass('supertoken');
        // wf.removeClass('activated');
				break;

  		case (KEYS.LEFT):
  		case (KEYS.RIGHT):
				/*if (cy.$('node.form.merge').length) {
					mergeNodes(event.which === KEYS.LEFT ? 'left' : 'right', 'subtoken');
				} else if (cy.$('.supertoken')) {
					// mergeNodes(toMerge, KEYS.SIDES[key.which], 'subtoken');
					// mergeNodes(toSup, KEYS.SIDES[key.which], 'supertoken');
				}*/
				break;

  		case (KEYS.EQUALS):
  		case (KEYS.EQUALS_):
				if (event.shiftKey) {
          gui.zoomIn();
        } else {
          cy.fit().center();
        }
				break;

  		case (KEYS.MINUS):
  		case (KEYS.MINUS_):
        if (event.shiftKey) {
          gui.zoomOut();
        } else {
          cy.fit().center();
        }
        break;

      case (KEYS.ENTER):
        gui.intercepted = false;
        graph.clear();
        break;

      default:
				if (47 < event.which && event.which < 58) {// key in 0-9
					const num = event.which - 48;
          cy.zoom(1.5 ** (num - 5));
          gui.update();
				}

		}
  }
  onCtrlKeyup(event) {
		log.debug(`called onCtrlKeyup(which:${event.which}, pressed:${JSON.stringify(pressed)})`);

		// handle Ctrl + <keypress>
		// solution based on https://stackoverflow.com/a/12444641/5181692
		pressed[event.which] = (event.type == 'keyup');
		log.info(`ctrl: ${pressed[KEYS.CTRL]}, shift: ${pressed[KEYS.CTRL]}, y: ${pressed[KEYS.Y]}, z: ${pressed[KEYS.Z]}, this: ${event.which}`);

		if (!pressed[KEYS.CTRL])
			return false;

		if (pressed[KEYS.PAGE_DOWN]) {
			if (pressed[KEYS.SHIFT]) {
				manager.last();
			} else {
				manager.next();
			}
      pressed = { [KEYS.CTRL]: true, [KEYS.SHIFT]: pressed[KEYS.SHIFT] };
			return true;

		} else if (pressed[KEYS.PAGE_UP]) {
			if (pressed[KEYS.SHIFT]) {
				manager.first()
			} else {
				manager.prev()
			}
      pressed = { [KEYS.CTRL]: true, [KEYS.SHIFT]: pressed[KEYS.SHIFT] };
			return true;

		} else if (pressed[KEYS.Z] && !pressed[KEYS.SHIFT]) {
			undoManager.undo();
      pressed = { [KEYS.CTRL]: true };
			return true;

		} else if (pressed[KEYS.Y] || pressed[KEYS.Z]) {
			undoManager.redo();
      pressed = { [KEYS.CTRL]: true, [KEYS.SHIFT]: pressed[KEYS.SHIFT] };
			setTimeout(() => { // catch only events w/in next 500 msecs
				pressed[KEYS.SHIFT] = false;
			}, 500);
			return true;

		} else {
			log.error(`onCtrlKeyup(): uncaught key combination`);
		}

		return false;
  }
  onKeyupInCurrentSentence(event) {
		log.debug(`called onKeyupInCurrentSentence(${event.which})`);

		switch (event.which) {
      case (KEYS.ENTER):
        manager.index = parseInt(gui.read('current-sentence')) - 1;
				break;
  		case (KEYS.LEFT):
  		case (KEYS.J):
        manager.prev();
				break;
  		case (KEYS.RIGHT):
  		case (KEYS.K):
        manager.next();
				break;
  		case (KEYS.MINUS):
        manager.removeSentence();
				break;
  		case (KEYS.EQUALS):
				manager.insertSentence();
				break;
		}
  }
  onKeyupInEditLabel(event) {
		log.debug(`called onKeyupInEditLabel(${event.which})`);

		switch (event.which) {
		  case (KEYS.ENTER):
        graph.clear();
				break;
		  case (KEYS.TAB):
				console.log('what should happen here???');
				break;
		  case (KEYS.ESC):
				gui.editing = null;
        graph.clear();
				break;
		}
  }
  onEditTextData(event) {
		log.debug(`called onEditTextData(key: ${event.which})`);

		//saveGraphEdits();

		switch (event.which) {
			case (KEYS.ESC):
  			this.blur();
  			break;
			case (KEYS.ENTER):
				gui.onEnter(event);
				break;
			default:
				manager.parse();
		}
  }
  onEnter(event) {
		log.debug(`called onEnter()`);

		let sentence = manager.sentence,
			cursor = $('#text-data').prop('selectionStart') - 1,
			lines = sentence.split(/\n/),
			lineId = null, before, during, after,
			cursorLine = 0;

		if (gui.is_table_view) {

      const target = $(event.target);
      cursor = parseInt(target.attr('row-id')) || parseInt(target.attr('col-id'));
      cursorLine = target.attr('row-id');

		} else {

			if (manager.format === 'Unknown' || manager.format === 'plain text')
				return;

			// get current line number
			let acc = 0;
			$.each(lines, (i, line) => {
				acc += line.length;
				if (acc + i < cursor)
					cursorLine = i + 1;
			});
			log.debug(`onEnter(): cursor on line[${cursorLine}]: "${lines[cursorLine]}"`);

			// advance the cursor until we are at the end of a line that isn't followed by a comment
			//   or at the very beginning of the textarea
			if (cursor !== 0 || sentence.startsWith('#')) {
				log.debug(`onEnter(): cursor[${cursor}]: "${sentence[cursor]}" (not at textarea start OR textarea has comments)`)
				while (sentence[cursor + 1] === '#' || sentence[cursor] !== '\n') {
					log.debug(`onEnter(): cursor[${cursor}]: "${sentence[cursor]}", line[${cursorLine}]: ${lines[cursorLine]}`);
					if (cursor === sentence.length)
						break;
					if (sentence[cursor] === '\n')
						cursorLine++;
					cursor++;
				}
			} else {
				log.debug(`onEnter(): cursor[${cursor}]: "${sentence[cursor]}" (at textarea start)`)
				cursorLine = -1;
			}
		}

		log.debug(`onEnter(): cursor[${cursor}]: "${sentence[cursor]}", line[${cursorLine}]: ${lines[cursorLine]}`);

    if (event.preventDefault) // bc of testing, sometimes these are fake events
      event.preventDefault();

		switch (manager.format) {
			case ('CoNLL-U'):

        if (cursor) {
          const tabs = lines[cursorLine].split('\t');
          const token = manager.current.getById(tabs[0]).token;
          manager.current.insertTokenAfter(token);

        } else {
          const token = manager.current[0].token;
          manager.current.insertTokenBefore(token);
        }

        // parse but persist the table settings
        const is_table_view = manager.current.is_table_view;
        const column_visibilities = manager.current.column_visibilities;
        manager.parse(manager.conllu);
        manager.current.is_table_view = is_table_view;
        manager.current.column_visibilities = column_visibilities;

				break;

			case ('CG3'):

        throw new errors.NotImplementedError('can\'t onEnter with CG3 :/');
        /*
				// advance to the end of an analysis
				log.debug(`onEnter(): line[${cursorLine}]: "${lines[cursorLine]}", cursor[${cursor}]: "${sentence[cursor]}"`);
				while (cursorLine < lines.length - 1) {
						if (lines[cursorLine + 1].startsWith('"<'))
								break;
						cursorLine++;
						cursor += lines[cursorLine].length + 1;
						log.debug(`onEnter(): incrementing line[${cursorLine}]: "${lines[cursorLine]}", cursor[${cursor}]: "${sentence[cursor]}"`);
				}

				lineId = lines.slice(0, cursorLine + 1).reduce((acc, line) => {
						return acc + line.startsWith('"<');
				}, 0) + 1;
				log.debug(`onEnter(): inserting line with id: ${lineId}`);
				log.debug(`onEnter(): resetting all content lines: [${lines}]`);

				const incrementIndices = (lines, lineId) => {
					return lines.map((line) => {
						if (line.startsWith('#'))
							return line;
						(line.match(/[#>][0-9]+/g) || []).map((match) => {
							let id = parseInt(match.slice(1));
							id += (id >= lineId ? 1 : 0);
							line = line.replace(match, `${match.slice(0,1)}${id}`)
						});
						return line;
					});
				}
				before = incrementIndices(lines.slice(0, cursorLine + 1), lineId);
				during = [`"<_>"`, `\t${getCG3Analysis(lineId, {id:lineId})}`];
				after = incrementIndices(lines.slice(cursorLine + 1), lineId);

				log.debug(`onEnter(): preceding line(s) : [${before}]`);
				log.debug(`onEnter(): interceding lines : [${during}]`);
				log.debug(`onEnter(): proceeding line(s): [${after}]`);

				$('#text-data').val(before.concat(during, after).join('\n'))
					.prop('selectionStart', cursor)
					.prop('selectionEnd', cursor);*/

				break;

			default:
				insertSentence();
		}

    gui.update();
  }
}



module.exports = GUI;
