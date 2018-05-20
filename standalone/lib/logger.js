'use strict';

/*
 * Logger object
 *
 * Tries to abstract away some of the complexity of logging.  If we can consistently
 * call the logger for errors, debugging, etc. instead of directly calling console.log,
 * then this will eventually make it easier to hide excessive stuff in production.
 *
 * Also, sending everything to one consistent place makes maintenance simpler.
 *
 * NOTE: in /standalone/lib/annotator.js, we set `window.log = new Logger()`, so
 *   to use this, call (for example) `log.warn("Some message")`.
 *
 * NOTE: to log "normally", without any of this special formatting, use Logger.out()
 *
 * @param {String} levelName:   one of 'CRITICAL', 'ERROR', 'WARN', 'INFO', 'DEBUG'
 *   used to set when the logger will actually display the message.  for example,
 *   if levelName='WARN', and you call `log.info("Some message")`, this won't be
 *   printed
 *
 * @param {Function} writer:    where to redirect the formatted message, default
 *   is console.error
 */
class Logger extends Object {
  constructor(levelName, writer=console.log) {

    super();

    this._write = writer;

    this.levelName = levelName;
    this.level = ['CRITICAL', 'ERROR', 'WARN', 'INFO', 'DEBUG']
      .indexOf(levelName);

    if (this.level === -1) {
      this.out(`Unrecognized Logger levelName "${levelName}", setting level to CRITICAL.`);
      this.levelName = 'CRITICAL';
      this.level = 0;
    }

    this.colors = {
      'CRITICAL': 'red',
      'ERROR': 'orange',
      'WARN': 'yellow',
      'INFO': 'green',
      'DEBUG': 'blue',
      'OK': 'green'
    };

  }
  /*
   * Override prototype toString() method
   */
  toString() {
    return `Logger (level=${this.levelName})`;
  }

  /*
   * `private` method
   * format a message to be printed
   *
   * @param {String} message:   message to be printed
   * @param {String} tag:    keyword to appear between the timestamp (if present)
   *   and the message (default=null implies no tag shown)
   * @param {Boolean} showTimestamp:  set to `false` to suppress the current time
   *   from being output
   *
   * @return {String} formatted message
   */
  _format(message, tag=null, showTimestamp=true) {

    let title = '', raw = '';
    if (showTimestamp) {
      let date = new Date();
      title += `[${date}] `;
      raw += `[${date}] `;
    }
    let css = [];
    if (tag !== null) {
      title += `%c${tag}%c: `;
      raw += `${tag}: `;
      css = css.concat([`color:${this.colors[tag] || 'black'};`, 'color:black'])
    }
    title += (message.match(/\n/) === null  // title should only be 1 line
      ? message
      : `${message.split('\n')[0]} [...]`);
    raw += message

    return { title:title, raw:raw, css:css };

  }

  /*
   * `private` method
   * helper function for the below functions ... decides whether or not a message
   * should be written out
   *
   * @param {Number} level:     integer representing the output priority level
   * @param {String} tag:       keyword to appear between the timestamp (if present)
   *   and the message (default=null implies no tag shown)
   * @param {String} message:   message to be printed (default='')
   * @param {Boolean} showTimestamp:  set to `false` to suppress the current time
   *   from being output
   *
   * @return <none>
   */
  _handle(level, tag, message='', writer) {
    if (level <= this.level) {
      const formatted = this._format(message, tag, true);
      writer = writer || this._write;
      console.groupCollapsed(formatted.title, ...formatted.css);
        writer(formatted.raw);
        console.groupCollapsed('stack trace:');
          console.trace();
        console.groupEnd();
      console.groupEnd();
    }
  }


  /*
   * `public` methods
   * call these functions to use this class's functionality (see above for details)
   *
   * @param {String} message:   message to be printed
   *
   * @return <none>
   */
  critical(message) {
    this._handle(0, 'CRITICAL', message, console.error);
  }
  error(message) {
    this._handle(1, 'ERROR', message, console.error);
  }
  warn(message) {
    this._handle(2, 'WARN', message, console.warn);
  }
  info(message) {
    this._handle(3, 'INFO', message, console.info);
  }
  debug(message) {
    this._handle(4, 'DEBUG', message, console.log);
  }


  /*
   * `public` method
   * log normally (always and without special formatting)
   *
   * @param {...various} args:    zero or more things to be written out
   *
   * @return <none>
   */
  out(message, tag) {
    const formatted = this._format(message, tag, false);
    if (formatted.css.length) {
      this._write(formatted.title, formatted.css);
    } else {
      this._write(formatted.raw);
    }
  }

}
