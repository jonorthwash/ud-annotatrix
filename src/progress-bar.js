'use strict';

class ProgressBar {
  constructor() {
    this.element = $('#progressBar');
  }

  update() {
    if (!manager.current)
      return;

    const percentage = manager.current.progress * 100;
    this.element.css('width', `${percentage}%`);
  }
}

module.exports = ProgressBar;
