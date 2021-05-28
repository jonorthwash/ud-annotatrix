"use strict";

const _ = require("underscore");

const utils = require("../utils");
const NxBaseClass = require("./base-class");
const Label = require("./label");

/**
 * Abstraction to hold a mapping of String => Label pairs, as well as some
 *  methods for doing work on those labels.
 */
class Labeler extends NxBaseClass {
  constructor(corpus) {
    super("Labeler");
    this.corpus = corpus;

    this._labels = {};
    this._filter = new Set();
  }

  /**
   * @typedef Labeler_SortReturnT
   * @property {String} name Label name
   * @property {Number} size Number of sentences with Label
   */

  /**
   * Sort all labels in Corpus by number of Sentences with that label
   *
   * @return {Labeler_SortReturnT}
   */
  sort() {
    const size = name => this._labels[name]._sents.size;

    return Object.keys(this._labels)
        .sort((x, y) => {
          if (size(x) < size(y))
            return 1;

          if (size(x) > size(y))
            return -1;

          return 0;
        })
        .map(name => {
          return {
            name: name,
            size: this._labels[name]._sents.size,
          };
        });
  }

  serialize() {
    return {
      labels: _.map(this._labels, label => label._label.serialize()),
      filter: Array.from(this._filter)
    };
  }

  static deserialize(corpus, serial) {
    const labeler = new Labeler(corpus);
    serial.labels.forEach(label => labeler.addLabel(label.name));
    serial._filter = new Set(...serial.filter);

    return labeler;
  }

  /**
   * Get a Label given its name
   *
   * @param {String} name
   * @return {Label}
   */
  get(name) { return this._labels[name]; }

  /**
   * Get the number of sentences with a given Label
   *
   * @param {String} name
   * @return {Number}
   */
  count(name) {
    return this._labels[name] ? this._labels[name]._sents.size : 0;
  }

  /**
   * Crawl through a sentence's comments to see if it has a particular Label
   *
   * @param {Sentence} sent
   * @param {String} searching
   * @return {Boolean}
   */
  sentenceHasLabel(sent, searching) {
    let hasLabel = false;
    sent.comments.forEach(comment => {
      if (comment.type === "label") {
        comment.labels.forEach(name => {
          if (name === searching)
            hasLabel = true;
        });
      }
    });

    return hasLabel;
  }

  /**
   * Checks if a given Sentence should be filtered
   *
   * @param {Sentence} sent
   * @return {Boolean}
   */
  sentenceInFilter(sent) {
    let inFilter = false;
    sent.comments.forEach(comment => {
      if (comment.type === "label") {
        comment.labels.forEach(name => {
          if (this._filter.has(name))
            inFilter = true;
        });
      }
    });

    return inFilter;
  }

  /**
   * Adds a Label name to the filter
   *
   * @param {String} name
   */
  addToFilter(name) {
    if (this.get(name))
      return this._filter.add(name);
  }

  /**
   * Removes a Label name from the filter
   *
   * @param {String} name
   */
  removeFromFilter(name) { return this._filter.delete(name); }

  /**
   * Callback to be triggered whenever we add a new Sentence to a Corpus
   *
   * @param {Sentence} sent
   */
  onAdd(sent) {
    sent.comments.forEach(comment => {
      if (comment.type === "label") {
        comment.labels.forEach(name => { this.addLabel(name, [sent]); });
      }
    });
  }

  /**
   * Callback to be triggered whenever we remove a Sentence from a Corpus
   *
   * @param {Sentence} sent
   */
  onRemove(sent) {
    sent.comments.forEach(comment => {
      if (comment.type === "label") {
        comment.labels.forEach(name => { this.removeLabel(name, [sent]); });
      }
    })
  }

  /**
   * Add new Label with the given name (if it doesn't already exist) and
   *  attach it to a list of Sentences.
   *
   * @param {String} name
   * @param {Sentence[]} [sents=[]]
   */
  addLabel(name, sents = []) {
    let label = this.get(name);
    if (label) {
      label._sents.add(...sents);

    } else {
      label = {
        _label: new Label(name),
        _sents: new Set(),
      };
      this._labels[name] = label;
    }

    sents.forEach(sent => {
      sent.comments.forEach(comment => {
        if (comment.type === "label") {
          comment.labels.push(name);
          label._sents.add(sent);
        }
      });
    });

    return label;
  }

  /**
   * Remove a Label by name (if it exists) from a set of Sentences (can
   *  be omitted).
   *
   * @param {String} name
   * @param {Sentence[]} sents
   */
  removeLabel(name, sents) {
    const label = this.get(name);
    if (!label)
      return false;

    (sents || label._sents).forEach(sent => {sent.comments.forEach(comment => {
                                      if (comment.type === "label") {
                                        const index =
                                            comment.labels.indexOf(name);
                                        comment.labels.splice(index, 1);
                                      }
                                    })});

    if (!this.count(name))
      delete this._labels[name];

    return label;
  }

  /**
   * Change the name of a Label from oldName => newName
   *
   * @param {String} oldName
   * @param {String} newName
   * @return {Label}
   */
  changeLabelName(oldName, newName) {
    if (this.get(newName))
      return false; // already exists

    const oldLabel = this.removeLabel(oldName);
    if (!label)
      return false;

    const newLabel = this.addLabel(newName, oldLabel._sents);
    newLabel.desc = oldLabel.desc;
    newLabel.bColor = oldLabel.bColor;
    newLabel.tColor = oldLabel.tColor;

    return newLabel;
  }

  /**
   * Change the color of a Label to a given color
   *
   * @param {String} name
   * @param {String} color
   * @return {Boolean} - whether the operation succeeded
   */
  changeLabelColor(name, color) {
    const label = this.get(name);
    if (!label)
      return false;

    if (color) {
      color = (color.match(utils.re.hexColorSixDigit) || [])[1];
      const int = parseInt(color, 16);
      if (isNaN(int) || int<0 || int>magic)
        return false; // out of bounds

    } else {
      color = utils.getRandomHexColor();
    }

    label._label.bColor = color;
    label._label.tColor = utils.getContrastingColor(color);

    return true;
  }

  /**
   * Change the description of a Label to a given description
   *
   * @param {String} name
   * @param {String} desc
   * @return {Boolean} - whether the operation succeeded
   */
  changeLabelDesc(name, desc) {
    const label = this.get(name);
    if (!label)
      return false;

    if (typeof desc !== "string")
      return false;

    label._label.desc = desc;
    return true;
  }
}

module.exports = Labeler;
