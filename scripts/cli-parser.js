#!/usr/bin/env node

'use strict';

const _ = require('underscore');
const fs = require('fs');
const minimist = require('minimist');
const request = require('request');
const uuidv4 = require('uuid/v4');

const ALLOWED_EXTENSIONS = ['txt', 'conllu', 'cg3', 'sd', 'corpus'];

class CLIError extends Error {
  constructor(...args) {
    super(...args);

    process.stderr.write(`CLIError: ${this.message}\n`);
    process.exit(1);
  }
}

function usage() {

  process.stderr.write(`usage: ${process.argv[1]}

reads a corpus from a file-like source and posts the data to
  <protocol>://<host>:<port>/save or stdout

OPTIONS:
  -f, --file <file> (default: stdin)
\t  read from <file> (extensions: ${ALLOWED_EXTENSIONS.join(', ')})
  -h, --help
\t  show this output and exit
  -H, --host <host> (default: localhost)
  -o, --out
\t  force script to write to stdout instead of posting
  -p, --port <port> (default: 5316)
  -P, --protocol <protocol> (default: http)
\t  force the program to post the data using the default values
  -s, --save
  -t, --treebank <treebank_id> (default: <automatically generated>)

`);
  process.exit(0);
}

function validatePath(path) {
  if (!path)
    throw new CLIError('no path specified');

  if (!fs.existsSync(path))
    throw new CLIError(`unable to locate path: ${path}`);

  const extension = path.split('.').slice(-1)[0];
  if (ALLOWED_EXTENSIONS.indexOf(extension) === -1)
    throw new CLIError(`unable to process file with extension: ${extension}`);

  return path;
}

function parse(text) {
  if (!text)
    throw new CLIError(`cannot parse empty string`);

  return manager.parse(text).save();
}

function write(params, text) {

  text = parse(text);
  
  process.stderr.write(`> writing to stdout\n`);
  process.stdout.write(text);
  process.exit(0);
}

function save(params, text) {

  text = parse(text);

  const url = `${params.protocol}://${params.host}:${params.port}/save`;
  process.stderr.write(`> posting treebank "${params.treebank}" to "${url}"\n`);

  request.post({
    url: url,
    form: {
      state: text,
      treebank_id: params.treebank
    }
  }, (err, res) => {
    if (err)
      throw err;

    process.stderr.write('> response: ')
    process.stdout.write(res.body);
    process.exit(0);
  });
}

(() => { // main

  global.log = new (require('../src/node-logger'))('SILENT');
  global.server = null;
  global.manager = new (require('../src/manager'))();

  const argv = minimist(process.argv.slice(2));
  let params = {
    path: argv.f || argv.file,
    save: argv.s || argv.save
      || argv.H || argv.host
      || argv.p || argv.port
      || argv.P || argv.protocol,
    write: argv.o || argv.out,
    host: argv.H || argv.host || 'localhost',
    port: argv.p || argv.port || 5316,
    protocol: argv.P || argv.protocol || 'http',
    treebank: argv.t || argv.treebank || uuidv4(),
  };
  let action = (!params.write && params.save) ? save : write;

  if (argv.h !== undefined || argv.help !== undefined) {

    usage();

  } else if (params.path) {

    params.path = validatePath(params.path);
    process.stderr.write(`> reading from file ${params.path}\n`);

    fs.readFile(params.path, 'utf8', (err, data) => {
      if (err)
        throw err;

      action(params, data);
    });

  } else {

    process.stderr.write('> reading from stdin\n');

    let lines = [];
    require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    }).on('line', line => {
      lines.push(line);
    }).on('close', data => {
      lines = lines.join('\n');
      action(params, lines);
    });

  }

})();
