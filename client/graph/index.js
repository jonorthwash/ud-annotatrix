'use strict';

const _ = require('underscore');
const $ = require('jquery');
const config = require('./config');
const cytoscape = require('./cytoscape/cytoscape.min');
const nx = require('notatrix');
const sort = require('./sort');
const utils = require('../utils');
const zoom = require('./zoom');


/**
 * Abstraction over the cytoscape canvas.  Handles interaction between the graph
 *  and the user.  For example, all the event handlers are here, the methods that
 *  draw the graph, and the methods that place the mice / locks.
 *
 * @param {App} app a reference to the parent of this module
 */
class Graph {
  constructor(app) {

    // save refs
    this.app = app;
    this.config = config;

    // pull this complexity out into its own module
    this.zoom = zoom;

    // keep track for our progress bar
    this.progress = {
      done: 0,
      total: 0,
    };

    // GUI-state stuff
    this.intercepted = false;
    this.editing = null;
    this.moving_dependency = null;

    // default options for the cytoscape canvas
    this.options = {
      container: this.app.gui.config.is_browser ? $('#cy') : null,
      boxSelectionEnabled: false,
      autounselectify: true,
      autoungrabify: true,
      zoomingEnabled: true,
      userZoomingEnabled: true,
      wheelSensitivity: 0.1,
      style: require('./cy-style'),
      layout: null,
      elements: []
    };

    // total number of elements in the graph
    this.length = 0;

    // number of "clumps" in the graph (i.e. form-node, pos-node, pos-edge, and
    //  number-node all form a single "clump"). the clump determines the horiz
    //  positioning of the cytoscape eles
    this.clumps = 0;

    // selector for our currently locked node/edge
    this.locked = null;

    // timer to enforce our mouse-move broadcast min-interval
    this.mouseBlocked = false;

    // load configuration prefs
    this.load();
  }



  // ---------------------------------------------------------------------------
  // core functionality

  /**
   * Build a list of cytoscape elements, both nodes and edges.  This function
   *  also validates all the elements.
   *
   * @return {Array} [{ data: Object, classes: String }]
   */
  get eles() {

    // helper function to get subscripted index numbers for superTokens
    function toSubscript(str) {
      const subscripts = { 0:'₀', 1:'₁', 2:'₂', 3:'₃', 4:'₄', 5:'₅',
        6:'₆', 7:'₇', 8:'₈', 9:'₉', '-':'₋', '(':'₍', ')':'₎' };

      if (str == 'null')
        return '';

      return str.split('').map((char) => {
        return (subscripts[char] || char);
      }).join('');
    }

    // helper function to get index numbers for a particular format
    function getIndex(token, format) {
      return format === 'CoNLL-U'
        ? token.indices.conllu
        : format === 'CG3'
          ? token.indices.cg3
          : token.indices.absolute;
    }

    // reset our progress tracker
    this.progress.done = 0;
    this.progress.total = 0;

    // cache these
    const sent = this.app.corpus.current,
      format = this.app.corpus.format;

    // num is like clump except not including superTokens, eles in the list
    let num = 0, eles = [];

    // walk over all the tokens
    sent.index().iterate(token => {

      // don't draw other analyses
      if (token.indices.cytoscape == null && !token.isSuperToken)
        return;

      // cache some values
      let id = getIndex(token, format);
      let clump = token.indices.cytoscape;
      let pos = format === 'CG3'
        ? token.xpostag || token.upostag
        : token.upostag || token.xpostag;
      let isRoot = sent.root.dependents.has(token);

      // after iteration, this will just be the max
      this.clumps = clump;

      if (token.isSuperToken) {

        eles.push({ // multiword label
          data: {
            id: `multiword-${id}`,
            clump: clump,
            name: `multiword`,
            label: `${token.form} ${toSubscript(`${id}`)}`,
            length: `${token.form.length > 3
              ? token.form.length * 0.7
              : token.form.length}em`,
            token: token,
          },
          classes: 'multiword'
        });

      } else {

        this.progress.total += 2;
        if (pos && pos !== '_')
          this.progress.done += 1;
        if (token.heads.length)
          this.progress.done += 1;

        let parent = token.name === 'SubToken'
          ? 'multiword-' + getIndex(sent.getSuperToken(token), format)
          : undefined;

        eles.push(

          { // "number" node
            data: {
              id: `num-${id}`,
              clump: clump,
              name: 'number',
              label: id,
              pos: pos,
              parent: parent,
              token: token,
            },
            classes: 'number'
          },

          { // "form" node
            data: {
              id: `form-${id}`,
              num: ++num,
              clump: clump,
              name: 'form',
              attr: 'form',
              form: token.form,
              label: token.form || '_',
              length: `${(token.form || '_').length > 3
                ? (token.form || '_').length * 0.7
                : (token.form || '_').length}em`,
              type: parent ? 'subToken' : 'token',
              state: `normal`,
              parent: `num-${id}`,
              token: token,
            },
            classes: isRoot ? 'form root' : 'form',
          },

          { // "pos" node
            data: {
              id: `pos-node-${id}`,
              num: ++num,
              clump: clump,
              name: `pos-node`,
              attr: format === 'CG3' ? `xpostag` : `upostag`,
              pos: pos,
              label: pos || '',
              length: `${(pos || '').length * 0.7 + 1}em`,
              token: token,
            },
            classes: utils.validate.posNodeClasses(pos),
          },

          { // "pos" edge
            data: {
              id: `pos-edge-${id}`,
              clump: clump,
              name: `pos-edge`,
              pos: pos,
              source: `form-${id}`,
              target: `pos-node-${id}`
            },
            classes: 'pos'
          }
        );

        // iterate over the token's heads to get edges
        token.mapHeads((head, i) => {

          // if not enhanced, only draw the first dependency
          if (i && !sent.options.enhanced)
            return;

          // TODO: improve this (basic) algorithm
          function getEdgeHeight(corpus, src, tar) {

            const diff = tar.indices.absolute - src.indices.absolute;

            let edgeHeight = config.edge_height * diff;
            if (corpus.is_ltr)
              edgeHeight *= -1;
            if (Math.abs(edgeHeight) !== 1)
              edgeHeight *= config.edge_coeff;
            if (corpus.is_vertical)
              edgeHeight = 45;

            return edgeHeight;
          }

          this.progress.total += 1;
          if (head.deprel && head.deprel !== '_')
            this.progress.done += 1;

          // roots don't get edges drawn (just bolded)
          if (head.token.name === 'RootToken')
            return;

          let deprel = head.deprel || '';

          const id = getIndex(token, format),
            headId = getIndex(head.token, format),
            label = this.app.corpus.is_ltr
              ? token.indices.absolute > head.token.indices.absolute
                ? `${deprel}⊳`
                : `⊲${deprel}`
              : token.indices.absolute > head.token.indices.absolute
                ? `⊲${deprel}`
                : `${deprel}⊳`;

          eles.push({
            data: {
              id: `dep_${id}_${headId}`,
              name: `dependency`,
              num: ++num,
              attr: `deprel`,
              deprel: deprel,
              source: `form-${headId}`,
              sourceToken: head.token,
              target: `form-${id}`,
              targetToken: token,
              length: `${(deprel || '').length / 3}em`,
              label: label,
              ctrl: new Array(4).fill(getEdgeHeight(this.app.corpus, head.token, token)),
            },
            classes: utils.validate.depEdgeClasses(sent, token, head),
            style: {
              'control-point-weights': '0.1 0.5 1',
              'target-endpoint': `0% -50%`,
              'source-endpoint': token.indices.absolute < head.token.indices.absolute
                ? `${-10 * config.edge_coeff}px -50%`
                : `${10 * config.edge_coeff}px -50%`,
            }
          });
        });
      }
    });

    this.length = num;
    return eles;
  }

  /**
   * Create the cytoscape instance and populate it with the nodes and edges we
   *  generate in `this.eles`.
   *
   * @return {Graph} (chaining)
   */
  draw() {

    // cache a ref
    const corpus = this.app.corpus;

    // extend our default cytoscape config based on current params
    this.options.layout = {
      name: 'tree',
      padding: 0,
      nodeDimensionsIncludeLabels: false,
      cols: (corpus.is_vertical ? 2 : undefined),
      rows: (corpus.is_vertical ? undefined : 2),
      sort: (corpus.is_vertical
        ? sort.vertical
        : corpus.is_ltr
          ? sort.ltr
          : sort.rtl)
    };

    // set the cytoscape content
    this.options.elements = corpus.isParsed ? this.eles : [];

    // instantiate and recall zoom/pan
    this.cy = cytoscape(this.options)
      .minZoom(0.1)
      .maxZoom(10.0)
      .zoom(config.zoom)
      .pan(config.pan);

    // see if we should calculate a zoom/pan or use our default
    this.zoom.checkFirst(this);

    // add the mice and locks from `collab`
    this.drawMice();
    this.setLocks();

    // check if we had something locked already before we redrew the graph
    if (config.locked_index === this.app.corpus.index) {

      // add the class to the element
      const locked = this.cy.$('#' + config.locked_id);
      locked.addClass(config.locked_classes);

      if (config.locked_classes.indexOf('merge-source') > -1) {

        // add the classes to adjacent elements if we were merging

        const left = this.getPrevForm();
        if (left && !left.hasClass('activated') && !left.hasClass('blocked') && left.data('type') === 'token')
          left
            .addClass('neighbor merge-left');

        const right = this.getNextForm();
        if (right && !right.hasClass('activated') && !right.hasClass('blocked') && right.data('type') === 'token')
          right
            .addClass('neighbor merge-right');

      } else if (config.locked_classes.indexOf('combine-source') > -1) {

        // add the classes to the adjacent elements if we were combining

        const left = this.getPrevForm();
        if (left && !left.hasClass('activated') && !left.hasClass('blocked') && left.data('type') === 'token')
          left
            .addClass('neighbor combine-left');

        const right = this.getNextForm();
        if (right && !right.hasClass('activated') && !right.hasClass('blocked') && right.data('type') === 'token')
          right
            .addClass('neighbor combine-right');
      }

      // make sure we lock it in the same way as if we had just clicked it
      this.lock(locked);
    }

    // set event handler callbacks
    return this.bind();
  }

  /**
   * Bind event handlers to the cytoscape elements and the enclosing canvas.
   *
   * @return {Graph} (chaining)
   */
  bind() {

    // avoid problems w/ `this`-rebinding in callbacks
    const self = this;

    // make sure zoom is bound to the correct cytoscape instance
    this.zoom.bind(this);

    // set a countdown to triggering a "background" click unless a node/edge intercepts it
    $('#cy canvas, #mute').mouseup(e => {

      // force focus off our inputs/textarea
      $(':focus').blur();
      self.intercepted = false;
      setTimeout(() => self.clear(), 100);
      self.save();

    });

    // don't clear if we clicked inside #edit
    $('#edit').mouseup(e => { self.intercepted = true; });

    // if we're dragging, don't clear; also save after we change the zoom
    $('#cy canvas')
      .mousemove(e => { self.intercepted = true; })
      .on('wheel', e => self.save());

    this.cy.on('mousemove', e => {

      // send out a 'move mouse' event at most every `mouse_move_delay` msecs
      if (self.app.initialized && !self.mouseBlocked)
        self.app.socket.broadcast('move mouse', e.position);

      // enforce the delay
      self.mouseBlocked = true;
      setTimeout(() => { self.mouseBlocked = false; }, config.mouse_move_delay);

    });

    // don't clear if we right- or left-click on an element
    this.cy.on('click cxttapend', '*', e => {

      self.intercepted = true;

      // debugging
      console.info(`clicked ${e.target.attr('id')}, data:`, e.target.data());
    });

    // bind the cy events
    self.cy.on('click', 'node.form', e => {

      const target = e.target;

      if (target.hasClass('locked'))
        return;

      self.cy.$('.multiword-active').removeClass('multiword-active');

      if (self.moving_dependency) {

        const dep = self.cy.$('.selected');
        const source = self.cy.$('.arc-source');

        // make a new dep, remove the old one
        self.makeDependency(source, target);
        self.removeDependency(dep);
        self.cy.$('.moving').removeClass('moving');
        self.moving_dependency = false;

        const newEdge = self.cy.$(`#${source.attr('id')} -> #${target.attr('id')}`);

        // right click the new edge and lock it
        newEdge.trigger('cxttapend');
        self.lock(newEdge);

      } else {

        // check if there's anything in-progress
        self.commit();

        self.cy.$('.arc-source').removeClass('arc-source');
        self.cy.$('.arc-target').removeClass('arc-target');
        self.cy.$('.selected').removeClass('selected');

        // handle the click differently based on current state

        if (target.hasClass('merge-right') || target.hasClass('merge-left')) {

          // perform merge
          self.merge(self.cy.$('.merge-source').data('token'), target.data('token'));
          self.unlock();

        } else if (target.hasClass('combine-right') || target.hasClass('combine-left')) {

          // perform combine
          self.combine(self.cy.$('.combine-source').data('token'), target.data('token'));
          self.unlock();

        } else if (target.hasClass('activated')) {

          // de-activate
          self.intercepted = false;
          self.clear();

        } else {

          const source = self.cy.$('.activated');
          target.addClass('activated');

          // if there was already an activated node
          if (source.length === 1) {

            // add a new edge
            self.makeDependency(source, target);
            source.removeClass('activated');
            target.removeClass('activated');
            self.unlock();

          } else {

            // activate it
            self.lock(target);

          }
        }
      }
    });

    self.cy.on('click', 'node.pos', e => {

      const target = e.target;

      if (target.hasClass('locked'))
        return;

      self.commit();
      self.editing = target;

      self.cy.$('.activated').removeClass('activated');
      self.cy.$('.arc-source').removeClass('arc-source');
      self.cy.$('.arc-target').removeClass('arc-target');
      self.cy.$('.selected').removeClass('selected');

      this.showEditLabelBox(target);
      self.lock(target);

    });

    self.cy.on('click', '$node > node', e => {

      const target = e.target;

      if (target.hasClass('locked'))
        return;

      self.cy.$('.activated').removeClass('activated');

      if (target.hasClass('multiword-active')) {

        target.removeClass('multiword-active');
        self.unlock();

      } else {

        self.cy.$('.multiword-active').removeClass('multiword-active');
        target.addClass('multiword-active');
        self.lock(target);

      }
    });

    self.cy.on('click', 'edge.dependency', e => {

      const target = e.target;

      if (target.hasClass('locked'))
        return;

      self.commit();
      self.editing = target;

      self.cy.$('.activated').removeClass('activated');
      self.cy.$('.arc-source').removeClass('arc-source');
      self.cy.$('.arc-target').removeClass('arc-target');
      self.cy.$('.selected').removeClass('selected');

      this.showEditLabelBox(target);
      self.lock(target);

    });
    self.cy.on('cxttapend', 'node.form', e => {

      const target = e.target;

      if (target.hasClass('locked'))
        return;

      self.commit();
      self.editing = target;

      self.cy.$('.activated').removeClass('activated');
      self.cy.$('.arc-source').removeClass('arc-source');
      self.cy.$('.arc-target').removeClass('arc-target');
      self.cy.$('.selected').removeClass('selected');

      this.showEditLabelBox(target);
      self.lock(target);

    });
    self.cy.on('cxttapend', 'edge.dependency', e => {

      const target = e.target;

      if (target.hasClass('locked'))
        return;

      self.commit();
      self.cy.$('.activated').removeClass('activated');

      if (target.hasClass('selected')) {

        self.cy.$(`#${target.data('source')}`).removeClass('arc-source');
        self.cy.$(`#${target.data('target')}`).removeClass('arc-target');
        target.removeClass('selected');
        self.unlock();

      } else {

        self.cy.$('.arc-source').removeClass('arc-source');
        self.cy.$(`#${target.data('source')}`).addClass('arc-source');

        self.cy.$('.arc-target').removeClass('arc-target');
        self.cy.$(`#${target.data('target')}`).addClass('arc-target');

        self.cy.$('.selected').removeClass('selected');
        target.addClass('selected');
        self.lock(target);

      }
    });

    return this;
  }

  /**
   * Save the current graph config to `localStorage`.
   */
  save() {

    if (this.cy) {
      config.zoom = this.cy.zoom();
      config.pan = this.cy.pan();
    }
    let serial = _.pick(config, 'pan', 'zoom', 'locked_index'
      , 'locked_id', 'locked_classes');
    serial = JSON.stringify(serial);
    utils.storage.setPrefs('graph', serial);

  }

  /**
   * Load the graph config from `localStorage` if it exists.
   */
  load() {

    let serial = utils.storage.getPrefs('graph');
    if (!serial)
        return;

    serial = JSON.parse(serial);
    config.set(serial);

  }

  /**
   * Save in-progress changes to the graph (labels being edited).
   */
  commit() {

    this.cy.$('.input').removeClass('input');

    if (this.editing === null)
      return; // nothing to do

    if (this.cy.$('.splitting').length) {

      const value = $('#edit').val();
      let index = value.indexOf(' ');
      index = index < 0 ? value.length : index;

      this.splitToken(this.editing, index);

    } else {

      const token = this.editing.data('token') || this.editing.data('targetToken'),
        attr = this.editing.data('attr'),
        value = utils.validate.attrValue(attr, $('#edit').val());

      if (attr === 'deprel') {

        this.modifyDependency(this.editing, value);

      } else {

        token[attr] = value;
        this.editing = null;
        this.app.save({
          type: 'set',
          indices: [this.app.corpus.index],
        });

      }
    }

    this.editing = null;
  }

  /**
   * Remove all the graph state that would indicate we're in the process of
   *  editing a label or activating a particular element.
   */
  clear() {

    // intercepted by clicking a canvas subobject || mousemove (i.e. drag) || #edit
    if (this.intercepted)
      return;

    this.commit();

    this.cy.$('*').removeClass('splitting activated multiword-active '
      + 'multiword-selected arc-source arc-target selected moving neighbor '
      + 'merge-source merge-left merge-right combine-source combine-left '
      + 'combine-right');

    this.moving_dependency = false;

    $('#mute').removeClass('activated');
    $('#edit').removeClass('activated');

    this.app.gui.status.refresh();
    this.unlock();

  }



  // ---------------------------------------------------------------------------
  // abstractions over modifying the corpus

  /**
   * Try to add `src` as a head for `tar`, save changes, and update graph.
   *
   * @param {CytoscapeNode} src
   * @param {CytoscapeNode} tar
   */
  makeDependency(src, tar) {

    try {

      src = src.data('token');
      tar = tar.data('token');
      tar.addHead(src);
      this.unlock();
      this.app.save({
        type: 'set',
        indices: [this.app.corpus.index],
      });

    } catch (e) {

      if (e instanceof nx.NxError) {

        this.app.gui.status.error(e.message);

      } else {

        throw e;
      }
    }

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

  /**
   * Try to change the deprel for the dependency given by `ele` to `deprel`, save
   *  changes, and update graph.
   *
   * @param {CytoscapeEdge} ele
   * @param {String} deprel
   */
  modifyDependency(ele, deprel) {

    try {

      let src = ele.data('sourceToken');
      let tar = ele.data('targetToken');
      tar.modifyHead(src, deprel);
      this.unlock();
      this.app.save({
        type: 'set',
        indices: [this.app.corpus.index],
      });

    } catch (e) {

      if (e instanceof nx.NxError) {

        this.app.gui.status.error(e.message);

      } else {

        throw e;
      }
    }
  }

  /**
   * Try to remove the dependency given by `ele`, save changes, and update graph.
   *
   * @param {CytoscapeEdge} ele
   */
  removeDependency(ele) {

    try {

      let src = ele.data('sourceToken');
      let tar = ele.data('targetToken');
      tar.removeHead(src);
      this.unlock();
      this.app.save({
        type: 'set',
        indices: [this.app.corpus.index],
      });

    } catch (e) {

      if (e instanceof nx.NxError) {

        this.app.gui.status.error(e.message);

      } else {

        throw e;
      }
    }
  }

  /**
   * Try to set `ele` as the root of the sentence, save changes, and update graph.
   *
   * @param {CytoscapeNode} ele
   */
  setRoot(ele) {

    const sent = this.app.corpus.current;
    ele = ele.data('token');

    try {

      if (!this.app.corpus.enhanced)
        sent.root.dependents.clear();

      ele.addHead(sent.root, 'root');
      this.unlock();
      this.app.save({
        type: 'set',
        indices: [this.app.corpus.index],
      });

    } catch (e) {

      if (e instanceof nx.NxError) {

        this.app.gui.status.error(e.message);

      } else {

        throw e;
      }
    }
  }

  /**
   * Try to the token given by `ele` as `index`, save changes, and update graph.
   *
   * @param {CytoscapeNode} ele
   * @param {Number} index
   */
  splitToken(ele, index) {

    try {

      this.app.corpus.current.split(ele.data('token'), index);
      this.unlock();
      this.app.save({
        type: 'set',
        indices: [this.app.corpus.index],
      });

    } catch (e) {

      if (e instanceof nx.NxError) {

        this.app.gui.status.error(e.message);

      } else {

        throw e;
      }
    }
  }

  /**
   * Try to the superToken given by `ele` into normal tokens save changes, and
   *  update graph.
   *
   * @param {CytoscapeNode} ele
   */
  splitSuperToken(ele) {

    try {

      this.app.corpus.current.split(ele.data('token'));
      this.unlock();
      this.app.save({
        type: 'set',
        indices: [this.app.corpus.index],
      });

    } catch (e) {

      if (e instanceof nx.NxError) {

        this.app.gui.status.error(e.message);

      } else {

        throw e;
      }
    }
  }

  /**
   * Try to combine `src` and `tar` into a superToken, save changes, and update
   *  graph.
   *
   * @param {CytoscapeNode} src
   * @param {CytoscapeNode} tar
   */
  combine(src, tar) {

    try {

      this.app.corpus.current.combine(src, tar);
      this.unlock();
      this.app.save({
        type: 'set',
        indices: [this.app.corpus.index],
      });

    } catch (e) {

      if (e instanceof nx.NxError) {

        this.app.gui.status.error(e.message);

      } else {

        throw e;
      }
    }
  }

  /**
   * Try to merge `src` and `tar` into a single normal token, save changes, and
   *  update graph.
   *
   * @param {CytoscapeNode} src
   * @param {CytoscapeNode} tar
   */
  merge(src, tar) {

    try {

      this.app.corpus.current.merge(src, tar);
      this.unlock();
      this.app.save({
        type: 'set',
        indices: [this.app.corpus.index],
      });

    } catch (e) {

      if (e instanceof nx.NxError) {

        this.app.gui.status.error(e.message);

      } else {

        throw e;
      }
    }
  }



  // ---------------------------------------------------------------------------
  // methods for traversing the graph

  /**
   * Get the `previous` form relative to the activated form (no wrapping).  This
   *  is useful for when we want to get the neighbors of a node (e.g. for merge
   *  or combine).  The `previous` form is the `form-node` with `clump` one less.
   *  If there is no `previous` form, returns undefined.
   *
   * @return {(CytoscapeCollection|undefined)}
   */
  getPrevForm() {

    let clump = this.cy.$('.activated').data('clump');
    if (clump === undefined)
      return;

    clump -= 1;

    return this.cy.$(`.form[clump = ${clump}]`);
  }

  /**
   * Get the `next` form relative to the activated form (no wrapping).  This
   *  is useful for when we want to get the neighbors of a node (e.g. for merge
   *  or combine).  The `next` form is the `form-node` with `clump` one greater.
   *  If there is no `next` form, returns undefined.
   *
   * @return {(CytoscapeCollection|undefined)}
   */
  getNextForm() {

    let clump = this.cy.$('.activated').data('clump');
    if (clump === undefined)
      return;

    clump += 1;

    return this.cy.$(`.form[clump = ${clump}]`);
  }

  /**
   * Show #edit on the `previous` cytoscape element, determined by the order it
   *  was drawn to the graph.
   */
  selectPrevEle() {

    let num = this.cy.$('.input').data('num');
    this.intercepted = false;
    this.clear();

    num += 1;
    if (num === 0)
      num = this.length;
    if (num > this.length)
      num = 1;

    const ele = this.cy.$(`[num = ${num}]`);
    this.editing = ele;
    if (ele.length)
      this.showEditLabelBox(ele);

  }

  /**
   * Show #edit on the `next` cytoscape element, determined by the order it
   *  was drawn to the graph.
   */
  selectNextEle() {

    let num = this.cy.$('.input').data('num');
    this.intercepted = false;
    this.clear();

    num -= 1;
    if (num === 0)
      num = this.length;
    if (num > this.length)
      num = 1;

    const ele = this.cy.$(`[num = ${num}]`);
    this.editing = ele;
    if (ele.length)
      this.showEditLabelBox(ele);

  }

  /**
   * Flash the #edit box, but stay in `splitting` mode (this affects what happens
   *  during `commit`).
   */
  flashTokenSplitInput(ele) {

    ele.addClass('splitting');
    this.editing = ele;
    this.showEditLabelBox(ele);

  }

  /**
   * Flash the #edit box around the current `input` node.  Also locks the target
   *  and flashes the #mute.
   */
  showEditLabelBox(target) {

    target.addClass('input');

    // get rid of direction arrows
    const label = target.data('label').replace(/[⊳⊲]/, '');
    target.data('label', label);

    // get bounding box
    let bbox = target.renderedBoundingBox();
    bbox.color = target.style('background-color');
    if (target.data('name') === 'dependency') {
      bbox.w = 100;
      bbox.h = this.cy.nodes()[0].renderedHeight();
      bbox.color = 'white';

      if (this.app.corpus.is_vertical) {
        bbox.y1 += (bbox.y2 - bbox.y1)/2 - 15;
        bbox.x1  = bbox.x2 - 70;
      } else {
        bbox.x1 += (bbox.x2 - bbox.x1)/2 - 50;
      }
    }

    // TODO: rank the labels + make the style better
    const autocompletes = target.data('name') === 'pos-node'
      ? utils.validate.U_POS
      : target.data('name') === 'dependency'
        ? utils.validate.U_DEPRELS
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
        lookupLimit: 5,
        width: 'flex'
      });

    // add the background-mute div
    $('#mute').addClass('activated')
      /*.css('height', this.app.corpus.is_vertical
        ? `${this.length * 50}px`
        : $(window).width() - 10);*/

    $('#edit').focus(); // move cursor to the end
    if (target.data('name') === 'dependency')
      $('#edit').select(); // highlight the current contents

    this.lock(target);
    this.app.gui.status.refresh();
  }



  // ---------------------------------------------------------------------------
  // methods for collaboration

  /**
   * Add `mouse` nodes for each of the users on the current corpus index.
   */
  drawMice() {
    this.app.collab.getMouseNodes().forEach(mouse => {

      const id = mouse.id.replace(/[#:]/g, '_');

      if (!this.cy.$(`#${id}.mouse`).length)
        this.cy.add({
          data: { id: id },
          classes: 'mouse'
        });

      this.cy.$(`#${id}.mouse`)
        .position(mouse.position)
        .css('background-color', '#' + mouse.color);

    });
  }

  /**
   * Add the `locked` class to each of the elements being edited by other users
   *  on the current corpus index.
   */
  setLocks() {

    this.cy.$('.locked')
      .removeClass('locked')
      .data('locked_by', null)
      .css('background-color', '')
      .css('line-color', '');

    this.app.collab.getLocks().forEach(lock => {

      this.cy.$('#' + lock.locked)
        .addClass('locked')
        .data('locked_by', lock.id)
        .css('background-color', '#' + lock.color)
        .css('line-color', '#' + lock.color);

    });
  }

  /**
   * Add a lock to `ele`, save it to the config, and broadcast it to the other
   *  users.
   *
   * @param {(CytoscapeEdge|CytoscapeNode)}
   */
  lock(ele) {

    if (!ele || !ele.length)
      return this.unlock();

    this.locked = ele;
    config.locked_index = this.app.corpus.index;
    config.locked_id = ele.id();

    let keys = Object.keys(_.pick(ele[0]._private.classes._obj, value => !!value));
    keys = _.intersection(keys, ['selected', 'activated'
      , 'multiword-active', 'merge-source', 'combine-source']);

    config.locked_classes = keys.join(' ');
    this.save();
    this.app.socket.broadcast('lock graph', ele.id());

  }

  /**
   * Remove the lock for the current user, save and broadcast.
   */
  unlock() {

    this.locked = null;
    config.locked_index = null;
    config.locked_id = null;
    config.locked_classes = null;
    this.save();
    this.app.socket.broadcast('unlock graph');

  }

}




module.exports = Graph;
