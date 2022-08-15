import * as _ from "underscore";
import * as $ from "jquery";

export const KEYS = {
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
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  0: 48,
  1: 49,
  2: 50,
  3: 51,
  4: 52,
  5: 53,
  6: 54,
  7: 55,
  8: 56,
  9: 57,
  QUESTION_MARK: 191,
};

export var pressed = new Set();

function name(which) { return _.invert(KEYS)[which]; }

export function keyup(app, event) {

  const collab = app.collab, corpus = app.corpus, graph = app.graph, gui = app.gui;

  pressed.delete(event.which);
  console.log("keyup>", event.which, name(event.which) || event.key, pressed)

  // catch CTRL+<key> sequence first
  if (pressed.has(KEYS.CTRL)) {

    if (event.which === KEYS.PAGE_DOWN) {
      if (pressed.has(KEYS.SHIFT)) {
        corpus.last();
      } else {
        corpus.next();
      }

    } else if (event.which === KEYS.PAGE_UP) {
      if (pressed.has(KEYS.SHIFT)) {
        corpus.first()
      } else {
        corpus.prev()
      }

    } else if (event.which === KEYS.Z && !pressed.has(KEYS.SHIFT)) {
      // TODO: Implement this!
      //undoManager.undo();

    } else if (event.which === KEYS.Y || pressed.has(KEYS.Z)) {
      // TODO: Implement this!
      //undoManager.redo();

    } else if (event.which === KEYS.L) {
      $("#label-input").focus();

    } else if (47 < event.which && event.which < 58) { // key in 0-9

      const num = event.which - 48;
      graph.grapher.zoomTo(1.5 ** (num - 5));
      gui.refresh();
    }

    return;
  }

  const focus = $(":focus");

  if (focus.is(".conllu-table")) {

    const table = gui.table;
    const td = focus;

    switch (event.which) {
    case (KEYS.ENTER):
      table.toggleEditing();
      break;

    case (KEYS.TAB):
      if (pressed.has(KEYS.SHIFT)) {
        table.goLeft(true);
        table.toggleEditing(true);
      } else {
        table.goRight(true);
        table.toggleEditing(true);
      }
      break;

    case (KEYS.UP):
      if (!table.editing)
        table.goUp();
      break;

    case (KEYS.DOWN):
      if (!table.editing)
        table.goDown();
      break;

    case (KEYS.LEFT):
      if (!table.editing)
        table.goLeft();
      break;

    case (KEYS.RIGHT):
      if (!table.editing)
        table.goRight();
      break;

    case (KEYS.ESC):
      const originalValue = td.attr("original-value") || "";
      td.text(originalValue).blur();
      break;
    }

    return;
  }

  if (focus.is("#current-sentence")) {

    switch (event.which) {
    case (KEYS.ENTER):
      corpus.index = parseInt($("#current-sentence").val()) - 1;
      break;

    case (KEYS.LEFT):
    case (KEYS.J):
      corpus.prev();
      break;

    case (KEYS.RIGHT):
    case (KEYS.K):
      corpus.next();
      break;

    case (KEYS.MINUS):
      corpus.removeSentence();
      break;

    case (KEYS.EQUALS):
      corpus.insertSentence();
      break;
    }

    return;
  }

  if (focus.is("#edit")) {

    switch (event.which) {
    case (KEYS.ENTER):
      app.graph.intercepted = false;
      graph.clear();
      break;

    case (KEYS.TAB):
      graph.intercepted = false;
      if (pressed.has(KEYS.SHIFT)) {
        graph.selectPrevEle();
      } else {
        graph.selectNextEle();
      }
      break;

    case (KEYS.ESC):
      app.graph.intercepted = false;
      app.graph.editing = null;
      graph.clear();
      break;
    }

    return;
  }

  if (focus.is("#text-data")) {

    switch (event.which) {
    case (KEYS.ESC):
      focus.blur();
      break;

    case (KEYS.ENTER):
      console.log("onEnter() not implemented"); // onEnter(event);
      break;

    case (KEYS.TAB):

      const cursor = $("#text-data").prop("selectionStart"), contents = $("#text-data").val(),
            before = contents.substring(0, cursor), after = contents.substring(cursor, contents.length);

      $("#text-data").val(before + "\t" + after);
      break;

    default:
      // wait a full second before parsing (this prevents immediate trimming
      //   of whitespace and other annoying side effects), and avoid redundant
      //   parsing if we edit again w/in that 1-sec window
      clearTimeout(gui.parseTimer);
      gui.parseTimer = setTimeout(() => {
        if (gui.config.autoparsing) {
          // Sometimes call Corpus::parse makes the cursor jump to the very end
          // of the textarea.  If we detect that to be the case, we can just set
          // the cursor back to its last known position.  This probably isn't
          // perfect, but it is less bad than the current behavior :^)
          const cursorBeforeParse = $("#text-data").prop("selectionStart");
          corpus.parse($("#text-data").val());
          if ($("#text-data").prop("selectionStart") == $("#text-data").val().length) {
            $("#text-data").prop("selectionStart", cursorBeforeParse).prop("selectionEnd", cursorBeforeParse);
          }
        } else {
          if (corpus.current)
            corpus.current.input = $("#text-data").val();
        }
      }, 1000);
      break;
    }

    return;
  }

  if (focus.is("#chat-input")) {
    if (event.which === KEYS.ENTER) {

      gui.chat.sendMessage(collab);
    }
    return;
  }

  if (event.which === KEYS.QUESTION_MARK) {
    console.log("help modal not implemented :(");
    return;
  }

  if (true)
    switch (event.which) {
    case (KEYS.DELETE):
    case (KEYS.BACKSPACE):
    case (KEYS.X):
      if ($(".selected").length) {
        graph.removeDependency($(".selected"));
      }/* else if (graph.cy.$('.supAct').length) {
        removeSup(st);
      }*/
      break;

    case (KEYS.D):
      if ($(".selected").length) {
        $(".selected").toggleClass("moving");
        graph.moving_dependency = !graph.moving_dependency;
      }
      break;

    case (KEYS.E):
      console.log("KEYS.E", $(".activated"));
      if ($(".activated").length)
        graph.toggleIsEmpty($(".activated"));
      break;

    case (KEYS.N):
      console.log("KEYS.N", $(".activated"));
      if ($(".activated").length)
        graph.insertEmptyTokenAfter($(".activated"));
      break;

    case (KEYS.P):
      /* if (text not focused)
        setPunct();*/
      console.log("setPunct() not implemented");
      break;

    case (KEYS.R):
      if ($(".activated").length)
        graph.setRoot($(".activated"));
      break;

    case (KEYS.S):

      const token = $(".activated");
      const superToken = $(".multiword-active");

      if (token.length) {

        graph.flashTokenSplitInput(token);

      } else if (superToken.length) {

        graph.splitSuperToken(superToken);
      }
      gui.status.refresh();
      break;

    case (KEYS.M):

      $(".form").removeClass("combine-source combine-left combine-right");

      if ($(".merge-source").length) {

        $(".neighbor").removeClass("merge-left merge-right neighbor");

        $(".merge-source").removeClass("merge-source").addClass("activated");

        graph.lock($(".activated"));

      } else if ($(".activated").length) {

        if (!$(".activated").attr("id").includes("form"))
          break;

        $(".activated").addClass("merge-source");

        $(".neighbor").removeClass("neighbor combine-source combine-left combine-right")

        const left = graph.getPrevForm();
        if (left.length && !left.hasClass("activated") && !left.hasClass("blocked") && left.attr("id").includes("form"))
          left.addClass("neighbor").addClass("merge-left");

        const right = graph.getNextForm();
        if (right.length && !right.hasClass("activated") && !right.hasClass("blocked") && right.attr("id").includes("form"))
          right.addClass("neighbor").addClass("merge-right");

        graph.lock($(".activated"));
      }
      gui.status.refresh();
      break;
      

    case (KEYS.C):

      $(".form").removeClass("merge-source merge-left merge-right");

      if ($(".combine-source").length) {

        $(".neighbor").removeClass("combine-left combine-right neighbor");

        $(".combine-source").removeClass("combine-source").addClass("activated");

        graph.lock($(".activated"));

      } else if ($(".activated").length) {

        if (!$(".activated").attr("id").includes("form"))
          break;

        $(".activated").addClass("combine-source");

        $(".neighbor").removeClass("neighbor merge-source merge-left merge-right")

        const left = graph.getPrevForm();
        if (left.length && !left.hasClass("activated") && !left.hasClass("blocked") && left.attr("id").includes("form"))
          left.addClass("neighbor combine-left");

        const right = graph.getNextForm();
        if (right.length && !right.hasClass("activated") && !right.hasClass("blocked") && right.attr("id").includes("form"))
          right.addClass("neighbor combine-right");

        graph.lock($(".activated"));
      }
      gui.status.refresh();
      break;

    case (KEYS.LEFT):

      // avoid panning the window
      if (event.preventDefault)
        event.preventDefault();

      if ($(".merge-left").length) {
        const tar = $(".merge-left");
        tar.click();

      } else if ($(".combine-left").length) {
        const tar = $(".combine-left");
        tar.click();
      }
      break;

    case (KEYS.RIGHT):

      // avoid panning the window
      if (event.preventDefault)
        event.preventDefault();

      if ($(".merge-right").length) {
        const tar = $(".merge-right");
        tar.click();

      } else if ($(".combine-right").length) {
        const tar = $(".combine-right");
        tar.click();
      }
      break;

    case (KEYS.EQUALS):
    case (KEYS.EQUALS_):
      if (event.shiftKey) {
        graph.grapher.zoomIn();
      } else {
        graph.grapher.zoomIn();
      }
      break;

    case (KEYS.MINUS):
    case (KEYS.MINUS_):
      if (event.shiftKey) {
        graph.grapher.zoomOut();
      } else {
        graph.grapher.zoomOut();
      }
      break;

      case (KEYS[0]):
        graph.grapher.resetZoom();
        break;

    case (KEYS.ENTER):
      graph.intercepted = false;
      graph.clear();
      break;

    case (KEYS.ESC):
      graph.intercepted = false;
      graph.clear();
      break;
    }
}

export function keydown(app, event) {

  pressed.add(event.which);
  if (event.which === KEYS.TAB)
    event.preventDefault();

  if (event.which === KEYS.ENTER && $(":focus").is("td"))
    event.preventDefault();
}

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
    log.debug(`onEnter(): incrementing line[${cursorLine}]: "${lines[cursorLine]}", cursor[${cursor}]:
"${sentence[cursor]}"`);
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

gui.refresh();
}

*/
