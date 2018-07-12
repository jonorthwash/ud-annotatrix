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
    this.bColor = getRandomHexColor();
    this.tColor = getTextColor(this.bColor);
    this.description = '';
  }

  changeColor(color) {

    if (color) {
      const int = parseInt(color, 16);
      if (isNaN(int) || int < 0 || int > magic)
        return null; // out of bounds
    } else {
      color = getRandomHexColor();
    }

    this.bColor = color;
    this.tColor = getTextColor(color);
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

  get(name) {

    let ret = null;
    _.each(this.labels, label => {
      if (label.name === name)
        ret = label;
    });

    return ret;
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

    $('#labels-list').children().detach();
    _.each(this.labels, label => {

      const li = $(`<li name="${label.name}" />`);

      const header = $(`<div class="label-header" />`);
      const hidden = $(`<div class="label-hidden" />`);
      li.append(header, hidden);

      const check = $(`<i class="fa fa-check" aria-hidden="true" type="checked" />`)
        .click(e => this.handleClickCheckbox(e));
      const name  = $(`<span class="label-name">${label.name}</span>`)
        .prepend(`<span class="square" style="background-color:${label.bColor};" />`)
        .click(e => this.handleClickLabel(e));
      const times = $(`<i class="fa fa-times" aria-hidden="true" />`)
        .click(e => this.handleClickTimes(e));
      header.append(check, name, times);

      const hNameContainer = $(`<div />`);
      const hDescContainer = $(`<div />`);
      const hColorContainer= $(`<div />`);
      const hSaveButton = $(`<button type="button" class="btn btn-secondary">Save</button>`)
        .click(e => handleClickSave(e));
      hidden.append(hNameContainer, hDescContainer, hColorContainer, hSaveButton);

      hNameContainer.text('Name:')
        .append(`<input name="name" value="${label.name}" />`);
      hDescContainer.text('Description:')
        .append(`<input name="desc" value="${label.description}" />`);

      const colorName  = $(`<input name="color" value="${label.bColor}" />`);
      const colorReset = $(`<button type="button" class="btn btn-secondary"><i class="fa fa-refresh" /></button>`);
      const colorSquare= $(`<span class="square" style="background-color:${label.bColor};" />`);
      hColorContainer.text('Color:')
        .append(colorName, colorReset, colorSquare);

      $('#labels-list').append(li)
    })
  }

  handleClickCheckbox(event) {

    const target = $(event.target),
      checked = target.attr('type') === 'checked';

    target.attr('type', checked ? 'unchecked' : 'checked')
      .css('opacity', checked ? '0' : '1');

  }
  handleClickLabel(event) {

    console.log('click label');

  }
  handleClickTimes(event) {

    console.log('click times');

  }
  handleClickSave(event) {

    console.log('click save');

  }
}

function getRandomHexColor() {
  return `#${Math.floor(Math.random()*magic).toString(16)}`;
}

function hexToRGB(hex) {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);

  if (match)
    return [
      parseInt(match[1], 16),
      parseInt(match[2], 16),
      parseInt(match[3], 16)
    ];
}

function getTextColor(background) {

  let color = '#ffffff';

  const rgb = hexToRGB(background);
  if (!rgb)
    return color;

  const [r, g, b] = rgb;
  if ((r**2 + g**2 + b**2) < ((255-r)**2 + (255-g)**2 + (255-b)**2))
    color = '#000000';

  return color;
}

module.exports = LabelManager;
