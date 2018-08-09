'use strict';

const _ = require('underscore');
const utils = require('../utils');

var _graph = {

	pan: { x: 0, y: 0 },
	zoom: 1,
	drawn_sentence: false,

  edge_height: 40,
	edge_coeff: 1,

	mouse_move_delay: 100, // msecs

	locked_index: null,
	locked_id: null,
	locked_classes: null,

  set: params => _.each(params, (value, key) => {
			if (_graph[key] !== undefined)
				_graph[key] = value;
		}),

};


module.exports = _graph;
