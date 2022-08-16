import * as _ from "underscore";
import * as $ from "jquery";

import {KEYS} from "./keyboard";
import type {GUI} from ".";

function flashDropdown(name: string, inputName?: string) {
  const dropdown = $(`li[name="${name}"] .label-hidden`);

  // show dropdown part immediately
  dropdown.css('display', 'flex');

  // wait 0.5 secs to return to standard dropdown behavior
  setTimeout(() => dropdown.css('display', ''), 500);

  if (inputName) {
    dropdown.find(`input[name="${inputName}"]`).focus();
  }
}

export class Labeler {
  private gui: GUI;
  constructor(gui: GUI) { this.gui = gui; }

  get current() { return this.gui.app.corpus.current; }

  get labeler() { return this.gui.app.corpus._corpus._labeler; }

  bind() {

    const self = this;

    $("#label-input").keyup(e => {
      if (e.which === KEYS.ENTER) {

        if (!self.current)
          return;

        const target = $(e.target);
        const names = (target.val() as string).trim().split(/\s+/);

        names.forEach(name => {
          if (self.labeler.get(name))
            return;

          self.gui.status.normal(`add-label-${name}`);
          self.labeler.addLabel(name, [self.current])
        });

        $("#label-input").val("");
        self.refresh();
      }
    });

    $("#label-clear-filter").click(e => {
      self.labeler._filter = new Set();
      self.gui.refresh();
    });

    $("#labels-horiz .label-text").click(e => {
      const target = $(e.target), name = target.closest("li").attr("name");

      if (self.labeler.sentenceHasLabel(self.current, name)) {

        self.gui.status.normal(`add-label-${name}`);
        self.labeler.addLabel(name, [self.current]);

      } else {

        self.gui.status.normal(`remove-label-${name}`);
        self.labeler.removeLabel(name, [self.current]);
      }

      self.gui.refresh();
      flashDropdown(name);
    });

    $("#labels-horiz .refresh-color").click(e => {
      const target = $(e.target), name = target.closest("li").attr("name");

      // TODO: This API doesn't exist anymore...
      (self.labeler.get(name)._label as any).changeColor();

      self.refresh();
      flashDropdown(name);
    });

    $("#labels-horiz input[name=\"label-name\"]").keyup(e => {
      if (e.which === KEYS.ENTER) {

        const target = $(e.target);
        const oldName = target.closest("li").attr("name");
        const newName = target.val() as string;

        self.labeler.changeLabelName(oldName, newName);
        (self.gui as any).update();
        flashDropdown(newName, "label-name");
      }
    });

    $("#labels-horiz input[name=\"label-desc\"]").keyup(e => {
      if (e.which === KEYS.ENTER) {

        const target = $(e.target);
        const name = target.closest("li").attr("name");
        const desc = target.val() as string;

        self.labeler.changeLabelDesc(name, desc);
        (self.gui as any).update();
        flashDropdown(name, "label-desc");
      }
    });

    $("#labels-horiz input[name=\"label-color\"]").keyup(e => {
      if (e.which === KEYS.ENTER) {

        const target = $(e.target);
        const name = target.closest("li").attr("name");
        const color = target.val() as string;

        self.labeler.changeLabelColor(name, color);
        (self.gui as any).update();
        flashDropdown(name, "label-color");
      }
    });

    $("#labels-horiz input[name=\"filtering\"]").click(e => {
      const target = $(e.target);
      const name = target.closest("li").attr("name");

      if (self.labeler._filter.has(name)) {
        self.labeler.removeFromFilter(name);
      } else {
        self.labeler.addToFilter(name);
      }

      self.gui.refresh();
      flashDropdown(name);
    });

    $("#labels-horiz .delete-button").click(e => {
      const target = $(e.target), name = target.closest("li").attr("name");

      const response = confirm(`Are you sure you want to delete the label "${name}"?`);
      if (!response)
        return;

      self.gui.status.normal(`remove-label-${name}`);
      self.labeler.removeLabel(name);

      self.gui.refresh();
      flashDropdown(name);
    });
  }

  refresh() {

    const config = this.gui.config;

    $("#label-container").css("display", config.is_label_bar_visible && config.is_textarea_visible ? "flex" : "none");

    $("#label-clear-filter .label-text").toggleClass("disabled", !!this.labeler._filter.size);

    $(".label.horiz").detach();
    _.each(this.labeler._labels, labelWithSentences => {
      const label = labelWithSentences._label;

      $(`#labels-horiz`)
          .append(
              $("<li>")
                  .attr("name", label.name)
                  .addClass("label horiz")
                  .addClass(this.labeler.sentenceHasLabel(this.current, label.name) ? "in-comments" : "not-in-comments")
                  .addClass(this.labeler.sentenceInFilter(this.current) ? "filtering" : "not-filtering")
                  .append($("<div>")
                              .addClass("label-text")
                              .text(label.name)
                              .css("background-color", "#" + label.bColor)
                              .css("color", "#" + label.tColor))
                  .append(
                      $("<div>")
                          .addClass("label-hidden")
                          .append(
                              $("<div>")
                                  .addClass("label-hidden-group")
                                  .append($("<div>")
                                              .addClass("label-hidden-item")
                                              .append($("<strong>").text("Name"))
                                              .append($("<input>").attr("name", "label-name").val(label.name)))
                                  .append($("<div>")
                                              .addClass("label-hidden-item")
                                              .append($("<strong>").text("Description"))
                                              .append($("<input>").attr("name", "label-desc").val(label.desc)))
                                  .append($("<div>")
                                              .addClass("label-hidden-item")
                                              .append($("<strong>").text("Color"))
                                              .append($("<div>")
                                                          .addClass("label-hidden-item-inner")
                                                          .append($("<span>")
                                                                      .addClass("hex-color-group")
                                                                      .text("#")
                                                                      .append($("<input>")
                                                                                  .attr("name", "label-color")
                                                                                  .attr("pattern", "[A-Fa-f\\d]{6}")
                                                                                  .val(label.bColor)))
                                                          .append($("<button>")
                                                                      .attr("type", "button")
                                                                      .addClass("btn btn-secondary refresh-color")
                                                                      .css("background-color", "#" + label.bColor)
                                                                      .append($("<i>").addClass("fa fa-refresh"))))))
                          .append($("<hr>"))
                          .append(
                              $("<div>")
                                  .addClass("label-hidden-group")
                                  .append($("<div>")
                                              .addClass("label-hidden-item")
                                              .append($("<div>")
                                                          .addClass("label-hidden-item-inner")
                                                          .append($("<input>")
                                                                      .attr("name", "filtering")
                                                                      .attr("type", "checkbox")
                                                                      .prop("checked", this.labeler.sentenceInFilter(
                                                                                           this.current)))
                                                          .append($("<span>")
                                                                      .addClass("filtering-label checkbox-label")
                                                                      .text("filtering")))))
                          .append($("<hr>"))
                          .append($("<div>")
                                      .addClass("label-hidden-group")
                                      .append($("<div>")
                                                  .addClass("label-hidden-item delete-item")
                                                  .append($("<button>")
                                                              .attr("type", "button")
                                                              .addClass("btn btn-secondary delete-button")
                                                              .text("delete"))))));
    });

    this.bind();
  }
}
