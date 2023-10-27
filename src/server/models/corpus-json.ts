import * as _ from "underscore";
import * as path from "path";
import * as fs from "fs";

import {cfg} from "../config";
import {DBError} from "../errors";

export class CorpusDB {
  private path: string;

  private constructor(filename: string) {
    if (!filename)
      throw new DBError("Missing required argument: filename");

    this.path = path.join(cfg.corpora_path, filename + ".json");
  }

  public static create(filename: string): CorpusDB {
    return new CorpusDB(filename);
  }

  load(next: (err: Error, loaded?: string) => void) {
    fs.readFile(this.path, (err, data) => {
      if (err)
        return next(err);

      next(null, data.toString());
    });
  }

  save(filename: string, state: any, next: (_: null, contents: string, err: Error|null) => void) {
    state.meta = _.defaults(state.meta, {
      filename: filename,
    });
    state = JSON.stringify(state, null, 2);
    fs.writeFile(this.path, state, next as () => void);
  }
}
