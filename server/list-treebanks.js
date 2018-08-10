'use strict';

const fs = require('fs');
const cfg = require('./config');
const moment = require('moment');
const nx = require('notatrix');
const path = require('path');

module.exports = next => {
  fs.readdir(cfg.corpora_path, (err, dirs) => {

    if (err || (!dirs || !dirs.length))
      return next(err, []);

    let corpora = [];
    let touched = 0;

    dirs.forEach(dir => {
      const filepath = path.join(cfg.corpora_path, dir);

      console.log(filepath)
      fs.lstat(filepath, (err, stat) => {
        touched++;

        if (err)
          throw err;

        if (filepath.endsWith('.json'))
          corpora.push({
            path: filepath,
            modified: stat.mtime,
          });

        if (touched === dirs.length) {

          const treebanks = corpora.sort((x, y) => {

            if (x.modified < y.modified)
              return 1;
            if (x.modified > y.modified)
              return -1;
            return 0;

          }).map(info => {

            let serial = fs.readFileSync(info.path);
            serial = serial.toString();
            serial = JSON.parse(serial);

            const snapshot = nx.Corpus.deserialize(serial).snapshot;

            return {
              id: path.basename(info.path).slice(0, -5),
              modified: info.modified,
              modified_ago: moment(info.modified).fromNow(),
              filename: snapshot.filename,
              sentences: snapshot.sentences,
              errors: snapshot.errors,
              labels: snapshot.labels.slice(0,3),
            };
          });

          next(null, treebanks);
        }
      });
    });
  });
};
