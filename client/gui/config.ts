import * as _ from "underscore";

import {check_if_browser} from "../utils/funcs";

export const _gui = {

  is_browser: check_if_browser(),

  pinned_menu_items: new Set(["discard-corpus", "show-help", "go-home"]),
  is_textarea_visible: true,
  is_table_visible: false,
  is_label_bar_visible: true,
  column_visibilities: new Array(10).fill(true),
  textarea_height: 238,
  autoparsing: true,

  statusNormalFadeout: 3000,
  statusErrorFadeout: 5000,

  set: params => _.each(params,
                        (value, key) => {
                          if (_gui[key] !== undefined)
                            _gui[key] = value;
                        }),

};
