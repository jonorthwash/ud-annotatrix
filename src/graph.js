'use strict';

const $ = require('jquery');
const _ = require('underscore');
require('./autocomplete');

const cfg = require('./config');
const cytoscape = require('./cytoscape/cytoscape');
const funcs = require('./funcs');
const CY_STYLE = require('./cy-style');
const sort = require('./sort');
const validate = require('./validate');

class Graph {
  constructor(mgr, options) {

    this.options = _.defaults(options, {
      container: funcs.inBrowser() ? $('#cy') : null,
      boxSelectionEnabled: false,
      autounselectify: true,
      autoungrabify: true,
      zoomingEnabled: true,
      userZoomingEnabled: false,
      wheelSensitivity: 0.1,
      style: CY_STYLE,
      layout: null,
      elements: []
    });


  }

  eles() {
    return _.map(manager.current.eles, ele => {
      if (ele.data.name === 'dependency') {

        const src = ele.data.sourceAnalysis,
          tar = ele.data.targetAnalysis;

        ele.data.label = gui.is_ltr
          ? tar.num < src.num
            ? `${src.deprel}⊳`
            : `⊲${src.deprel}`
          : tar.num < src.num
            ? `⊲${src.deprel}`
            : `${src.deprel}⊳`;

        ele.data.ctrl = new Array(4).fill(getEdgeHeight(src.num, tar.num));
        ele.classes = 'dependency';
      }

      return ele;
    });
  }

  update() {
    if (gui.graph_disabled)
      return;

    this.options.layout = {
      name: 'tree',
      padding: 0,
      nodeDimensionsIncludeLabels: false,
      cols: (gui.is_vertical ? 2 : undefined),
      rows: (gui.is_vertical ? undefined : 2),
      sort: (gui.is_vertical
        ? sort.vertical
        : gui.is_ltr
          ? sort.ltr
          : sort.rtl)
    };
    this.options.elements = this.eles();

    window.cy = cytoscape(this.options)
      .minZoom(0.1)
      .maxZoom(10.0)
      .fit()
      .zoom(null) // TODO: gui.zoom
      .center()
      .pan(null); // TODO: gui.pan

    this.bind()
  }

  bind() {
    /**
     * Binds event handlers to cy elements.
     * NOTE: If you change the style of a node (e.g. its selector) then
     * you also need to update it here.
     */

    // set a countdown to triggering a "background" click unless a node/edge intercepts it
    $('#cy canvas, #mute').mouseup((event) => {
      setTimeout(() => {
        graph.clear();
        setTimeout(() => { // wait another full second before unsetting
          gui.intercepted = false;
        });
      }, 100);
    });
    $('#cy canvas').mousemove((event) => {
      gui.intercepted = true;
    });
    $('#edit').mouseup((event) => {
      gui.intercepted = true;
    });
    cy.on('click', '*', (event) => {
      gui.intercepted = true;

      // DEBUG: this line should be taken out in production
      console.info(`clicked ${event.target.attr('id')}, data:`, event.target.data());
    });

    cy.on('click', 'node.form', onClickFormNode);
    cy.on('click', 'node.pos', onClickPosNode);
    cy.on('click', '$node > node', onClickChildNode);
    cy.on('cxttapend', 'node.form', onCxttapendFormNode);

    cy.on('click', 'edge.dependency', onClickDependencyEdge);
    cy.on('cxttapend', 'edge.dependency', onCxttapendDependencyEdge);
  }

  clear() {
    log.debug(`called onClickCanvas(intercepted: ${gui.intercepted})`);

    // intercepted by clicking a canvas subobject || mousemove (i.e. drag) || #edit
    if (gui.intercepted)
      return;

    graph.save();

    cy.$('.activated').removeClass('activated');
    cy.$('.arc-source').removeClass('arc-source');
    cy.$('.arc-target').removeClass('arc-target');
    cy.$('.selected').removeClass('selected');
    cy.$('.moving').removeClass('moving');
    cy.$('.merge').removeClass('merge');
    gui.moving_dependency = false;

    $('#mute').removeClass('activated');
    $('#edit').removeClass('activated');
  }

  save() {
    log.debug(`called saveGraphEdits(target:${gui.editing ? gui.editing.attr('id') : 'null'}, text:${gui.editing ? $('#edit').val() : ''})`);

    cy.$('.input').removeClass('input');

    if (gui.editing === null)
      return; // nothing to do

    const conllu = gui.editing.data().conllu || gui.editing.data().sourceConllu;
    const newAttrKey = gui.editing.data().attr;
    const newAttrValue = $('#edit').val();
    log.debug(`saveGraphEdits(): ${newAttrKey} set =>"${newAttrValue}", whitespace:${/[ \t\n]+/g.test(newAttrValue)}`);

    // check we don't have any whitespace
    if (/\s+/g.test(newAttrValue)) {
      const message = 'ERROR: Unable to add changes with whitespace!  Try creating a new node first.';
      log.error(message);
      alert(message); // TODO: probably should streamline errors
      gui.editing = null;
      return;
    }

    const oldAttrValue = modify(conllu.superTokenId, conllu.subTokenId, newAttrKey, newAttrValue);
    window.undoManager.add({
      undo: () => {
        modify(conllu.superTokenId, conllu.subTokenId, newAttrKey, oldAttrValue);
      },
      redo: () => {
        modify(conllu.superTokenId, conllu.subTokenId, newAttrKey, newAttrValue);
      }
    });

    gui.editing = null;
  }

  editLabel(target) {
    log.debug(`called graph.editLabel(${target.attr('id')})`);

    target.addClass('input');

    // get rid of direction arrows
    const label = target.data('label').replace(/[⊳⊲]/, '');
    target.data('label', label);

    // get bounding box
    let bbox = target.renderedBoundingBox();
    bbox.color = target.style('background-color');
    if (target.data('name') === 'dependency') {
      bbox.w = 100;
      bbox.h = cy.nodes()[0].renderedHeight();
      bbox.color = 'white';

      if (gui.is_vertical) {
        bbox.y1 += (bbox.y2 - bbox.y1)/2 - 15;
        bbox.x1  = bbox.x2 - 70;
      } else {
        bbox.x1 += (bbox.x2 - bbox.x1)/2 - 50;
      }
    }

    // TODO: rank the labels + make the style better
    const autocompletes = target.data('name') === 'pos-node'
      ? validate.U_POS
      : target.data('name') === 'dependency'
        ? validate.U_DEPRELS
        : [];

    console.log(autocompletes)
    console.log($('#edit').autocomplete)
    // add the edit input
    $('#edit')
      .val('')
      .focus()
      .val(label)
      .css('top', bbox.y1)
      .css('left', bbox.x1)
      .css('height', bbox.h)
      .css('width', bbox.w + 5)
      .attr('target', target.attr('id'))
      .addClass('activated')
      .autocomplete({
        lookup: autocompletes,
        tabDisabled: false,
        autoSelectFirst: true,
        lookupLimit: 5 });

    // add the background-mute div
    $('#mute').addClass('activated')
      .css('height', gui.is_vertical
        ? `${gui.tokens.length * 50}px`
        : $(window).width() - 10);

    $('#edit').focus(); // move cursor to the end
    if (target.data('name') === 'dependency')
      $('#edit').select(); // highlight the current contents

  }

  makeDependency(src, tar) {
    console.log(src, tar);
    log.debug(`called makeDependency(${src.attr('id')}=>${tar.attr('id')})`);
    /**
     * Called by clicking a form-node while there is already an active form-node.
     * Changes the text data and redraws the graph. Currently supports only conllu.
     */

    src = src.data('analysis');
    tar = tar.data('analysis');

    if (src === tar) {
      log.warn(`makeDependency(): unable to create dependency within superToken ${src.superTokenId}`);
      return;
    }

    const oldHead = manager.current.getById(src.head);
    src.addHead(tar);
    manager.parse(manager.conllu);

    window.undoManager.add({
      undo: () => {
        src.removeHead(tar);
        manager.parse(manager.conllu);
      },
      redo: () => {
        src.addHead(tar);
        manager.parse(manager.conllu);
      }
    });
    /*
    // TODO:
    // If the target POS tag is PUNCT set the deprel to @punct [99%]
    // IF the target POS tag is CCONJ set the deprel to @cc [88%]
    // IF the target POS tag is SCONJ set the deprel to @mark [86%]
    // IF the target POS tag is DET set the deprel to @det [83%]

    const POS_TO_REL = {
        'PUNCT': 'punct',
        'DET': 'det',
        'CCONJ': 'cc',
        'SCONJ': 'mark'
    }

    // TODO: Put this somewhere better
    if (thisToken.upostag in POS_TO_REL)
        sentAndPrev = changeConlluAttr(sent, indices, 'deprel', POS_TO_REL[thisToken.upostag]);

    let isValidDep = true;
    if (thisToken.upostag === 'PUNCT' && !is_projective_nodes(sent.tokens, [targetIndex])) {
        log.warn('writeArc(): Non-projective punctuation');
        isValidDep = false
    }*/
  }

  removeDependency(ele) {
    log.debug(`called removeDependency(${ele.attr('id')})`);

    const source = ele.data('sourceConllu'),
      oldHead    = modify(source.superTokenId, source.subTokenId, 'head', undefined),
      oldDeprel  = modify(source.superTokenId, source.subTokenId, 'deprel', undefined);

    window.undoManager.add({
      undo: () => {
        modify(source.superTokenId, source.subTokenId, 'head', oldHead);
        modify(source.superTokenId, source.subTokenId, 'deprel', oldDeprel);
      },
      redo: () => {
        modify(source.superTokenId, source.subTokenId, 'head', undefined);
        modify(source.superTokenId, source.subTokenId, 'deprel', undefined);
      }
    });
  }

  setAsRoot(ele) {
    log.debug(`called setAsRoot(${ele.attr('id')})`);

    // check if there is already a root
    let oldRoot;
    gui.iterTokens((num, token) => {
      if ((token.deprel).toLowerCase() === 'root' && token.head == 0)
        oldRoot = token;
    });
    log.error(`setAsRoot(): oldRoot: ${oldRoot.superTokenId}:${oldRoot.subTokenId || '_'}`);

    if (oldRoot) {
      // unset as root
      modify(oldRoot.superTokenId, oldRoot.subTokenId, 'head', undefined);
      modify(oldRoot.superTokenId, oldRoot.subTokenId, 'deprel', undefined);
    }

    // set new root
    ele = ele.data('conllu');
    const eleOldHead = modify(ele.superTokenId, ele.subTokenId, 'head', 0),
      eleOldDeprel = modify(ele.superTokenId, ele.subTokenId, 'deprel', 'root');

    window.undoManager.add({
      undo: () => {
        if (oldRoot) {
          modify(oldRoot.superTokenId, oldRoot.subTokenId, 'head', 0);
          modify(oldRoot.superTokenId, oldRoot.subTokenId, 'deprel', 'root');
        }
        modify(ele.superTokenId, ele.subTokenId, 'head', eleOldHead);
        modify(ele.superTokenId, ele.subTokenId, 'deprel', eleOldDeprel);
      },
      redo: () => {
        if (oldRoot) {
          modify(oldRoot.superTokenId, oldRoot.subTokenId, 'head', undefined);
          modify(oldRoot.superTokenId, oldRoot.subTokenId, 'deprel', undefined);
        }
        modify(ele.superTokenId, ele.subTokenId, 'head', 0);
        modify(ele.superTokenId, ele.subTokenId, 'deprel', 'root');
      }
    });
  }

  merge(direction, strategy) {
    log.error(`called mergeNodes(${dir})`);

    // old: (toMerge, side, how)

    /* Support for merging tokens into either a new token or a supertoken.
    Recieves the node to merge, side (right or left) and a string denoting
    how to merge the nodes. In case of success, redraws the tree. */
    // const indices = findConlluId(toMerge);

    const oldSentence = manager.sentence;

    // prefer traits on this one
    const major = cy.$('.merge').data('conllu');
    // either one to the left or to the right (w/o wrapping)
    const minor = manager.current.tokens[ major.superTokenId + (direction === 'left' ? -1 : 1) ];

    // make sure we have stuff
    if (!major || !minor) {
      log.error('mergeNodes(): cannot merge these tokens');
      return;
    }

    manager.current.merge(major, minor, strategy);

    undoManager.add({
      undo: () => {
        manager.parse(oldSentence);
      },
      redo: () => {
        manager.parse(manager.conllu);
      }
    });
  }
}

function getEdgeHeight(srcNum, tarNum) {

  let edgeHeight = cfg.defaultEdgeHeight * (tarNum - srcNum);
  if (gui.is_ltr)
    edgeHeight *= -1;
  if (Math.abs(edgeHeight) !== 1)
    edgeHeight *= cfg.defaultEdgeCoeff;
  if (gui.is_vertical)
    edgeHeight = 45;

  log.debug(`getEdgeHeight(): ${edgeHeight}`);

  return edgeHeight;
}

function modify(superTokenId, subTokenId, attrKey, attrValue) {
  log.info(`called modify(superTokenId:${superTokenId}, subTokenId:${subTokenId}, attr:${attrKey}=>${attrValue})`);

  const conllu = manager.current;
  log.debug(`modify(): before: ${conllu.tokens[superTokenId][attrKey]}`);

  if (attrKey === 'head') // need this here b/c [set head] sets a pointer to a token
    attrValue = conllu.getById(attrValue);

  let oldValue;
  if (subTokenId !== null && subTokenId !== undefined) {
    oldValue = conllu.tokens[superTokenId].tokens[subTokenId][attrKey];
    conllu.tokens[superTokenId].tokens[subTokenId][attrKey] = attrValue;
  } else {
    oldValue = conllu.tokens[superTokenId][attrKey];
    conllu.tokens[superTokenId][attrKey] = attrValue;
  }

  log.debug(`modify(): during: ${conllu.tokens[superTokenId][attrKey]}`);
  manager.parse(conllu.serial);
  log.debug(`modify(): after:  ${manager.current.tokens[superTokenId][attrKey]}`);

  // return oldValue for undo/redo purposes
  return oldValue;
}

function onClickFormNode(event) {
  const target = event.target;
  log.critical(`called onClickFormNode(${target.attr('id')})`);

  if (gui.moving_dependency) {

    const source = cy.$('.arc-source');

    graph.makeDependency(source, target);
    cy.$('.moving').removeClass('moving');
    gui.moving_dependency = false;

    // right-click the new edge
    cy.$(`#${source.attr('id')} -> #${target.attr('id')}`).trigger('cxttapend');

  } else {

    graph.save();

    cy.$('.arc-source').removeClass('arc-source');
    cy.$('.arc-target').removeClass('arc-target');
    cy.$('.selected').removeClass('selected');

    if (target.hasClass('activated')) {
      target.removeClass('activated');

    } else {

      const source = cy.$('.activated');
      target.addClass('activated');

      // if there was already an activated node
      if (source.length === 1) {
        graph.makeDependency(source, target);
        source.removeClass('activated');
        target.removeClass('activated');
      }
    }
  }
}

function onClickPosNode(event) {
  const target = event.target;
  log.debug(`called onClickPosNode(${target.attr('id')})`);

  graph.save();
  gui.editing = target;

  cy.$('.activated').removeClass('activated');
  cy.$('.arc-source').removeClass('arc-source');
  cy.$('.arc-target').removeClass('arc-target');
  cy.$('.selected').removeClass('selected');

  graph.editLabel(target);
}

function onClickChildNode(event) {
  // NB: event.target is the PARENT of a child we click
  const target = event.target;
  log.debug(`called onClickChildNode(${target.attr('id')})`);
  target.toggleClass('supAct');
  console.info('onClickChildNode()', event);
  alert('onClickChildNode()');
}

function onCxttapendFormNode(event) {
  const target = event.target;
  log.debug(`called onCxttapendFormNode(${target.attr('id')})`);

  graph.save();
  gui.editing = target;

  cy.$('.activated').removeClass('activated');
  cy.$('.arc-source').removeClass('arc-source');
  cy.$('.arc-target').removeClass('arc-target');
  cy.$('.selected').removeClass('selected');

  graph.editLabel(target);
}

function onClickDependencyEdge(event) {
  const target = event.target;
  log.debug(`called onClickDependencyEdge(${target.attr('id')})`);

  graph.save();
  gui.editing = target;

  cy.$('.activated').removeClass('activated');
  cy.$('.arc-source').removeClass('arc-source');
  cy.$('.arc-target').removeClass('arc-target');
  cy.$('.selected').removeClass('selected');

  graph.editLabel(target);
}

function onCxttapendDependencyEdge(event) {
    const target = event.target;
    log.debug(`called onCxttapendDependencyEdge(${target.attr('id')})`);

    /**
     * Activated when an arc is selected. Adds classes showing what is selected.
     */

    graph.save();

    cy.$('.activated').removeClass('activated');

    if (target.hasClass('selected')) {

      cy.$(`#${target.data('source')}`).removeClass('arc-source');
      cy.$(`#${target.data('target')}`).removeClass('arc-target');  // visual effects on targeted node
      target.removeClass('selected');

    } else {

      cy.$('.arc-source').removeClass('arc-source');
      cy.$(`#${target.data('source')}`).addClass('arc-source');

      cy.$('.arc-target').removeClass('arc-target');
      cy.$(`#${target.data('target')}`).addClass('arc-target');

      cy.$('.selected').removeClass('selected');
      target.addClass('selected');

    }
}


module.exports = Graph;
