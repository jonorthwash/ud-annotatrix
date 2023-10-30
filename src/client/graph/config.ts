import * as _ from "underscore";

export interface GraphConfig {
  //pan: MousePosition;
  zoom: number;
  drawn_sentence: boolean;

  edge_height: number;
  edge_coeff: number;

  mouse_move_delay: number;

  locked_index: number|null;
  locked_id: string|null;
  locked_classes: string|null;

  set: (params: {[key in keyof GraphConfig]: string}) => void;
}

export const _graph: GraphConfig = {

  // placeholders (get overwritten on first graph draw)
  pan: {x: 0, y: 0},
  zoom: 1,
  drawn_sentence: false,

  // affect relative heights of the cytoscape graph edges
  edge_height: 40,
  edge_coeff: 1,

  // how frequently to send mouse-move updates (msecs)
  mouse_move_delay: 100,

  // persist info about user locks in between graph draws
  locked_index: null,
  locked_id: null,
  locked_classes: null,

  set: params => _.each(params,
                        (value, key) => {
                          if ((_graph as any)[key] !== undefined)
                            (_graph as any)[key] = value;
                        }),

};
