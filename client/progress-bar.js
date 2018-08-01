'use strict';

class ProgressBar {
  constructor() {
    this.element = gui.inBrowser
      ? $('#progressBar')
      : null;

    this.done = 0;
    this.total = 0;
  }

  update() {
    if (!manager.current || !this.element)
      return;

    const percent = (this.total ? this.done / this.total : 0) * 100;
    this.element.css('width', `${percent}%`);
  }
}

module.exports = ProgressBar;
