"use strict";

const _ = require("underscore");
const $ = require("jquery");
const config = require("./config");
const nx = require("notatrix");
const sort = require("./sort");
const utils = require("../utils");
const v = require("./visualiser.js");

/**
 * Abstraction over the graph editor.  Handles interaction between the graph
 *  and the user.  For example, all the event handlers are here, the methods that
 *  draw the graph, and the methods that place the mice / locks.
 *
 * @param {App} app a reference to the parent of this module
 */
class Graph {
  constructor(app) {
    console.log("CONFIG:", config);
    // save refs
    this.app = app;
    this.config = config;

    this.v = v;

    // keep track for our progress bar
    this.progress = {
      done: 0,
      total: 0,
    };

    // GUI-state stuff
    this.intercepted = false;
    this.editing = null;
    this.moving_dependency = null;

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

    // Stores the token objects corresponding to each form.
    // We need to do this rather than just storing the token
    // objects in the html object using .data() because
    // apparently, if we set the data in visualiser.js,
    // we won't be able to fetch it in here. So this is the
    // only way really.
    this.tokens = {};

    // Same as above but for multiword tokens
    this.mwTokens = {};

    // Maps local token numbers to global token numbers
    // Basically so empty nodes are easier to deal with
    this.presentationId = {};

    // load configuration prefs
    this.load();
  }

  // ---------------------------------------------------------------------------
  // core functionality

  /**
   * Build a list of elements, both nodes and edges.  This function
   *  also validates all the elements.
   *
   * @return {Array} [Object]
   */
  get eles() {
    this.presentationId = {};
    // helper function to get subscripted index numbers for superTokens
    function toSubscript(str) {
      const subscripts = {
        0: "₀",
        1: "₁",
        2: "₂",
        3: "₃",
        4: "₄",
        5: "₅",
        6: "₆",
        7: "₇",
        8: "₈",
        9: "₉",
        "-": "₋",
        "(": "₍",
        ")": "₎"
      };

      if (str == "null")
        return "";

      return str.split("").map((char) => { return (subscripts[char] || char); }).join("");
    }

    // helper function to get index numbers for a particular format
    function getIndex(token, format) {
      return format === "CoNLL-U" ? token.indices.conllu
                                  : format === "CG3" ? token.indices.cg3 : token.indices.absolute;
    }

    // reset our progress tracker
    this.progress.done = 0;
    this.progress.total = 0;

    // cache these
    const sent = this.app.corpus.current, format = this.app.corpus.format;

    // num is like clump except not including superTokens, eles in the list
    let num = 0, eles = [];

    // tokenNum counts just normal tokens (no supertokens and dependencies)
    let tokenNum = 0;

    // Counts just supertokens
    let mwTokenNum = 0;

    // walk over all the tokens
    sent.index().iterate(token => {
      // don't draw other analyses
      if (token.indices.cytoscape == null && !token.isSuperToken)
        return;

      // cache some values
      let id = getIndex(token, format);
      let clump = token.indices.cytoscape;
      let pos = format === "CG3" ? token.xpostag || token.upostag : token.upostag || token.xpostag;
      let isRoot = sent.root.dependents.has(token);

      // after iteration, this will just be the max
      this.clumps = clump;

      if (token.isSuperToken) {

        eles.push({ // multiword node
          id: `multiword-${id}`,
          clump: clump,
          name: `multiword`,
          label: `${token.form} ${toSubscript(`${id}`)}`,
          token: token,
          conlluId: token.indices.conllu,
          absoluteId: token.indices.absolute,
          cg3Id: token.indices.cg3,
          len: token._analyses[0]._subTokens.length,
          subId: mwTokenNum,
          classes: 'multiword'
        });

        this.mwTokens[mwTokenNum] = token;

      } else {

        this.progress.total += 2;
        if (pos && pos !== "_")
          this.progress.done += 1;
        if (token.heads.length)
          this.progress.done += 1;

        let parent = token.name === "SubToken" ? "multiword-" + getIndex(sent.getSuperToken(token), format) : undefined;

        this.tokens[tokenNum] = token;

		    this.presentationId[id] = tokenNum;

        eles.push(
          { // "form" node, including pos data
            id: `form-${tokenNum}`,
            subId: tokenNum,
            conlluId: id,
            num: ++num,
            clump: clump,
            name: 'form',
            attr: 'form',
            form: token.form,
            label: token.form || '_',
            type: parent ? 'subToken' : 'token',
            state: `normal`,
            parent: `num-${tokenNum}`,
            token: token,
            classes: isRoot ? 'form root' : 'form',
            posClasses: utils.validate.posNodeClasses(pos),
            posAttr: format === 'CG3' ? `xpostag` : `upostag`,
            posLabel: pos || '',
          },
        );
        tokenNum++;
      }
      
    });

    sent.index().iterate(token => {
      // iterate over the token's heads to get edges
      token.mapHeads((head, i) => {

        // if not enhanced, only draw the first dependency
        if (i && !sent.options.enhanced)
          return;

        this.progress.total += 1;
        if (head.deprel && head.deprel !== "_")
          this.progress.done += 1;

        // roots don't get edges drawn (just bolded)
        if (head.token.name === "RootToken")
          return;

        let deprel = head.deprel || "";

        const id = getIndex(token, format),
          headId = getIndex(head.token, format),
          label = this.app.corpus.is_ltr
            ? token.indices.absolute > head.token.indices.absolute
              ? `${deprel}⊳`
              : `⊲${deprel}`
            : token.indices.absolute > head.token.indices.absolute
              ? `⊲${deprel}`
              : `${deprel}⊳`;

        const presentId = this.presentationId[id];
        const presentHeadId = this.presentationId[headId];

        eles.push({
          id: `dep_${presentId}_${presentHeadId}`,
          name: `dependency`,
          num: ++num,
          attr: `deprel`,
          deprel: deprel,
          source: `token-${presentHeadId}`,
          sourceNum: parseInt(presentHeadId),
          sourceToken: head.token,
          target: `token-${presentId}`,
          targetNum: parseInt(presentId),
          targetToken: token,
          label: label,
          enhanced: i ? true: false,
          classes: utils.validate.depEdgeClasses(sent, token, head),
        });
      });
    });

    this.length = num;
    return eles;
  }

  /**
   * Create the cytoscape instance and populate it with the nodes and edges we
   * generate in `this.eles`.
   *
   * @return {Graph} (chaining)
   */
  draw() {
    // cache a ref

    this.v.bind(this);
    this.v.run();

    // add the mice and locks from `collab`
    this.drawMice();
    this.setLocks();

    // check if we had something locked already before we redrew the graph
    if (config.locked_index === this.app.corpus.index) {

      // add the class to the element
      const locked = $("#" + config.locked_id);
      locked.addClass(config.locked_classes);

      if (config.locked_classes.indexOf("merge-source") > -1) {

        // add the classes to adjacent elements if we were merging

        const left = this.getPrevForm();
        if (left.length && !left.hasClass("activated") && !left.hasClass("blocked") && left.attr('id').includes('form'))
          left.addClass("neighbor merge-left");

        const right = this.getNextForm();
        if (right.length && !right.hasClass("activated") && !right.hasClass("blocked") && right.attr('id').includes('form'))
          right.addClass("neighbor merge-right");

      } else if (config.locked_classes.indexOf("combine-source") > -1) {

        // add the classes to the adjacent elements if we were combining

        const left = this.getPrevForm();
        if (left.length && !left.hasClass("activated") && !left.hasClass("blocked") && left.attr('id').includes('form'))
          left.addClass("neighbor combine-left");

        const right = this.getNextForm();
        if (right.length && !right.hasClass("activated") && !right.hasClass("blocked") && right.attr('id').includes('form'))
          right.addClass("neighbor combine-right");
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

    // Triggering a "background" click unless a node/edge intercepts it
    // Note: this triggers after everything else. Also, we call unbind
    // because event handlers would otherwise stack on #mute.
    $('#graph-svg, #mute').unbind().on('click contextmenu', function(e) {
      self.save();
      self.clear();
      self.intercepted = false;
      e.preventDefault();
    });

    // don't clear if we clicked inside #edit
    $('#edit').click(function() {
      self.intercepted = true;
    });

    // If there is a click on an element, intercept.
    $('#graph-svg').on('click contextmenu', '*', e => {
      self.intercepted = true;
    });

    // Click on a form
    $('.token').click(function() {
      self.intercepted = true;

      let targetNum = $(this).attr('subId');
      // THIS is #group-[id]. But we want #form-[id].
      let target = $('#form-' + targetNum);
      if (target.hasClass('locked'))
        return;
      if (self.moving_dependency) {

        const dep = $('.selected');
        const sourceNum = $('.arc-source').attr('subId');

        // make a new dep, remove the old one
        self.makeDependency(self.tokens[sourceNum], self.tokens[targetNum]);
        self.removeDependency(dep);
        $('.moving').removeClass('moving');
        self.moving_dependency = false;

        const newEdge = $('#dep_' + targetNum + '_' + sourceNum);
        // right click the new edge and lock it
        newEdge.trigger('contextmenu');
        self.moving_dependency = true;
        self.lock(newEdge);

      } else {

        // check if there's anything in-progress
        self.commit();

        $('.arc-source').removeClass('arc-source');
        $('.arc-target').removeClass('arc-target');
        $('.selected').removeClass('selected');

        // handle the click differently based on current state

        if (target.hasClass('merge-right') || target.hasClass('merge-left')) {

          // perform merge
          let sourceNum = $('.merge-source').attr('subId');
          self.merge(self.tokens[sourceNum], self.tokens[targetNum]);
          self.unlock();

        } else if (target.hasClass('combine-right') || target.hasClass('combine-left')) {

          // perform combine
          let sourceNum = $('.combine-source').attr('subId');
          self.combine(self.tokens[sourceNum], self.tokens[targetNum]);
          self.unlock();

        } else if (target.hasClass('activated')) {

          // de-activate
          self.intercepted = false;
          self.clear();

        } else {

          let source = $('.activated');
          target.addClass('activated');

          // if there was already an activated node
          if (source.length === 1) {
            // add a new edge
            let sourceNum = source.attr('subId');
            self.makeDependency(self.tokens[sourceNum], self.tokens[targetNum]);
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

    d3.select("#graph-svg").on("mousemove", function() {
      // Get mouse position and un"scale/pan" it
      let position = d3.mouse(this);
      position[0] = (position[0] - self.config.pan.x) / self.config.zoom;
      position[1] = (position[1] - self.config.pan.y) / self.config.zoom;
      // send out a 'move mouse' event at most every `mouse_move_delay` msecs
      if (self.app.initialized && !self.mouseBlocked && self.app.online)
        self.app.socket.broadcast("move mouse", {"x": position[0], "y": position[1]});

      // enforce the delay
      self.mouseBlocked = true;
      setTimeout(() => { self.mouseBlocked = false; }, config.mouse_move_delay);

    });

    // Handle click on pos nodes
    $(".pos, .pos-label").on('click', function() {
      self.intercepted = true;
      // If we click on the text, we want to convert it to the deprel id
      let targetId = $(this).attr('id').replace('text-','');

      const target = $('#' + targetId);

      if (target.hasClass("locked"))
        return;

      self.commit();
      self.editing = target;

      $(".activated").removeClass("activated");
      $(".arc-source").removeClass("arc-source");
      $(".arc-target").removeClass("arc-target");
      $(".selected").removeClass("selected");

      self.showEditLabelBox(target);
      self.lock(target);
    });

    // Handles click on multiword token
    $(".multiword").on("click", e => {

      const target = $(e.target);

      if (target.hasClass("locked"))
        return;

      $(".activated").removeClass("activated");

      if (target.hasClass("multiword-active")) {

        target.removeClass("multiword-active");
        self.unlock();

      } else {

        $(".multiword-active").removeClass("multiword-active");
        target.addClass("multiword-active");
        self.lock(target);
      }
    });

    // Handles editing of forms
    $('.token').on('contextmenu', function() {
      let targetNum = $(this).attr('subId');
      // THIS is #group-[id]. But we want #form-[id].
      let target = $('#form-' + targetNum);

      if (target.hasClass("locked"))
        return;

      self.commit();
      self.editing = target;

      $(".activated").removeClass("activated");
      $(".arc-source").removeClass("arc-source");
      $(".arc-target").removeClass("arc-target");
      $(".selected").removeClass("selected");

      self.showEditLabelBox(target);
      self.lock(target);

    });

    // Selecting dependencies
    $('.dependency').contextmenu(function(e) {
      self.intercepted = true;
      const target = $(e.target);
      let targetId = $(this).attr('id');
      let arcSource = targetId.split('_')[2];
      let arcTarget = targetId.split('_')[1];
      if (target.hasClass('locked'))
        return;
      self.commit();
      $('.activated').removeClass('activated');
      if (target.hasClass('selected')) {

        $('#form-' + arcSource).removeClass('arc-source');
        $('#form-' + arcTarget).removeClass('arc-target');
        target.removeClass('selected');
        self.unlock();

      } else {

        $(".arc-source").removeClass("arc-source");
        $("#form-"+ arcSource).addClass("arc-source");

        $(".arc-target").removeClass("arc-target");
        $("#form-" + arcTarget).addClass("arc-target");

        $(".selected").removeClass("selected");
        target.addClass("selected");
        self.lock(target);
      }
    });

    // Editing deprel labels.
    $(".dependency, .deprel-label").on('click', function() {
      self.intercepted = true;
      // If we click on the text, we want to convert it to the deprel id
      let targetId = $(this).attr('id').replace('text-','');

      const target = $('#' + targetId);
      if (target.hasClass('locked')) {
        return;
      }
      self.commit();
      self.editing = target;

      $('.activated').removeClass('activated');
      $('.arc-source').removeClass('arc-source');
      $('.arc-target').removeClass('arc-target');
      $('.selected').removeClass('selected');

      self.showEditLabelBox(target);
      self.lock(target);
    });

    return this;
  }

  /**
   * Save the current graph config to `localStorage`.
   */
  save() {

    let serial = _.pick(config, "pan", "zoom", "locked_index", "locked_id", "locked_classes");
    serial = JSON.stringify(serial);
    utils.storage.setPrefs("graph", serial);
  }

  /**
   * Load the graph config from `localStorage` if it exists.
   */
  load() {

    let serial = utils.storage.getPrefs("graph");
    if (!serial)
      return;

    serial = JSON.parse(serial);
    config.set(serial);
  }

  /**
   * Save in-progress changes to the graph (labels being edited).
   */
  commit() {

    $(".input").removeClass("input");

    if (this.editing === null)
      return; // nothing to do

    if ($(".splitting").length) {

      const value = $("#edit").val();
      let index = value.indexOf(" ");
      index = index < 0 ? value.length : index;

      this.splitToken(this.editing, index);

    } else {

      const attr = this.editing.attr("attr"),
        value = utils.validate.attrValue(attr, $("#edit").val());

      if (attr == "deprel") {

        this.modifyDependency(this.editing, value);

      } else {
        const tokenNum = this.editing.attr("subId");
        this.tokens[tokenNum][attr] = value;
        this.editing = null;
        this.app.save({
          type: "set",
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

    $(":focus").blur();

    $("*").removeClass("splitting activated multiword-active " +
                      "multiword-selected arc-source arc-target selected moving neighbor " +
                      "merge-source merge-left merge-right combine-source combine-left " +
                      "combine-right");

    this.moving_dependency = false;

    $("#mute").removeClass("activated");
    $("#edit").removeClass("activated");

    this.app.gui.status.refresh();
    this.unlock();
  }

  // ---------------------------------------------------------------------------
  // abstractions over modifying the corpus

  /**
   * Try to add `src` as a head for `tar`, save changes, and update graph.
   *
   * @param {BaseToken} src
   * @param {BaseToken} tar
   */
  makeDependency(src, tar) {

    try {
      tar.addHead(src);
      this.unlock();
      this.app.save({
        type: "set",
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
   * @param {PathObject} ele
   * @param {String} deprel
   */
  modifyDependency(ele, deprel) {

    try {

      let id = ele.attr("id");
      let sourceNum = parseInt(id.split("_")[2]);
	    let targetNum = parseInt(id.split("_")[1]);
      let src = this.tokens[sourceNum];
      let tar = this.tokens[targetNum];
      tar.modifyHead(src, deprel);
      this.unlock();
      this.app.save({
        type: "set",
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
   * @param {PathObject} ele
   */
  removeDependency(ele) {

    try {
      let id = ele.attr("id");
      let sourceNum = parseInt(id.split("_")[2]);
	    let targetNum = parseInt(id.split("_")[1]);
      let src = this.tokens[sourceNum];
      let tar = this.tokens[targetNum];
      tar.removeHead(src);
      this.unlock();
      this.app.save({
        type: "set",
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

  insertEmptyTokenAfter(ele) {
    const sent = this.app.corpus.current;
    let eleNum = ele.attr("subId");
    ele = this.tokens[eleNum];
    console.log("inserting empty token after", ele);

    try {

      const newToken = new nx.Token(sent, {
        form: "_",
        isEmpty: true,
      });

      const index = ele.indices.sup;
      // insert the new token after it
      sent.tokens = sent.tokens.slice(0, index + 1).concat(newToken).concat(sent.tokens.slice(index + 1));

      this.app.graph.intercepted = false;
      this.app.graph.clear();
      this.app.gui.refresh();

    } catch (e) {

      if (e instanceof nx.NxError) {

        this.app.gui.status.error(e.message);

      } else {

        throw e;
      }
    }
  }

  /**
   * Toggle whether `ele` is an empty node, save changes, and update the graph
   *
   * @param {BaseToken} ele
   */
  toggleIsEmpty(ele) {

    console.log("toggling isEmpty");
    const sent = this.app.corpus.current;
    let eleNum = ele.attr("subId");
    ele = this.tokens[eleNum];
    console.log(ele.isEmpty, ele);

    try {
      ele.setEmpty(!ele.isEmpty);
      this.unlock();
      this.app.save({
        type: "set",
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
   * @param {BaseToken} ele
   */
  setRoot(ele) {

    const sent = this.app.corpus.current;
    let eleNum = ele.attr("subId");
    ele = this.tokens[eleNum];

    try {

      if (!this.app.corpus.enhanced)
        sent.root.dependents.clear();

      ele.addHead(sent.root, "root");
      this.unlock();
      this.app.save({
        type: "set",
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
   * @param {BaseToken} ele
   * @param {Number} index
   */
  splitToken(ele, index) {

    try {
      let eleNum = ele.attr("subId");
      ele = this.tokens[eleNum];
      this.app.corpus.current.split(ele, index);
      this.unlock();
      this.app.save({
        type: "set",
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
   * @param {BaseToken} ele
   */
  splitSuperToken(ele) {

    try {
      let eleNum = ele.attr("subId");
      this.app.corpus.current.split(this.mwTokens[eleNum]);
      this.unlock();
      this.app.save({
        type: "set",
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
   * @param {BaseToken} src
   * @param {BaseToken} tar
   */
  combine(src, tar) {

    try {

      this.app.corpus.current.combine(src, tar);
      this.unlock();
      this.app.save({
        type: "set",
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
   * @param {BaseToken} src
   * @param {BaseToken} tar
   */
  merge(src, tar) {

    try {

      this.app.corpus.current.merge(src, tar);
      this.unlock();
      this.app.save({
        type: "set",
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
   * @return {(RectObject|undefined)}
   */
  getPrevForm() {
    
    let clump = parseInt($(".activated").attr("subId"));
    if (clump === undefined)
      return;

    clump -= 1;

    return $("#form-" + clump);
  }

  /**
   * Get the `next` form relative to the activated form (no wrapping).  This
   *  is useful for when we want to get the neighbors of a node (e.g. for merge
   *  or combine).  The `next` form is the `form-node` with `clump` one greater.
   *  If there is no `next` form, returns undefined.
   *
   * @return {(RectObject|undefined)}
   */
  getNextForm() {

    let clump = parseInt($(".activated").attr("subId"));
    if (clump === undefined)
      return;

    clump += 1;

    return $("#form-" + clump);
  }

  /**
   * Show #edit on the `previous` cytoscape element, determined by the order it
   *  was drawn to the graph.
   */
  selectPrevEle() {

    let num = parseInt($(".input").attr("num"));
    this.intercepted = false;
    this.clear();

    num -= 1;
    if (num === 0)
      num = this.length;
    if (num > this.length)
      num = 1;

    const ele = $(`[num = ${num}]`);
    this.editing = ele;
    if (ele.length)
      this.showEditLabelBox(ele);
  }

  /**
   * Show #edit on the `next` cytoscape element, determined by the order it
   *  was drawn to the graph.
   */
  selectNextEle() {

    let num = parseInt($(".input").attr("num"));
    this.intercepted = false;
    this.clear();

    num += 1;
    if (num === 0)
      num = this.length;
    if (num > this.length)
      num = 1;

    const ele = $(`[num = ${num}]`);
    this.editing = ele;
    if (ele.length)
      this.showEditLabelBox(ele);
  }

  /**
   * Flash the #edit box, but stay in `splitting` mode (this affects what happens
   *  during `commit`).
   */
  flashTokenSplitInput(ele) {

    ele.addClass("splitting");
    this.editing = ele;
    this.showEditLabelBox(ele);
  }

  /**
   * Flash the #edit box around the current `input` node.  Also locks the target
   *  and flashes the #mute.
   */
  showEditLabelBox(target) {

    target.addClass("input");
    let textElement = $('#text-' + target.attr('id'));
    let textLabel = textElement.text().replace(/[⊳⊲]/, '');
    let textBCR;
    if(target.attr('id').includes('dep')) {
      textBCR = textElement[0].getBoundingClientRect();
    } else {
      textBCR = target[0].getBoundingClientRect();
    }
    let offsetHeight = $("#graph-svg")[0].getBoundingClientRect().y;
    let textX = textBCR.x;
    let textY = textBCR.y - offsetHeight;
    let textWidth = textBCR.width;
    let textHeight = textBCR.height;
    

    // TODO: rank the labels + make the style better
    const autocompletes = target.attr("id").includes("pos")
      ? utils.validate.U_POS
      : target.attr("id").includes("dep")
        ? utils.validate.U_DEPRELS
        : [];

    // add the edit input
    $("#edit")
      .val("")
      .focus()
      .val(textLabel)
      .css("top", textY)
      .css("left", textX)
      .css("height", textHeight)
      .css("width", textWidth)
      .attr("target", target.attr("id"))
      .addClass("activated")
      .selfcomplete(
        {lookup: autocompletes, tabDisabled: false, autoSelectFirst: true, lookupLimit: 5, width: "flex"});

    // add the background-mute div
    $("#mute").addClass("activated");
      /*.css('height', this.app.corpus.is_vertical
        ? `${this.length * 50}px`
        : $(window).width() - 10);*/

    $("#edit").focus(); // move cursor to the end
    if (target.attr("id").includes("dep")) {
      $("#edit").select(); // highlight the current contents
    }

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
      this.v.drawMouse(mouse);
    });
  }

  /**
   * Add the `locked` class to each of the elements being edited by other users
   *  on the current corpus index.
   */
  setLocks() {

    $(".locked")
      .removeClass("locked")
      .data("locked_by", null)
      .css("background-color", "")
      .css("line-color", "");

    this.app.collab.getLocks().forEach(lock => {
      $("#" + lock.locked)
        .addClass("locked")
        .data("locked_by", lock.id)
        .css("background-color", "#" + lock.color)
        .css("line-color", "#" + lock.color);
    });
  }

  /**
   * Add a lock to `ele`, save it to the config, and broadcast it to the other
   *  users.
   *
   * @param {(PathObject|RectObject)}
   */
  lock(ele) {

    if (!ele || !ele.length)
      return this.unlock();

    this.locked = ele;
    config.locked_index = this.app.corpus.index;
    config.locked_id = ele.attr('id');

    let keys = ele.attr("class").split(/\s+/);
    keys = _.intersection(keys, ["selected", "activated"
      , "multiword-active", "merge-source", "combine-source"]);

    config.locked_classes = keys.join(" ");
    this.save();
    if(this.app.online) {
      this.app.socket.broadcast("lock graph", ele.attr("id"));
    }
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
    if (this.app.online) {
      this.app.socket.broadcast("unlock graph");
    }
  }
}

module.exports = Graph;
