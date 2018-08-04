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
const status = require('./status');
const nx = require('notatrix');
const mice = require('./mice');

class Graph {
  constructor(options) {

    this.options = _.defaults(options, {
      container: funcs.inBrowser() ? $('#cy') : null,
      boxSelectionEnabled: false,
      autounselectify: true,
      autoungrabify: true,
      zoomingEnabled: true,
      userZoomingEnabled: true,
      wheelSensitivity: 0.1,
      style: require('./cy-style'),
      layout: null,
      elements: []
    });

    // only do this for in-browser ... add the .selfcomplete method to $()
    if (gui.inBrowser)
      require('./selfcomplete');

    this.length = 0;
    this.clumps = 0;
    this.progress = new ProgressBar();

    // cy handlers
    this.click = {
      form: event => {
        const target = event.target;
        log.debug(`called onClickFormNode(${target.attr('id')})`);

        cy.$('.multiword-active').removeClass('multiword-active');

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

          if (target.hasClass('merge-right') || target.hasClass('merge-left')) {

            this.merge(cy.$('.merge-source').data('token'), target.data('token'));

          } else if (target.hasClass('combine-right') || target.hasClass('combine-left')) {

            this.combine(cy.$('.combine-source').data('token'), target.data('token'));

          } else if (target.hasClass('activated')) {

            gui.intercepted = false;
            this.clear();

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

        showEditLabelBox(target);
      },
      multiword: event => {
        const target = event.target;

        cy.$('.activated').removeClass('activated');

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

        showEditLabelBox(target);
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

        showEditLabelBox(target);
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

    function toSubscript(str) {
      const subscripts = { 0:'₀', 1:'₁', 2:'₂', 3:'₃', 4:'₄', 5:'₅',
        6:'₆', 7:'₇', 8:'₈', 9:'₉', '-':'₋', '(':'₍', ')':'₎' };

      if (str == null)
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

    const sent = manager.current._nx,
      format = manager.current.format;

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
            classes: validate.posNodeClasses(pos),
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

          this.progress.total += 1;
          if (head.deprel && head.deprel !== '_')
            this.progress.done += 1;

          if (head.token.name === 'RootToken')
            return;

          let deprel = head.deprel || '';

          const id = getIndex(token, format),
            headId = getIndex(head.token, format),
            label = gui.is_ltr
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
              ctrl: getCtrl(head.token, token),
            },
            classes: validate.depEdgeClasses(sent, head.token, token),
            style: getStyle(head.token, token),
          });
        });
      }
    });

    this.length = num;
    return eles;
  }

  update() {
    if (!manager.current.parsed)
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
    this.progress.update();

    return this;
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

    cy.on('mousemove', e => mice.emit(e.position));
  }

  clear() {
    log.info(`called onClickCanvas(intercepted: ${gui.intercepted})`);

    // intercepted by clicking a canvas subobject || mousemove (i.e. drag) || #edit
    if (gui.intercepted)
      return;

    this.save();

    cy.$('.splitting').removeClass('splitting');
    cy.$('.activated').removeClass('activated');
    cy.$('.multiword-active').removeClass('multiword-active');
    cy.$('.multiword-selected').removeClass('multiword-selected');
    cy.$('.arc-source').removeClass('arc-source');
    cy.$('.arc-target').removeClass('arc-target');
    cy.$('.selected').removeClass('selected');
    cy.$('.moving').removeClass('moving');
    cy.$('.neighbor').removeClass('neighbor');
    cy.$('.merge-source, .merge-left, .merge-right')
      .removeClass('merge-source merge-left merge-right');
    cy.$('.combine-source, .combine-left, .combine-right')
      .removeClass('combine-source combine-left combine-right');
    gui.moving_dependency = false;

    $('#mute').removeClass('activated');
    $('#edit').removeClass('activated');

    gui.status.update();
  }

  save() {
    log.debug(`called saveGraphEdits(target:${gui.editing ? gui.editing.attr('id') : 'null'}, text:${gui.editing ? $('#edit').val() : ''})`);

    cy.$('.input').removeClass('input');

    if (gui.editing === null)
      return; // nothing to do

    if (cy.$('.splitting').length) {

      const value = $('#edit').val();
      let index = value.indexOf(' ');
      index = index < 0 ? value.length : index;

      this.splitToken(gui.editing, index);

    } else {

      const token = gui.editing.data('token') || gui.editing.data('targetToken'),
        attr = gui.editing.data('attr'),
        value = validate.attrValue(attr, $('#edit').val());

      if (attr === 'deprel') {

        this.modifyDependency(gui.editing, value);

      } else {

        token[attr] = value;
        manager.onChange();

      }
    }

    gui.editing = null;
  }

  makeDependency(src, tar) {
    log.debug(`called makeDependency(${src.attr('id')}=>${tar.attr('id')})`);
    /**
     * Called by clicking a form-node while there is already an active form-node.
     * Changes the text data and redraws the graph. Currently supports only conllu.
     */

    try {

      src = src.data('token');
      tar = tar.data('token');
      tar.addHead(src);

    } catch (e) {

      if (e instanceof nx.NxError) {

        status.error(e.message);

      } else {

        throw e;
      }
    }

    manager.onChange();

    /*
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

  modifyDependency(ele, value) {

    try {

      let src = ele.data('sourceToken');
      let tar = ele.data('targetToken');
      tar.modifyHead(src, value);

    } catch (e) {

      if (e instanceof nx.NxError) {

        status.error(e.message);

      } else {

        throw e;
      }
    }

    manager.onChange();
  }

  removeDependency(ele) {
    log.debug(`called removeDependency(${ele.attr('id')})`);

    try {

      let src = ele.data('sourceToken');
      let tar = ele.data('targetToken');
      tar.removeHead(src);

    } catch (e) {

      if (e instanceof nx.NxError) {

        status.error(e.message);

      } else {

        throw e;
      }
    }

    manager.onChange();
  }

  setRoot(ele) {
    log.debug(`called setAsRoot(${ele.attr('id')})`);

    const sent = manager.current._nx;
    ele = ele.data('token');

    try {

      if (!sent.options.enhanced)
        sent.root.dependents.clear();

      ele.addHead(sent.root, 'root');

    } catch (e) {

      if (e instanceof nx.NxError) {

        status.error(e.message);

      } else {

        throw e;
      }
    }

    manager.onChange();
  }

  flashTokenSplitInput(ele) {

    ele.addClass('splitting');
    gui.editing = ele;
    showEditLabelBox(ele);

  }

  splitToken(ele, index) {
    try {

      manager.current._nx.split(ele.data('token'), index);

    } catch (e) {

      if (e instanceof nx.NxError) {

        status.error(e.message);

      } else {

        throw e;
      }
    }

    manager.onChange();
  }

  splitSuperToken(ele) {
    try {

      manager.current._nx.split(ele.data('token'));

    } catch (e) {

      if (e instanceof nx.NxError) {

        status.error(e.message);

      } else {

        throw e;
      }
    }

    manager.onChange();
  }

  combine(src, tar) {
    try {

      manager.current._nx.combine(src, tar);

    } catch (e) {

      if (e instanceof nx.NxError) {

        status.error(e.message);

      } else {

        throw e;
      }
    }

    manager.onChange();
  }

  merge(src, tar) {
    try {

      manager.current._nx.merge(src, tar);

    } catch (e) {

      if (e instanceof nx.NxError) {

        status.error(e.message);

      } else {

        throw e;
      }
    }

    manager.onChange();

    /*

    function mergeNodes(direction) {

      // the highlighted one is the "major" token
      const major = cy.$('node.form.merge').data().analysis;

      // find the "minor" token by moving either one clump to the left or right
      const minorClump = major.clump
        + (direction === 'left' && gui.is_ltr || direction === 'right' && !gui.is_ltr
          ? -1 : 1);

      // iterate tokens until we find a matching candidate
      let minor = null;
      major.sentence.forEach(token => {
        if (token.analysis.clump === minorClump)
          minor = token.analysis;
      });

      // do the merge
      if (major && minor)
        major.token.mergeWith(minor.token);

      // clean up
      cy.$('node.form.merge').removeClass('merge');
      gui.update();
    }

    */
    // old: (toMerge, side, how)

    /* Support for merging tokens into either a new token or a supertoken.
    Recieves the node to merge, side (right or left) and a string denoting
    how to merge the nodes. In case of success, redraws the tree. */
    // const indices = findConlluId(toMerge);

    /*
    const oldSentence = manager.toString();

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
    */
  }

  getLeftForm() {

    let clump = cy.$('.activated').data('clump');
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

    return cy.$(`.form[clump = ${clump}]`);
  }

  getRightForm() {

    let clump = cy.$('.activated').data('clump');
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

    return cy.$(`.form[clump = ${clump}]`);
  }

  prev() {

    let num = cy.$('.input').data('num');
    gui.intercepted = false;
    this.clear();

    num += 1;
    if (num === 0)
      num = this.length;
    if (num > this.length)
      num = 1;

    const ele = cy.$(`[num = ${num}]`);
    gui.editing = ele;
    if (ele.length)
      showEditLabelBox(ele);

  }

  next() {

    let num = cy.$('.input').data('num');
    gui.intercepted = false;
    this.clear();

    num -= 1;
    if (num === 0)
      num = this.length;
    if (num > this.length)
      num = 1;

    const ele = cy.$(`[num = ${num}]`);
    gui.editing = ele;
    if (ele.length)
      showEditLabelBox(ele);

  }
}

function getStyle(src, tar) {
  let style = {
    'control-point-weights': '0.1 0.5 1',
    'target-endpoint': `0% -50%`
  };

  if (tar.indices.absolute < src.indices.absolute) {
    style['source-endpoint'] = `${-10 * cfg.defaultEdgeCoeff}px -50%`;
  } else {
    style['source-endpoint'] = `${10 * cfg.defaultEdgeCoeff}px -50%`;
  }

  return style;
}

function getCtrl(src, tar) {
  return new Array(4).fill(getEdgeHeight(src, tar));
}

function getEdgeHeight(src, tar) {

  const diff = tar.indices.absolute - src.indices.absolute;

  let edgeHeight = cfg.defaultEdgeHeight * diff;
  if (gui.is_ltr)
    edgeHeight *= -1;
  if (Math.abs(edgeHeight) !== 1)
    edgeHeight *= cfg.defaultEdgeCoeff;
  if (gui.is_vertical)
    edgeHeight = 45;

  log.debug(`getEdgeHeight(): ${edgeHeight}`);

  return edgeHeight;
}

function showEditLabelBox(target) {
  log.debug(`called showEditLabelBox(${target.attr('id')})`);

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

  gui.status.update();
}

module.exports = Graph;
