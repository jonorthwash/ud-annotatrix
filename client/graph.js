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

    this.progress = new ProgressBar();

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

    function getDependencyEdge(format, head, token, deprel, progress) {

      progress.total += 1;
      if (deprel && deprel !== '_')
        progress.done += 1;

      if (head.name === 'RootToken')
        return;

      deprel = deprel || '';

      const id = getIndex(token, format),
        headId = getIndex(head, format),
        label = gui.is_ltr
          ? token.indices.absolute > head.indices.absolute
            ? `${deprel}⊳`
            : `⊲${deprel}`
          : token.indices.absolute > head.indices.absolute
            ? `⊲${deprel}`
            : `${deprel}⊳`;

      eles.push({
        data: {
          id: `dep_${id}_${headId}`,
          name: `dependency`,
          attr: `deprel`,
          deprel: deprel,
          source: `form-${headId}`,
          sourceToken: head,
          target: `form-${id}`,
          targetToken: token,
          length: `${(deprel || '').length / 3}em`,
          label: label,
          ctrl: getCtrl(head, token),
        },
        classes: validate.depEdgeClasses(sent, head, token),
        style: getStyle(head, token),
      });
    }

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
      let num = token.indices.absolute - 1;
      let clump = token.indices.cytoscape;
      let pos = format === 'CG3'
        ? token.xpostag || token.upostag
        : token.upostag || token.xpostag;

      if (token.isSuperToken) {

        eles.push({ // multiword label
          data: {
            id: `multiword-${id}`,
            num: num,
            clump: clump,
            name: `multiword`,
            label: `${token.form} ${toSubscript(`${id}`)}`,
            length: `${token.form.length > 3
              ? token.form.length * 0.7
              : token.form.length}em`
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
              num: num,
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
              num: num,
              clump: clump,
              name: 'form',
              attr: 'form',
              form: token.form,
              label: token.form || '',
              length: `${(token.form || '').length > 3
                ? (token.form || '').length * 0.7
                : (token.form || '').length}em`,
              state: `normal`,
              parent: `num-${id}`,
              token: token,
            },
            classes: `form${sent.root === token ? ' root' : ''}`,
          },

          { // "pos" node
            data: {
              id: `pos-node-${id}`,
              num: num,
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
              num: num,
              clump: clump,
              name: `pos-edge`,
              pos: pos,
              source: `form-${id}`,
              target: `pos-node-${id}`
            },
            classes: 'pos'
          }
        );

        if (sent.options.enhanced) {
          token.mapDeps((h, d) => getDependencyEdge(format, h, token, d, this.progress));
        } else if (token._head) {
          getDependencyEdge(format, token._head, token, token.deprel, this.progress);
        }
      }
    });

    return eles;
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

    const analysis = gui.editing.data().analysis || gui.editing.data().sourceToken,
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

    src = src.data('token');
    tar = tar.data('token');

    if (src === tar) {
      status.error('token cannot be its own head');
      return;
    }

    addHead(src, tar);

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

  removeDependency(ele) {
    log.debug(`called removeDependency(${ele.attr('id')})`);

    const src = ele.data('sourceToken'),
      tar = ele.data('targetToken');

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

  const ana = manager.current.get(id);

  ana[attr] = value;
  manager.parse(manager.toString());
}

function addHead(srcId, tarId, dep='') {

  src.addHead(tar, dep);
  manager.parse(manager.toString());

}

function removeHead(srcId, tarId) {
  const src = manager.current.get(srcId),
    tar = manager.current.get(tarId);

  src.removeHead(tar);
  manager.parse(manager.toString());
}


module.exports = Graph;
