import * as $ from "jquery";

import * as nx from "../../notatrix";
import {forEachFormat} from "../utils/funcs";
import {_gui as config} from "./config";
import type {GUI} from ".";

export class Textarea {
  private gui: GUI;
  constructor(gui: GUI) { this.gui = gui; }

  bind() {

    const self = this;

    // textarea resizing
    $("#text-data").mouseup(e => {
      config.textarea_height = $(e.target).css("height");
      self.gui.app.graph.draw();
      self.gui.save();
    });
  }

  refresh() {

    const corpus = this.gui.app.corpus;

    // show the data
    if (config.is_textarea_visible) {

      if (corpus.format !== "CoNLL-U")
        config.is_table_visible = false;

      if (config.is_table_visible) {

        $("#table-data").show();
        $("#text-data").hide();
        this.gui.table.rebuild();

      } else {

        $("#table-data").hide();
        $("#text-data").val(corpus.textdata).css("height", config.textarea_height).show();
      }
    }

    // show errors and warnings
    $(".format-tab").removeClass("disabled").find(".tab-warning, .tab-error").hide();
    forEachFormat(format => {
      if (corpus.current.isParsed) {

        if (corpus.format === format) {

          const loss = corpus.current.to(format).loss;
          if (loss.length)
            $(`.format-tab[name="${format}"] .tab-warning`).show().attr("title", `Unable to encode ${loss.join(", ")}`);

        } else {
          try {

            corpus.current.to(format);

          } catch (e) {

            console.log("error", format);
            $(`.format-tab[name="${format}"]`).addClass("disabled").find(`.tab-error`).show().attr("title", e.message);
          }
        }
      } else {

        const s = new nx.Sentence(corpus.textdata, {interpretAs: format});
        if (s.Error)
          $(`.format-tab[name="${format}"]`)
              .addClass("disabled")
              .find(`.tab-error`)
              .show()
              .attr("title", s.Error.message);
      }
    });
  }
}
