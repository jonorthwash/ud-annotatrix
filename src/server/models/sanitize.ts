import * as _ from "underscore";

import * as nx from "../../notatrix";

function sanitize(obj: any, keys: string[]): any {
  obj = _.pick(obj, keys);
  _.each(obj, (value, key, obj) => { obj[key] = JSON.stringify(value); });

  return obj;
}

interface Meta {
  current_index: unknown;
  owner: unknown;
  github_url: unknown;
  gui: unknown;
  labeler: unknown;
  permissions: unknown;
  editors: unknown;
}

interface SanitizedMeta {
  current_index: string;
  owner: string;
  github_url: string;
  gui: string;
  labeler: string;
  permissions: string;
  editors: string;
}

export function sanitizeMeta(meta: Meta): SanitizedMeta {
  return sanitize(
    meta,
    [
      "current_index",
      "owner",
      "github_url",
      "gui",
      "labeler",
      "permissions",
      "editors",
    ]
  );
}

interface Sentence {
  column_visibilities: unknown;
  format: unknown;
  is_table_view: unknown;
  nx_initialized: unknown;
  nx: nx.Sentence;
}

interface SanitizedSentence {
  column_visibilities: string;
  format: string;
  is_table_view: string;
  nx_initialized: string;
  nx: string;
}

export function sanitizeSentence(sentence: Sentence): SanitizedSentence {
  return sanitize(
    sentence,
    [
      "column_visibilities",
      "format",
      "is_table_view",
      "nx_initialized",
      "nx",
    ]
  );
}
