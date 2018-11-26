'use strict';

const $ = require('jquery');
const _ = require('underscore');
const utils = require('../utils');

class Table {
  constructor(gui) {

    this.gui = gui;
    this.col = 1;
    this.cols = 10;
    this.row = 0;
    this.rows = 0;

  }

  get editing() {
    return $('#table-data .editing').length;
  }

  toConllu() {

    let rows = [];
    for (let i=0; i<=this.rows; i++) {

      let row = [];
      for (let j=0; j<10; j++) {

        row.push($(`[row-id="${i}"][col-id="${j}"]`).text() || '_');

      }

      rows.push(row.join('\t'));
    }

    return rows.join('\n');
  }

  goRight(wrap) {

    if (this.col === this.cols - 1) {
      if (!wrap)
        return;

      this.col = 0;
      this.row += 1;
      if (this.row > this.rows)
        this.row = 0;
    }

    this.col += 1;

    $('#table-data .editing').blur();
    $('.focused').removeClass('focused')

    const td = $(`[col-id="${this.col}"][row-id="${this.row}"]`)
      .addClass('focused')
      .prop('contenteditable', false)
      .focus();
  }

  goLeft(wrap) {

    if (this.col === 1) {
      if (!wrap)
        return;

      this.col = this.cols;
      this.row -= 1;
      if (this.row < 0)
        this.row = this.rows;
    }

    this.col -= 1;

    $('#table-data .editing').blur();
    $('.focused').removeClass('focused')

    const td = $(`[col-id="${this.col}"][row-id="${this.row}"]`)
      .addClass('focused')
      .prop('contenteditable', false)
      .focus();
  }

  goUp() {

    if (this.row === 0)
      return;

    this.row -= 1;

    $('#table-data .editing').blur();
    $('.focused').removeClass('focused')

    const td = $(`[col-id="${this.col}"][row-id="${this.row}"]`)
      .addClass('focused')
      .prop('contenteditable', false)
      .focus();
  }

  goDown() {

    if (this.row === this.rows)
      return;

    this.row += 1;

    $('#table-data .editing').blur();
    $('.focused').removeClass('focused')

    const td = $(`[col-id="${this.col}"][row-id="${this.row}"]`)
      .addClass('focused')
      .prop('contenteditable', false)
      .focus();
  }

  toggleEditing(toggle) {

    const td = $(`[col-id="${this.col}"][row-id="${this.row}"]`)
      .toggleClass('editing', toggle);

    if (td.hasClass('editing')) {

      td
        .prop('contenteditable', true)
        .focus();

    } else {

      td.blur()
      $(`[col-id="${this.col}"][row-id="${this.row}"]`)
        .addClass('focused')
        .focus();

    }

    console.log(td.prop('contenteditable'))
  }

  bind() {

    const self = this;

    $('#table-data th').click(e => {

      const target = $(e.target),
        col = target.attr('col-id'),
        columns = self.gui.config.column_visibilities;

      if (!target.hasClass('hideable'))
        return;

      columns[col] = !columns[col];
      self.refresh();
    });

    $('#table-data td')
      .click(e => {

        const target = $(e.target);
        self.row = parseInt(target.attr('row-id'));
        self.col = parseInt(target.attr('col-id'));


        $('.focused')
          .removeClass('focused')
          .blur();
        target
          .addClass('focused');

        self.toggleEditing(true);

      })
      .blur(e => {

        const target = $(e.target),
          uuid = target.attr('uuid'),
          token = self.gui.app.corpus.current.query(t => t.uuid === uuid)[0],
          field = target.attr('field'),
          originalValue = target.attr('original-value') || '',
          value = target.text() || '';

        target.prop('contenteditable', false)
          .removeClass('editing')
          .removeClass('focused');

        if (value === originalValue)
          return;

        self.gui.app.corpus.parse(self.toConllu());
      });

  }

  refresh() {

    $('#table-data th')
      .removeClass('column-show column-hide')
      .find('.fa')
        .removeClass('fa-angle-double-left fa-angle-double-right');

    console.log('refresh table')
    this.gui.config.column_visibilities.forEach((vis, i) => {

      const column = $(`#table-data [col-id="${i}"]`);


      console.log(i, vis, column)
      column
        .filter('th')
        .addClass(vis ? 'column-show' : 'column-hide')
        .find('.fa')
          .addClass(vis ? 'fa-angle-double-left' : 'fa-angle-double-right');

      column
        .filter('td')
        .removeClass('column-show column-hide')
        .addClass(vis ? 'column-show' : 'column-hide');
    });

  }

  rebuild() {

    $('#table-data tbody').empty();

    let i = 0;
    this.gui.app.corpus.current.iterate(token => {
      let tr = $('<tr>')
        .attr('tabindex', '-1')
        .attr('id', `table_${i}`);

      ['id', 'form', 'lemma', 'upostag', 'xpostag',
        'feats', 'head', 'deprel', 'deps', 'misc'].forEach((field, j) => {

        const value = field === 'id'
          ? token.indices.conllu
          : field === 'head' && token.heads._items.length
            ? token.heads._items[0].token.indices.conllu
            : field === 'deprel' && token.heads._items.length
              ? token.heads._items[0].deprel
              : field === 'deps' && token.heads._items.length
                ? function () {
                  var val = '';
                  token.mapHeads((head, i) => {
                    if (i != 0)
                      val += '|';
                    val += head.token.indices.conllu + ':' + head.deprel
                    })
                    return val;
                  }
                : token[field];

        let valid = {},
          td = $('<td>'),
          inputSpan = $('<span>').attr('name', 'input'),
          errorSpan = $('<span>').attr('name', 'error');

        if (value !== '_') {
          if (j === 3)
            valid = utils.validate.is_upos(value);
          if (j === 7)
            valid = utils.validate.is_udeprel(value);
        }

        const visibilities = this.gui.config.column_visibilities;

        td.addClass('conllu-table')
          .attr('tabindex', '-1')
          .attr('row-id', i)
          .attr('col-id', j)
          .attr('num', 10*i + j)
          .attr('uuid', token.uuid)
          .attr('field', field)
          .attr('original-value', value)
          .attr('name', j === 0 ? 'index' : 'content')
          .css('visibility', visibilities[j] ? 'visible' : 'hidden');

        inputSpan.text(value);

        /*
        if (!valid)
          document.l10n.formatValue(valid.err, valid.data).then(title => {
            errorSpan.addClass('fa fa-exclamation-triangle')
              .addClass('parse-error')
              .attr('aria-hidden', 'true')
              .attr('title', title);
          });
        */

        tr.append( td.append(inputSpan).append(errorSpan) );
      });

      $('#table-data tbody').append(tr);
      this.rows = i;
      i++;
    });

    this.refresh();
    this.bind();
  }
}

module.exports = Table;
