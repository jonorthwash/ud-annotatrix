const _ = require("underscore"), expect = require("chai").expect,
      sinon = require("sinon"), utils = require("./utils"), nx = require("../../src/notatrix");

describe("relation sets", () => {
  it(`should initialize the heads and dependents fields on the tokens`, () => {
    const sent = new nx.Sentence("first second third");
    sent.iterate(token => {
      expect(token.heads.length).to.equal(0);
      expect(token.dependents.length).to.equal(0);
    });
  });

  it(`should throw errors if we pass invalid args and such`, () => {
    const sent = new nx.Sentence("first second third");
    const tok0 = sent.tokens[0];
    const tok1 = sent.tokens[1];

    expect(() => tok0.addHead()).to.throw(nx.NxError);
    expect(() => tok0.addHead(1)).to.throw(nx.NxError);
    expect(() => tok0.addHead("1")).to.throw(nx.NxError);
    expect(() => tok0.addHead(tok0)).to.throw(nx.NxError);
    expect(() => tok0.addHead(tok1, 1)).to.throw(nx.NxError);

    expect(() => tok0.modifyHead()).to.throw(nx.NxError);
    expect(() => tok0.modifyHead(1)).to.throw(nx.NxError);
    expect(() => tok0.modifyHead("1")).to.throw(nx.NxError);
    expect(() => tok0.modifyHead(tok1, 1)).to.throw(nx.NxError);
  });

  it(`should keep track after adding a head`, () => {
    const sent = new nx.Sentence("first second third");
    const tok0 = sent.tokens[0];
    const tok1 = sent.tokens[1];
    const deprel = "deprel_0_1";

    tok0.addHead(tok1, deprel);

    expect(tok0.heads.length).to.equal(1);
    expect(tok0.heads.first).to.deep.equal({
      token: tok1,
      deprel: deprel,
    });
    expect(tok0.dependents.length).to.equal(0);
    expect(tok0.dependents.first).to.equal(null);

    expect(tok1.heads.length).to.equal(0);
    expect(tok1.heads.first).to.equal(null);
    expect(tok1.dependents.length).to.equal(1);
    expect(tok1.dependents.first).to.deep.equal({
      token: tok0,
      deprel: deprel,
    });
  });

  it(`should only keep one head at a time if not enhanced`, () => {
    const sent = new nx.Sentence("first second third", {enhanced: false});
    const tok0 = sent.tokens[0];
    const tok1 = sent.tokens[1];
    const tok2 = sent.tokens[2];
    const deprel01 = "deprel_0_1";
    const deprel02 = "deprel_0_2";

    tok0.addHead(tok1, deprel01);
    const ret1 = tok0.addHead(tok2, deprel02);
    const ret2 = tok0.addHead(tok2, deprel02);

    expect(tok0.heads.length).to.equal(1);
    expect(tok0.heads.first).to.deep.equal({
      token: tok2,
      deprel: deprel02,
    });
    expect(tok0.dependents.length).to.equal(0);
    expect(tok0.dependents.first).to.equal(null);

    expect(tok1.heads.length).to.equal(0);
    expect(tok1.heads.first).to.equal(null);
    expect(tok1.dependents.length).to.equal(0);
    expect(tok1.dependents.first).to.equal(null);

    expect(tok2.heads.length).to.equal(0);
    expect(tok2.heads.first).to.equal(null);
    expect(tok2.dependents.length).to.equal(1);
    expect(tok2.dependents.first).to.deep.equal({
      token: tok0,
      deprel: deprel02,
    });

    expect(ret1).to.equal(true);
    expect(ret2).to.equal(
        true); // because not enhanced, clear every time we add
  });

  it(`should keep multiple heads at a time if enhanced`, () => {
    const sent = new nx.Sentence("first second third", {enhanced: true});
    const tok0 = sent.tokens[0];
    const tok1 = sent.tokens[1];
    const tok2 = sent.tokens[2];
    const deprel01 = "deprel_0_1";
    const deprel02 = "deprel_0_2";

    tok0.addHead(tok1, deprel01);
    const ret1 = tok0.addHead(tok2, deprel02);
    const ret2 = tok0.addHead(tok2, deprel02);

    expect(tok0.heads.length).to.equal(2);
    expect(tok0.heads.map(utils.noop)).to.deep.equal([
      {
        token: tok1,
        deprel: deprel01,
      },
      {
        token: tok2,
        deprel: deprel02,
      }
    ]);
    expect(tok0.heads.first).to.deep.equal({
      token: tok1,
      deprel: deprel01,
    });
    expect(tok0.dependents.length).to.equal(0);
    expect(tok0.dependents.first).to.equal(null);

    expect(tok1.heads.length).to.equal(0);
    expect(tok1.heads.first).to.equal(null);
    expect(tok1.dependents.length).to.equal(1);
    expect(tok1.dependents.first).to.deep.equal({
      token: tok0,
      deprel: deprel01,
    });

    expect(tok2.heads.length).to.equal(0);
    expect(tok2.heads.first).to.equal(null);
    expect(tok2.dependents.length).to.equal(1);
    expect(tok2.dependents.first).to.deep.equal({
      token: tok0,
      deprel: deprel02,
    });

    expect(ret1).to.equal(true);
    expect(ret2).to.equal(false);
  });

  it(`should update a deprel when we modify an existing dependency`, () => {
    const sent = new nx.Sentence("first second third");
    const tok0 = sent.tokens[0];
    const tok1 = sent.tokens[1];
    const deprel1 = "deprel1";
    const deprel2 = "deprel2";

    tok0.addHead(tok1, deprel1);
    const ret1 = tok0.modifyHead(tok1, deprel2);
    const ret2 = tok0.modifyHead(tok1, deprel2);

    expect(tok0.heads.length).to.equal(1);
    expect(tok0.heads.first).to.deep.equal({
      token: tok1,
      deprel: deprel2,
    });
    expect(tok0.dependents.length).to.equal(0);
    expect(tok0.dependents.first).to.equal(null);

    expect(tok1.heads.length).to.equal(0);
    expect(tok1.heads.first).to.equal(null);
    expect(tok1.dependents.length).to.equal(1);
    expect(tok1.dependents.first).to.deep.equal({
      token: tok0,
      deprel: deprel2,
    });

    expect(ret1).to.equal(true);
    expect(ret2).to.equal(false);
  });

  it(`should do nothing if we update a nonexistent dependency`, () => {
    const sent = new nx.Sentence("first second third");
    const tok0 = sent.tokens[0];
    const tok1 = sent.tokens[1];
    const tok2 = sent.tokens[2];
    const deprel1 = "deprel1";
    const deprel2 = "deprel2";

    tok0.addHead(tok1, deprel1);
    const ret = tok0.modifyHead(tok2, deprel2);

    expect(tok0.heads.length).to.equal(1);
    expect(tok0.heads.first).to.deep.equal({
      token: tok1,
      deprel: deprel1,
    });
    expect(tok0.dependents.length).to.equal(0);
    expect(tok0.dependents.first).to.equal(null);

    expect(tok1.heads.length).to.equal(0);
    expect(tok1.heads.first).to.equal(null);
    expect(tok1.dependents.length).to.equal(1);
    expect(tok1.dependents.first).to.deep.equal({
      token: tok0,
      deprel: deprel1,
    });

    expect(tok2.heads.length).to.equal(0);
    expect(tok2.dependents.length).to.equal(0);

    expect(ret).to.equal(false);
  });

  it(`should remove a dependency if it exists`, () => {
    const sent = new nx.Sentence("first second third");
    const tok0 = sent.tokens[0];
    const tok1 = sent.tokens[1];
    const deprel = "deprel";

    tok0.addHead(tok1, deprel);
    const ret = tok0.removeHead(tok1);

    expect(tok0.heads.length).to.equal(0);
    expect(tok0.heads.first).to.equal(null);
    expect(tok0.dependents.length).to.equal(0);
    expect(tok0.dependents.first).to.equal(null);

    expect(tok1.heads.length).to.equal(0);
    expect(tok1.heads.first).to.equal(null);
    expect(tok1.dependents.length).to.equal(0);
    expect(tok1.dependents.first).to.equal(null);

    expect(ret.token instanceof nx.BaseToken && typeof ret.deprel === "string")
        .to.equal(true);
  });

  it(`should do nothing if we try to remove a nonexistent dependency`, () => {
    const sent = new nx.Sentence("first second third");
    const tok0 = sent.tokens[0];
    const tok1 = sent.tokens[1];
    const tok2 = sent.tokens[2];
    const deprel = "deprel";

    tok0.addHead(tok1, deprel);
    const ret = tok0.removeHead(tok2);

    expect(tok0.heads.length).to.equal(1);
    expect(tok0.heads.first).to.deep.equal({
      token: tok1,
      deprel: deprel,
    });
    expect(tok0.dependents.length).to.equal(0);
    expect(tok0.dependents.first).to.equal(null);

    expect(tok1.heads.length).to.equal(0);
    expect(tok1.heads.first).to.equal(null);
    expect(tok1.dependents.length).to.equal(1);
    expect(tok1.dependents.first).to.deep.equal({
      token: tok0,
      deprel: deprel,
    });

    expect(tok2.heads.length).to.equal(0);
    expect(tok2.dependents.length).to.equal(0);

    expect(ret).to.equal(null);
  });

  /*
  it(`should map un-enhanced dependencies to just the first element`, () => {

    const sent = new nx.Sentence('first second third', { enhanced: true });
    const tok0 = sent.tokens[0];
    const tok1 = sent.tokens[1];
    const tok2 = sent.tokens[2];
    const deprel01 = 'deprel_0_1';
    const deprel02 = 'deprel_0_2';

    tok0.addHead(tok1, deprel01);
    tok0.addHead(tok2, deprel02);

    sent.unenhance();

    expect(tok0.heads.map(utils.noop)).to.deep.equal([
      {
        token: tok1,
        deprel: deprel01,
      },
      {
        token: tok2,
        deprel: deprel02,
      }
    ]);
    expect(tok0.mapHeads(head => head.deprel)).to.deep.equal([
      deprel01
    ]);

    expect(tok1.heads.length).to.equal(0);
    expect(tok1.dependents.length).to.equal(1);
    expect(tok1.mapDependents(dependent => dependent.deprel)).to.deep.equal([
      deprel01
    ]);

    expect(tok2.heads.length).to.equal(0);
    expect(tok2.dependents.length).to.equal(1);
    expect(tok2.mapDependents(dependent => dependent.deprel)).to.deep.equal([
      deprel02
    ]);

  });
  */

  it(`should map enhanced dependencies to all the elements`, () => {
    const sent = new nx.Sentence("first second third", {enhanced: true});
    const tok0 = sent.tokens[0];
    const tok1 = sent.tokens[1];
    const tok2 = sent.tokens[2];
    const deprel01 = "deprel_0_1";
    const deprel02 = "deprel_0_2";

    tok0.addHead(tok1, deprel01);
    tok0.addHead(tok2, deprel02);

    expect(tok0.heads.map(utils.noop)).to.deep.equal([
      {
        token: tok1,
        deprel: deprel01,
      },
      {
        token: tok2,
        deprel: deprel02,
      }
    ]);
    expect(tok0.mapHeads(head => head.deprel)).to.deep.equal([
      deprel01,
      deprel02,
    ]);

    expect(tok1.heads.length).to.equal(0);
    expect(tok1.dependents.length).to.equal(1);
    expect(tok1.mapDependents(dependent => dependent.deprel)).to.deep.equal([
      deprel01
    ]);

    expect(tok2.heads.length).to.equal(0);
    expect(tok2.dependents.length).to.equal(1);
    expect(tok2.mapDependents(dependent => dependent.deprel)).to.deep.equal([
      deprel02
    ]);
  });

  it(`should output correct head, deprel, deps fields for un-enhanced`, () => {
    const sent =
        new nx.Sentence("first second third fourth", {enhanced: false});
    const tok1 = sent.tokens[0];
    const tok2 = sent.tokens[1];
    const tok3 = sent.tokens[2];
    const tok4 = sent.tokens[3];
    const deprel13 = "dep13";
    const deprel12 = "dep12";
    const deprel14 = "dep14";
    const deprel14b = "dep14b";

    tok1.addHead(tok3, deprel13);
    tok1.addHead(tok2, deprel12);
    tok1.addHead(tok4, deprel14);
    tok1.modifyHead(tok4, deprel14b);

    ["CoNLL-U", "CG3", "Brackets"].forEach(format => {
      expect(tok1.getHead(format)).to.equal("4");
      expect(tok1._getDeprel()).to.equal(deprel14b);
      expect(tok1._getDeps(format).join("|")).to.equal("");

      expect(tok2.getHead(format)).to.equal(null);
      expect(tok2._getDeprel()).to.equal(null);
      expect(tok2._getDeps(format).join("|")).to.equal("");

      expect(tok3.getHead(format)).to.equal(null);
      expect(tok3._getDeprel()).to.equal(null);
      expect(tok3._getDeps(format).join("|")).to.equal("");

      expect(tok4.getHead(format)).to.equal(null);
      expect(tok4._getDeprel()).to.equal(null);
      expect(tok4._getDeps(format).join("|")).to.equal("");
    });
  });

  it(`should output correct head, deprel, deps fields for enhanced`, () => {
    const sent = new nx.Sentence("first second third fourth", {enhanced: true});
    const tok1 = sent.tokens[0];
    const tok2 = sent.tokens[1];
    const tok3 = sent.tokens[2];
    const tok4 = sent.tokens[3];
    const deprel13 = "dep13";
    const deprel12 = "dep12";
    const deprel14 = "dep14";
    const deprel14b = "dep14b";

    tok1.addHead(tok3, deprel13);
    tok1.addHead(tok2, deprel12);
    tok1.addHead(tok4, deprel14);
    tok1.modifyHead(tok4, deprel14b);

    ["CoNLL-U", "CG3", "Brackets"].forEach(format => {
      expect(tok1.getHead(format)).to.equal("3");
      expect(tok1._getDeprel()).to.equal(deprel13);
      expect(tok1._getDeps(format).join("|"))
          .to.equal("2:dep12|3:dep13|4:dep14b");

      expect(tok2.getHead(format)).to.equal(null);
      expect(tok2._getDeprel()).to.equal(null);
      expect(tok2._getDeps().join("|")).to.equal("");

      expect(tok3.getHead(format)).to.equal(null);
      expect(tok3._getDeprel()).to.equal(null);
      expect(tok3._getDeps().join("|")).to.equal("");

      expect(tok4.getHead(format)).to.equal(null);
      expect(tok4._getDeprel()).to.equal(null);
      expect(tok4._getDeps().join("|")).to.equal("");
    });
  });

  it(`should output correct head, deprel, deps fields after setting and unsetting enhanced`,
     () => {
       const sent =
           new nx.Sentence("first second third fourth", {enhanced: false});
       const tok1 = sent.tokens[0];
       const tok2 = sent.tokens[1];
       const tok3 = sent.tokens[2];
       const tok4 = sent.tokens[3];
       const deprel13 = "dep13";
       const deprel12 = "dep12";
       const deprel14 = "dep14";
       const deprel14b = "dep14b";

       tok1.addHead(tok3, deprel13);
       tok1.addHead(tok2, deprel12);
       tok1.addHead(tok4, deprel14);
       tok1.modifyHead(tok4, deprel14b);

       ["CoNLL-U", "CG3", "Brackets"].forEach(format => {
         expect(tok1.getHead(format)).to.equal("4");
         expect(tok1._getDeprel()).to.equal(deprel14b);
         expect(tok1._getDeps(format).join("|")).to.equal("");

         expect(tok2.getHead(format)).to.equal(null);
         expect(tok2._getDeprel()).to.equal(null);
         expect(tok2._getDeps(format).join("|")).to.equal("");

         expect(tok3.getHead(format)).to.equal(null);
         expect(tok3._getDeprel()).to.equal(null);
         expect(tok3._getDeps(format).join("|")).to.equal("");

         expect(tok4.getHead(format)).to.equal(null);
         expect(tok4._getDeprel()).to.equal(null);
         expect(tok4._getDeps(format).join("|")).to.equal("");
       });

       sent.enhance();

       ["CoNLL-U", "CG3", "Brackets"].forEach(format => {
         expect(tok1.getHead(format)).to.equal("4");
         expect(tok1._getDeprel()).to.equal(deprel14b);
         expect(tok1._getDeps(format).join("|")).to.equal("4:dep14b");

         expect(tok2.getHead(format)).to.equal(null);
         expect(tok2._getDeprel()).to.equal(null);
         expect(tok2._getDeps().join("|")).to.equal("");

         expect(tok3.getHead(format)).to.equal(null);
         expect(tok3._getDeprel()).to.equal(null);
         expect(tok3._getDeps().join("|")).to.equal("");

         expect(tok4.getHead(format)).to.equal(null);
         expect(tok4._getDeprel()).to.equal(null);
         expect(tok4._getDeps().join("|")).to.equal("");
       });

       tok1.addHead(tok3, deprel13);

       ["CoNLL-U", "CG3", "Brackets"].forEach(format => {
         expect(tok1.getHead(format)).to.equal("4");
         expect(tok1._getDeprel()).to.equal(deprel14b);
         expect(tok1._getDeps(format).join("|")).to.equal("3:dep13|4:dep14b");

         expect(tok2.getHead(format)).to.equal(null);
         expect(tok2._getDeprel()).to.equal(null);
         expect(tok2._getDeps().join("|")).to.equal("");

         expect(tok3.getHead(format)).to.equal(null);
         expect(tok3._getDeprel()).to.equal(null);
         expect(tok3._getDeps().join("|")).to.equal("");

         expect(tok4.getHead(format)).to.equal(null);
         expect(tok4._getDeprel()).to.equal(null);
         expect(tok4._getDeps().join("|")).to.equal("");
       });

       sent.unenhance();

       ["CoNLL-U", "CG3", "Brackets"].forEach(format => {
         expect(tok1.getHead(format)).to.equal("4");
         expect(tok1._getDeprel()).to.equal(deprel14b);
         expect(tok1._getDeps(format).join("|")).to.equal("");

         expect(tok2.getHead(format)).to.equal(null);
         expect(tok2._getDeprel()).to.equal(null);
         expect(tok2._getDeps().join("|")).to.equal("");

         expect(tok3.getHead(format)).to.equal(null);
         expect(tok3._getDeprel()).to.equal(null);
         expect(tok3._getDeps().join("|")).to.equal("");

         expect(tok4.getHead(format)).to.equal(null);
         expect(tok4._getDeprel()).to.equal(null);
         expect(tok4._getDeps().join("|")).to.equal("");
       });
     });
});
