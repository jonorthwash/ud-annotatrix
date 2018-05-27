'use strict'

var TABLE_COLUMNS_VISIBILITY = new Array(10).fill(true),
    IS_TABLE_VIEW = false,
    DEFAULT_NUM_TABLE_ROWS = 20





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




















function calculateRows() {
    log.critical('called calculateRows()');

    const windowHeight = $(window).height(),
        graphDivHeight = $('.controls').outerHeight(),
        controlsDivHeight = $('.row').outerHeight(),
        remainingSpace = windowHeight - graphDivHeight - controlsDivHeight - 65,
        fontSize = $('#text-data').css('font-size'),
        lineHeight = Math.floor(parseInt(fontSize.replace('px','')) * 1.5);

    DEFAULT_NUM_TABLE_ROWS = parseInt(remainingSpace/lineHeight);
}

function fitTable() {
    log.critical('called fitTable()');

    calculateRows();

    /* If there're less lines in conllu than the default number of rows
    in the table, fit the number of rows to the number of lines. */
    const currentRows = $('#text-data').val().split('\n').length;
    const numRows = (currentRows < DEFAULT_NUM_TABLE_ROWS
        ? currentRows + 1 : DEFAULT_NUM_TABLE_ROWS);

    $('#text-data').attr('rows', numRows);
}


function tableEditCell(loc) {
}

function updateTable() {
    log.debug('called updateTable()');

    // Update the data in the table from the data in the textarea
    $('#table-data tbody').empty();
    $.each($('#text-data').val().split('\n'), (i, line) => {
        log.debug(`updateTable() line: ${line}`);
        if (line.trim() === '')
            return

        if (line[0] === '#') {
            $('#table-data tbody').append(
                `<tr style="display:none;" id="table_${i}">
                    <td colspan="10"><span>${line}</span></td>
                </tr>`);
        } else if (line.split('\t').length !== 10) {
            log.debug(`updateTable() weirdness!`);
            $('#table-data tbody').append(
                `<tr style="display:none;" id="table_${i}">
                    <td colspan="10"><span>${line}</span></td>
                </tr>`);
        } else {

            // create a new <tr> node
            let tr = $('<tr>').attr('id', `table_${i}`),
                cells = line.split('\t');

            for (let j=0; j < 10; j++) {
                let valid = [true, '', {}],
                    loc = `table_${i}_${j}`;

                if (cells[j].trim() === '')
                    cells[j] = '_';

                if (cells[j] !== '_') {
                    if (j === 3)
                        valid = is_upos(cells[j]);
                    if (j === 7)
                        valid = is_udeprel(cells[j]);
                }

                let td = $('<td>').append( $('<span>')
                    .text(cells[j])
                    .attr('id', loc)
                    .attr('data-value', cells[j])
                    .attr('tabindex', '-1')
                    .prop('contenteditable', true)
                    .blur(updateTable)
                    .keyup(() => { tableEditCell(loc); }) );

                if (!valid[0]) {
                    document.l10n.formatValue(valid[1], valid[2]).then( (t) => {
                      td.append( $('<span>').append('<i>')
                          .addClass('fa fa-exclamation-triangle')
                          .attr('aria-hidden', 'true')
                          .attr('title', t) );
                    });
                }
                tr.append(td);

                // Make sure hidden columns stay hidden
                if (!TABLE_COLUMNS_VISIBILITY[j])
                    $(`[id^=table_][id$=${j}]`).css('display', 'none');
            }

            $('#table-data tbody').append(tr);
        }
    });

    /* Sushain's original, more beautiful code:
    $('#table-data tbody').append(
        $('#text-data').val().split('\n')
            .filter(line => line.length && !line.startsWith('#'))
            .map(rowText => $('<tr>').append(
                rowText.split('\t').map(cellText => $('<td>').text(cellText))
            ));
    ); */
}


function toggleCodeWindow() {
    log.debug(`called toggleCodeWindow()`);

    $('#btnViewText i').toggleClass('fa-chevron-down', 'fa-chevron-up');
    $('#data').toggle();
    $('#tabBox').toggle();
    $('#btnViewTable').closest('div').toggle();
    if (!IS_VERTICAL)
        $('#cy').css('height', $(window).height()-$('.inarea').height()-80);
}
