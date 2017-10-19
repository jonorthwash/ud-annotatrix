
// is defined in a js file, because fetch doesn't work offline in chrome
var CY_STYLE = [{
    "selector": "node",
    "style": {
        "height": 20,
        "background-color": NORMAL,
        "shape": "roundrectangle",
        "text-valign": "center",
        "text-halign": "center",
        "border-color": "#000",
        "border-width": 1
    }
}, {
    "selector": "node.wf",
    "style": {
        "width": "data(length)",
        "label": "data(label)"
  }
}, {
    "selector": "node.MultiwordToken",
    "style": {
        "background-color": ST_COLOR,
        "text-background-color": NORMAL,
        "text-background-opacity": 0.9,
        "text-border-color": "#000",
        "text-border-opacity": 0.9,
        "text-border-width": "1px",
        "text-background-shape": "roundrectangle",
        "text-valign": "top",
        "label": "data(label)"
  }
}, {
    "selector": ".supAct",
    "style": {
        "background-color": ACTIVE
    }
}, {
    "selector": "node.wf.arc-selected",
    "style": {
        "border-color": FANCY
    }
}, {
    "selector": "node.wf.activated",
    "style": {
        "background-color": ACTIVE
    }
}, {
    "selector": "node.wf.activated.retokenize",
    "style": {
        "background-color": POS_COLOR,
        "border-color": FANCY
    }
}, {
    "selector": "node.wf.merge",
    "style": {
        "background-color": POS_COLOR,
        "border-color": FANCY
    }
}, {
    "selector": "node.wf.supertoken",
    "style": {
        "background-color": POS_COLOR,
        "border-color": FANCY
    }
}, {
  "selector": "node.pos",
  "style": {
    "width": "data(length)",
    "label": "data(label)",
    "background-color": POS_COLOR
  }
}, {
  "selector": "edge",
  "style": {
    "width": 3,
    "opacity": 0.766,
    "line-color": "#111"
  }
}, {
  "selector": "edge.dependency-error",
  "style": {
    "target-arrow-shape": "triangle",
    "target-arrow-color": "#d11",
    "line-color": "#d11",
    "text-margin-y": -10,
    "curve-style": "unbundled-bezier",
    "control-point-distances": "data(ctrl)",
    "control-point-weights": "0 0.25 0.75 1",
    "edge-distances": "node-position",
    "label": "data(label)",
    "text-events": "yes"
  }
}, {
    "selector": "edge.dependency-error.selected",
    "style": {
        "line-color": FANCY,
        "target-arrow-color": FANCY
    }
}, {
  "selector": "edge.dependency",
  "style": {
    "target-arrow-shape": "triangle",
    "target-arrow-color": "#111",
    "text-margin-y": -10,
    "curve-style": "unbundled-bezier",
    "control-point-distances": "data(ctrl)",
    "control-point-weights": "0 0.25 0.75 1",
    "edge-distances": "node-position",
    "label": "data(label)",
    "text-events": "yes"
  }
}, {
    "selector": "edge.dependency.selected",
    "style": {
        "line-color": FANCY,
        "target-arrow-color": FANCY
    }
}, {
    "selector": "node.MultiwordToken",
    "style": {
        "background-color": ST_COLOR,
        "text-background-color": NORMAL,
        "text-background-opacity": 0.9,
        "text-border-color": "#000",
        "text-border-opacity": 0.9,
        "text-border-width": "1px",
        "text-background-shape": "roundrectangle",
        "text-valign": "top",
        "label": "data(label)"
  }
}, {"selector": "edge.pos",
  "style": {
    "curve-style": "haystack"
  }
}, {
    "selector": "node.tokenNumber",
    "style": {
        "background-opacity": 0,
        "border-opacity": 0,
        "padding": 0,
        "text-background-color": POS_COLOR,
        "text-background-opacity": 0.9,
        "text-border-color": "#000",
        "text-border-opacity": 0.9,
        "text-border-width": "1px",
        "text-background-shape": "roundrectangle",
        "text-halign": "right",
        "label": "data(label)",
        "events": "no"
  }
}];
