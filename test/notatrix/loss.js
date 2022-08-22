"use strict";

const _ = require("underscore"), expect = require("chai").expect,
      sinon = require("sinon"), utils = require("./utils"), nx = require("..");

describe("check loss", () => {
  it("no dependencies", () => {
    const s = new nx.Sentence(`1	one	_	_	_	_	_	_	_	_
2	two	_	_	_	_	_	_	_	_
3	three	_	_	_	_	_	_	_	_`);

    expect(s.options.enhanced).to.equal(false);
    expect(() => s.to("Brackets").loss).to.throw(nx.GeneratorError);
    expect(s.to("CG3").loss).to.deep.equal([]);
    expect(s.to("CoNLL-U").loss).to.deep.equal([]);
    expect(s.to("Params").loss).to.deep.equal([]);
    expect(s.to("plain text").loss).to.deep.equal([]);
    expect(s.to("SD").loss).to.deep.equal([]);
  });

  it("only dependencies", () => {
    const s = new nx.Sentence(`1	one	_	_	_	_	0	root	_	_
2	two	_	_	_	_	3	_	3	_
3	three	_	_	_	_	1	_	1	_`);

    expect(s.options.enhanced).to.equal(false);
    expect(s.to("Brackets").loss).to.deep.equal([]);
    expect(s.to("CG3").loss).to.deep.equal([]);
    expect(s.to("CoNLL-U").loss).to.deep.equal([]);
    expect(s.to("Params").loss).to.deep.equal([]);
    expect(s.to("plain text").loss).to.deep.equal(["heads"]);
    expect(s.to("SD").loss).to.deep.equal([]);
  });

  it("enhanced", () => {
    const s = new nx.Sentence(`1	one	_	_	_	_	0	root	_	_
2	two	_	_	_	_	3	_	1|3	_
3	three	_	_	_	_	1	_	1	_`);

    expect(s.options.enhanced).to.equal(true);
    expect(() => s.to("Brackets").loss).to.throw(nx.GeneratorError);
    expect(s.to("CG3").loss).to.deep.equal(["enhanced dependencies"]);
    expect(s.to("CoNLL-U").loss).to.deep.equal([]);
    expect(s.to("Params").loss).to.deep.equal(["enhanced dependencies"]);
    expect(s.to("plain text").loss).to.deep.equal(["heads"]);
    expect(s.to("SD").loss).to.deep.equal(["enhanced dependencies"]);
  });

  it("unenhanced", () => {
    const s = new nx.Sentence(`1	one	_	_	_	_	0	root	_	_
2	two	_	_	_	_	3	_	1|3	_
3	three	_	_	_	_	1	_	1	_`);

    expect(s.options.enhanced).to.equal(true);
    s.unenhance();
    expect(s.options.enhanced).to.equal(false);
    expect(() => s.to("Brackets").loss).to.throw(nx.GeneratorError);
    expect(s.to("CG3").loss).to.deep.equal(["enhanced dependencies"]);
    expect(s.to("CoNLL-U").loss).to.deep.equal(["enhanced dependencies"]);
    expect(s.to("Params").loss).to.deep.equal(["enhanced dependencies"]);
    expect(s.to("plain text").loss).to.deep.equal(["heads"]);
    expect(s.to("SD").loss).to.deep.equal(["enhanced dependencies"]);
  });
});
