'use strict';

const $ = require('jquery');
const validate = require('./validate');

function build() {
  $('#table-data tbody').empty();

  let i = 0;
  manager.current._nx.iterate(token => {
    let tr = $('<tr>')
      .attr('tabindex', '-1')
      .attr('id', `table_${i}`);

    $.each(
      ['id', 'form', 'lemma', 'upostag', 'xpostag',
        'feats', 'head', 'deprel', 'deps', 'misc'], (j, field) => {

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
        .blur(edit);

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
}

function edit(event) {

  const target = $(event.target),
    uuid = target.attr('uuid'),
    token = manager.current._nx.query(t => t.uuid === uuid)[0],
    field = target.attr('field'),
    originalValue = target.attr('original-value') || '',
    value = target.text() || '';

  if (value === originalValue)
    return;

  token[field] = value;
  manager.onChange();
}

module.exports = {
  build,
  edit
};
