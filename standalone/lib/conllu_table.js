"use strict"

var TABLE_VIEW = false;
var TABLE_COLUMNS_HEADERS = {"ID": 0, "FORM": 1, "LEMMA": 2, "UPOSTAG": 3, "XPOSTAG": 4, "FEATS": 5, "HEAD": 6, "DEPREL": 7, "DEPS": 8, "MISC": 9};
var TABLE_COLUMNS_VISIBILITY = [true, true, true, true, true, true, true, true, true, true];

var tableRowsDefault = 20

function calculateRows() {
    var windowHeight = $(window).height();
    var graphDivHeight = $('.controls').outerHeight();
    var controlsDivHeight = $('.row').outerHeight();
    var labelHeight = $('#filemanagement').outerHeight();
    var fontSize = $('#indata').css('font-size');
    var lineHeight = Math.floor(parseInt(fontSize.replace('px','')) * 1.5);
    var remainingSpace = windowHeight - graphDivHeight - controlsDivHeight - labelHeight - 65;
    tableRowsDefault = parseInt(remainingSpace/lineHeight);
}

function fitTable() {
    calculateRows();
    /* If there're less lines in conllu than the default number of rows
    in the table, fit the number of rows to the number of lines. */
    var curSentence = $("#indata").val();
    if (curSentence.split("\n").length < tableRowsDefault) {
        $("#indata").attr("rows", curSentence.split("\n").length + 1);
    } else {
        $("#indata").attr("rows", tableRowsDefault);
    }
}


function tableEditCell(loc) {
    // Yes I'm sorry I don't know Jquery, I'm sure this could be done much better.
    loc = loc.trim();
    var table = document.getElementById("indataTable");
    var cell = document.getElementById(loc).innerHTML;
    console.log("tableEditCell() " + loc + " " + cell);

    // Update the CoNLL-U and set the value in the textbox

    var conllu = "";
    var r;
    var c;
    var thisCell;

    for (r = 1; r < table.rows.length; r += 1) {
        for (c = 0; c < table.rows[r].cells.length; c += 1) {
            thisCell = table.rows[r].cells[c].childNodes[0].innerHTML;
            if (thisCell.trim() === "") {
                thisCell = "_";
            }
            thisCell = thisCell.replace(/<br>/g, ""); // Get rid of extra spaces
//            console.log("@" + table.rows[r].cells[c].innerHTML + " // " + thisCell);
            if (c > 0) {
                conllu = conllu + "\t" + thisCell;
            } else {
                conllu = conllu + thisCell;
            }
        }
        conllu = conllu + "\n";
    }
    console.log("!@", conllu);
    $("#indata").val(conllu);

    drawTree();
}

function toggleTableView() {
    // This function toggles the table view
    $("#tableViewButton").toggleClass("fa-code", "fa-table");
    $("#indata").toggle();
    $("#indataTable").toggle();
    if (TABLE_VIEW) {
        TABLE_VIEW = false;
    } else {
        TABLE_VIEW = true;
    }
}

function updateTable() {
    // Update the data in the table from the data in the textarea
    $("#indataTable tbody").empty();
    var conlluLines = $("#indata").val().split("\n");
    var row = 0;
    var col;

    conlluLines.forEach(function (line) {
        if (line.trim() === "") {
            return;
        }
        //console.log(line);
        if (line[0] === "#") {
            $("#indataTable tbody").append("<tr style='display:none' id='table_'" + row + "><td colspan='10'><span>" + line + "</span></td></tr>");
        } else if (line.split("\t").length !== 10) {
            // console.log("WEIRDNESS:", line.split("\t").length ,line);
            $("#indataTable tbody").append("<tr style='display:none' id='table_'" + row + "><td colspan='10'><span>" + line + "</span></td></tr>");
        } else {
            var lineRow = $("<tr>");
            var cells = line.split("\t");
            var valid;
            var loc;
            var td;
            var span0;
            var span1;
            for (col = 0; col < 10; col += 1) {
                valid = [true, "", {}];
                loc = "table_" + row + ":" + col;
                if (cells[col].trim() === "") {
                    cells[col] = "_";
                }
                if (cells[col] !== "_") {
                    if (col === 3) {
                        valid = is_upos(cells[col]);
                    }
                    if (col === 7) {
                        valid = is_udeprel(cells[col]);
                    }
                }

                td = $("<td>");
                span0 = $("<span data-value='" + cells[col] + "'onBlur='updateTable();' onKeyUp='tableEditCell(\"" + loc + "\");' id='" + loc + "' contenteditable>" + cells[col] + "</span>");
                td.append(span0);
                if (!valid[0]) {
                    span1 = $("<span><i class='fa fa-exclamation-triangle' aria-hidden='true'></i></span>");
                    document.l10n.formatValue(valid[1], valid[2]).then(function (t) {
                        span1.attr("title", t);
                    });
                    td.append(span1);
                }
                lineRow.append(td);
            }
            $("#indataTable tbody").append(lineRow);
        }
        row += 1;
    });

    // Make sure hidden columns stay hidden
    // This could probably go in the for loop above
    for (col = 0; col < 10; col += 1) {
        if (!TABLE_COLUMNS_VISIBILITY[col]) {
            $("[id^=table_][id$=" + col + "]").css("display", "none");
        }
    }
// Sushain's original, more beautiful code:
//    $("#indataTable tbody").append(
//        $("#indata").val().split("\n")
//            .filter(line => line.length && !line.startsWith("#"))
//            .map(rowText => $("<tr>").append(
//                rowText.split("\t").map(cellText => $("<td>").text(cellText))
//            ))
//    );
}

function toggleTableColumn(col) {
   // Toggle the visibility of a table column. It only hides the values in the cells,
   // not the column header.
   // @col = the column that was clicked

   // the HTML id of the table cell is #table_<ROW>:<COLUMN>, the hash maps
   // from column ID to column offset
    var colId = TABLE_COLUMNS_HEADERS[col];
    var button = $("#tableCol_" + col).text();  // The text (e.g. dot)

    console.log("toggleTableColumn() " + " " + col + " " + button);
   // $("#tableCol_" + col).empty(); // Empty the text

    $("#tableCol_" + col + " i").toggleClass("fa-angle-double-right", "fa-angle-double-left");
    $("#tableHead_" + col).toggle();
    $("[id^=table_][id$=" + colId + "]").toggle();
    TABLE_COLUMNS_VISIBILITY[colId] = !TABLE_COLUMNS_VISIBILITY[colId];

    if (button === "⚪") {  // If the column is currently hidden, make it visible
     //$("#tableCol_" + col).append("⚫");
     //$("#tableHead_" + col).css("display","inline-block");
     //$("[id^=table_][id$=" + colId+"]").css("display","inline-block");
     //TABLE_COLUMNS_VISIBILITY[colId] = true;
    } else { // If the column is visible make it hidden
     //$("#tableCol_" + col).append("⚪");
     //$("#tableHead_" + col).css("display","none");
     //$("[id^=table_][id$=" + colId+"]").css("display","none");
     //TABLE_COLUMNS_VISIBILITY[colId] = false;
    }

   // TODO: Maybe use greying out of the headers in addition to/instead of
   // the filled/empty dots to indicate hidden or not
}

function toggleCodeWindow() {
    $("#codeVisibleButton").toggleClass("fa-chevron-down", "fa-chevron-up");
    //console.log("toggleCodeWindow()");
    $(".indataarea").toggle();
    $("#tabBox").toggle();
    $("#viewButton").toggle();
    if(!VERT_ALIGNMENT) {
        $("#cy").css("height", $(window).height()-$(".inarea").height()-80);
    }
}
