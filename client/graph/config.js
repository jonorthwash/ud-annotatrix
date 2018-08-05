'use strict';

const _ = require('underscore');
const utils = require('../utils');

var _graph = {

	pan: { x: 0, y: 0 },
	zoom: 1,

  edge_height: 40,
	edge_coeff: 1,

  set: params => _.each(params, (value, key) => {
			if (_graph[key] !== undefined)
				_graph[key] = value;
		}),

};


module.exports = _graph;
