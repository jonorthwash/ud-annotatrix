#!/usr/bin/env node

/*
 * Kevin Murphy
 * 7/25/18
 *
 * This script handles compiling the EJS templates into plain HTML files to
 *  allow clients to open the UD Annotatrix without a server.
 */

"use strict";

const ejs = require("ejs");
const fs = require("fs");
const path = require("path");

const mkdirp = require("mkdirp");
const html_base_path = path.join("src", "server", "public", "html");

function render(filename, args) {
  const ejs_path = path.join("src", "server", "views", `${filename}.ejs`);
  const html_path = path.join("src", "server", "public", "html", `${filename}.html`);

  fs.readFile(ejs_path, (err, contents) => {
    if (err)
      throw err;

    contents = contents.toString();
    const html = ejs.render(contents, args);

    fs.writeFile(html_path, html, err => {
      if (err)
        throw err;
    });
  });
}

function render_all() {

  mkdirp(html_base_path);

  render("annotatrix", {
    // `src/server/views/modals`
    modalPath: path.join(__dirname, "../", "src", "server", "views", "modals"),
    github_configured: false,
    username: null,
    path: path
  });
  render("help", {});
  render("index", {base: null, error: null, treebanks: []});
}

if (require.main === module)
  render_all();

module.exports = render_all;
