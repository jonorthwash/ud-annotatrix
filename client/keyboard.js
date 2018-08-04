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
  C: 67,
  D: 68,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  P: 80,
  R: 82,
  S: 83,
  X: 88,
  Y: 89,
  Z: 90,
  0: 48,
  QUESTION_MARK: 191,
};

var pressed = new Set();

function name(which) {
  return _.invert(KEYS)[which];
}

function keyup(gui, event) {

  pressed.delete(event.which);
  console.log('keyup>', event.which, name(event.which) || event.key, pressed)

  // catch CTRL+<key> sequence first
  if (pressed.has(KEYS.CTRL)) {

    if (event.which === KEYS.PAGE_DOWN) {
      if (pressed.has(KEYS.SHIFT)) {
        manager.last();
      } else {
        manager.next();
      }
      return;

    } else if (event.which === KEYS.PAGE_UP) {
      if (pressed.has(KEYS.SHIFT)) {
        manager.first()
      } else {
        manager.prev()
      }
      return;

    } else if (event.which === KEYS.Z && !pressed.has(KEYS.SHIFT)) {
      undoManager.undo();
      return;

    } else if (event.which === KEYS.Y || pressed.has(KEYS.Z)) {
      undoManager.redo();
      return;

    } else if (event.which === KEYS.L) {
      $('#label-input').focus();
      return;

    } else if (47 < event.which && event.which < 58) { // key in 0-9

      const num = event.which - 48;
      cy.zoom(1.5 ** (num - 5));
      gui.update();
      return;

    }
  }

  if ($(':focus').is('.conllu-table')) {

    function goRight(ele) {

      const rows = $('#table-data').find('tr').length - 1;
      let row = parseInt(td.attr('row-id'));
      let col = parseInt(td.attr('col-id')) + 1;

      if (col === 10) {
        row += 1;
        col = 1;
      }
      if (row === rows)
        row = 0;

      const next = $(`td.conllu-table[row-id = "${row}"][col-id = "${col}"]`);
      setTimeout(() => next.focus(), 200);
    }

    function goLeft(ele) {

      const rows = $('#table-data').find('tr').length - 1;
      let row = parseInt(td.attr('row-id'));
      let col = parseInt(td.attr('col-id')) - 1;

      if (col === 0) {
        row -= 1;
        col = 9;
      }
      if (row === -1)
        row = rows - 1;

      const next = $(`td.conllu-table[row-id = "${row}"][col-id = "${col}"]`);
      setTimeout(() => next.focus(), 200);
    }

    function goUp(ele) {

      const rows = $('#table-data').find('tr').length - 1;
      let row = parseInt(td.attr('row-id')) - 1;
      let col = parseInt(td.attr('col-id'));

      if (row === -1)
        row = rows - 1;

      const next = $(`td.conllu-table[row-id = "${row}"][col-id = "${col}"]`);
      setTimeout(() => next.focus(), 200);
    }

    function goDown(ele) {

      const rows = $('#table-data').find('tr').length - 1;
      let row = parseInt(td.attr('row-id')) - 1;
      let col = parseInt(td.attr('col-id'));

      if (row === rows)
        row = 0;

      const next = $(`td.conllu-table[row-id = "${row}"][col-id = "${col}"]`);
      setTimeout(() => next.focus(), 200);
    }

    const td = $(':focus');

    switch (event.which) {
      case (KEYS.ENTER):
        td.blur();
        return;

      case (KEYS.TAB):
        if (pressed.has(KEYS.SHIFT)) {
          goLeft(td);
        } else {
          goRight(td);
        }
        return;

      case (KEYS.UP):
        if (pressed.has(KEYS.CTRL))
          goUp(td);
        return;

      case (KEYS.DOWN):
        if (pressed.has(KEYS.CTRL))
          goDown(td);
        return;

      case (KEYS.LEFT):
        if (pressed.has(KEYS.CTRL))
          goLeft(td);
        return;

      case (KEYS.RIGHT):
        if (pressed.has(KEYS.CTRL))
          goRight(td);
        return;

      case (KEYS.ESC):
        const originalValue = td.attr('original-value') || '';
        td.text(originalValue).blur();
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

    switch (event.which) {
      case (KEYS.ENTER):
        gui.intercepted = false;
        graph.clear();
        return;

      case (KEYS.TAB):
        graph.intercepted = false;
        if (pressed.has(KEYS.SHIFT)) {
          graph.prev();
        } else {
          graph.next();
        }
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

        const cursor = $('#text-data').prop('selectionStart'),
          contents = $('#text-data').val(),
          before = contents.substring(0, cursor),
          after = contents.substring(cursor, contents.length);

        $('#text-data').val(before + '\t' + after);
        return;

      default:
        // wait a full second before parsing (this prevents immediate trimming
        //   of whitespace and other annoying side effects), and avoid redundant
        //   parsing if we edit again w/in that 1-sec window
        clearTimeout(gui.parseTimer);
        gui.parseTimer = setTimeout(() => {

          if (manager.current.parsed)
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

      const token = cy.$('.activated');
      const superToken = cy.$('.multiword-active');

      if (token.length) {

        graph.flashTokenSplitInput(token);

      } else if (superToken.length) {

        graph.splitSuperToken(superToken);

      }
      gui.status.update();
      return;

    case (KEYS.M):

      if (cy.$('.merge-source').length) {

        cy.$('.neighbor')
          .removeClass('merge-left merge-right neighbor');

        cy.$('.merge-source')
          .removeClass('merge-source')
          .addClass('activated');

      } else if (cy.$('.activated').length) {

        if (cy.$('.activated').data('type') !== 'token')
          return;

        cy.$('.activated')
          .addClass('merge-source');

        cy.$('.neighbor')
          .removeClass('neighbor combine-source combine-left combine-right')

        const left = graph.getLeftForm();
        if (!left.hasClass('activated') && left.data('type') === 'token')
          left
            .addClass('neighbor')
            .addClass('merge-left');

        const right = graph.getRightForm();
        if (!right.hasClass('activated') && right.data('type') === 'token')
          right
            .addClass('neighbor')
            .addClass('merge-right');

      }
      gui.status.update();
      return;

    case (KEYS.C):
      if (cy.$('.combine-source').length) {

        cy.$('.neighbor')
          .removeClass('combine-left combine-right neighbor');

        cy.$('.combine-source')
          .removeClass('combine-source')
          .addClass('activated');

      } else if (cy.$('.activated').length) {

        if (cy.$('.activated').data('type') !== 'token')
          return;

        cy.$('.activated')
          .addClass('combine-source');

        cy.$('.neighbor')
          .removeClass('neighbor merge-source merge-left merge-right')

        const left = graph.getLeftForm();
        if (!left.hasClass('activated') && left.data('type') === 'token')
          left
            .addClass('neighbor')
            .addClass('combine-left');

        const right = graph.getRightForm();
        if (!right.hasClass('activated') && right.data('type') === 'token')
          right
            .addClass('neighbor')
            .addClass('combine-right');

      }
      gui.status.update();
      return;

    case (KEYS.LEFT):

      // avoid panning the window
      if (event.preventDefault)
        event.preventDefault();

      if (cy.$('.merge-left').length) {

        const src = cy.$('.merge-source').data('token');
        const tar = cy.$('.merge-left').data('token');
        graph.merge(src, tar);

      } else if (cy.$('.combine-left').length) {

        const src = cy.$('.combine-source').data('token');
        const tar = cy.$('.combine-left').data('token');
        graph.combine(src, tar);

      }
      return;

    case (KEYS.RIGHT):

      // avoid panning the window
      if (event.preventDefault)
        event.preventDefault();

        if (cy.$('.merge-right').length) {

          const src = cy.$('.merge-source').data('token');
          const tar = cy.$('.merge-right').data('token');
          graph.merge(src, tar);

        } else if (cy.$('.combine-right').length) {

          const src = cy.$('.combine-source').data('token');
          const tar = cy.$('.combine-right').data('token');
          graph.combine(src, tar);

        }
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

    case (KEYS.ESC):
      graph.clear();
      return;

    case (KEYS.QUESTION_MARK):
      console.log('help modal not implemented :(');
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
