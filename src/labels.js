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
      color = (color.match(/^#?([a-f\d]{6})/) || [])[1];
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
      _.each(parseComment(comment), label => {
        if (label)
          this.add(label);
      });
    });

    return this; // chaining
  }

  has(index, name) {

    if (name === undefined) {
      name = index;
      index = manager.index;
    }

    const comments = manager.getSentence(index).comments;

    let has = false;
    _.each(comments, comment => {
      _.each(parseComment(comment), label => {
        if (name === label)
          has = true;
      });
    });

    return has;
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

    return !found; // so we know if success or not
  }

  update() {

    $('#labels-vert').children().detach();
    $('.labels-horiz').children().not(':first-child').detach();

    _.each(this.labels, label => {

      // first make the list items
      const vert = $(`<li name="${label.name}" class="label vert-label" />`);

      const header = $(`<div class="label-header" />`);
      const hidden = $(`<div class="label-hidden" />`);
      vert.append(header, hidden);

      const name  = $(`<span class="label-name">${label.name}</span>`)
        .prepend(`<span class="square" style="background-color:${label.bColor};" />`)
        .click(e => this.handleClickLabel(e));
      const chev  = $(`<i class="fa fa-chevron-down chevron" aria-hidden="true" />`)
        .click(e => this.handleClickChevron(e));
      const check = $(`<i class="fa" aria-hidden="true" type="checked" />`)
        .addClass(this.has(label.name) ? 'fa-check-square-o' : 'fa-square-o')
        .attr('type', this.has(label.name) ? 'checked' : 'unchecked')
        .click(e => this.handleClickCheckbox(e));
      const times = $(`<i class="fa fa-times" aria-hidden="true" />`)
        .click(e => this.handleClickTimes(e));
      header.append(name, chev, check, times);

      const hNameContainer = $(`<div />`)
        .text('Name:')
        .append(`<input name="name" value="${label.name}" />`);
      const hDescContainer = $(`<div />`)
        .text('Description:')
        .append(`<input name="desc" value="${label.description}" />`);
      const hColorName = $(`<input name="color" value="${label.bColor}" />`);
      const hColorReset = $(`<button type="button" class="btn btn-secondary"><i class="fa fa-refresh" /></button>`)
        .click(e => this.handleClickResetColor(e));
      const hColorSquare = $(`<span class="square" style="background-color:${label.bColor};" />`);
      const hColorContainer = $(`<div />`)
        .text('Color:')
        .append(hColorName, hColorReset, hColorSquare);
      const hSaveButton = $(`<button type="button" class="btn btn-secondary">Save</button>`)
        .click(e => this.handleClickSave(e));
      hidden.append(hNameContainer, hDescContainer, hColorContainer, hSaveButton);

      $('#labels-vert').append(vert)

      // then add the actual labels
      const horiz = $(`<li name="${label.name}" class="label horiz-label" />`)
        .text(label.name)
        .css('background-color', label.bColor)
        .css('color', label.tColor)
        .click(e => this.handleClickLabel(e));

      if (this.has(label.name)) {
        $('#labels-horiz-current').append(horiz);
      } else {
        $('#labels-horiz-all').append(horiz);
      }

    });
  }

  handleEnter(event) {

    const names = $('#label-input').val().trim();

    _.each(names.split(/\s+/), name => {
      if (name && this.add(name))
        addLabelToComments(name);
    });

    $('#label-input').val('');
  }
  handleClickChevron(event) {
    const target = $(event.target),
      hidden = $(target.closest('li').find('.label-hidden')),
      display = hidden.css('display');

    $('.label-hidden')
      .css('display', 'none')
      .closest('li').find('.chevron')
        .removeClass('fa-chevron-up')
        .addClass('fa-chevron-down');

    if (display === 'none')
      hidden
        .css('display', 'block')
        .closest('li').find('.chevron')
          .addClass('fa-chevron-up')
          .removeClass('fa-chevron-down');
  }
  handleClickCheckbox(event) {

    const target = $(event.target),
      checked = target.attr('type') === 'checked',
      name = target.closest('li').attr('name');

    target
      .toggleClass('fa-check-square-o')
      .toggleClass('fa-square-o')
      .attr('type', checked ? 'unchecked' : 'checked');

    if (checked) {
      removeLabelFromComments(name);
    } else {
      addLabelToComments(name);
    }
  }
  handleClickLabel(event) {

    console.log('click label');

  }
  handleClickTimes(event) {

    const target = $(event.target),
      name = target.closest('li').attr('name');

    this.labels = this.labels.filter(label => {
      if (label.name !== name)
        return label;
    });
    for (let i=0; i<manager.length; i++) {
      removeLabelFromComments(i, name);
    }
  }
  handleClickResetColor(event) {

    const target = $(event.target),
      name = target.closest('li').attr('name'),
      label = this.get(name);

    label.changeColor();
    this.update();

  }
  handleClickSave(event) {

    console.log('click save');

  }
}

function addLabelToComments(index, name) {

  if (name === undefined) {
    name = index;
    index = manager.index;
  }

  let done = false;
  manager.comments = manager.getSentence(index).comments.map(comment => {

    if (comment.match(regex.comment) && !done) {
      comment = `${comment} ${name}`;
      done = true;
    }

    return comment;
  });

  if (!done)
    manager.comments = manager.comments.concat([`labels = ${name}`]);
}

function removeLabelFromComments(index, name) {

  if (name === undefined) {
    name = index;
    index = manager.index;
  }

  const reg = new RegExp(` ${name}( ?)`);
  manager.comments = manager.getSentence(index).comments.map(comment => {
    return comment.replace(reg, '$1')
  });
}

function parseComment(comment) {

  let labels = [];
  const labelString = comment.match(regex.comment);

  if (labelString)
    labelString[2].split(/\s/).forEach(label => {

      const content = label.match(regex.content);
      if (content)
        labels.push(content[1]);

    });

  return labels;
}

function getRandomHexColor() {

  let color = '';
  do {
    color = `#${Math.floor(Math.random()*magic).toString(16)}`;
  } while (color.length !== 7);

  return color;
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
  if ((r**2 + g**2 + b**2) > ((255-r)**2 + (255-g)**2 + (255-b)**2))
    color = '#000000';

  return color;
}

module.exports = LabelManager;
