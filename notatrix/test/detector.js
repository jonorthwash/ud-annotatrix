"use strict";

const _ = require("underscore"), expect = require("chai").expect,
      sinon = require("sinon"), utils = require("./utils"), nx = require("..");

describe("detector", () => {
  describe("detect formats explicitly", () => {
    const options = {
      requireTenParams: true,
    };

    utils.forEachText((text, format, name) => {
      it(`${format}:${name} is ${format}`, () => {
        expect(nx.detect.as [format](text, options)).to.equal(format);
      });
    });
  });

  describe("avoid cross-detection", () => {
    const options = {};

    utils.forEachText((text, format, name) => {
      utils.forEachFormat(castedFormat => {
        if (format !== castedFormat)
          it(`${format}:${name} is not ${castedFormat}`, () => {
            const cast = nx.detect.as [castedFormat];
            expect(() => { cast(text, options); }).to.throw(nx.DetectorError);
          });
      });
    });
  });

  describe("detect formats implicitly", () => {
    const options = {
      suppressDetectorErrors: true,
      returnAllMatches: true,
    };

    utils.forEachText((text, format, name) => {
      it(`${format}:${name} is ${format}`, () => {
        const possibilities = nx.detect(text, options);
        expect(possibilities.indexOf(format) > -1).to.equal(true);
      });
    });
  });
});
