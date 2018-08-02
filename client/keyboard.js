'use strict';

const _ = require('underscore');
const $ = require('jquery');

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

var pressed = new Set();

function name(which) {
  return _.invert(KEYS)[which];
}

function keyup(gui, event) {

  pressed.delete(event.which);
  console.log(name(event.which), pressed)//.forEach(key => name(key)).join(' '));

  // catch CTRL+<key> sequence first
  if (pressed.has(KEYS.CTRL)) {

    if (pressed.has(KEYS.PAGE_DOWN)) {
      if (pressed.has(KEYS.SHIFT)) {
        manager.last();
      } else {
        manager.next();
      }
      return;

    } else if (pressed.has(KEYS.PAGE_UP)) {
      if (pressed.has(KEYS.SHIFT)) {
        manager.first()
      } else {
        manager.prev()
      }
      return;

    } else if (pressed.has(KEYS.Z) && !pressed.has(KEYS.SHIFT)) {
      undoManager.undo();
      return;

    } else if (pressed.has(KEYS.Y) || pressed.has(KEYS.Z)) {
      undoManager.redo();
      return;

    } else if (47 < event.which && event.which < 58) { // key in 0-9

      const num = event.which - 48;
      console.log(num)
      cy.zoom(1.5 ** (num - 5));
      gui.update();
      return;

    }
  }

  if ($(':focus').is('#current-sentence')) {

    switch (event.which) {
      case (KEYS.ENTER):
        manager.index = parseInt($('current-sentence').val()) - 1;
        return;

      case (KEYS.LEFT):
      case (KEYS.J):
        manager.prev();
        return;

      case (KEYS.RIGHT):
      case (KEYS.K):
        manager.next();
        return;

      case (KEYS.MINUS):
        manager.removeSentence();
        return;

      case (KEYS.EQUALS):
        manager.insertSentence();
        return;
    }
  }

  if ($(':focus').is('#edit')) {

    console.log('#edit focus', event.which, event.which === KEYS.TAB)
    switch (event.which) {
      case (KEYS.ENTER):
        gui.intercepted = false;
        graph.clear();
        return;

      case (KEYS.TAB):
        graph.intercepted = false;
        console.log(cy.$('.input'));
        if (pressed.has(KEYS.SHIFT)) {
          graph.prev();
        } else {
          graph.next();
        }
        console.log('tabbed')
        event.preventDefault();
        return;

      case (KEYS.ESC):
        gui.intercepted = false;
        gui.editing = null;
        graph.clear();
        return;
    }
  }

  if ($(':focus').is('#text-data')) {

    switch (event.which) {
      case (KEYS.ESC):
        this.blur();
        return;

      case (KEYS.ENTER):
        console.log('onEnter() not implemented');//onEnter(event);
        return;

      case (KEYS.TAB):
        console.log('add a tab character not implemented');
        return;

      default:
        // wait a full second before parsing (this prevents immediate trimming
        //   of whitespace and other annoying side effects), and avoid redundant
        //   parsing if we edit again w/in that 1-sec window
        clearTimeout(gui.parseTimer);
        gui.parseTimer = setTimeout(() => {
          manager.parse($('#text-data').val());
        }, 1000);
        return;
    }
  }

  switch (event.which) {
    case (KEYS.DELETE):
    case (KEYS.BACKSPACE):
    case (KEYS.X):
      if (cy.$('.selected').length) {
        graph.removeDependency(cy.$('.selected'));
      }/* else if (cy.$('.supAct').length) {
        removeSup(st);
      }*/
      return;

    case (KEYS.D):
      if (cy.$('.selected').length) {
        cy.$('.selected').toggleClass('moving');
        gui.moving_dependency = !gui.moving_dependency;
      }
      return;

    case (KEYS.M):
      if (cy.$('node.form.merge').length) {

        cy.$('node.form.activated')
          .removeClass('activated');

        cy.$('node.form.merge')
          .addClass('activated')
          .removeClass('merge');

      } else if (cy.$('node.form.activated').length) {

        cy.$('node.form.activated')
          .removeClass('activated')
          .addClass('merge');

      }
      return;

    case (KEYS.P):
      /* if (text not focused)
        setPunct();*/
      console.log('setPunct() not implemented');
      return;

    case (KEYS.R):
      if (cy.$('node.form.activated'))
        graph.setRoot(cy.$('node.form.activated'));
      return;

    case (KEYS.S):
      // wf.addClass('supertoken');
      // wf.removeClass('activated');
      return;

    case (KEYS.LEFT):

      // avoid panning the window
      if (event.preventDefault)
        event.preventDefault();

      if (cy.$('node.form.merge').length)
        mergeNodes('left');
      return;

    case (KEYS.RIGHT):

      // avoid panning the window
      if (event.preventDefault)
        event.preventDefault();

      if (cy.$('node.form.merge').length) {
        mergeNodes('right');
      } /*else if (cy.$('.supertoken')) {
        // mergeNodes(toMerge, KEYS.SIDES[key.which], 'subtoken');
        // mergeNodes(toSup, KEYS.SIDES[key.which], 'supertoken');
      }*/
      return;

    case (KEYS.EQUALS):
    case (KEYS.EQUALS_):
      if (event.shiftKey) {
        gui.zoomIn();
      } else {
        cy.fit().center();
      }
      return;

    case (KEYS.MINUS):
    case (KEYS.MINUS_):
      if (event.shiftKey) {
        gui.zoomOut();
      } else {
        cy.fit().center();
      }
      return;

    case (KEYS.ENTER):
      gui.intercepted = false;
      graph.clear();
      return;

  }
}

function keydown(gui, event) {

  pressed.add(event.which);
  if (event.which === KEYS.TAB)
    event.preventDefault();

}

module.exports = KEYS;
module.exports.pressed = pressed;
module.exports.up = keyup;
module.exports.down = keydown;


/*


$('#current-sentence').keyup(e => onKeyupInCurrentSentence(e));
$('#text-data').keyup(e => onEditTextData(e));
$('#edit').keyup(e => onKeyupInEditLabel(e));
onkeyup = onKeyupInDocument;


function onKeyupInDocument(event) {
  log.info(`called onKeyupInDocument(${event.which})`);

  // returns true if it caught something
  if (onCtrlKeyup(event))
    return;

  // editing an input
  if ($('#text-data').is(':focus') || $('#edit').is(':focus'))
    return;

  // if we get here, we're handling a keypress without an input-focus or ctrl-press
  // (which means it wasn't already handled)
  log.debug(`onKeyupInDocument(): handling event.which:${event.which}`);

}

function onEnter(event) {
  log.debug(`called onEnter()`);

  let sentence = $('#text-data').val(),
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

      throw new Error('deprecated');
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

      throw new errors.NotImplementedError('can\'t onEnter with CG3 :/');*/
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

        /*

      break;

    default:
      insertSentence();
  }

  gui.update();
}

*/
