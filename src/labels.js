'use strict';

const _ = require('underscore');
const $ = require('jquery');
const DeserializationError = require('./errors').DeserializationError;

const regex = {
  comment: /(labels|tags)\s*=\s*(.*)$/,
  content: /([\w-:]*)/
};

// NOTE: 16777215 (base 10) = ffffff (base 16)
const magic = 16777215;
const ENTER = 13;

class Label {
  constructor(name) {

    name = name || 'default';

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
        return false; // out of bounds

      color = `#${color}`;
    } else {
      color = getRandomHexColor();
    }

    this.bColor = color;
    this.tColor = getTextColor(color);

    return true;
  }

  get state() {
    return {
      name: this.name,
      desc: this.desc,
      bColor: this.bColor,
      tColor: this.tColor
    };
  }

  set state(state) {
    if (!state.name)
      throw new DeserializationError(`cannot set name to "${state.name}"`);

    state.desc = state.desc || '';
    if (typeof state.desc !== 'string')
      throw new DeserializationError(`cannot set description to non-string value`);

    this.name = state.name;
    this.desc = state.desc;

    if (!this.changeColor(state.bColor))
      throw new DeserializationError(`cannot set background color to "${state.bColor}"`);
  }

  render(labeler) {

    const inComments = labeler.has(this.name),
      filtering = labeler._filter.has(this.name);

    $(`#labels-horiz`).append($('<li>')
      .attr('name', this.name)
      .addClass('label horiz')
      .addClass(inComments ? 'in-comments' : 'not-in-comments')
      .addClass(filtering  ? 'filtering'   : 'not-filtering')
      .append($('<div>')
        .addClass('label-text')
        .text(this.name)
        .css('background-color', this.bColor)
        .css('color', this.tColor)
        .click(e => labeler.handle.click.label(e))
      )
      .append($('<div>')
        .addClass('label-hidden')
        .append($('<div>')
          .addClass('label-hidden-group')
          .append($('<div>')
            .addClass('label-hidden-item')
            .append($('<strong>')
              .text('Name')
            )
            .append($('<input>')
              .attr('name', 'label-name')
              .val(this.name)
              .keyup(e => labeler.handle.keyup.name(e))
            ))
          .append($('<div>')
            .addClass('label-hidden-item')
            .append($('<strong>')
              .text('Description')
            )
            .append($('<input>')
              .attr('name', 'label-desc')
              .val(this.desc)
              .keyup(e => labeler.handle.keyup.desc(e))
            ))
          .append($('<div>')
            .addClass('label-hidden-item')
            .append($('<strong>')
              .text('Color')
            )
            .append($('<div>')
              .addClass('label-hidden-item-inner')
              .append($('<span>')
                .addClass('hex-color-group')
                .text('#')
                .append($('<input>')
                  .attr('name', 'label-color')
                  .attr('pattern', '[A-Fa-f\\d]{6}')
                  .val(this.bColor.substr(1))
                  .keyup(e => labeler.handle.keyup.color(e))
                )
              )
              .append($('<button>')
                .attr('type', 'button')
                .addClass('btn btn-secondary refresh-color')
                .css('background-color', this.bColor)
                .click(e => labeler.handle.click.refresh(e))
                .append($('<i>')
                  .addClass('fa fa-refresh')
                )
              )
            )
          )
        )
        .append($('<hr>'))
        .append($('<div>')
          .addClass('label-hidden-group')
          .append($('<div>')
            .addClass('label-hidden-item')
            .append($('<div>')
              .addClass('label-hidden-item-inner')
              .append($('<input>')
                .attr('name', 'in-comments')
                .attr('type', 'checkbox')
                .prop('checked', inComments)
                .click(e => labeler.handle.click.checkbox.inComments(e))
              )
              .append($('<span>')
                .addClass('in-comments-label checkbox-label')
                .text('has label')
              )
            )
          )
          .append($('<div>')
            .addClass('label-hidden-item')
            .append($('<div>')
              .addClass('label-hidden-item-inner')
              .append($('<input>')
                .attr('name', 'filtering')
                .attr('type', 'checkbox')
                .prop('checked', filtering)
                .click(e => labeler.handle.click.checkbox.filtering(e))
              )
              .append($('<span>')
                .addClass('filtering-label checkbox-label')
                .text('filtering')
              )
            )
          )
        )
        .append($('<hr>'))
        .append($('<div>')
          .addClass('label-hidden-group')
          .append($('<div>')
            .addClass('label-hidden-item delete-item')
            .append($('<button>')
              .attr('type', 'button')
              .addClass('btn btn-secondary delete-button')
              .text('delete')
              .click(e => labeler.handle.click.delete(e))
            )
          )
        )
      )
    );
  }
}

class Labeler {
  constructor() {
    this._labels = [];
    this._filter = new Set();

    // don't want the "jQuery needs a window" errors during testing
    if (!gui || !gui.inBrowser)
      return this;

    $('#label-input').keyup(e => {
      if (e.which === ENTER)
        this.handle.enter(e);
    });

    this.handle = {
      enter: event => {
        const names = $('#label-input').val().trim();
        _.each(names.split(/\s+/), name => {
          if (name)
            this.add(name)

          this.addLabel(name); // add to the comments
        });

        $('#label-input').val('');
        gui.update();
      },

      click: {
        label: event => {
          const target = $(event.target),
            name = target.closest('li').attr('name');

          this.toggleFilter(name);
          manager.updateFilter();
          gui.update();
          flashDropdown(name);
        },

        refresh: event => {
          const target = $(event.target),
            name = target.closest('li').attr('name'),
            label = this.get(name);

          label.changeColor();
          gui.update();
          flashDropdown(name);
        },

        checkbox: {
          inComments: event => {
            const target = $(event.target),
              checked = target.is(':checked'),
              name = target.closest('li').attr('name');

            if (checked) {
              this.addLabel(name);
            } else {
              this.removeLabel(name);
            }

            manager.updateFilter();
            gui.update();
            flashDropdown(name);
          },

          filtering: event => {
            const target = $(event.target),
              name = target.closest('li').attr('name');

            this.toggleFilter(name);
            manager.updateFilter();
            gui.update();
            flashDropdown(name);
          }
        },

        delete: event => {
          const target = $(event.target),
            name = target.closest('li').attr('name');

          const response = confirm(`Are you sure you want to delete the label "${name}" from all sentences?`);
          if (!response)
            return;

          this.remove(name);
          gui.update();
        }
      },

      keyup: {
        name: event => {
          var target = $(event.target),
            name = target.closest('li').attr('name'),
            value = target.val();

          if (event.which === ENTER) {
            this.edit(name, { name: value });
            gui.update();
            flashDropdown(value);
          }
        },

        desc: event => {
          var target = $(event.target),
            name = target.closest('li').attr('name'),
            value = target.val();

          if (event.which === ENTER) {
            this.edit(name, { desc: value });
            gui.update();
            flashDropdown(name);
          }
        },

        color: event => {
          var target = $(event.target),
            name = target.closest('li').attr('name'),
            value = target.val();

          if (event.which === ENTER) {
            this.edit(name, { color: value });
            gui.update();
            flashDropdown(name);
          }
        }
      }
    };
  }

  parse(comments) {

    _.each(Labeler.parseComments(comments), label => {
      if (label)
        this.add(label);
    });

    return this; // chaining
  }

  static parseComment(comment) {
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

  static parseComments(comments) {
    return _.reduce(comments, (l, comment) => {
      return l.concat(Labeler.parseComment(comment));
    }, []);
  }

  has(index, name) {

    if (name === undefined) {
      name = index;
      index = manager.index;
    }

    const comments = manager.getSentence(index).comments;

    let has = false;
    _.each(comments, comment => {
      _.each(Labeler.parseComment(comment), label => {
        if (name === label)
          has = true;
      });
    });

    return has;
  }

  get(name) {

    let ret = null;
    if (name && typeof name === 'string')
      _.each(this._labels, label => {
        if (label.name === name)
          ret = label;
      });

    return ret;
  }

  add(name) {

    let found = false;
    _.each(this._labels, label => {
      if (label.name === name)
        found = true;
    });

    if (!found)
      this._labels.push(new Label(name));

    return !found; // so we know if success or not
  }

  remove(name) {
    this._labels = this._labels.filter(label => {
      if (label.name !== name)
        return label;
    });
    for (let i=0; i<manager.length; i++) {
      this.removeLabel(i, name);
    }
  }

  edit(name, values) {
    const label = this.get(name);
    if (!label)
      return null;

    if (values.name) {
      for (let i=0; i<manager.length; i++) {
        this.changeLabel(i, label.name, values.name);
      }
      label.name = values.name;
    }

    if (values.desc || values.desc === '')
      label.desc = values.desc;

    if (values.color)
      label.changeColor(values.color.startsWith('#') ? values.color : `#${values.color}`);
  }

  update() {

    if (!gui || !gui.inBrowser)
      return;

    $('.label.horiz').detach();

    _.each(this._labels, label => label.render(this));
  }

  addLabel(index, name) {

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
      manager.getSentence(index).comments = manager.getSentence(index).comments.concat([`labels = ${name}`]);
  }

  removeLabel(index, name) {

    if (name === undefined) {
      name = index;
      index = manager.index;
    }

    const reg = new RegExp(` ${name}( ?)`);
    manager.getSentence(index).comments = manager.getSentence(index).comments.map(comment => {
      return comment.replace(reg, '$1')
    });
  }

  changeLabel(index, oldName, newName) {
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

  get state() {
    return {
      labels: this._labels.map(label => label.state),
      filter: Array.from(this._filter)
    };
  }

  set state(state) {
    this._labels = state.labels.map(labelState => {
      let label = new Label();
      label.state = labelState;
      return label;
    });

    this._filter = new Set();
    _.each(state.filter, name => {
      this.addFilter(name);
    });
  }

  addFilter(name) {

    // make sure it's a valid name
    manager.map(i => {
      if (this.has(i, name))
        this._filter.add(name);
    });

    return this; // chaining
  }
  filter(name) {
    return this.addFilter(name); // alias
  }

  removeFilter(name) {
    this._filter.delete(name);
    return this;
  }
  unfilter(name) {
    return this.removeFilter(name); // alias
  }

  clearFilter() {
    this._filter.forEach(name => this.removeFilter(name));
    return this;
  }

  toggleFilter(name) {

    if (this._filter.has(name)) {
      this.removeFilter(name);
    } else {
      this.addFilter(name);
    }

    return this;
  }

}

function flashDropdown(name) {
  const dropdown = $(`li[name="${name}"] .label-hidden`);

  // show dropdown part immediately
  dropdown.css('display', 'flex');

  // wait 0.5 secs to return to standard dropdown behavior
  setTimeout(() => dropdown.css('display', ''), 500);
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

module.exports = Labeler;
