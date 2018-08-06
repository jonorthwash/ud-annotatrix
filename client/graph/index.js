'use strict';

const _ = require('underscore');
const $ = require('jquery');
const cytoscape = require('./cytoscape/cytoscape.min');
const utils = require('../utils');

const config = require('./config');
const sort = require('./sort');


class Graph {
  constructor(app) {

    this.app = app;
    this.config = config;
    this.progress = {
      done: 0,
      total: 0,
    };

    this.intercepted = false;
    this.editing = null;
    this.moving_dependency = null;

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

    this.length = 0;
    this.clumps = 0;

    this.load();
  }

  get eles() {
    function toSubscript(str) {
      const subscripts = { 0:'₀', 1:'₁', 2:'₂', 3:'₃', 4:'₄', 5:'₅',
        6:'₆', 7:'₇', 8:'₈', 9:'₉', '-':'₋', '(':'₍', ')':'₎' };

      if (str == 'null')
        return '';

      return str.split('').map((char) => {
        return (subscripts[char] || char);
      }).join('');
    }

    function getIndex(token, format) {
      return format === 'CoNLL-U'
        ? token.indices.conllu
        : format === 'CG3'
          ? token.indices.cg3
          : token.indices.absolute;
    }

    var num = 0;

    this.progress.done = 0;
    this.progress.total = 0;

    const sent = this.app.corpus.current,
      format = this.app.corpus.format;

    sent.index();

    let eles = [];

    sent.iterate(token => {

      if (token.indices.cytoscape == null && !token.isSuperToken)
        return;

      let id = getIndex(token, format);
      let clump = token.indices.cytoscape;
      let pos = format === 'CG3'
        ? token.xpostag || token.upostag
        : token.upostag || token.xpostag;
      let isRoot = sent.root.dependents.has(token);
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
        if (token._head)
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

        token.mapHeads(head => {

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
            classes: utils.validate.depEdgeClasses(sent, head.token, token),
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

  makeDependency(src, tar) {

    try {

      src = src.data('token');
      tar = tar.data('token');
      tar.addHead(src);

    } catch (e) {

      if (e instanceof nx.NxError) {

        this.app.gui.status.error(e.message);

      } else {

        throw e;
      }
    }

    this.app.save();

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

  modifyDependency(ele, value) {

    try {

      let src = ele.data('sourceToken');
      let tar = ele.data('targetToken');
      tar.modifyHead(src, value);

    } catch (e) {

      if (e instanceof nx.NxError) {

        this.app.gui.status.error(e.message);

      } else {

        throw e;
      }
    }

    this.app.save();
  }

  removeDependency(ele) {

    try {

      let src = ele.data('sourceToken');
      let tar = ele.data('targetToken');
      tar.removeHead(src);

    } catch (e) {

      if (e instanceof nx.NxError) {

        this.app.gui.status.error(e.message);

      } else {

        throw e;
      }
    }

    this.app.save();
  }

  setRoot(ele) {

    const sent = this.app.corpus.current;
    ele = ele.data('token');

    try {

      if (!this.app.corpus.enhanced)
        sent.root.dependents.clear();

      ele.addHead(sent.root, 'root');

    } catch (e) {

      if (e instanceof nx.NxError) {

        this.app.gui.status.error(e.message);

      } else {

        throw e;
      }
    }

    this.app.save();
  }

  flashTokenSplitInput(ele) {

    ele.addClass('splitting');
    this.editing = ele;
    this.showEditLabelBox(ele);

  }

  splitToken(ele, index) {
    try {

      this.app.corpus.current.split(ele.data('token'), index);

    } catch (e) {

      if (e instanceof nx.NxError) {

        this.app.gui.status.error(e.message);

      } else {

        throw e;
      }
    }

    this.app.save();
  }

  splitSuperToken(ele) {
    try {

      this.app.corpus.current.split(ele.data('token'));

    } catch (e) {

      if (e instanceof nx.NxError) {

        this.app.gui.status.error(e.message);

      } else {

        throw e;
      }
    }

    this.app.save();
  }

  combine(src, tar) {
    try {

      this.app.corpus.current.combine(src, tar);

    } catch (e) {

      if (e instanceof nx.NxError) {

        this.app.gui.status.error(e.message);

      } else {

        throw e;
      }
    }

    this.app.save();
  }

  merge(src, tar) {
    try {

      this.app.corpus.current.merge(src, tar);

    } catch (e) {

      if (e instanceof nx.NxError) {

        this.app.gui.status.error(e.message);

      } else {

        throw e;
      }
    }

    this.app.save();
  }

  getLeftForm() {

    let clump = this.cy.$('.activated').data('clump');
    if (clump === undefined)
      return;

    clump -= 1;

    /*
    // uncomment this to allow wrapping
    if (clump < 0)
      clump = this.clumps;
    if (clump > this.clumps)
      clump = 0;
    */

    return this.cy.$(`.form[clump = ${clump}]`);
  }

  getRightForm() {

    let clump = this.cy.$('.activated').data('clump');
    if (clump === undefined)
      return;

    clump += 1;

    /*
    // uncomment this to allow wrapping
    if (clump < 0)
      next = this.clumps;
    if (clump > this.clumps)
      clump = 0;
    */

    return this.cy.$(`.form[clump = ${clump}]`);
  }

  prev() {

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

  next() {

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

  save() {

    if (this.cy) {
      config.zoom = this.cy.zoom();
      config.pan = this.cy.pan();
    }
    let serial = _.pick(config, 'pan', 'zoom');
    serial = JSON.stringify(serial);
    utils.storage.setPrefs('graph', serial);

  }

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
        lookupLimit: 5
      });

    // add the background-mute div
    $('#mute').addClass('activated')
      /*.css('height', this.app.corpus.is_vertical
        ? `${this.length * 50}px`
        : $(window).width() - 10);*/

    $('#edit').focus(); // move cursor to the end
    if (target.data('name') === 'dependency')
      $('#edit').select(); // highlight the current contents

    this.app.gui.status.refresh();
  }

  load() {

    let serial = utils.storage.getPrefs('graph');
    serial = JSON.parse(serial);
    config.set(serial);
  }

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
        this.app.save();

      }
    }

    this.editing = null;
  }

  clear() {

    // intercepted by clicking a canvas subobject || mousemove (i.e. drag) || #edit
    if (this.intercepted)
      return;

    this.commit();

    this.cy.$('*').removeClass('splitting activated multiword-active'
      + 'multiword-selected arc-source arc-target selected moving neighbor'
      + 'merge-source merge-left merge-right combine-source combine-left'
      + 'combine-right');

    this.moving_dependency = false;

    $('#mute').removeClass('activated');
    $('#edit').removeClass('activated');

    this.app.gui.status.refresh();

  }

  draw() {

    const corpus = this.app.corpus;

    if (!corpus.parsed)
      return;

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
    this.options.elements = this.eles;

    this.cy = cytoscape(this.options)
      .minZoom(0.1)
      .maxZoom(10.0)
      .zoom(config.zoom)
      .pan(config.pan);

    // add a slight delay to ensure this gets drawn last
    if (!config.drawn_sentences.has(corpus.index)) {

      console.log('never seen');
      this.cy.fit().center();
      config.zoom = this.cy.zoom();
      config.pan = this.cy.pan();
      config.drawn_sentences.add(corpus.index);

    }

    this.bind();

    return this;
  }

  bind() {

    const self = this;

    // set a countdown to triggering a "background" click unless a node/edge intercepts it
    $('#cy canvas, #mute').mouseup(e => {
      self.intercepted = false;
      setTimeout(() => self.clear(), 100);
    });
    $('#cy canvas').mousemove(e => {
      self.intercepted = true;
    });
    $('#edit').mouseup(e => {
      self.intercepted = true;
    });
    this.cy.on('click cxttapend', '*', e => {
      self.intercepted = true;

      // DEBUG: this line should be taken out in production
      console.info(`clicked ${e.target.attr('id')}, data:`, e.target.data());
    });

    // bind the cy events
    self.cy.on('click', 'node.form', e => {

      const target = e.target;

      self.cy.$('.multiword-active').removeClass('multiword-active');

      if (self.moving_dependency) {

        const dep = self.cy.$('.selected');
        const source = self.cy.$('.arc-source');

        self.makeDependency(source, target);
        self.removeDependency(dep);
        self.cy.$('.moving').removeClass('moving');
        self.moving_dependency = false;

        // right-click the new edge
        self.cy.$(`#${source.attr('id')} -> #${target.attr('id')}`).trigger('cxttapend');

      } else {

        self.commit();

        self.cy.$('.arc-source').removeClass('arc-source');
        self.cy.$('.arc-target').removeClass('arc-target');
        self.cy.$('.selected').removeClass('selected');

        if (target.hasClass('merge-right') || target.hasClass('merge-left')) {

          self.merge(self.cy.$('.merge-source').data('token'), target.data('token'));

        } else if (target.hasClass('combine-right') || target.hasClass('combine-left')) {

          self.combine(self.cy.$('.combine-source').data('token'), target.data('token'));

        } else if (target.hasClass('activated')) {

          self.intercepted = false;
          self.clear();

        } else {

          const source = self.cy.$('.activated');
          target.addClass('activated');

          // if there was already an activated node
          if (source.length === 1) {
            self.makeDependency(source, target);
            source.removeClass('activated');
            target.removeClass('activated');
          }
        }
      }
    });
    self.cy.on('click', 'node.pos', e => {

      const target = e.target;

      self.commit();
      self.editing = target;

      self.cy.$('.activated').removeClass('activated');
      self.cy.$('.arc-source').removeClass('arc-source');
      self.cy.$('.arc-target').removeClass('arc-target');
      self.cy.$('.selected').removeClass('selected');

      this.showEditLabelBox(target);

    });
    self.cy.on('click', '$node > node', e => {

      const target = e.target;

      self.cy.$('.activated').removeClass('activated');

      if (target.hasClass('multiword-active')) {
        target.removeClass('multiword-active');
      } else {
        self.cy.$('.multiword-active').removeClass('multiword-active');
        target.addClass('multiword-active');
      }
    });
    self.cy.on('click', 'edge.dependency', e => {

      const target = e.target;

      self.commit();
      self.editing = target;

      self.cy.$('.activated').removeClass('activated');
      self.cy.$('.arc-source').removeClass('arc-source');
      self.cy.$('.arc-target').removeClass('arc-target');
      self.cy.$('.selected').removeClass('selected');

      this.showEditLabelBox(target);

    });
    self.cy.on('cxttapend', 'node.form', e => {

      const target = e.target;

      self.commit();
      self.editing = target;

      self.cy.$('.activated').removeClass('activated');
      self.cy.$('.arc-source').removeClass('arc-source');
      self.cy.$('.arc-target').removeClass('arc-target');
      self.cy.$('.selected').removeClass('selected');

      this.showEditLabelBox(target);

    });
    self.cy.on('cxttapend', 'edge.dependency', e => {

      const target = e.target;

      self.commit();
      self.cy.$('.activated').removeClass('activated');

      if (target.hasClass('selected')) {

        self.cy.$(`#${target.data('source')}`).removeClass('arc-source');
        self.cy.$(`#${target.data('target')}`).removeClass('arc-target');  // visual effects on targeted node
        target.removeClass('selected');

      } else {

        self.cy.$('.arc-source').removeClass('arc-source');
        self.cy.$(`#${target.data('source')}`).addClass('arc-source');

        self.cy.$('.arc-target').removeClass('arc-target');
        self.cy.$(`#${target.data('target')}`).addClass('arc-target');

        self.cy.$('.selected').removeClass('selected');
        target.addClass('selected');

      }
    });

    //self.cy.on('mousemove', e => mice.emit(e.position));
  }
}




module.exports = Graph;
