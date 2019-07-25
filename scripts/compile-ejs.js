#!/usr/bin/env node

/*
 * Kevin Murphy
 * 7/25/18
 *
 * This script handles compiling the EJS templates into plain HTML files to
 *  allow clients to open the UD Annotatrix without a server.
 */

'use strict';

const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const html_base_path_array = ['server', 'public', 'html'];

function render(filename, args) {
  const ejs_path = path.join('server', 'views', `${filename}.ejs`);
  const html_path = path.join('server', 'public', 'html', `${filename}.html`);

  ejs.renderFile(ejs_path, args, function (err, html) {
    if (err)
      throw err;
    fs.writeFile(html_path, html, err => {
      if (err)
        throw err;
    });
  });
}

function render_all() {

  html_base_path_array
   .reduce((pre, dir) => {
         const cur = path.join(pre, dir);
         if (!fs.existsSync(cur)){
           fs.mkdirSync(cur);
         }
         return cur;
       },
   "");
  render('annotatrix', {
    // `${__dirname}/../server/views/modals`
    modalPath:  path.join(__dirname, '..', 'server', 'views', 'modals'),
    github_configured: false,
    username: null,
    path: path
  });
  render('help', {});
  render('index', {
    base: null,
    error: null,
    treebanks: []
  });

}


if (require.main === module)
  render_all();

module.exports = render_all;
