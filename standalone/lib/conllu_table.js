'use strict'

function buildTable() {
    log.debug(`called buildTable()`);

    $('#table-data tbody').empty();
    $.each($('#text-data').val().split('\n'), (i, line) => {
        log.debug(`updateTable() line: ${line}`);
        if (line.trim() === '')
            return

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
                    span = $('<span>');

                if (cell.trim() === '')
                    cell = '_';

                if (cell !== '_') {
                    if (j === 3)
                        valid = is_upos(cell);
                    if (j === 7)
                        valid = is_udeprel(cell);
                }

                span.text(cell)
                    .prop('contenteditable', true)
                    .attr('row-id', i)
                    .attr('col-id', j)
                    .attr('data-value', cell)
                    .css('display', _.column_visible(j) ? 'inline' : 'none')
                    .keyup(onEditTable);

                if (valid.err) {
                    log.warn(`buildTable(): error parsing cell (err:"${valid.err}", cell:"${cell}")`);
                    span.addClass('parse-error');
                    document.l10n.formatValue(valid.err, valid.data).then( (title) => {
                        span.addClass('fa fa-exclamation-triangle')
                            .attr('aria-hidden', 'true')
                            .attr('title', title);
                    });
                }
                tr.append( $('<td>').append(span) );
            });
        }
        $('#table-data tbody').append(tr);
    });
}

function onEditTable(event) {
    log.debug(`called onEditTable(key: ${event.which})`);

    switch (event.which) {
        case (KEYS.ESC):
            this.blur();
            break;
        case (KEYS.ENTER):
            onEnter(event);
            break;
        default:

            // join the rows on \n and the columns on \t
            let conllu = Array.from($('#table-data tr').map((i, tr) => {
                if ($(tr).hasClass('comment') || $(tr).hasClass('wrong-shape')) {

                    return $(tr).text();

                } else {

                    return Array.from($(tr).find('td').map((j, td) => {
                        let content = $(td).text().replace(/<br>/g, '').trim();
                        return content.length ? content : '_';

                    })).join('\t');
                }
            })).join('\n');

            // save it to the textarea and parse it
            $('#text-data').val(conllu);
            parseTextData();
    }
}

function toggleTableView(event, force) { // force param used for testing
    log.debug('called toggleTableView()');

    if (_.format() !== 'CoNLL-U') {
        log.warn(`toggleTableView(): table view not supported for ${_.format()}`);
        _.is_table_view(false);
    } else {
        _.is_table_view(force === undefined ? !_.is_table_view() : force);
    }

    updateTabs();
}

function toggleTableColumn(event) {
    log.debug(`called toggleTableColumn(col-id: ${$(event.target).attr('col-id')})`);

    const target = $(event.target), col = target.attr('col-id');
    if (target.find('i').length === 0) {
        log.warn(`toggleTableColumn(): `)
    }

    _.column_visible(col, !_.column_visible(col));
    target.toggleClass('column-hidden')
        .find('i').toggleClass('fa-angle-double-right', 'fa-angle-double-left');
    $(`td [col-id=${col}]`).toggle();
}
