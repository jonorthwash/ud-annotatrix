'use strict';

const $ = require('jquery');
const validate = require('./validate');

function build() {
  $('#table-data tbody').empty();

  manager.current.forEach((token, i) => {
    let tr = $('<tr>').attr('id', `table_${i}`);

    $.each(
      ['id', 'form', 'lemma', 'upostag', 'xpostag',
        'feats', 'head', 'deprel', 'deps', 'misc'], (j, field) => {

      const value = token.analysis[field];

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
        .attr('row-id', i)
        .attr('col-id', j)
        .attr('tok-id', token.analysis.id)
        .attr('field', field)
        .attr('name', j === 0 ? 'index' : 'content')
        .css('visibility', gui.column_visible(j) ? 'visible' : 'hidden')
        .blur(edit)
        .keyup((event) => {
          if (event.which === gui.keys.ESC) {
            $(event.target).blur();
          } else if (event.which === gui.keys.ENTER) {
            gui.onEnter(event);
          }
        });

      inputSpan.text(value);

      if (valid.err) {
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
  });
}

function edit(event) {

  const target = $(event.target),
    id = target.attr('tok-id'),
    ana = manager.current.getById(id),
    field = target.attr('field'),
    value = target.text();

  ana[field] = value;
  gui.update();
}

module.exports = {
  build,
  edit
};
