"use strict";

import * as _ from "underscore";
import * as re from "../utils/regex";
import {getContrastingColor, getRandomHexColor} from "../utils/funcs";
import {NxBaseClass} from "./base-class";
import {Label, LabelSerial} from "./label";
import {Sentence} from "./sentence";
import type {Corpus} from "./corpus";

export interface LabelerSerial {
  labels: LabelSerial[];
  filter: string[];
}

export interface SortedLabel {
  name: string;
  size: number;
}

interface LabelWithSentences {
  _label: Label;
  _sents: Set<Sentence>;
}

/**
 * Abstraction to hold a mapping of String => Label pairs, as well as some
 *  methods for doing work on those labels.
 */
export class Labeler extends NxBaseClass {
  corpus: Corpus;
  _labels: {[name: string]: LabelWithSentences};
  _filter: Set<string>;

  constructor(corpus: Corpus) {
    super("Labeler");
    this.corpus = corpus;

    this._labels = {};
    this._filter = new Set();
  }

  /**
   * Sort all labels in Corpus by number of Sentences with that label
   */
  sort(): SortedLabel[] {
    const size = (name: string) => this._labels[name]._sents.size;

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

  serialize(): LabelerSerial {
    return {
      labels: _.map(this._labels, label => label._label.serialize()),
      filter: Array.from(this._filter)
    };
  }

  static deserialize(corpus: Corpus, serial: LabelerSerial): Labeler {
    const labeler = new Labeler(corpus);
    serial.labels.forEach(label => labeler.addLabel(label.name));
    labeler._filter = new Set(...serial.filter);

    return labeler;
  }

  /**
   * Get a Label given its name
   */
  get(name: string): LabelWithSentences|undefined { return this._labels[name]; }

  /**
   * Get the number of sentences with a given Label
   */
  count(name: string): number {
    return this._labels[name] ? this._labels[name]._sents.size : 0;
  }

  /**
   * Crawl through a sentence's comments to see if it has a particular Label
   */
  sentenceHasLabel(sent: Sentence, searching: string): boolean {
    let hasLabel = false;
    sent.comments.forEach(comment => {
      if (comment.type === "label") {
        comment.labels.forEach(labelName => {
          if (labelName === searching)
            hasLabel = true;
        });
      }
    });

    return hasLabel;
  }

  /**
   * Checks if a given Sentence should be filtered
   */
  sentenceInFilter(sent: Sentence): boolean {
    let inFilter = false;
    sent.comments.forEach(comment => {
      if (comment.type === "label") {
        comment.labels.forEach(labelName => {
          if (this._filter.has(labelName))
            inFilter = true;
        });
      }
    });

    return inFilter;
  }

  /**
   * Adds a Label name to the filter
   */
  addToFilter(name: string): Set<string> {
    if (this.get(name))
      return this._filter.add(name);
    return undefined;
  }

  /**
   * Removes a Label name from the filter
   */
  removeFromFilter(name: string) { return this._filter.delete(name); }

  /**
   * Callback to be triggered whenever we add a new Sentence to a Corpus
   */
  onAdd(sent: Sentence): void {
    sent.comments.forEach(comment => {
      if (comment.type === "label") {
        comment.labels.forEach(labelName => { this.addLabel(labelName, [sent]); });
      }
    });
  }

  /**
   * Callback to be triggered whenever we remove a Sentence from a Corpus
   */
  onRemove(sent: Sentence): void {
    sent.comments.forEach(comment => {
      if (comment.type === "label") {
        comment.labels.forEach(labelName => { this.removeLabel(labelName, [sent]); });
      }
    })
  }

  /**
   * Add new Label with the given name (if it doesn't already exist) and
   *  attach it to a list of Sentences.
   */
  addLabel(name: string, sents: Sentence[]|Set<Sentence> = []): LabelWithSentences {
    let label = this.get(name);
    if (!label) {
      label = {
        _label: new Label(name),
        _sents: new Set(),
      };
      this._labels[name] = label;
    }

    sents.forEach(sent => {
      sent.comments.forEach(comment => {
        if (comment.type === "label") {
          comment.labels.push(label._label.name);
          label._sents.add(sent);
        }
      });
    });

    return label;
  }

  /**
   * Remove a Label by name (if it exists) from a set of Sentences (can
   *  be omitted).
   */
  removeLabel(name: string, sents?: Sentence[]): LabelWithSentences|null {
    const label = this.get(name);
    if (!label)
      return null;

    (sents || label._sents).forEach(sent => {sent.comments.forEach(comment => {
                                      if (comment.type === "label") {
                                        const index =
                                            comment.labels.indexOf(label._label.name);
                                        comment.labels.splice(index, 1);
                                      }
                                    })});

    if (!this.count(name))
      delete this._labels[name];

    return label;
  }

  /**
   * Change the name of a Label from oldName => newName
   */
  changeLabelName(oldName: string, newName: string): LabelWithSentences|null {
    if (this.get(newName))
      return null; // already exists

    const oldLabel = this.removeLabel(oldName);
    if (!oldLabel)
      return null;

    const newLabel = this.addLabel(newName, oldLabel._sents);
    newLabel._label.desc = oldLabel._label.desc;
    newLabel._label.bColor = oldLabel._label.bColor;
    newLabel._label.tColor = oldLabel._label.tColor;

    return newLabel;
  }

  /**
   * Change the color of a Label to a given color
   */
  changeLabelColor(name: string, color: string): boolean {
    const label = this.get(name);
    if (!label)
      return false;

    if (color) {
      color = (color.match(re.hexColorSixDigit) || [])[1];
      const int = parseInt(color, 16);
      if (isNaN(int) || int<0)
        return false; // out of bounds

    } else {
      color = getRandomHexColor();
    }

    label._label.bColor = color;
    label._label.tColor = getContrastingColor(color);

    return true;
  }

  /**
   * Change the description of a Label to a given description
   */
  changeLabelDesc(name: string, desc: string): boolean {
    const label = this.get(name);
    if (!label)
      return false;

    if (typeof desc !== "string")
      return false;

    label._label.desc = desc;
    return true;
  }
}
