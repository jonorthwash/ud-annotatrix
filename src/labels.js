'use strict';

const _ = require('underscore');
const $ = require('jquery');

const regex = {
  comment: /(labels|tags)\s*=\s*(.*)$/,
  content: /([\w-:]*)/
};

// NOTE: 16777215 (base 10) = ffffff (base 16)
const magic = 16777215;

class Label {
  constructor(name) {
    this.name = name;
    this.bColor = hashStringToHex(name);
    this.tColor = getTextColor(this.bColor);
    this.desc = '';
  }

  changeColor(color) {

    if (color) {
      color = (color.match(/^#?([a-f\d]{6})/i) || [])[1];
      const int = parseInt(color, 16);
      if (isNaN(int) || int < 0 || int > magic)
        return null; // out of bounds

      color = `#${color}`;
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

    // don't want the "jQuery needs a window" errors during testing
    if (!gui || !gui.inBrowser)
      return this;

    $('#label-input').keyup(e => {
      if (e.which === 13) // enter
        this.handle.enter(e);
    });

    this.handle = {
      enter: event => {
        const names = $('#label-input').val().trim();
        this.addLabels(names);

        $('#label-input').val('');
        gui.update();
      },

      click: {
        chevron: event => {
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
        },

        checkbox: event => {
          const target = $(event.target),
            checked = target.attr('type') === 'checked',
            name = target.closest('li').attr('name');

          target
            .toggleClass('fa-check-square-o')
            .toggleClass('fa-square-o')
            .attr('type', checked ? 'unchecked' : 'checked');

          if (checked) {
            this.removeLabelFromComments(name);
          } else {
            this.addLabelToComments(name);
          }

          gui.update();
        },

        label: event => {
          console.log('click label');
        },

        times: event => {
          const target = $(event.target),
            name = target.closest('li').attr('name');

          const response = confirm(`Are you sure you want to delete the label "${name}" from all sentences?`);
          if (!response)
            return;

          this.remove(name);
          gui.update();
        },

        refresh: event => {
          const target = $(event.target),
            name = target.closest('li').attr('name'),
            label = this.get(name);

          label.changeColor();
          this.update();
          flashDropdown(name);
        },

        save: event => {
          const target = $(event.target),
            li = target.closest('li'),
            name = li.attr('name'),
            values = {
              name: li.find('input[name="name"]').val(),
              desc: li.find('input[name="desc"]').val(),
              color: li.find('input[name="color"]').val()
            };

          this.edit(name, values);

          gui.update();
          flashDropdown(name);
        }
      }
    }
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

  remove(name) {
    this.labels = this.labels.filter(label => {
      if (label.name !== name)
        return label;
    });
    for (let i=0; i<manager.length; i++) {
      this.removeLabelFromComments(i, name);
    }
  }

  edit(name, values) {
    const label = this.get(name);

    if (values.name) {
      for (let i=0; i<manager.length; i++) {
        this.changeLabelInComments(i, name, values.name);
      }
      label.name = values.name;
    }

    if (values.desc)
      label.desc = values.desc;

    if (values.color)
      label.changeColor(`#${values.color}`);
  }

  update() {

    if (!gui || !gui.inBrowser)
      return;

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
        .click(e => this.handle.click.label(e));
      const chev  = $(`<i class="fa fa-chevron-down chevron" aria-hidden="true" />`)
        .click(e => this.handle.click.chevron(e));
      const check = $(`<i class="fa" aria-hidden="true" type="checked" />`)
        .addClass(this.has(label.name) ? 'fa-check-square-o' : 'fa-square-o')
        .attr('type', this.has(label.name) ? 'checked' : 'unchecked')
        .click(e => this.handle.click.checkbox(e));
      const times = $(`<i class="fa fa-times" aria-hidden="true" />`)
        .click(e => this.handle.click.times(e));
      header.append(name, chev, check, times);

      const hNameContainer = $(`<div />`)
        .text('Name:')
        .append(`<input name="name" value="${label.name}" />`);
      const hDescContainer = $(`<div />`)
        .text('Description:')
        .append(`<input name="desc" value="${label.desc}" />`);
      const hColorName = $(`<input name="color" value="${label.bColor.substr(1)}" />`);
      const hColorReset = $(`<button type="button" class="btn btn-secondary refresh-color"><i class="fa fa-refresh" /></button>`)
        .click(e => this.handle.click.refresh(e));
      const hColorSquare = $(`<span class="square" style="background-color:${label.bColor};" />`);
      const hColorInputs = $('<div class="color-inputs" pattern="[A-Fa-f\d]{6}">')
        .text('#')
        .append(hColorName, hColorReset, hColorSquare);
      const hColorContainer = $(`<div />`)
        .text('Color:')
        .append(hColorInputs);
      const hSaveButton = $(`<button type="button" class="btn btn-secondary">Save</button>`)
        .click(e => this.handle.click.save(e));
      hidden.append(hNameContainer, hDescContainer, hColorContainer, hSaveButton);

      $('#labels-vert').append(vert)

      // then add the actual labels
      const horiz = $(`<li name="${label.name}" class="label horiz-label" />`)
        .text(label.name)
        .css('background-color', label.bColor)
        .css('color', label.tColor)
        .click(e => this.handle.click.label(e));

      if (this.has(label.name)) {
        $('#labels-horiz-current').append(horiz);
      } else {
        $('#labels-horiz-all').append(horiz);
      }

    });
  }

  addLabels(string) {
    _.each(string.split(/\s+/), name => {
      if (name && this.add(name))
        this.addLabelToComments(name);
    });
  }

  addLabelToComments(index, name) {

    if (name === undefined) {
      name = index;
      index = manager.index;
    }

    let done = false;
    manager.getSentence(index).comments = manager.getSentence(index).comments.map(comment => {

      if (comment.match(regex.comment) && !done) {
        comment = `${comment} ${name}`;
        done = true;
      }

      return comment;
    });

    if (!done)
      manager.comments = manager.comments.concat([`labels = ${name}`]);
  }

  removeLabelFromComments(index, name) {

    if (name === undefined) {
      name = index;
      index = manager.index;
    }

    const reg = new RegExp(` ${name}( ?)`);
    manager.getSentence(index).comments = manager.getSentence(index).comments.map(comment => {
      return comment.replace(reg, '$1')
    });
  }

  changeLabelInComments(index, oldName, newName) {
    if (newName === undefined) {
      newName = oldName;
      oldName = index;
      index = manager.index;
    }

    const reg = new RegExp(` ${oldName}( ?)`);
    manager.getSentence(index).comments = manager.getSentence(index).comments.map(comment => {
      return comment.replace(reg, ` ${newName}$1`)
    });
  }

}

function flashDropdown(name) {
  const dropdown = $('.dropdown-content');

  // show dropdown part immediately
  dropdown.css('display', 'block');

  // expand chevron-click style
  if (name)
    $(`li.vert-label[name="${name}"]`).find('.label-hidden')
      .css('display', 'block')
      .find('.chevron')
        .addClass('fa-chevron-up')
        .removeClass('fa-chevron-down');

  // wait 0.5 secs to return to standard dropdown behavior
  setTimeout(() => dropdown.css('display', ''), 500);
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

function hashStringToHex(string) {
  let hash = 0;
  for (let i=0; i<string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let hex = '#';
  for (let i=0; i<3; i++) {
    const value = (hash >> (i*8)) & 0xFF;
    hex += ('00' + value.toString(16)).substr(-2);
  }
  return hex;
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
