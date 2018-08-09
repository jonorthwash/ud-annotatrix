'use strict';

// is defined in a js file, because fetch doesn't work offline in chrome

const ACTIVE_COLOR = '#2653c9',
  NORMAL_COLOR = '#7fa2ff',
  FANCY_COLOR = '#cc22fc',
  POS_COLOR = '#afa2ff',
  ST_COLOR = '#bcd2ff',
  MOVING_COLOR = '#00f';

const CY_STYLE = [

  {
    selector: '*.disabled',
    style: {
      opacity: 0.4/*
      'background-color': '#f00',
      color: '#0ff'*/
    }
  },

  {
    selector: 'node',
    style: {
      height: 20,
      'background-color': NORMAL_COLOR,
      shape: 'roundrectangle',
      'text-valign': 'center',
      'text-halign': 'center',
      'border-color': '#000',
      'border-width': 1
    }
  },

  {
    selector: 'node.form',
    style: {
      width: 'data(length)',
      label: 'data(label)'
    }
  },

  {
    selector: 'node.multiword',
    style: {
      'background-color': ST_COLOR,
      'text-background-color': NORMAL_COLOR,
      'text-background-opacity': 0.9,
      'text-border-color': '#000',
      'text-border-opacity': 0.9,
      'text-border-width': '1px',
      'text-background-shape': 'roundrectangle',
      'text-valign': 'top',
      label: 'data(label)'
    }
  },

  {
    selector: 'node.multiword-active',
    style: {
      'background-color': ACTIVE_COLOR
    }
  },

  {
    selector: 'node.form.arc-source, node.form.arc-target',
    style: {
      'border-color': FANCY_COLOR
    }
  },

  {
    selector: 'node.form.root',
    style: {
      'font-weight': 'bold',
      //'text-border-width': '2em',
      'border-width': '2px'
    }
  },

  {
    selector: 'node.form.neighbor',
    style: {
      'background-color': '#0b2',
    }
  },

  {
    selector: 'node.form.activated',
    style: {
      'background-color': ACTIVE_COLOR
    }
  },

  {
    selector: 'node.form.activated.retokenize',
    style: {
      'background-color': POS_COLOR,
      'border-color': FANCY_COLOR
    }
  },

  {
    selector: 'node.form.merge',
    style: {
      'background-color': POS_COLOR,
      'border-color': FANCY_COLOR
    }
  },

  {
    selector: 'node.form.supertoken',
    style: {
      'background-color': POS_COLOR,
      'border-color': FANCY_COLOR
    }
  },

  {
    selector: 'node.pos',
    style: {
      width: 'data(length)',
      label: 'data(label)',
      'background-color': POS_COLOR
    }
  },

  {
    selector: 'edge',
    style: {
      width: 3,
      opacity: 0.766,
      'line-color': '#111',
      'control-point-weights': '0.2 0.25 0.75 0.8',
    }
  },

  {
    selector: 'edge.incomplete',
    style: {
      'target-arrow-shape': 'triangle',
      'target-arrow-color': '#aaa',
      'line-color': '#aaa',
      'text-margin-y': -10,
      'curve-style': 'unbundled-bezier',
      'control-point-distances': 'data(ctrl)',
      'control-point-weights': '0 0.25 0.75 1',
      'arrow-scale': '1.5',
      'edge-distances': 'node-position',
      label: 'data(label)',
      'text-events': 'yes'
    }
  },

  {
    selector: 'edge.incomplete.vertical',
    style: {
      'text-margin-y':  0,
      'text-background-opacity':  1,
      'text-background-color':  'white',
      'text-background-shape':  'roundrectangle',
      'text-border-color':  'black',
      'text-border-width':  1,
      'text-border-opacity':  1,
      'control-point-weights':  '0.15 0.45 0.55 0.85',
      'text-margin-x':  'data(length)',
      'source-distance-from-node':  10,
      'target-distance-from-node':  10
    }
  },

  {
    selector: 'edge.incomplete.horizontal',
    style: {
      'text-margin-y':  -10,
      'text-margin-x':  0,
      'text-background-opacity':  0,
      'text-border-opacity':  0,
      'control-point-weights':  '0 0.25 0.75 1',
      'source-distance-from-node':  0,
      'target-distance-from-node':  0
    }
  },

  {
    selector: 'edge.error',
    style: {
      'target-arrow-shape': 'triangle',
      'target-arrow-color': '#d11',
      'line-color': '#d11',
      'text-margin-y': -10,
      'curve-style': 'unbundled-bezier',
      'control-point-distances': 'data(ctrl)',
      'control-point-weights': '0 0.25 0.75 1',
      'arrow-scale': '1.5',
      'edge-distances': 'node-position',
      label: 'data(label)',
      'text-events': 'yes'
    }
  },

  {
    selector: 'node.pos.error',
    style: {
      'border-color': '#d11',
    }
  },

  {
    selector: 'edge.enhanced',
    style: {
      'target-arrow-shape': 'triangle',
      'target-arrow-color': '#045',
      'line-color': '#045',
      'text-margin-y': -10,
      'curve-style': 'unbundled-bezier',
      'control-point-distances': 'data(ctrl)',
      'control-point-weights': '0 0.25 0.75 1',
      'edge-distances': 'node-position',
      'arrow-scale': '1.5',
      label: 'data(label)',
      'text-events': 'yes'
    }
  },

  {
    selector: 'edge.dependency',
    style: {
      'target-arrow-shape': 'triangle',
      'target-arrow-color': '#111',
      'text-margin-y': -10,
      'curve-style': 'unbundled-bezier',
      'control-point-distances': 'data(ctrl)',
      'control-point-weights': '0 0.25 0.75 1',
      'edge-distances': 'node-position',
      label: 'data(label)',
      'text-events': 'yes'
    }
  },

  {
    selector: 'edge.dependency.selected',
    style: {
        'line-color': FANCY_COLOR,
        'target-arrow-color': FANCY_COLOR
    }
  },

  {selector: 'edge.pos',
    style: {
      'curve-style': 'haystack'
    }
  },

  {
    selector: 'node.number',
    style: {
      'background-opacity': 0,
      'border-opacity': 0,
      padding: 0,
      'text-background-color': POS_COLOR,
      'text-background-opacity': 0.9,
      'text-border-color': '#000',
      'text-border-opacity': 0.9,
      'text-border-width': '1px',
      'text-background-shape': 'roundrectangle',
      'text-halign': 'right',
      label: 'data(label)',
      events: 'no'
    }
  },

  {
    selector: 'edge.moving',
    style: {
      'line-color': MOVING_COLOR,
      'target-arrow-color': MOVING_COLOR
    }
  },

  {
    selector: 'node.mouse',
    style: {
      height: 5,
      width: 5,
      opacity: 0.5,
      'border-width': 1,
    },
  },

  {
    selector: 'edge.locked',
    style: {
      opacity: 1,
    },
  },

];

module.exports = CY_STYLE;
