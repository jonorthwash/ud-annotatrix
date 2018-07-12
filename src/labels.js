'use strict';

const _ = require('underscore');

const regex = {
  comment: /(labels|tags)\s*=\s*(.*)$/,
  content: /([\w-:]*)/
};

class Label {
  constructor(name) {
    this.name = name;
  }
}

class LabelManager {
  constructor() {
    this.labels = [];
  }

  parse(comments) {
    _.each(comments, comment => {

      const labelString = comment.match(regex.comment);
      if (!labelString)
        return;

      labelString[2].split(/\s/).forEach(label => {

        const content = label.match(regex.content);
        if (content)
          this.add(content[1]);

      });
    });

    return this; // chaining
  }

  add(name) {

    let found = false;
    _.each(this.labels, label => {
      if (label.name === name)
        found = true;
    });

    if (!found)
      this.labels.push(new Label(name));

    return this; // chaining
  }

  update() {

  }
}

module.exports = LabelManager;
