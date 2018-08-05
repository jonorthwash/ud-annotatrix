'use strict';

const $ = require('jquery');
const _ = require('underscore');
const utils = require('../utils');

class Table {
  constructor(gui) {

    this.gui = gui;
    this.col = 1;
    this.row = 0;

  }

  bind() {

    const self = this;

    $('.thead-default th').click(e => {

      const col = $(event.target).attr('col-id'),
        columns = self.gui.config.column_visibilities;

      columns[col] = !columns[col];
      self.refresh();
    });
  }

  refresh() {

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
          : token[field];

        let valid = {},
          td = $('<td>'),
          inputSpan = $('<span>').attr('name', 'input'),
          errorSpan = $('<span>').attr('name', 'error');

        if (value !== '_') {
          if (j === 3)
            valid = validate.is_upos(value);
          if (j === 7)
            valid = validate.is_udeprel(value);
        }

        td.prop('contenteditable', true)
          .addClass('conllu-table')
          .attr('tabindex', '-1')
          .attr('row-id', i)
          .attr('col-id', j)
          .attr('num', 10*i + j)
          .attr('uuid', token.uuid)
          .attr('field', field)
          .attr('original-value', value)
          .attr('name', j === 0 ? 'index' : 'content')
          .css('visibility', gui.column_visible(j) ? 'visible' : 'hidden')
          .blur(e => {

            const target = $(event.target),
              uuid = target.attr('uuid'),
              token = this.gui.app.corpus.current.query(t => t.uuid === uuid)[0],
              field = target.attr('field'),
              originalValue = target.attr('original-value') || '',
              value = target.text() || '';

            if (value === originalValue)
              return;

            token[field] = value;
            this.gui.app.save();

          });

        inputSpan.text(value);

        if (!valid) {
          log.warn(`buildTable(): error parsing cell (err:"${valid.err}", value:"${value}")`);
          /*document.l10n.formatValue(valid.err, valid.data).then(title => {
            errorSpan.addClass('fa fa-exclamation-triangle')
              .addClass('parse-error')
              .attr('aria-hidden', 'true')
              .attr('title', title);
          });*/
        }
        tr.append( td.append(inputSpan).append(errorSpan) );
      });

      $('#table-data tbody').append(tr);
      i++;
    });

    $('#table-data th').removeClass('column-hidden');
    this.gui.config.column_visibilities.forEach((vis, i) => {

      const column = $(`#table-data [colid="${i}"]`);

      column
        .find('th')
        .addClass(vis ? 'fa-angle-double-left' : 'fa-angle-double-right');

      column
        .find('td')
        .css('visibility', vis ? 'visible' : 'hidden');
    });
  }
}

module.exports = Table;
