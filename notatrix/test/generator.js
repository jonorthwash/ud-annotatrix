"use strict";

const _ = require("underscore"), expect = require("chai").expect,
      sinon = require("sinon"), utils = require("./utils"), nx = require("..");

describe("generator", () => {
  describe("generate output in input format from nx.Sentence instances", () => {
    utils.forEachText((text, format, name) => {
      it(`${format}:${name}`, () => {
        // massage the inputs and outputs to not break at pointless
        // places
        let clean = str => utils.clean(str, []);
        switch (format) {
        case ("CoNLL-U"):
          clean = str => utils.clean(str, [
            utils.spacesToTabs,
            line => line.trim(),
          ]);
          break;
        case ("CG3"):
          clean = str => utils.clean(str, [
            utils.spacesToTabs,
          ]);
          break;
        case ("Params"):
          clean = obj => obj.forEach(token => _.omit(token, "index"));
          break;
        case ("plain text"):
          clean = str => str.trim();
          break;
        case ("SD"):
          clean = str => str.split("\n")
                             .sort((x, y) => { // reorder the lines
                               if (x[0] < y[0])
                                 return -1;
                               if (x[0] > y[0])
                                 return 1;
                               return 0;
                             })
                             .join("\n")
                             .replace(utils.re.spaceBeforePunctuation, "$1");
          break;
        }

        let options = {
          addHeadOnModifyFailure: false,
          addHeadsWhenAddingDeps: false,
          addDepsWhenAddingHeads: false,
          depsShowDeprel: false,
          showEnhancedDependencies: false,
          useTokenDeprel: false,
        };

        // some data has weird stuff that needs to be set
        switch (`${format}:${name}`) {
        case ("CG3:nested"):
        case ("CG3:with_semicolumn"):
        case ("CG3:apertium_kaz_1"):
        case ("CG3:apertium_kaz_2"):
          options.omitIndices = true;
          break;
        case ("CoNLL-U:ud_example_modified"):
          options.depsShowDeprel = true;
          options.showEnhancedDependencies = true;
          break;
        case ("CoNLL-U:ud_example_spaces"):
          options.depsShowDeprel = true;
          options.showRootDeprel = false;
          options.showEnhancedDependencies = true;
          break;
        case ("CoNLL-U:ud_example_tabs"):
          options.depsShowDeprel = true;
          break;
        }
        if (format === "Brackets") {
          options.addDepsWhenAddingHeads = true;
          options.useTokenDeprel = true;
        } else if (format === "SD") {
          options.addDepsWhenAddingHeads = true;
          options.useTokenDeprel = true;
        }

        const sent = new nx.Sentence(text, options);
        const generated = nx.generate[format](sent, options);
        const detected = nx.detect.as [format](generated.output);

        expect(detected).to.equal(format);
        expect(clean(generated.output)).to.equal(clean(text));
        expect(Array.isArray(generated.loss)).to.equal(true);
      });
    });
  });

  describe("generate outputs in different formats if possible", () => {
    const test = (text, format, name, options = {}) => {
      utils.forEachFormat(castedFormat => {
        if (format !== castedFormat)
          it(`${format}:${name} => ${castedFormat}`, () => {
            try {

              const generated =
                  (new nx.Sentence(text, options)).to(castedFormat);
              expect(Array.isArray(generated.loss)).to.equal(true);

            } catch (e) {
              if (e instanceof utils.GeneratorError) {
                // console.log(e.message);
              } else {
                throw e;
              }
            }
          });
      });
    };

    utils.forEachText(test);
    test("", "plain text", "empty string",
         {interpretAs: "plain text", allowEmptyString: true});
    test(null, "plain text", "null",
         {interpretAs: "plain text", allowEmptyString: true});
    test(undefined, "plain text", "undefined",
         {interpretAs: "plain text", allowEmptyString: true});
  });

  /*
  describe('parse formats implicitly to notatrix serial', () => {

    const options = {};

    utils.forEachText((text, format, name) => {
      it(`${format}:${name}`, () => {

        const possibilities = nx.parse(text, options);
        _.each(possibilities, possibility => {
          expect(() =>
  nx.detect.as.notatrixSerial(possibility)).to.not.throw();
        });

      });
    });
  });
  */
});
