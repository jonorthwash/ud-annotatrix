import * as _ from "underscore";

export function parse(obj: any): any {
  _.each(obj, (value, key, obj) => { obj[key] = JSON.parse(value); });

  return obj;
}
