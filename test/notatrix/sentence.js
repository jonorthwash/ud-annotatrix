"use strict";

const _ = require("underscore"), expect = require("chai").expect,
      sinon = require("sinon"), utils = require("./utils"), nx = require("../../src/notatrix");

describe("Sentence", () => {
  describe("instantiate nx.Sentence with explicit format", () => {
    utils.forEachText((text, format, name) => {
      const options = {
        interpretAs: format,
      };

      it(`${format}:${name}`, () => {
        expect(() => {new nx.Sentence(text, options)}).to.not.throw();
      });
    });
  });

  describe("instantiate nx.Sentence without explicit format", () => {
    utils.forEachText((text, format, name) => {
      it(`${format}:${name}`,
         () => { expect(() => {new nx.Sentence(text)}).to.not.throw(); });
    });
  });

  describe("serialize nx.Sentence back into notatrix-serial format", () => {
    utils.forEachText((text, format, name) => {
      it(`${format}:${name}`, () => {
        const parsed = nx.parse(text, {returnAllPossibilities: false});
        const serial = (new nx.Sentence(parsed)).serialize();

        // get some sort of notatrix serial output
        expect(() => { nx.detectAs.notatrixSerial(serial); }).to.not.throw();

        // in fact, get the same exact notatrix serial
        const clean = serial => {
          serial.tokens = serial.tokens.map(token => _.omit(token, "index"));
        };
        expect(clean(serial)).to.equal(clean(parsed));
      });
    });
  });
});
