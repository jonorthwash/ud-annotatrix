"use strict";

const _ = require("underscore"), expect = require("chai").expect,
      sinon = require("sinon"), utils = require("./utils"), nx = require("..");

describe("parser", () => {
  describe("parse formats explicitly to notatrix serial", () => {
    const options = {};

    utils.forEachText((text, format, name) => {
      it(`${format}:${name}`, () => {
        const parsed = nx.parse.as [format](text, options);
        expect(() => nx.detect.as.notatrixSerial(parsed)).to.not.throw();
      });
    });
  });

  describe("parse formats implicitly to notatrix serial", () => {
    const options = {};

    utils.forEachText((text, format, name) => {
      it(`${format}:${name}`, () => {
        const possibilities = nx.parse(text, options);
        _.each(possibilities, possibility => {
          expect(() => nx.detect.as.notatrixSerial(possibility)).to.not.throw();
        });
      });
    });
  });
});
