'use strict';

/*
 * Tester object
 *
 * put unit tests inside here as functions, and then add the function call to
 * the all() function ... to invoke, use window.test.all() or test.all()
 *
 * also implements an assert() function, which throws AssertionError exceptions
 */
class Tester extends Object {
  constructor() { super(); }


  /*
   * simple assert function
   */
  assert(expression, message='') {
    if (!expression)
      throw new AssertionError(message);
    log.debug(`OK: Tester.assert() got a truthy expression (message: "${message}")`);
  }





  /*
   * TEST functions
   */
  all() {
    log.out('\nExecuting Tester.all()');
    this.tester();
    this.logger();
    this.errors();
    this.buttons();
  }
  tester() {

    log.out('\nExecuting Tester.tester()');

    this.assert(1==1, `1==1`);
    this.assert(1=='1', `1=='1'`);
    this.assert(1!=='1', `1!=='1'`);
    this.assert(undefined==null, `undefined==null`);
    this.assert(undefined!==null, `undefined!==null`);
    this.assert(0==false, `0==false`);
    this.assert(0!==false, `0!==false`);
    this.assert(1==true, `1==true`);
    this.assert((()=>{})()==undefined, `(()=>{})()==undefined`);
    this.assert((()=>{})()===undefined, `(()=>{})()===undefined`);
    this.assert('foo'!='bar', `'foo'!=bar`);

  }
  logger() {

    log.out('\nExecuting Tester.logger()');

    const testMessage = 'This is the logger test message';
    const loggers = [ log, // defined in annotator.js
      new Logger('CRITICAL'),
      new Logger('ERROR'),
      new Logger('WARN'),
      new Logger('INFO'),
      new Logger('DEBUG'),
      new Logger('INVALID') ];

    $.each(loggers, (i, logger) => {

      logger.out(`\nNow testing logger: ${logger}`);
      logger.critical(testMessage);
      logger.error(testMessage);
      logger.warn(testMessage);
      logger.info(testMessage);
      logger.debug(testMessage);

    });
  }
  errors() {

    log.out('\nExecuting Tester.errors()');

    const testMessage = 'This is the error test message';
    const errors = [
      new Error(testMessage),
      new ReferenceError(testMessage),
      new TypeError(testMessage),
      new SyntaxError(testMessage),
      new AnnotatrixError(testMessage),
      new AssertionError(testMessage),
      new GUIError(testMessage),
      new ParseError(testMessage)
    ];

    $.each(errors, (i, error) => {
      try {
        throw error;
      } catch (e) {
        console.log(`Caught ${e.name} with message "${e.message
          }", (custom:${e instanceof AnnotatrixError ? 'yes' : 'no'})`);
      }
    });
  }
  buttons() {

    log.out('\nExecuting Tester.buttons()');

    const buttons = [
      $('#prevSenBtn'),
      $('#nextSenBtn'),
      $('#remove'),
      $('#add'),
      $('#upload'),
      $('#exportBtn'),
      $('#clearBtn'),
      $('#printBtn'),
      $('#btnUndo'),
      $('#btnRedo'),
      $('#helpBtn'),
      $('#settingsBtn'),
      $('#viewOther'),
      $('#viewConllu'),
      $('#viewCG'),
      $('#tableViewBtn'),
      $('#codeVisibleBtn'),
      $('#RTL'),
      $('#vertical'),
      $('#enhanced')
    ];

    $.each(buttons, (i, button) => {
      //button.click();
    });
  }
}
