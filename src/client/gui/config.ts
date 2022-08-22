import * as _ from "underscore";

import {check_if_browser} from "../utils/funcs";

export interface GuiConfig {
  is_browser: boolean;

  pinned_menu_items: Set<string>;
  is_textarea_visible: boolean;
  is_table_visible: boolean;
  is_label_bar_visible: boolean;
  column_visibilities: boolean[];
  textarea_height: string;
  autoparsing: boolean;

  statusNormalFadeout: number;
  statusErrorFadeout: number;

  set: (params: {[key in keyof GuiConfig]: string}) => void;
}

export const _gui: GuiConfig = {

  is_browser: check_if_browser(),

  pinned_menu_items: new Set(["discard-corpus", "show-help", "go-home"]),
  is_textarea_visible: true,
  is_table_visible: false,
  is_label_bar_visible: true,
  column_visibilities: new Array(10).fill(true),
  textarea_height: "238px",
  autoparsing: true,

  statusNormalFadeout: 3000,
  statusErrorFadeout: 5000,

  set: params => _.each(params,
                        (value, key) => {
                          if ((_gui as any)[key] !== undefined)
                            (_gui as any)[key] = value;
                        }),
};
