'use strict';

const $ = require('jquery');
const _ = require('underscore');

const cfg = require('./config');
const cytoscape = require('./cytoscape/cytoscape');
const errors = require('./errors');
const funcs = require('./funcs');
const sort = require('./sort');
const validate = require('./validate');
const ProgressBar = require('./progress-bar');

class Graph {
  constructor(options) {

    this.options = _.defaults(options, {
      container: funcs.inBrowser() ? $('#cy') : null,
      boxSelectionEnabled: false,
      autounselectify: true,
      autoungrabify: true,
      zoomingEnabled: true,
      userZoomingEnabled: false,
      wheelSensitivity: 0.1,
      style: require('./cy-style'),
      layout: null,
      elements: []
    });

    // only do this for in-browser ... add the .selfcomplete method to $()
    if (gui.inBrowser)
      require('./selfcomplete');

    this.progressBar = new ProgressBar();

    // cy handlers
    this.click = {
      form: event => {
        const target = event.target;
        log.debug(`called onClickFormNode(${target.attr('id')})`);

        if (gui.moving_dependency) {

          const dep = cy.$('.selected');
          const source = cy.$('.arc-source');

          this.makeDependency(source, target);
          this.removeDependency(dep);
          cy.$('.moving').removeClass('moving');
          gui.moving_dependency = false;

          // right-click the new edge
          cy.$(`#${source.attr('id')} -> #${target.attr('id')}`).trigger('cxttapend');

        } else {

          this.save();

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
              this.makeDependency(source, target);
              source.removeClass('activated');
              target.removeClass('activated');
            }
          }
        }
      },
      pos: event => {
        const target = event.target;
        log.debug(`called onClickPosNode(${target.attr('id')})`);

        this.save();
        gui.editing = target;

        cy.$('.activated').removeClass('activated');
        cy.$('.arc-source').removeClass('arc-source');
        cy.$('.arc-target').removeClass('arc-target');
        cy.$('.selected').removeClass('selected');

        editLabel(target);
      },
      multiword: event => {
        const target = event.target;

        if (target.hasClass('multiword-active')) {
          target.removeClass('multiword-active');
        } else {
          cy.$('.multiword-active').removeClass('multiword-active');
          target.addClass('multiword-active');
        }
      },
      dependency: event => {
        const target = event.target;
        log.debug(`called onClickDependencyEdge(${target.attr('id')})`);

        this.save();
        gui.editing = target;

        cy.$('.activated').removeClass('activated');
        cy.$('.arc-source').removeClass('arc-source');
        cy.$('.arc-target').removeClass('arc-target');
        cy.$('.selected').removeClass('selected');

        editLabel(target);
      }
    };
    this.cxttapend = {
      form: event => {
        const target = event.target;
        log.debug(`called onCxttapendFormNode(${target.attr('id')})`);

        this.save();
        gui.editing = target;

        cy.$('.activated').removeClass('activated');
        cy.$('.arc-source').removeClass('arc-source');
        cy.$('.arc-target').removeClass('arc-target');
        cy.$('.selected').removeClass('selected');

        editLabel(target);
      },
      dependency: event => {
        const target = event.target;
        log.debug(`called onCxttapendDependencyEdge(${target.attr('id')})`);

        /**
         * Activated when an arc is selected. Adds classes showing what is selected.
         */

        this.save();

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
    };
  }

  eles() {
    if (manager.graphable)
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
    return [];
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
      .zoom(gui.zoom)
      .pan(gui.pan);

    // add a slight delay to ensure this gets drawn last
    if (!gui.zoom && !gui.pan)
      setTimeout(() => {
        cy.fit().center();
        gui.zoom = cy.zoom();
        gui.pan = cy.pan();
      }, 5);

    this.bind();
    this.progressBar.update();
  }

  bind() {
    /**
     * Binds event handlers to cy elements.
     * NOTE: If you change the style of a node (e.g. its selector) then
     * you also need to update it here.
     */

    // set a countdown to triggering a "background" click unless a node/edge intercepts it
    $('#cy canvas, #mute').mouseup(event => {
      gui.intercepted = false;
      setTimeout(() => this.clear(), 100);
    });
    $('#cy canvas').mousemove(event => {
      gui.intercepted = true;
    });
    $('#edit').mouseup(event => {
      gui.intercepted = true;
    });
    cy.on('click cxttapend', '*', event => {
      gui.intercepted = true;

      // DEBUG: this line should be taken out in production
      console.info(`clicked ${event.target.attr('id')}, data:`, event.target.data());
    });

    // bind the cy events
    cy.on('click', 'node.form', e => this.click.form(e));
    cy.on('click', 'node.pos', e => this.click.pos(e));
    cy.on('click', '$node > node', e => this.click.multiword(e));
    cy.on('click', 'edge.dependency', e => this.click.dependency(e));
    cy.on('cxttapend', 'node.form', e => this.cxttapend.form(e));
    cy.on('cxttapend', 'edge.dependency', e => this.cxttapend.dependency(e));
  }

  clear() {
    log.info(`called onClickCanvas(intercepted: ${gui.intercepted})`);

    // intercepted by clicking a canvas subobject || mousemove (i.e. drag) || #edit
    if (gui.intercepted)
      return;

    this.save();

    cy.$('.activated').removeClass('activated');
    cy.$('.multiword-active').removeClass('multiword-active');
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

    const analysis = gui.editing.data().analysis || gui.editing.data().sourceAnalysis,
      attr = gui.editing.data().attr,
      oldValue = analysis[attr],
      newValue = $('#edit').val();

    modify(analysis.id, attr, newValue);

    window.undoManager.add({
      undo: () => {
        modify(analysis.id, attr, oldValue);
      },
      redo: () => {
        modify(analysis.id, attr, newValue);
      }
    });

    gui.editing = null;
  }

  makeDependency(src, tar) {
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

    addHead(src.id, tar.id);

    undoManager.add({
      undo: () => {
        removeHead(src.id, tar.id);
        this.clear();
      },
      redo: () => {
        addHead(src.id, tar.id);
        this.clear();
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

    const src = ele.data('sourceAnalysis'),
      tar = ele.data('targetAnalysis');

    removeHead(src.id, tar.id);

    undoManager.add({
      undo: () => {
        addHead(src.id, tar.id);
      },
      redo: () => {
        removeHead(src.id, tar.id);
      }
    });
  }

  setRoot(ele) {
    log.debug(`called setAsRoot(${ele.attr('id')})`);

    // check if there is already a root
    let oldRoot;
    manager.current.forEach(token => {
      token.forEach(analysis => {
        if (analysis.head == 0 || analysis.deprel.toLowerCase() == 'root')
          oldRoot = analysis;
      });
    });

    // set new root
    const newRoot = ele.data('analysis');
    if (!newRoot)
      return;

    if (oldRoot) {
      modify(oldRoot.id, 'head', []);
      modify(oldRoot.id, 'deprel', undefined);
    }

    const oldHead = newRoot.head,
      oldDeprel = newRoot.deprel;

    modify(newRoot.id, 'head', '0');
    modify(newRoot.id, 'deprel', 'root');

    undoManager.add({
      undo: () => {
        if (oldRoot) {
          modify(oldRoot.id, 'head', '0');
          modify(oldRoot.id, 'deprel', 'root');
        }

        modify(newRoot.id, 'head', oldHead);
        modify(newRoot.id, 'deprel', oldDeprel);
      },
      redo: () => {
        if (oldRoot) {
          modify(oldRoot.id, 'head', []);
          modify(oldRoot.id, 'deprel', undefined);
        }

        modify(newRoot.id, 'head', '0');
        modify(newRoot.id, 'deprel', 'root');
      }
    });
  }

  merge(direction, strategy) {
    throw new errors.NotImplementedError('merging not implemented');
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

function editLabel(target) {
  log.debug(`called editLabel(${target.attr('id')})`);

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
    .selfcomplete({
      lookup: autocompletes,
      tabDisabled: false,
      autoSelectFirst: true,
      lookupLimit: 5
    });

  // add the background-mute div
  $('#mute').addClass('activated')
    .css('height', gui.is_vertical
      ? `${gui.tokens.length * 50}px`
      : $(window).width() - 10);

  $('#edit').focus(); // move cursor to the end
  if (target.data('name') === 'dependency')
    $('#edit').select(); // highlight the current contents
}

function modify(id, attr, value) {

  // check we don't have any whitespace
  if (/\s+/g.test(value)) {
    const message = 'ERROR: Unable to add changes with whitespace!  Try creating a new node first.';
    log.error(message);
    alert(message); // TODO: probably should streamline errors
    gui.editing = null;
    return;
  }

  const ana = manager.current.getById(id);

  ana[attr] = value;
  gui.update();
}

function addHead(srcId, tarId, dep='') {
  const src = manager.current.getById(srcId),
    tar = manager.current.getById(tarId);

  src.addHead(tar, dep);
  gui.update();
}

function removeHead(srcId, tarId) {
  const src = manager.current.getById(srcId),
    tar = manager.current.getById(tarId);

  src.removeHead(tar);
  gui.update();
}


module.exports = Graph;
