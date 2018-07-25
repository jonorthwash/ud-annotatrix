'use strict';

const fs = require('fs');
const cfg = require('./config');
const path = require('path');

module.exports = next => {
  fs.readdir(cfg.corpora_path, (err, dirs) => {
    if (err || (!dirs || !dirs.length))
      return next(err, []);

    let corpora = [];
    let touched = 0;

    dirs.forEach(dir => {
      const filepath = path.join(cfg.corpora_path, dir);

      if (!filepath.endsWith('.db'))
        return;

      fs.lstat(filepath, (err, stat) => {
        touched++;

        if (err)
          return;

        corpora.push({
          url: dir.slice(0, -3),
          modified: stat.mtime
        });

        if (touched === dirs.length)
          next(null, corpora);
      });
    });
  });
};
