'use strict';

const _ = require('underscore');

const regex = {
  comment: /(labels|tags)\s*=\s*(.*)$/,
  content: /([\w-:]*)/
};

// NOTE: 16777215 (base 10) = ffffff (base 16)
const magic = 16777215;

class Label {
  constructor(name) {
    this.name = name;
    this.color = getRandomHexColor();
  }

  changeColor(color) {
    
    if (color) {
      const int = parseInt(color, 16);
      if (isNaN(int) || int < 0 || int > magic)
        return null; // out of bounds
    } else {
      color = getRandomHexColor();
    }

    this.color = color;
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

function getRandomHexColor() {
  return `#${Math.floor(Math.random()*magic).toString(16)}`;
}

module.exports = LabelManager;
