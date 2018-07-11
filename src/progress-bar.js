'use strict';

class ProgressBar {
  constructor() {
    this.element = gui.inBrowser
      ? $('#progressBar')
      : null;
  }

  update() {
    if (!manager.current || !this.element)
      return;

    const percentage = manager.current.progress * 100;
    this.element.css('width', `${percentage}%`);
  }
}

module.exports = ProgressBar;
