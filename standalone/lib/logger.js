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
  constructor(levelName, writer=console.error) {

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

    let string = '';
    if (showTimestamp) {
      let date = new Date();
      string += `[${date}] `;
    }
    if (tag !== null)
      string += `${tag.toUpperCase()}: `;
    string += message;//JSON.stringify(message);

    return string;

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
  _handle(level, tag, message='') {
    if (level <= this.level) {
      message = this._format(message, tag, true);
      this._write(message);
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
    this._handle(0, 'critical', message);
  }
  error(message) {
    this._handle(1, 'error', message);
  }
  warn(message) {
    this._handle(2, 'warn', message);
  }
  info(message) {
    this._handle(3, 'info', message);
  }
  debug(message) {
    this._handle(4, 'debug', message);
  }


  /*
   * `public` method
   * log normally (always and without special formatting)
   *
   * @param {...various} args:    zero or more things to be written out
   *
   * @return <none>
   */
  out(message) {
    message = this._format(message, null, false);
    this._write(message);
  }

}
