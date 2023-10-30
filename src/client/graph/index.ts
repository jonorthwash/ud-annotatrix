import * as _ from "underscore";
import * as $ from "jquery";
import * as d3 from "d3";

import * as nx from "../../notatrix";
import * as storage from "../utils/local-storage";
import * as validate from "../utils/validate";
import type {App} from "../app";

import {_graph as config} from "./config";
import * as v from "./visualiser";
import * as tree from "./tree";

interface Progress {
  done: number;
  total: number;
}

export interface DependencyNode {
  id: string;           // `dep_${id}_${headId}`
  name: "dependency";
  num: number;
  attr: string;
  deprel: string;
  source: unknown;      // `token-${id}`
  sourceNum: number;
  sourceToken: nx.BaseToken;
  target: unknown;      // `token-${id}`
  targetNum: number;
  targetToken: nx.BaseToken;
  label: string;
  enhanced: boolean;
  classes: string;
}

export interface MultiwordNode {
  id: string;           // `multiword-${id}`
  clump: number;
  name: "multiword";
  label: string;        // `${form} ${subscript(id)}`
  token: nx.BaseToken;
  conlluId: nx.ConlluIndex;
  absoluteId: number;
//  cg3Id: nx.Cg3Index;
  len: number;
  subId: number;
  classes: string;
}

export interface FormNode {
  id: string;           // `form-${tokenNum}`
  subId: number;
  conlluId: nx.ConlluIndex;
  num: number;
  clump: number;
  name: "form";
  attr: "form";
  form: string;
  label: string;
  type: "subToken"|"token";
  state: "normal";
  parent: string;       // `num-${tokenNum}`
  token: nx.BaseToken;
  classes: string;
  posClasses: string;
  posAttr: "xpostag"|"upostag";
  posLabel: string;
}

export type GraphNode = DependencyNode|MultiwordNode|FormNode;

/**
 * Abstraction over the graph editor.  Handles interaction between the graph
 *  and the user.  For example, all the event handlers are here, the methods that
 *  draw the graph, and the methods that place the mice / locks.
 */
export class Graph {
  public app: App;
  public config: typeof config;
  public grapher: typeof tree|typeof v;
  public progress: Progress;
  public intercepted: boolean;
  public editing: JQuery<HTMLElement>|null;
  public moving_dependency: boolean;
  public length: number;
  private clumps: number;
  private locked: JQuery<HTMLElement>|null;
  private mouseBlocked: boolean;
  private tokens: {[tokenId: number]: nx.BaseToken};
  private mwTokens: {[tokenId: number]: nx.BaseToken};
  public presentationId: {[tokenId: number]: number};
  private treeBlocked: boolean;
  public connections: {[headId: number]: number[]};
  public numTokens: number;

  constructor(app: App) {
    console.log("CONFIG:", config);
    // save refs
    this.app = app;
    this.config = config;

    if (this.app.corpus.is_vertical) {
      this.grapher = tree;
    }
    else {
      this.grapher = v;
    }
    

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

    // We want to block the tree view if there is no root
    // or if there exists a cycle.
    this.treeBlocked = false;

    // Holds all connections between nodes, making it easier
    // to traverse the tree.
    this.connections = {};

    // Total number of forms (not counting supertokens)
    this.numTokens = 0;

    // load configuration prefs
    this.load();
  }

  // ---------------------------------------------------------------------------
  // core functionality

  /**
   * Build a list of elements, both nodes and edges.  This function
   *  also validates all the elements.
   */
  get eles() {
    // reset variables
    this.presentationId = {};
    this.connections = {};
    this.numTokens = 0;

    // helper function to get subscripted index numbers for superTokens
    function toSubscript(str: string) {
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

      return str
        .split("")
        .map((ch) => ((subscripts as any)[ch] || ch))
        .join("");
    }

    // reset our progress tracker
    this.progress.done = 0;
    this.progress.total = 0;

    // reset tree blocked
    this.treeBlocked = false;

    // cache these
    const sent = this.app.corpus.current, format = this.app.corpus.format;

    // num is like clump except not including superTokens, eles in the list
    let num = 0;
    const eles: GraphNode[] = [];

    // tokenNum counts just normal tokens (no supertokens and dependencies)
    let tokenNum = 0;

    // Counts just supertokens
    let mwTokenNum = 0;

    let rootFound = false;

    // walk over all the tokens
    sent.index().iterate((token: nx.BaseToken) => {
      // don't draw other analyses
      if (token.indices.cytoscape == null && !token.isSuperToken)
        return;

      // cache some values
      let id = nx.BaseToken.getTokenIndex(token, format);
      let clump = token.indices.cytoscape;
      let pos = format === "CG3" ? token.xpostag || token.upostag : token.upostag || token.xpostag;
      let isRoot = sent.root.dependents.has(token);

      if(isRoot) {
        rootFound = true;
      }

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

        let parent = token.name === "SubToken"
          ? "multiword-" + nx.BaseToken.getTokenIndex(sent.getSuperToken(token), format)
          : undefined;

        this.tokens[tokenNum] = token;

        (this.presentationId as any)[id] = tokenNum;

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
            posClasses: validate.posNodeClasses(pos),
            posAttr: format === 'CG3' ? `xpostag` : `upostag`,
            posLabel: pos || '',
          },
        );
        tokenNum++;
        this.numTokens++;
      }
      
    });

    if(!rootFound) {
      this.treeBlocked = true;
    }

    sent.index().iterate((token: nx.BaseToken) => {
      // iterate over the token's heads to get edges
      token.mapHeads((head, i) => {

        // if not enhanced or is_vertical
        // only draw the first dependency
        if (i && (!sent.options.enhanced || this.app.corpus.is_vertical))
          return;

        this.progress.total += 1;
        if (head.deprel && head.deprel !== "_")
          this.progress.done += 1;

        // roots don't get edges drawn (just bolded)
        if (head.token.name === "RootToken")
          return;

        let deprel = head.deprel || "";

        const id = nx.BaseToken.getTokenIndex(token, format);
        const headId = nx.BaseToken.getTokenIndex(head.token, format);
        const label = this.app.corpus.is_ltr
            ? token.indices.absolute > head.token.indices.absolute
              ? `${deprel}⊳`
              : `⊲${deprel}`
            : token.indices.absolute > head.token.indices.absolute
              ? `⊲${deprel}`
              : `${deprel}⊳`;

        const presentId = (this.presentationId as any)[id];
        const presentHeadId = (this.presentationId as any)[headId];
        let depClasses = validate.depEdgeClasses(sent, token, head);
        if (!(presentHeadId in this.connections)) {
          this.connections[presentHeadId] = [];
        }
        this.connections[presentHeadId].push(presentId);
        
        if(depClasses.includes("cycle")) {
          this.treeBlocked = true;
        }
        if(String(id).includes('.') || String(headId).includes('.')) {
          depClasses += " dotted";
        }
        eles.push({
          id: `dep_${presentId}_${presentHeadId}`,
          name: `dependency`,
          num: ++num,
          attr: `deprel`,
          deprel: deprel,
          source: `token-${presentHeadId}`,
          sourceNum: parseInt(presentHeadId as unknown as string),
          sourceToken: head.token,
          target: `token-${presentId}`,
          targetNum: parseInt(presentId as unknown as string),
          targetToken: token,
          label: label,
          enhanced: i ? true: false,
          classes: depClasses,
        });
      });
    });

    this.length = num;
    return eles;
  }

  /**
   * Create the cytoscape instance and populate it with the nodes and edges we
   * generate in `this.eles`.
   */
  draw() {
    if (this.app.corpus.is_vertical) {
      this.grapher = tree;
    }
    else {
      this.grapher = v;
    }

    if (!this.app.corpus.is_vertical || !this.treeBlocked) {
      this.grapher.bind(this);
      this.grapher.run();
    }
    else {
      (this.grapher as typeof tree).displayError();
      console.log("Graph contains a cycle or needs a root.");
      $("#vertical").click();
    }
    

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
      //this.lock(locked);
    }
    // set event handler callbacks
    return this.bind();
  }

  /**
   * Bind event handlers to the cytoscape elements and the enclosing canvas.
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

      let targetNum = $(this).attr('subId') as unknown as number;
      // THIS is #group-[id]. But we want #form-[id].
      let target = $('#form-' + targetNum);
      if (target.hasClass('locked'))
        return;
      if (self.moving_dependency) {

        const dep = $('.selected');
        const sourceNum = $('.arc-source').attr('subId') as unknown as number;

        // make a new dep, remove the old one
        self.makeDependency(self.tokens[sourceNum], self.tokens[targetNum]);
        self.removeDependency(dep);
        $('.moving').removeClass('moving');
        self.moving_dependency = false;

        const newEdge = $('#dep_' + targetNum + '_' + sourceNum);
        // right click the new edge and lock it
        newEdge.trigger('contextmenu');
        self.moving_dependency = true;
        //self.lock(newEdge);

      } else {

        // check if there's anything in-progress
        self.commit();

        $('.arc-source').removeClass('arc-source');
        $('.arc-target').removeClass('arc-target');
        $('.selected').removeClass('selected');

        // handle the click differently based on current state

        if (target.hasClass('merge-right') || target.hasClass('merge-left')) {

          // perform merge
          let sourceNum = $('.merge-source').attr('subId') as unknown as number;
          self.merge(self.tokens[sourceNum], self.tokens[targetNum]);
          //self.unlock();

        } else if (target.hasClass('combine-right') || target.hasClass('combine-left')) {

          // perform combine
          let sourceNum = $('.combine-source').attr('subId') as unknown as number;
          self.combine(self.tokens[sourceNum], self.tokens[targetNum]);
          //self.unlock();

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
            let sourceNum = source.attr('subId') as unknown as number;
            self.makeDependency(self.tokens[sourceNum], self.tokens[targetNum]);
            source.removeClass('activated');
            target.removeClass('activated');
            //self.unlock();

          } else {

            // activate it
            //self.lock(target);

          }
        }
      }
    });

    d3.select("#graph-svg").on("mousemove", function() {
      // Get mouse position and un"scale/pan" it
      let position = d3.mouse(this as d3.ContainerElement);
      position[0] = (position[0] - self.config.pan.x) / self.config.zoom;
      position[1] = (position[1] - self.config.pan.y) / self.config.zoom;

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
      //self.lock(target);
    });

    // Handles click on multiword token
    $(".multiword").on("click", e => {

      const target = $(e.target);

      if (target.hasClass("locked"))
        return;

      $(".activated").removeClass("activated");

      if (target.hasClass("multiword-active")) {

        target.removeClass("multiword-active");
        //self.unlock();

      } else {

        $(".multiword-active").removeClass("multiword-active");
        target.addClass("multiword-active");
        //self.lock(target);
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
      //self.lock(target);

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
        //self.unlock();

      } else {

        $(".arc-source").removeClass("arc-source");
        $("#form-"+ arcSource).addClass("arc-source");

        $(".arc-target").removeClass("arc-target");
        $("#form-" + arcTarget).addClass("arc-target");

        $(".selected").removeClass("selected");
        target.addClass("selected");
        //self.lock(target);
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
      //self.lock(target);
    });

    return this;
  }

  /**
   * Save the current graph config to `localStorage`.
   */
  save() {

    const picked = _.pick(config, "pan", "zoom", "locked_index", "locked_id", "locked_classes");
    const serial = JSON.stringify(picked);
    storage.setPrefs("graph", serial);
  }

  /**
   * Load the graph config from `localStorage` if it exists.
   */
  load() {
    let serial = storage.getPrefs("graph");
    if (!serial)
      return;
    const parsed = JSON.parse(serial);
    config.set(parsed);
  }

  /**
   * Save in-progress changes to the graph (labels being edited).
   */
  commit() {

    $(".input").removeClass("input");

    if (this.editing === null)
      return; // nothing to do

    if ($(".splitting").length) {

      const value = $("#edit").val() as string;
      let index = value.indexOf(" ");
      index = index < 0 ? value.length : index;

      this.splitToken(this.editing, index);

    } else {

      const attr = this.editing.attr("attr");
      const value = validate.attrValue(attr, $("#edit").val() as string);

      if (attr == "deprel") {

        this.modifyDependency(this.editing, value);

      } else {
        const tokenNum = this.editing.attr("subId") as unknown as number;
        (this.tokens[tokenNum] as any)[attr] = value;
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
    //this.unlock();
  }

  // ---------------------------------------------------------------------------
  // abstractions over modifying the corpus

  /**
   * Try to add `src` as a head for `tar`, save changes, and update graph.
   */
  makeDependency(src: nx.BaseToken, tar: nx.BaseToken) {

    try {
      tar.addHead(src);
      //this.unlock();
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
   */
  modifyDependency(ele: JQuery<HTMLElement>, deprel: string) {

    try {

      let id = ele.attr("id");
      let sourceNum = parseInt(id.split("_")[2]);
      let targetNum = parseInt(id.split("_")[1]);
      let src = this.tokens[sourceNum];
      let tar = this.tokens[targetNum];
      tar.modifyHead(src, deprel);
      //this.unlock();
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
   */
  removeDependency(ele: JQuery<HTMLElement>) {

    try {
      let id = ele.attr("id");
      let sourceNum = parseInt(id.split("_")[2]);
      let targetNum = parseInt(id.split("_")[1]);
      let src = this.tokens[sourceNum];
      let tar = this.tokens[targetNum];
      tar.removeHead(src);
      //this.unlock();
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

  insertEmptyTokenAfter(ele: JQuery<HTMLElement>) {
    const sent = this.app.corpus.current;
    let eleNum = ele.attr("subId") as unknown as number;
    const token = this.tokens[eleNum];
    console.log("inserting empty token after", token);

    try {

      const newToken = new nx.Token(sent, {
        form: "_",
        isEmpty: true,
      });

      const index = token.indices.sup;
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
   */
  toggleIsEmpty(ele: JQuery<HTMLElement>) {

    console.log("toggling isEmpty");
    const sent = this.app.corpus.current;
    let eleNum = ele.attr("subId") as unknown as number;
    const token = this.tokens[eleNum];
    console.log(token.isEmpty, token);

    try {
      token.setEmpty(!token.isEmpty);
      //this.unlock();
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
   */
  setRoot(ele: JQuery<HTMLElement>) {

    const sent = this.app.corpus.current;
    let eleNum = ele.attr("subId") as unknown as number;
    const token = this.tokens[eleNum];

    try {

      if (!this.app.corpus._corpus.options.enhanced)
        sent.root.dependents.clear();

      token.addHead(sent.root, "root");
      //this.unlock();
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
   */
  splitToken(ele: JQuery<HTMLElement>, index: number) {

    try {
      let eleNum = ele.attr("subId") as unknown as number;
      const token = this.tokens[eleNum];
      this.app.corpus.current.split(token, index);
      //this.unlock();
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
   */
  splitSuperToken(ele: JQuery<HTMLElement>) {

    try {
      let eleNum = ele.attr("subId") as unknown as number;
      this.app.corpus.current.split(this.mwTokens[eleNum]);
      //this.unlock();
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
   */
  combine(src: nx.BaseToken, tar: nx.BaseToken) {

    try {

      this.app.corpus.current.combine(src, tar);
      //this.unlock();
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
   */
  merge(src: nx.BaseToken, tar: nx.BaseToken) {

    try {

      this.app.corpus.current.merge(src, tar);
      //this.unlock();
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
   */
  getPrevForm(): JQuery<SVGRectElement>|undefined {
    
    let clump = parseInt($(".activated").attr("subId"));
    if (clump === undefined)
      return undefined;

    clump -= 1;

    return $("#form-" + clump) as unknown as JQuery<SVGRectElement>;
  }

  /**
   * Get the `next` form relative to the activated form (no wrapping).  This
   *  is useful for when we want to get the neighbors of a node (e.g. for merge
   *  or combine).  The `next` form is the `form-node` with `clump` one greater.
   *  If there is no `next` form, returns undefined.
   */
  getNextForm(): JQuery<SVGRectElement>|undefined {

    let clump = parseInt($(".activated").attr("subId"));
    if (clump === undefined)
      return undefined;

    clump += 1;

    return $("#form-" + clump) as unknown as JQuery<SVGRectElement>;
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
  flashTokenSplitInput(ele: JQuery<HTMLElement>) {

    ele.addClass("splitting");
    this.editing = ele;
    this.showEditLabelBox(ele);
  }

  /**
   * Flash the #edit box around the current `input` node.  Also locks the target
   *  and flashes the #mute.
   */
  showEditLabelBox(target: JQuery<HTMLElement>) {

    target.addClass("input");
    let textElement = $('#text-' + target.attr('id'));
    let textLabel = textElement.text().replace(/[⊳⊲]/, '');
    if(textElement.is("textPath")) {
      textElement = $('#textContainer-' + target.attr('id'));
    }
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
      ? validate.U_POS
      : target.attr("id").includes("dep")
        ? validate.U_DEPRELS
        : [];

    // add the edit input
    const edit = $("#edit")
      .val("")
      .focus()
      .val(textLabel)
      .css("top", textY)
      .css("left", textX)
      .css("height", textHeight)
      .css("width", textWidth)
      .attr("target", target.attr("id"))
      .addClass("activated");

    // NOTE: We need to cast this to 'any' because 'selfcomplete' works by
    //       monkeypatching JQuery...
    (edit as any).selfcomplete(
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

    //this.lock(target);
    this.app.gui.status.refresh();
  }


}
