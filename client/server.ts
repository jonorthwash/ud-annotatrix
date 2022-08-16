import * as $ from "jquery";

import {storage} from "./utils";
import {getTreebankId} from "./utils/funcs";
import type {App} from "./app";

/**
 * Abstraction over an AJAX connection.  Handles sending and receiving large
 *  packets from a server.  Usually, this means the initial loading of the
 *	corpus, as well as saving (including (de)serialization).
 */
export class Server {
  private app: App;
  public is_running: boolean;
  private treebank_id: string;

  constructor(app: App) {

    // save a reference to the parent
    this.app = app;
    this.is_running = false;
    this.treebank_id = getTreebankId();
  }

  /**
   * Attempt to connect to the server via AJAX.  This function updates the
   *	<tt>Server.is_running<\tt> attribute, which is checked by other functions.
   */
  connect() {
    try {
      $.ajax({
        type: "GET",
        url: "/running",
        success: data => {
          console.info("AJAX connect success with response:", data);

          this.is_running = true;
          this.app.gui.status.normal("connected to server");
          this.load();
        },
        error: data => {
          console.info("AJAX connect failed with response:", data);
          this.app.gui.status.error("unable to connect to server");

          const serial = storage.load();
          if (serial)
            this.app.load(serial);
        }
      });
    } catch (e) {

      console.info("AJAX connected failed with response:", e.message);
      this.app.gui.status.error("unable to connect to server");

      const serial = storage.load();
      if (serial)
        this.app.load(serial);
    }
  }

  /**
   * Save a JSON object containing a serial representation of the corpus to the
   *  server (if running).
   */
  save(obj: any) {
    if (!this.is_running)
      return;

    try {

      const serial = JSON.stringify(obj);

      $.ajax({
        type: "POST",
        url: `/save?treebank_id=${this.treebank_id}`,
        contentType: "application/json; charset=utf-8",
        data: serial,
        dataType: "json",
        success: data => {
          if (data.error) {
            console.log(this.treebank_id);
            console.info("AJAX save failed with response:", data);
            this.app.gui.status.error("unable to save to server");

          } else {
            console.info("AJAX save success with response:", data);
          }
        },
        error: data => {
          console.info("AJAX save failed with response:", data);
          this.app.gui.status.error("unable to save to server");
        }
      });
    } catch (e) {

      console.info("AJAX save failed with response:", e);
      this.app.gui.status.error("unable to save to server");
    }
  }

  /**
   * Attempt to load a serial representation of the corpus from the server.
   */
  load() {

    if (!this.is_running)
      return;

    try {
      $.ajax({
        type: "GET",
        url: `/load?treebank_id=${this.treebank_id}`,
        success: data => {
          if (data.error) {

            console.info("AJAX load failed with response:", data);
            this.app.gui.status.error("unable to load from server");

            const serial = storage.load();
            if (serial)
              this.app.load(serial);

          } else {

            // console.info('AJAX load success with response:', data);
            data = JSON.parse(data);
            this.app.load(data);
          }
        },
        error: data => {
          console.info("AJAX load failed with response:", data);
          this.app.gui.status.error("unable to load from server");

          const serial = storage.load();
          if (serial)
            this.app.load(serial);
        }
      });
    } catch (e) {

      console.info("AJAX load failed with response:", e);
      this.app.gui.status.error("unable to load from server");

      const serial = storage.load();
      if (serial)
        this.app.load(serial);
    }
  }
}
