import * as fs from "fs";
import * as moment from "moment";
import * as nx from "notatrix";
import * as path from "path";

import {cfg} from "./config";
import {Treebank} from "./models/treebank";

interface Corpus {
  path: string;
  modified: unknown;
}

export function listTreebanks(next: (err: Error|null, treebanks: Treebank[]) => void) {
  fs.readdir(cfg.corpora_path, (err, dirs) => {
    if (err || (!dirs || !dirs.length))
      return next(err, []);

    let corpora: Corpus[] = [];
    let touched = 0;

    dirs.forEach(dir => {
      const filepath = path.join(cfg.corpora_path, dir);

      console.log(filepath)
      fs.lstat(filepath, (err, stat) => {
        touched++;

        if (err)
          throw err;

        if (filepath.endsWith(".json"))
          corpora.push({
            path: filepath,
            modified: stat.mtime,
          });

        if (touched === dirs.length) {

          const treebanks = corpora
                                .sort((x, y) => {
                                  if (x.modified < y.modified)
                                    return 1;
                                  if (x.modified > y.modified)
                                    return -1;
                                  return 0;
                                })
                                .map(info => {
                                  const buffer = fs.readFileSync(info.path);
                                  const serial = buffer.toString();
                                  const parsed = JSON.parse(serial);
                                  const snapshot = nx.Corpus.deserialize(parsed).snapshot;

                                  return {
                                    id: path.basename(info.path).slice(0, -5),
                                    modified: info.modified,
                                    modified_ago: moment(info.modified).fromNow(),
                                    filename: snapshot.filename,
                                    sentences: snapshot.sentences,
                                    errors: snapshot.errors,
                                    labels: snapshot.labels.slice(0, 3),
                                  };
                                });

          next(null, treebanks);
        }
      });
    });
  });
}
