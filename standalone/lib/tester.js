'use strict';

/*
 * Tester object
 *
 * put unit tests inside here as functions, and then add the function call to
 * the all() function ... to invoke, use window.test.all() or test.all()
 */
class Tester extends Object {
  constructor() { super(); }

  all() {
    log.out('\nExecuting Tester.all()');
    this.logger();
    this.errors();
  }

  logger() {

    log.out('\nExecuting Tester.logger()');

    let testMessage = 'This is the logger test message';
    let loggers = [ log, // defined in annotator.js
      new Logger('CRITICAL'),
      new Logger('ERROR'),
      new Logger('WARN'),
      new Logger('INFO'),
      new Logger('DEBUG'),
      new Logger('INVALID') ];

    for (let i=0; i<loggers.length; i++) {
      let logger = loggers[i];

      logger.out(`\nNow testing logger: ${logger}`);
      logger.critical(testMessage);
      logger.error(testMessage);
      logger.warn(testMessage);
      logger.info(testMessage);
      logger.debug(testMessage);

    }
  }

  errors() {

    log.out('\nExecuting Tester.errors()');

    let testMessage = 'This is the error test message';
    let errors = [
      new Error(testMessage),
      new ReferenceError(testMessage),
      new TypeError(testMessage),
      new SyntaxError(testMessage),
      new AnnotatrixError(testMessage),
      new GUIError(testMessage),
      new ParseError(testMessage)
    ];

    for (let i=0; i<errors.length; i++) {
      let error = errors[i];

      try {
        throw error;
      } catch (e) {
        console.log(`Caught ${e.name} with message "${e.message
          }", (custom:${e instanceof AnnotatrixError ? 'yes' : 'no'})`);
      }
    }
  }
}
