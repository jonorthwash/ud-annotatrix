import * as $ from "jquery";
import * as _ from "underscore";

import * as nx from "../notatrix";
import {storage} from "../utils";
import {getRootPath} from "../utils/funcs";
import type {App} from "../app";

import {_gui as config} from "./config";
import {Corpus} from "../corpus";
import {GraphMenu} from "./graph-menu";
import {KEYS, keyup, keydown} from "./keyboard";
import {Labeler} from "./labeler";
import {Menu} from "./menu";
import {Status} from "./status";
import {Table} from "./table";
import {Textarea} from "./textarea"

interface Uploaded {
  name: string;
  text: string|ArrayBuffer;
}

/**
 * Abstraction over the user interface.  Handles interaction between user via
 *  DOM elements & keystrokes and the application instance.
 */
export class GUI {
  public app: App;
  public config: typeof config;
  private graphMenu: GraphMenu;
  private labeler: Labeler;
  public menu: Menu
  public status: Status;
  public table: Table;
  private textarea: Textarea;
  public root: unknown;
  private uploaded: Uploaded|null = null;
  public parseTimer: ReturnType<typeof setTimeout>|null = null;;

  constructor(app: App) {

    this.app = app;

    // bind subelements
    this.config = config;
    this.graphMenu = new GraphMenu(this);
    this.labeler = new Labeler(this);
    this.menu = new Menu(this);
    this.status = new Status(this);
    this.table = new Table(this);
    this.textarea = new Textarea(this);
    this.root = getRootPath();

    this.load();
    this.bind();
  }

  /**
   * Save the GUI preferences to localStorage
   */
  save() {

    const picked = _.pick(this.config, "column_visibilities", "is_label_bar_visible", "is_table_visible",
                        "is_textarea_visible", "pinned_menu_items", "textarea_height", "autoparsing");
    const serial = JSON.stringify(picked);
    storage.setPrefs("gui", serial);
  }

  /**
   * Load the GUI preferences from localStorage
   */
  load() {

    const serial = storage.getPrefs("gui");
    if (!serial)
      return;

    const parsed = JSON.parse(serial);
    parsed.pinned_menu_items = new Set(parsed.pinned_menu_items || []);

    this.config.set(parsed);
  }

  /**
   * Bind DOM elements to user keystrokes recursively
   */
  bind() {

    // ignore all this stuff if we're in Node
    if (!this.config.is_browser)
      return;

    const self = this;

    // bind all subelements
    require("./selfcomplete");
    this.graphMenu.bind();
    this.menu.bind();
    this.status.bind();
    this.textarea.bind();

    if (!this.app.online || !this.app.server.is_running) {
      $("#upload-filename").on("change", function(e) {
        // console.log("changed", e.target.files);
        const target = e.target as HTMLInputElement;
        if (target.files.length > 0) {
          let reader = new FileReader();
          reader.onload = (d) => {
            self.uploaded = {
              name: target.files[0].name,
              text: d.target.result,
            };
          };
          reader.readAsText(target.files[0]);
        }
      });
      $("#uploadform").on("submit", function(e) {
        e.preventDefault(); // cancel the actual submit
        if (window.File && window.FileReader && window.FileList && window.Blob) {
          // console.log("FileAPI OK");
          if (self.uploaded && self.uploaded.hasOwnProperty("text")) {
            let upcorpus = nx.Corpus.fromString(self.uploaded["text"] as string);
            upcorpus.filename = self.uploaded.name;
            console.log(upcorpus.serialize());
            self.app.corpus = new Corpus(self.app, upcorpus.serialize());
            $("#upload-file-modal").hide();
            $("#upload-filename").val(null);
            self.refresh();
          }
        } else {
          alert("Your browser does not support FileAPI");
        }
      });
    }

    // graph interception stuff
    $(".controls").click(e => $(":focus:not(#edit)").blur());
    $("#edit").click(e => { self.app.graph.intercepted = true; });

    // keystroke handling & such
    window.onkeyup = e => keyup(self.app, e);
    window.onkeydown = e => keydown(self.app, e);
    window.onbeforeunload = e => self.app.save();
  }

  /**
   * Called after any change to application state.  Refreshes the view of the
   *  application by recursively refreshing subelements.
   */
  refresh() {

    // ignore all this stuff if we're in node
    if (!this.config.is_browser)
      return;

    // refresh all subelements
    this.graphMenu.refresh();
    this.labeler.refresh();
    this.menu.refresh();
    this.status.refresh();
    this.textarea.refresh();

    // and draw the graph
    this.app.graph.draw();

    // show the completeness
    const percent =
        100 * (this.app.graph.progress.total ? this.app.graph.progress.done / this.app.graph.progress.total : 0);

    $("#progress-bar").css("width", `${percent}%`);
  }
}
