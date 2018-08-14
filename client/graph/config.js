'use strict';

const _ = require('underscore');
const utils = require('../utils');

var _graph = {

	// placeholders (get overwritten on first graph draw)
	pan: { x: 0, y: 0 },
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

  set: params => _.each(params, (value, key) => {
			if (_graph[key] !== undefined)
				_graph[key] = value;
		}),

};


module.exports = _graph;
