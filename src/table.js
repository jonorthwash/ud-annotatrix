'use strict';

const $ = require('jquery');

function build() {
  $('#table-data tbody').empty();

  $.each($('#text-data').val().split('\n'), (i, line) => {
    log.debug(`buildTable() line: ${line}`);
    if (line.trim() === '')
      return;

    const cells = line.split('\t');
    let tr = $('<tr>').attr('id', `table_${i}`);

    if (line.startsWith('#')) {

      tr.addClass('comment').text(line);

    } else if (cells.length !== 10) {

      log.warn(`buildTable(): CoNLL-U should have 10 columns`);
      tr.addClass('wrong-shape').text(line);

    } else {

      $.each(cells, (j, cell) => {
        let valid = {},
          td = $('<td>'),
          inputSpan = $('<span>').attr('name', 'input'),
          errorSpan = $('<span>').attr('name', 'error');

        if (cell.trim() === '')
          cell = '_';

        if (cell !== '_') {
          if (j === 3)
            valid = is_upos(cell);
          if (j === 7)
            valid = is_udeprel(cell);
        }

        td.prop('contenteditable', true)
          .attr('row-id', i)
          .attr('col-id', j)
          .attr('name', j === 0 ? 'index' : 'content')
          .css('visibility', a.column_visible(j) ? 'visible' : 'hidden')
          .blur(onEditTable)
          .keyup((event) => {
            if (event.which === KEYS.ESC) {
              $(event.target).blur();
            } else if (event.which === KEYS.ENTER) {
              onEnter(event);
            }
          });

        inputSpan.text(cell);

        if (valid.err) {
          log.warn(`buildTable(): error parsing cell (err:"${valid.err}", cell:"${cell}")`);
          document.l10n.formatValue(valid.err, valid.data).then(title => {
            errorSpan.addClass('fa fa-exclamation-triangle')
              .addClass('parse-error')
              .attr('aria-hidden', 'true')
              .attr('title', title);
          });
        }
        tr.append( td.append(inputSpan).append(errorSpan) );
      });
    }

    $('#table-data tbody').append(tr);
  });
}

function edit(event) {

  // join the rows on \n and the columns on \t
  let conllu = Array.from($('#table-data tr').map((i, tr) => {
    if ($(tr).hasClass('comment') || $(tr).hasClass('wrong-shape')) {

      return $(tr).text();

    } else {

      return Array.from($(tr).find('td').map((j, td) => {
        let content = $(td).find('[name=input]')
          .text().replace(/<br>/g, '').trim();
        return content.length ? content : '_';

      })).join('\t');
    }
  })).join('\n');

  // save it to the textarea and parse it
  manager.parse(conllu);
}

module.exports = {
  build,
  edit
};
