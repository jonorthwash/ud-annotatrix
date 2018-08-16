#!/usr/bin/env node

/*
 * Kevin Murphy
 * 8/9/18
 *
 * This script handles downloading all of the CoNLL-U treebanks linked to on
 *  universaldependencies.org to the local filesystem.
 */

'use strict';

const _ = require('underscore');
const cheerio = require('cheerio');
const fs = require('fs');
const mkdirp = require('mkdirp');
const request = require('request');

require('dotenv').config();
const gh_token = process.env.GITHUB_TOKEN;
const dest_path = '/tmp/treebanks/';
mkdirp(dest_path);

const re = {
  repo: /^Repository/,
  github: /^http.*com\/([\w-]*)\/([\w-]*)\/tree\/([\w-]*)$/,
  slug: /[^\w]/g,
  conllu: /\.conllu$/,
};

function parse_github_url(url) {

  const chunks = url.match(re.github);
  return {
    org: chunks[1],
    repo: chunks[2],
    branch: chunks[3],
  };

}

// main
request.get('http://universaldependencies.org', (err, res, body) => {
  if (err)
    throw err;

  const $ = cheerio.load(body);

  let repos = [];
  $('#accordion').first().find('ul').find('li:nth-child(2)').each((i, li) => {

    li = $(li);

    if (re.repo.test(li.text()))
      li.find('a').each((j, a) => {

        repos.push($(a).attr('href'));

      });
  });

  repos = repos.map(parse_github_url).forEach(repo => {

    const files_url = 'https://api.github.com/repos/'
      + `${repo.org}/${repo.repo}/contents?ref=${repo.branch}`;

    request.get(files_url, { headers: {

      'User-Agent': 'ud_scraper',
      'Authorization': 'token ' + gh_token, // to avoid throttling

    }}, (err, res, body) => {
      if (err)
        throw err;

      body = JSON.parse(body);

      if (res.statusCode === 200) {

        body.forEach(file => {

          if (re.conllu.test(file.name))
            request.get(file.download_url, (err, res, body) => {
              if (err)
                throw err;

              if (res.statusCode === 200) {

                fs.writeFile(dest_path + file.name, body, err => {
                  if (err)
                    throw err;
                });

              } else {
                process.stderr.write(`bad response from ${file.download_url}\n`);
              }
            });
        });

      } else {
        process.stderr.write(`Bad response from ${files_url}: ${body.message}\n`);
      }
    });
  });
});
