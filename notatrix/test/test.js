"use strict";

const _ = require("underscore");
const expect = require("chai").expect;

const data = require("./data");
const Sentence = require("../src/sentence");
const Token = require("../src/token");
const Analysis = require("../src/analysis");
const E = require("../src/errors");

function clean(str) { return str.trim().replace(/[ \t]+/g, "\t").trim(); }
function cleanText(str) {
  return str.trim().replace(/([.,?!]+)$/, " $1").replace(/(\s)+/, " ").trim();
}
function ignoreSemicolons(str) {
  return clean(str)
      .split("\n")
      .map(line => { return line.replace(/^;/, ""); })
      .join("\n");
}
function ignoreIndices(str) {
  return clean(str.split("\t").slice(1).join("\t"));
}
function ignoreAfterLemma(str) {
  return str.split("\n")
      .map(line => { return line.split("\t").slice(0, 3).join(" "); })
      .join(" ");
}
function countHeads(ana) {
  let acc = 0;
  ana.mapHeads(() => { acc++; });
  return acc;
}
function countDeps(ana) {
  let acc = 0;
  ana.mapDeps(() => { acc++; });
  return acc;
}
function forms(token) {
  return token.analyses.map(ana => { return ana.form; }).join(" ");
}
function currentForms(sentence) {
  return sentence.tokens.map(tok => { return tok.analysis.form; }).join(" ");
}

const fallback = "_";

describe("Analysis", () => {
  describe("invalid intializer", () => {
    it(`throw a NotatrixError`, () => {
      expect(() => { let a = new Analysis(); }).to.throw(E.NotatrixError);
    });
  });

  const s = new Sentence();
  const data = [
    {inParams: undefined, outParams: {}, text: fallback},
    {inParams: null, outParams: {}, text: fallback},
    {inParams: {form: "string"}, outParams: {form: "string"}, text: "string"},
    {inParams: {ignore: "string"}, outParams: {}, text: fallback}
  ];

  _.each(data, d => {
    describe(`valid intializer`, () => {
      it(`initialize correctly`, () => {
        let t = new Token(s);
        t.params = d.inParams;
        let a = t.analysis;

        expect(a).to.be.an.instanceof(Analysis);
        expect(a.token).to.equal(t);
        expect(a.sentence).to.equal(s);
        expect(a.params).to.deep.equal(d.outParams);
        expect(a.id).to.equal(null);
        expect(a.superToken).to.equal(null);
        expect(a.subTokens).to.deep.equal([]);
        expect(a.length).to.equal(0);
        expect(a[0]).to.equal(null);
        expect(a[-1]).to.equal(null);
        expect(a[100]).to.equal(null);
        expect(a[Infinity]).to.equal(null);
        expect(a[-Infinity]).to.equal(null);
        expect(a.getSubToken(0)).to.equal(null);

        expect(a.isSuperToken).to.equal(false);
        expect(a.isSubToken).to.equal(false);
        expect(a.isCurrent).to.equal(true);

        expect(a._heads).to.deep.equal([]);
        expect(a._deps).to.deep.equal([]);
        expect(countDeps(a)).to.equal(0);
      });

      it(`return formats correctly`, () => {
        let t = new Token(s);
        t.params = d.inParams;
        let a = t.analysis;

        expect(() => { return a.conllu; })
            .to.throw(E.NotatrixError); // not indexed yet
        a.cg3;

        // even after indexing (Token not attached to Sentence yet)
        t.sentence.index();
        expect(() => { return a.conllu; }).to.throw(E.NotatrixError);
        a.cg3;
      });
    });
  });

  describe("modify contents", () => {
    it(`handles (insert|remove|move)SubTokenAt() and (push|pop)SubToken`, () => {
      let s = new Sentence();

      let t0 = new Token(s);
      let t1 = new Token(s);
      let t2 = new Token(s);
      let t3 = new Token(s);
      let t4 = new Token(s);

      let a0 = new Analysis(t0, {form: "zeroth"});
      let a1 = new Analysis(t1, {form: "first"});
      let a2 = new Analysis(t2, {form: "second"});
      let a3 = new Analysis(t3, {form: "third"});
      let a4 = new Analysis(t4, {form: "fourth"});

      t0.analysis = a0;
      t1.analysis = a1;
      t2.analysis = a2;
      t3.analysis = a3;
      t4.analysis = a4;

      expect(t0.text).to.equal("zeroth");
      expect(t1.text).to.equal("first");
      expect(t2.text).to.equal("second");
      expect(t3.text).to.equal("third");
      expect(t4.text).to.equal("fourth");

      expect(a0[0]).to.equal(null);
      expect(a1[0]).to.equal(null);
      expect(a2[0]).to.equal(null);
      expect(a3[0]).to.equal(null);
      expect(a4[0]).to.equal(null);

      expect(() => { a0.insertSubTokenAt(); }).to.throw(E.NotatrixError);
      expect(() => { a0.insertSubTokenAt({}); }).to.throw(E.NotatrixError);
      expect(() => { a0.insertSubTokenAt(null); }).to.throw(E.NotatrixError);
      expect(() => { a0.insertSubTokenAt(undefined); })
          .to.throw(E.NotatrixError);
      expect(() => { a0.insertSubTokenAt("x"); }).to.throw(E.NotatrixError);
      expect(() => { a0.insertSubTokenAt(0); }).to.throw(E.NotatrixError);
      expect(() => { a0.insertSubTokenAt(0, {}); }).to.throw(E.NotatrixError);
      expect(() => { a0.insertSubTokenAt(0, null); }).to.throw(E.NotatrixError);
      expect(() => { a0.insertSubTokenAt(0, undefined); })
          .to.throw(E.NotatrixError);
      expect(() => { a0.insertSubTokenAt(0, a1); }).to.throw(E.NotatrixError);

      s.insertTokenAt(0, t0);

      a0.insertSubTokenAt(0, t1);

      expect(a0.subTokens).to.deep.equal([t1]);
      expect(a0[0]).to.deep.equal(a1);
      expect(a0[1]).to.equal(null);
      expect(a0.isSuperToken).to.equal(true);
      expect(a0.isSubToken).to.equal(false);

      expect(t0.subTokens).to.deep.equal([t1]);
      expect(t0.isSuperToken).to.equal(true);
      expect(t0.isSubToken).to.equal(false);

      expect(a1.superToken).to.deep.equal(a0);
      expect(a1.isSuperToken).to.equal(false);
      expect(a1.isSubToken).to.equal(true);

      expect(t1.superToken).to.deep.equal(a0);
      expect(t1.isSuperToken).to.equal(false);
      expect(t1.isSubToken).to.equal(true);

      expect(ignoreAfterLemma(s.conllu)).to.equal("1-1 zeroth _ 1 first first")

      a0.insertSubTokenAt(-1, t2);

      expect(a0.subTokens).to.deep.equal([t2, t1]);
      expect(a0[0]).to.deep.equal(a2);
      expect(a0[1]).to.equal(a1);
      expect(a0[2]).to.equal(null);
      expect(a0.isSuperToken).to.equal(true);
      expect(a0.isSubToken).to.equal(false);

      expect(t0.subTokens).to.deep.equal([t2, t1]);
      expect(t0.isSuperToken).to.equal(true);
      expect(t0.isSubToken).to.equal(false);

      expect(a2.superToken).to.deep.equal(a0);
      expect(a2.isSuperToken).to.equal(false);
      expect(a2.isSubToken).to.equal(true);

      expect(t2.superToken).to.deep.equal(a0);
      expect(t2.isSuperToken).to.equal(false);
      expect(t2.isSubToken).to.equal(true);

      expect(ignoreAfterLemma(s.conllu))
          .to.equal("1-2 zeroth _ 1 second second 2 first first")

      expect(() => { a3.insertSubTokenAt(0, t0); }).to.throw(E.NotatrixError);
      expect(() => { a3.insertSubTokenAt(0, t1); }).to.throw(E.NotatrixError);

      a0.insertSubTokenAt(1, t3);

      expect(a0.subTokens).to.deep.equal([t2, t3, t1]);
      expect(a0[0]).to.deep.equal(a2);
      expect(a0[1]).to.equal(a3);
      expect(a0[2]).to.equal(a1);
      expect(a0[3]).to.equal(null);
      expect(a0.isSuperToken).to.equal(true);
      expect(a0.isSubToken).to.equal(false);

      expect(t0.subTokens).to.deep.equal([t2, t3, t1]);
      expect(t0.isSuperToken).to.equal(true);
      expect(t0.isSubToken).to.equal(false);

      expect(a3.superToken).to.deep.equal(a0);
      expect(a3.isSuperToken).to.equal(false);
      expect(a3.isSubToken).to.equal(true);

      expect(t3.superToken).to.deep.equal(a0);
      expect(t3.isSuperToken).to.equal(false);
      expect(t3.isSubToken).to.equal(true);

      expect(ignoreAfterLemma(s.conllu))
          .to.equal("1-3 zeroth _ 1 second second 2 third third 3 first first");

      a0.insertSubTokenAt(Infinity, t4);

      expect(a0.subTokens).to.deep.equal([t2, t3, t1, t4]);
      expect(ignoreAfterLemma(s.conllu))
          .to.equal(
              "1-4 zeroth _ 1 second second 2 third third 3 first first 4 fourth fourth");

      a0.removeSubTokenAt(1);

      expect(a0.subTokens).to.deep.equal([t2, t1, t4]);
      expect(a3.superToken).to.equal(null);
      expect(a3.isSubToken).to.equal(false);
      expect(t3.isSubToken).to.equal(false);
      expect(ignoreAfterLemma(s.conllu))
          .to.equal(
              "1-3 zeroth _ 1 second second 2 first first 3 fourth fourth");

      a0.removeSubTokenAt(2);

      expect(a0.subTokens).to.deep.equal([t2, t1]);
      expect(a4.superToken).to.equal(null);
      expect(a4.isSubToken).to.equal(false);
      expect(t4.isSubToken).to.equal(false);
      expect(ignoreAfterLemma(s.conllu))
          .to.equal("1-2 zeroth _ 1 second second 2 first first");

      a0.removeSubTokenAt(-5);

      expect(a0.subTokens).to.deep.equal([t1]);
      expect(a2.superToken).to.equal(null);
      expect(a2.isSubToken).to.equal(false);
      expect(t2.isSubToken).to.equal(false);
      expect(ignoreAfterLemma(s.conllu)).to.equal("1-1 zeroth _ 1 first first");

      a0.removeSubTokenAt(Infinity);

      expect(a0.subTokens).to.deep.equal([]);
      expect(a0.isSuperToken).to.equal(false);
      expect(a1.superToken).to.equal(null);
      expect(a1.isSubToken).to.equal(false);
      expect(t1.isSubToken).to.equal(false);
      expect(ignoreAfterLemma(s.conllu)).to.equal("1 zeroth zeroth");

      let ret =
          a0.pushSubToken(t1).pushSubToken(t2).pushSubToken(t3).popSubToken();
      a0.pushSubToken(t4);

      expect(a0.subTokens).to.deep.equal([t1, t2, t4]);
      expect(ret).to.deep.equal(t3);

      a0.moveSubTokenAt(0, 2);
      expect(a0.subTokens).to.deep.equal([t2, t4, t1]);

      a0.moveSubTokenAt(1, 0);
      expect(a0.subTokens).to.deep.equal([t4, t2, t1]);

      a0.moveSubTokenAt(Infinity, -Infinity);
      expect(a0.subTokens).to.deep.equal([t1, t4, t2]);
    });
  });
});

describe("Token", () => {
  describe("invalid intializer", () => {
    it(`throw a NotatrixError`, () => {
      expect(() => { let t = new Token(); }).to.throw(E.NotatrixError);
    });
  });

  const s = new Sentence();
  const data = [{}];

  _.each(data, d => {
    describe(`valid initializer`, () => {
      it(`initialize correctly`, () => {
        let t = new Token(s);

        expect(t.sentence).to.equal(s);
        expect(t.current).to.equal(null);
        expect(t.analyses).to.deep.equal([]);
        expect(t.analysis).to.equal(null);
        expect(t.length).to.equal(0);
        expect(t.subTokens).to.equal(null);

        expect(t.isSubToken).to.equal(false);
        expect(t.isSuperToken).to.equal(null);
        expect(t.isEmpty).to.equal(false);
        expect(t.isAmbiguous).to.equal(false);
      });

      it(`return formats correctly`, () => {
        let t = new Token(s);

        expect(() => { return t.text; }).to.throw(E.NotatrixError);
        expect(() => { return t.conllu; }).to.throw(E.NotatrixError);
        expect(() => { return t.cg3; }).to.throw(E.NotatrixError);
        expect(() => { return t.params; }).to.throw(E.NotatrixError);

        // even after "indexing" (b/c the token hasn't actually been
        // added to the Sentence yet)
        t.sentence.index();
        expect(() => { return t.text; }).to.throw(E.NotatrixError);
        expect(() => { return t.conllu; }).to.throw(E.NotatrixError);
        expect(() => { return t.cg3; }).to.throw(E.NotatrixError);
        expect(() => { return t.params; }).to.throw(E.NotatrixError);
      })
    });

    describe(`valid after initializing first Analysis`, () => {
      it(`initialize directly with params`, () => {
        let t = new Token(s, {form: "testing"});

        expect(t.current).to.equal(0);
        expect(forms(t)).to.equal("testing");
        expect(t.analysis).to.be.an.instanceof(Analysis);
        expect(t.analysis.form).to.equal("testing");
        expect(t.length).to.equal(1);
        expect(t.subTokens).to.deep.equal([]);

        expect(t.isSubToken).to.equal(false);
        expect(t.isSuperToken).to.equal(false);
        expect(t.isEmpty).to.equal(false);
        expect(t.isAmbiguous).to.equal(false);
      });

      it(`initialize with = operator`, () => {
        let t = new Token(s);
        t.params = {
          form: "testing"
        }; // can only set t.analysis (i.e. current) this way

        expect(t.current).to.equal(0);
        expect(forms(t)).to.equal("testing");
        expect(t.analysis).to.be.an.instanceof(Analysis);
        expect(t.analysis.form).to.equal("testing");
        expect(t.length).to.equal(1);
        expect(t.subTokens).to.deep.equal([]);

        expect(t.isSubToken).to.equal(false);
        expect(t.isSuperToken).to.equal(false);
        expect(t.isEmpty).to.equal(false);
        expect(t.isAmbiguous).to.equal(false);
      });

      it(`initialize with Token.insertAnalysisAt() method`, () => {
        let t = new Token(s);
        t.insertAnalysisAt(0,
                           new Analysis(t, {form: "testing"})); // more flexible

        expect(t.current).to.equal(0);
        expect(forms(t)).to.equal("testing");
        expect(t.analysis).to.be.an.instanceof(Analysis);
        expect(t.analysis.form).to.equal("testing");
        expect(t.length).to.equal(1);
        expect(t.subTokens).to.deep.equal([]);

        expect(t.isSubToken).to.equal(false);
        expect(t.isSuperToken).to.equal(false);
        expect(t.isAmbiguous).to.equal(false);
      });

      it(`has equivalent initializers`, () => {
        let params = {form: "testing"};

        let tokens = [
          new Token(s, params), new Token(s), new Token(s),
          Token.fromParams(s, params), Token.fromConllu(s, "1\ttesting"),
          // Token.fromCG3(s, /* ??? */)
        ];

        tokens[1].params = params;
        tokens[2].pushAnalysis(new Analysis(tokens[2], params));

        _.each(tokens, token => { expect(token).to.deep.equal(tokens[0]); });
      });

      it(`return formats correctly`, () => {
        let t = new Token(s);
        t.params = {form: "testing"};

        expect(t.text).to.equal("testing");
        expect(() => {t.conllu}).to.throw(E.NotatrixError); // not indexed yet
        // expect(() => { t.cg3 }).to.throw(E.NotatrixError); // not
        // indexed yet
        expect(t.params).to.deep.equal({form: "testing"});

        t.sentence.index();
        expect(() => { return t.conllu; })
            .to.throw(E.NotatrixError); // not attached to sentence
        // expect(() => { return t.cg3; }).to.throw(E.NotatrixError);

        s.pushToken(t);
        expect(ignoreAfterLemma(t.conllu)).to.equal("1 testing testing");
      });
    });
  });

  describe(`modify contents`, () => {
    it(`handles (insert|remove|move)AnalysisAt() and (push|pop)Analysis`,
       () => {
         let s = new Sentence();
         let t = new Token(s);
         t.params = {form: "zeroth"};

         let a1 = new Analysis(t, {form: "first"});
         let a2 = new Analysis(t, {form: "second"});
         let a3 = new Analysis(t, {form: "third"});
         let a4 = new Analysis(t, {form: "fourth"});
         let a5 = null;

         expect(forms(t)).to.equal("zeroth");

         t.insertAnalysisAt(0, a1);
         expect(forms(t)).to.equal("first zeroth");

         t.insertAnalysisAt(1, a2);
         expect(forms(t)).to.equal("first second zeroth");

         t.insertAnalysisAt(-1, a3);
         expect(forms(t)).to.equal("third first second zeroth");

         t.insertAnalysisAt(Infinity, a4);
         expect(forms(t)).to.equal("third first second zeroth fourth");

         t.removeAnalysisAt(0);
         expect(forms(t)).to.equal("first second zeroth fourth");

         t.removeAnalysisAt(1);
         expect(forms(t)).to.equal("first zeroth fourth");

         t.removeAnalysisAt(-1);
         expect(forms(t)).to.equal("zeroth fourth");

         t.removeAnalysisAt(Infinity);
         expect(forms(t)).to.equal("zeroth");
         expect(t.current).to.equal(0);
         expect(t.analysis.form).to.equal("zeroth");

         t.removeAnalysisAt(Infinity);
         expect(forms(t)).to.equal("");
         expect(t.current).to.equal(null);
         expect(t.analysis).to.equal(null);

         t.removeAnalysisAt(0);
         expect(forms(t)).to.equal("");

         t.removeAnalysisAt(-3);
         expect(forms(t)).to.equal("");

         t.insertAnalysisAt(6, a1);
         expect(forms(t)).to.equal("first");
         expect(t.current).to.equal(0);
         expect(t.analysis.form).to.equal("first");

         t.insertAnalysisAt(6, a2);
         expect(forms(t)).to.equal("first second");

         t.insertAnalysisAt(6, a3).insertAnalysisAt(6, a4);
         expect(forms(t)).to.equal("first second third fourth");

         t.moveAnalysisAt(0, 1);
         expect(forms(t)).to.equal("second first third fourth");

         t.moveAnalysisAt(0, 10);
         expect(forms(t)).to.equal("first third fourth second");

         t.moveAnalysisAt(-2, 2);
         expect(forms(t)).to.equal("third fourth first second");

         t.moveAnalysisAt(Infinity, Infinity);
         expect(forms(t)).to.equal("third fourth first second");

         let ret = t.popAnalysis();
         expect(forms(t)).to.equal("third fourth first");
         expect(ret.form).to.equal("second");

         t.pushAnalysis(a2).pushAnalysis(a2).pushAnalysis(a2).pushAnalysis(a2);
         expect(forms(t)).to.equal(
             "third fourth first second second second second");

         expect(() => { t.insertAnalysisAt(0, a5); }).to.throw(E.NotatrixError);
       });

    it(`has consistent get, set, prev, next`, () => {
      let s = new Sentence();
      let t = new Token(s);

      expect(forms(t)).to.equal("");

      t.insertAnalysisAt(0, new Analysis(t, {form: "first"}));
      t.insertAnalysisAt(1, new Analysis(t, {form: "second"}));
      t.insertAnalysisAt(2, new Analysis(t, {form: "third"}));
      t.insertAnalysisAt(3, new Analysis(t, {form: "fourth"}));
      expect(forms(t)).to.equal("first second third fourth");

      expect(t.analysis.form).to.equal("first");
      t.next();
      expect(t.analysis.form).to.equal("second");
      t.next();
      expect(t.analysis.form).to.equal("third");
      t.next();
      expect(t.analysis.form).to.equal("fourth");
      t.next();
      expect(t.analysis.form).to.equal("fourth");
      t.prev();
      expect(t.analysis.form).to.equal("third");
      t.prev();
      expect(t.analysis.form).to.equal("second");
      t.prev();
      expect(t.analysis.form).to.equal("first");
      t.prev();
      expect(t.analysis.form).to.equal("first");
      t.current = 0;
      expect(t.analysis.form).to.equal("first");
      t.current = 2;
      expect(t.analysis.form).to.equal("third");
      t.current = Infinity;
      expect(t.analysis.form).to.equal("third");
      t.current = -Infinity
      expect(t.analysis.form).to.equal("third");
    });
  });
});

describe("Sentence", () => {
  describe("valid initializer", () => {
    it(`initialize correctly`, () => {
      let s = new Sentence();

      expect(s.comments).to.deep.equal([]);
      // expect(s.conlluLoaded).to.equal(false);
      // expect(s.cg3Loaded).to.equal(false);
      expect(s.tokens).to.deep.equal([]);
      expect(s.length).to.equal(0);

      expect(s.isValidConllu).to.equal(true);
      expect(s.isValidCG3).to.equal(true);
    });

    it(`well-defined getter behavior`, () => {
      let s = new Sentence();

      expect(s.getComment(0)).to.equal(null);
      expect(s.getToken(0)).to.equal(null);
      expect(s[0]).to.equal(null); // analysis
      expect(s.getById(0)).to.equal(null);
    });

    it(`return formats correctly`, () => {
      let s = new Sentence();

      expect(s.text).to.equal("");
      expect(s.conllu).to.equal("");
      // expect(s.cg3).to.equal('');
      expect(s.params).to.deep.equal([]);
    });
  });

  describe(`valid after initializing first Analysis`, () => {
    let params = [{form: "hello"}, {form: "world"}];

    it(`initialize directly with params`, () => {
      let s = new Sentence(params);

      expect(s.comments).to.deep.equal([]);
      // expect(s.conlluLoaded).to.equal(false);
      // expect(s.cg3Loaded).to.equal(false);
      expect(currentForms(s)).to.equal("hello world");
      expect(s.length).to.equal(2);

      expect(s.isValidConllu).to.equal(true);
      expect(s.isValidCG3).to.equal(true);
    });

    it(`initialize with = operator`, () => {
      let s = new Sentence();
      s.tokens = [new Token(s, params[0]), new Token(s, params[1])];

      expect(s.comments).to.deep.equal([]);
      // expect(s.conlluLoaded).to.equal(false);
      // expect(s.cg3Loaded).to.equal(false);
      expect(currentForms(s)).to.equal("hello world");
      expect(s.length).to.equal(2);

      expect(s.isValidConllu).to.equal(true);
      expect(s.isValidCG3).to.equal(true);
    });

    it(`initialize with Sentence.insertTokenAt method`, () => {
      let s = new Sentence();
      s.pushToken(new Token(s, params[0])).pushToken(new Token(s, params[1]));

      expect(s.comments).to.deep.equal([]);
      // expect(s.conlluLoaded).to.equal(false);
      // expect(s.cg3Loaded).to.equal(false);
      expect(currentForms(s)).to.equal("hello world");
      expect(s.length).to.equal(2);

      expect(s.isValidConllu).to.equal(true);
      expect(s.isValidCG3).to.equal(true);
    });

    it(`has equivalent initializers`, () => {
      let sents = [
        new Sentence(params), new Sentence(), new Sentence(), new Sentence(),
        Sentence.fromConllu("1\thello\n2\tworld"),
        // Sentence.fromCG3([/* ??? */]),
        Sentence.fromParams(params)
      ];
      sents[1].tokens =
          [new Token(sents[1], params[0]), new Token(sents[1], params[1])];
      sents[2]
          .pushToken(new Token(sents[2], params[0]))
          .pushToken(new Token(sents[2], params[1]));
      sents[3].params = params;

      _.each(sents, (s, i) => {
        s.index();
        expect(s).to.deep.equal(sents[0]);
      });
    });

    it(`return formats correctly`, () => {
      let s = new Sentence(params);

      expect(s.text).to.equal("hello world");
      expect(ignoreAfterLemma(s.conllu))
          .to.equal("1 hello hello 2 world world");
      // expect(s.cg3).to.equal()
      expect(s.params).to.deep.equal(params);
    });
  });

  describe("parsers", () => {
    it(`parse list of params`, () => {
      let s = new Sentence();
      let params = [{form: "hello"}, {form: "world"}];
      s.params = params;
      expect(s.params).to.deep.equal(params);
      expect(s.isValidConllu).to.equal(true);
      expect(s.isValidCG3).to.equal(true);
    });

    _.each(data["CoNLL-U"], (conllu, name) => {
      it(`parse CoNLL-U:${name}`, () => {
        let s = new Sentence({help: {head: false, deps: false}});

        s.conllu = conllu;
        expect(clean(s.conllu)).to.equal(clean(conllu));
        expect(s.isValidConllu).to.equal(true);
      });
    });

    _.each(
        data.CG3,
        (cg3, name) => {it(`parse CG3:${name}`, () => {
          let s = new Sentence(
              {help: {head: false, deps: false}, showEmptyDependencies: false});

          s.cg3 = cg3;
          expect(clean(s.cg3)).to.equal(ignoreSemicolons(cg3));
        })});

    _.each(data["Plain text"], (text, name) => {
      it(`parse Plain text:${name}`, () => {
        let s = new Sentence({help: {head: false, deps: false}});

        s.text = text;
        expect(s.text).to.equal(cleanText(text));
      });
    });
    it(`parse nx`, () => {

                   });
  });
  return;

  describe(`token array manipulators`, () => {
    it(`handles (insert|remove|move)TokenAt()`, () => {
      let s = new Sentence();

      let t0 = new Token(s, {form: "zeroth"});
      let t1 = new Token(s, {form: "first"});
      let t2 = new Token(s, {form: "second"});
      let t3 = new Token(s, {form: "third"});
      let t4 = new Token(s, {form: "fourth"});
      let t5 = new Token(s, {form: "fifth"});
      let t6 = new Token(s, {form: "sixth"});

      expect(t5.text).to.equal("fifth");
      expect(t6.text).to.equal("sixth");

      expect(() => { s.insertTokenAt(); }).to.throw(E.NotatrixError);
      expect(() => { s.insertTokenAt({}); }).to.throw(E.NotatrixError);
      expect(() => { s.insertTokenAt(null); }).to.throw(E.NotatrixError);
      expect(() => { s.insertTokenAt(undefined); }).to.throw(E.NotatrixError);
      expect(() => { s.insertTokenAt("x"); }).to.throw(E.NotatrixError);
      expect(() => { s.insertTokenAt(0); }).to.throw(E.NotatrixError);
      expect(() => { s.insertTokenAt(0, {}); }).to.throw(E.NotatrixError);
      expect(() => { s.insertTokenAt(0, null); }).to.throw(E.NotatrixError);
      expect(() => { s.insertTokenAt(0, undefined); })
          .to.throw(E.NotatrixError);
      expect(() => { s.insertTokenAt(0, t0.analysis); })
          .to.throw(E.NotatrixError);

      expect(currentForms(s)).to.equal("");
      expect(s[-1]).to.equal(null);
      expect(s[0]).to.equal(null);
      expect(s[1]).to.equal(null);

      s.insertTokenAt(0, t0);
      expect(currentForms(s)).to.equal("zeroth");

      s.insertTokenAt(-1, t1);
      expect(currentForms(s)).to.equal("first zeroth");

      s.insertTokenAt(1, t2);
      expect(currentForms(s)).to.equal("first second zeroth");

      s.insertTokenAt(Infinity, t3);
      expect(currentForms(s)).to.equal("first second zeroth third");

      s.moveTokenAt(-1, 2);
      expect(currentForms(s)).to.equal("second zeroth first third");

      s.moveTokenAt(Infinity, 1);
      expect(currentForms(s)).to.equal("second third zeroth first");

      s.removeTokenAt(3);
      expect(currentForms(s)).to.equal("second third zeroth");

      s.removeTokenAt(-1);
      expect(currentForms(s)).to.equal("third zeroth");

      s.pushToken(t4).pushToken(t5).popToken();
      expect(currentForms(s)).to.equal("third zeroth fourth");
    });

    it(`integrate token and subToken manipulation`, () => {
      let s = new Sentence();

      s.comments = ["this is the test sentence"];
      s.pushToken(new Token(s, {form: "zeroth", misc: "super"}));
      s.pushToken(new Token(s, {form: "first", misc: "super"}));
      s.pushToken(new Token(s, {form: "second", misc: "super"}));

      s[0].pushSubToken(new Token(s, {form: "third", misc: "sub"}));
      s[0].pushSubToken(new Token(s, {form: "fourth", misc: "sub"}));
      s[2].pushSubToken(new Token(s, {form: "fifth", misc: "sub"}));
      s[2].pushSubToken(new Token(s, {form: "sixth", misc: "sub"}));

      expect(s.conllu).to.equal(`# this is the test sentence
1-2	zeroth	zeroth	_	_	_	_	_	_	super
1	third	third	_	_	_	_	_	_	sub
2	fourth	fourth	_	_	_	_	_	_	sub
3	first	first	_	_	_	_	_	_	super
4-5	second	second	_	_	_	_	_	_	super
4	fifth	fifth	_	_	_	_	_	_	sub
5	sixth	sixth	_	_	_	_	_	_	sub`);

      s[0].addHead(s[2][0], "one");
      s[2][0].addHead(s[1], "two");

      expect(s.conllu).to.equal(`# this is the test sentence
1-2	zeroth	zeroth	_	_	_	4:one	_	_	super
1	third	third	_	_	_	_	_	_	sub
2	fourth	fourth	_	_	_	_	_	_	sub
3	first	first	_	_	_	_	_	4:two	super
4-5	second	second	_	_	_	_	_	_	super
4	fifth	fifth	_	_	_	3:two	_	1-2:one	sub
5	sixth	sixth	_	_	_	_	_	_	sub`);

      s[2].removeSubTokenAt(0);

      expect(s.conllu).to.equal(`# this is the test sentence
1-2	zeroth	zeroth	_	_	_	_	_	_	super
1	third	third	_	_	_	_	_	_	sub
2	fourth	fourth	_	_	_	_	_	_	sub
3	first	first	_	_	_	_	_	_	super
4-4	second	second	_	_	_	_	_	_	super
4	sixth	sixth	_	_	_	_	_	_	sub`);
    });

    it(`integrate subTokens with empty tokens`, () => {
      let s = new Sentence();
      s.comments = ["this is the #-# and #.# integration test"];

      s.pushToken(new Token(s, {form: "zeroth", misc: "super"}));
      s.pushToken(Token.fromConllu(s, `3.1 first first _ _ _ _ _ _ empty`));
      s[0].pushSubToken(new Token(s, {form: "second", misc: "sub"}));
      s[0].pushSubToken(new Token(s, {form: "third", misc: "sub"}));

      expect(s.getToken(3).isEmpty).to.equal(true);
      expect(s.text).to.equal("second third");
      expect(s.conllu).to.equal(`# this is the #-# and #.# integration test
1-2	zeroth	zeroth	_	_	_	_	_	_	super
1	second	second	_	_	_	_	_	_	sub
2	third	third	_	_	_	_	_	_	sub
2.1	first	first	_	_	_	_	_	_	empty`);

      let tmp = s[0].popSubToken();
      s[1].pushSubToken(tmp);

      expect(s[1].token.isEmpty).to.equal(true);
      expect(s[1][0].token.isEmpty).to.equal(true);
      expect(s.text).to.equal("second");
      expect(s.conllu).to.equal(`# this is the #-# and #.# integration test
1-1	zeroth	zeroth	_	_	_	_	_	_	super
1	second	second	_	_	_	_	_	_	sub
1.1-1.1	first	first	_	_	_	_	_	_	empty
1.1	third	third	_	_	_	_	_	_	sub`);
    });
  });

  describe("serializer", () => {
    _.each(data["CoNLL-U"], (text, name) => {
      it(`${name}: serialize to Notatrix and back`, () => {
        let s = new Sentence({help: {head: false, deps: false}});
        s.conllu = text;

        expect(clean(s.conllu)).to.equal(clean(text));
      });
    });
  });
});

describe(`modify heads & deps`, () => {
  it(`modify heads`, () => {
    let s = new Sentence();
    s.params = [{form: "first"}, {form: "second"}, {form: "third"}];

    let a0 = s[0];
    let a1 = s[1];
    let a2 = s[2];
    let a3 = s[3];

    expect(a0).to.be.an.instanceof(Analysis)
    expect(a1).to.be.an.instanceof(Analysis);
    expect(a2).to.be.an.instanceof(Analysis);
    expect(a3).to.equal(null);

    a0.removeHead(a1);

    expect(a0.head).to.equal(null);
    expect(countHeads(a0)).to.equal(0);
    expect(a0.deps).to.equal(null);
    expect(countDeps(a0)).to.equal(0);

    expect(a1.head).to.equal(null);
    expect(countHeads(a1)).to.equal(0);
    expect(a1.deps).to.equal(null);
    expect(countDeps(a1)).to.equal(0);

    expect(a2.head).to.equal(null);
    expect(countHeads(a2)).to.equal(0);
    expect(a2.deps).to.equal(null);
    expect(countDeps(a2)).to.equal(0);

    a0.addHead(a1);

    expect(a0.head).to.equal("2");
    expect(countHeads(a0)).to.equal(1);
    expect(a0.deps).to.equal(null);
    expect(countDeps(a0)).to.equal(0);

    expect(a1.head).to.equal(null);
    expect(countHeads(a1)).to.equal(0);
    expect(a1.deps).to.equal("1");
    expect(countDeps(a1)).to.equal(1);

    expect(a2.head).to.equal(null);
    expect(countHeads(a2)).to.equal(0);
    expect(a2.deps).to.equal(null);
    expect(countDeps(a2)).to.equal(0);

    a0.removeHead(a0);

    expect(a0.head).to.equal("2");
    expect(countHeads(a0)).to.equal(1);
    expect(a0.deps).to.equal(null);
    expect(countDeps(a0)).to.equal(0);

    expect(a1.head).to.equal(null);
    expect(countHeads(a1)).to.equal(0);
    expect(a1.deps).to.equal("1");
    expect(countDeps(a1)).to.equal(1);

    expect(a2.head).to.equal(null);
    expect(countHeads(a2)).to.equal(0);
    expect(a2.deps).to.equal(null);
    expect(countDeps(a2)).to.equal(0);

    a0.removeHead(a1);

    expect(a0.head).to.equal(null);
    expect(countHeads(a0)).to.equal(0);
    expect(a0.deps).to.equal(null);
    expect(countDeps(a0)).to.equal(0);

    expect(a1.head).to.equal(null);
    expect(countHeads(a1)).to.equal(0);
    expect(a1.deps).to.equal(null);
    expect(countDeps(a1)).to.equal(0);

    expect(a2.head).to.equal(null);
    expect(countHeads(a2)).to.equal(0);
    expect(a2.deps).to.equal(null);
    expect(countDeps(a2)).to.equal(0);

    a0.addHead(a1, "test-dependent");

    expect(a0.head).to.equal("2:test-dependent");
    expect(countHeads(a0)).to.equal(1);
    expect(a0.deps).to.equal(null);
    expect(countDeps(a0)).to.equal(0);

    expect(a1.head).to.equal(null);
    expect(countHeads(a1)).to.equal(0);
    expect(a1.deps).to.equal("1:test-dependent");
    expect(countDeps(a1)).to.equal(1);

    expect(a2.head).to.equal(null);
    expect(countHeads(a2)).to.equal(0);
    expect(a2.deps).to.equal(null);
    expect(countDeps(a2)).to.equal(0);

    a0.addHead(a1, "test-dependent-2"); // overwrite, don't add

    expect(a0.head).to.equal("2:test-dependent-2");
    expect(countHeads(a0)).to.equal(1);
    expect(a0.deps).to.equal(null);
    expect(countDeps(a0)).to.equal(0);

    expect(a1.head).to.equal(null);
    expect(countHeads(a1)).to.equal(0);
    expect(a1.deps).to.equal("1:test-dependent-2");
    expect(countDeps(a1)).to.equal(1);

    expect(a2.head).to.equal(null);
    expect(countHeads(a2)).to.equal(0);
    expect(a2.deps).to.equal(null);
    expect(countDeps(a2)).to.equal(0);

    a0.addHead(a1); // don't overwrite if less data than before

    expect(a0.head).to.equal("2:test-dependent-2");
    expect(countHeads(a0)).to.equal(1);
    expect(a0.deps).to.equal(null);
    expect(countDeps(a0)).to.equal(0);

    expect(a1.head).to.equal(null);
    expect(countHeads(a1)).to.equal(0);
    expect(a1.deps).to.equal("1:test-dependent-2");
    expect(countDeps(a1)).to.equal(1);

    expect(a2.head).to.equal(null);
    expect(countHeads(a2)).to.equal(0);
    expect(a2.deps).to.equal(null);
    expect(countDeps(a2)).to.equal(0);

    a0.changeHead(a2);

    expect(a0.head).to.equal("2:test-dependent-2");
    expect(countHeads(a0)).to.equal(1);
    expect(a0.deps).to.equal(null);
    expect(countDeps(a0)).to.equal(0);

    expect(a1.head).to.equal(null);
    expect(countHeads(a1)).to.equal(0);
    expect(a1.deps).to.equal("1:test-dependent-2");
    expect(countDeps(a1)).to.equal(1);

    expect(a2.head).to.equal(null);
    expect(countHeads(a2)).to.equal(0);
    expect(a2.deps).to.equal(null);
    expect(countDeps(a2)).to.equal(0);

    a0.addHead(a2, "test-dependent-3");

    expect(a0.head).to.equal("2:test-dependent-2|3:test-dependent-3");
    expect(countHeads(a0)).to.equal(2);
    expect(a0.deps).to.equal(null);
    expect(countDeps(a0)).to.equal(0);

    expect(a1.head).to.equal(null);
    expect(countHeads(a1)).to.equal(0);
    expect(a1.deps).to.equal("1:test-dependent-2");
    expect(countDeps(a1)).to.equal(1);

    expect(a2.head).to.equal(null);
    expect(countHeads(a2)).to.equal(0);
    expect(a2.deps).to.equal("1:test-dependent-3");
    expect(countDeps(a2)).to.equal(1);

    a0.changeHead(a2, "test-dependent-4");

    expect(a0.head).to.equal("2:test-dependent-2|3:test-dependent-4");
    expect(countHeads(a0)).to.equal(2);
    expect(a0.deps).to.equal(null);
    expect(countDeps(a0)).to.equal(0);

    expect(a1.head).to.equal(null);
    expect(countHeads(a1)).to.equal(0);
    expect(a1.deps).to.equal("1:test-dependent-2");
    expect(countDeps(a1)).to.equal(1);

    expect(a2.head).to.equal(null);
    expect(countHeads(a2)).to.equal(0);
    expect(a2.deps).to.equal("1:test-dependent-4");
    expect(countDeps(a2)).to.equal(1);

    a0.changeHead(a2);

    expect(a0.head).to.equal("2:test-dependent-2|3:test-dependent-4");
    expect(countHeads(a0)).to.equal(2);
    expect(a0.deps).to.equal(null);
    expect(countDeps(a0)).to.equal(0);

    expect(a1.head).to.equal(null);
    expect(countHeads(a1)).to.equal(0);
    expect(a1.deps).to.equal("1:test-dependent-2");
    expect(countDeps(a1)).to.equal(1);

    expect(a2.head).to.equal(null);
    expect(countHeads(a2)).to.equal(0);
    expect(a2.deps).to.equal("1:test-dependent-4");
    expect(countDeps(a2)).to.equal(1);

    a0.removeHead(a1).removeHead(a2);

    expect(a0.head).to.equal(null);
    expect(countHeads(a0)).to.equal(0);
    expect(a0.deps).to.equal(null);
    expect(countDeps(a0)).to.equal(0);

    expect(a1.head).to.equal(null);
    expect(countHeads(a1)).to.equal(0);
    expect(a1.deps).to.equal(null);
    expect(countDeps(a1)).to.equal(0);

    expect(a2.head).to.equal(null);
    expect(countHeads(a2)).to.equal(0);
    expect(a2.deps).to.equal(null);
    expect(countDeps(a2)).to.equal(0);

    expect(() => { a0.addHead(a3); }).to.throw(E.NotatrixError);
    expect(() => { a0.removeHead(a3); }).to.throw(E.NotatrixError);
    expect(() => { a0.changeHead(a3); }).to.throw(E.NotatrixError);
  });

  it(`modify deps`, () => {
    let s = new Sentence();
    s.params = [{form: "first"}, {form: "second"}, {form: "third"}];

    let a0 = s[0];
    let a1 = s[1];
    let a2 = s[2];
    let a3 = s[3];

    expect(a0).to.be.an.instanceof(Analysis)
    expect(a1).to.be.an.instanceof(Analysis);
    expect(a2).to.be.an.instanceof(Analysis);
    expect(a3).to.equal(null);

    a0.removeDep(a1);

    expect(a0.head).to.equal(null);
    expect(countHeads(a0)).to.equal(0);
    expect(a0.deps).to.equal(null);
    expect(countDeps(a0)).to.equal(0);

    expect(a1.head).to.equal(null);
    expect(countHeads(a1)).to.equal(0);
    expect(a1.deps).to.equal(null);
    expect(countDeps(a1)).to.equal(0);

    expect(a2.head).to.equal(null);
    expect(countHeads(a2)).to.equal(0);
    expect(a2.deps).to.equal(null);
    expect(countDeps(a2)).to.equal(0);

    a0.addDep(a1);

    expect(a0.head).to.equal(null);
    expect(countHeads(a0)).to.equal(0);
    expect(a0.deps).to.equal("2");
    expect(countDeps(a0)).to.equal(1);

    expect(a1.head).to.equal("1");
    expect(countHeads(a1)).to.equal(1);
    expect(a1.deps).to.equal(null);
    expect(countDeps(a1)).to.equal(0);

    expect(a2.head).to.equal(null);
    expect(countHeads(a2)).to.equal(0);
    expect(a2.deps).to.equal(null);
    expect(countDeps(a2)).to.equal(0);

    a0.removeDep(a0);

    expect(a0.head).to.equal(null);
    expect(countHeads(a0)).to.equal(0);
    expect(a0.deps).to.equal("2");
    expect(countDeps(a0)).to.equal(1);

    expect(a1.head).to.equal("1");
    expect(countHeads(a1)).to.equal(1);
    expect(a1.deps).to.equal(null);
    expect(countDeps(a1)).to.equal(0);

    expect(a2.head).to.equal(null);
    expect(countHeads(a2)).to.equal(0);
    expect(a2.deps).to.equal(null);
    expect(countDeps(a2)).to.equal(0);

    a0.removeDep(a1);

    expect(a0.head).to.equal(null);
    expect(countHeads(a0)).to.equal(0);
    expect(a0.deps).to.equal(null);
    expect(countDeps(a0)).to.equal(0);

    expect(a1.head).to.equal(null);
    expect(countHeads(a1)).to.equal(0);
    expect(a1.deps).to.equal(null);
    expect(countDeps(a1)).to.equal(0);

    expect(a2.head).to.equal(null);
    expect(countHeads(a2)).to.equal(0);
    expect(a2.deps).to.equal(null);
    expect(countDeps(a2)).to.equal(0);

    a0.addDep(a1, "test-dependent");

    expect(a0.head).to.equal(null);
    expect(countHeads(a0)).to.equal(0);
    expect(a0.deps).to.equal("2:test-dependent");
    expect(countDeps(a0)).to.equal(1);

    expect(a1.head).to.equal("1:test-dependent");
    expect(countHeads(a1)).to.equal(1);
    expect(a1.deps).to.equal(null);
    expect(countDeps(a1)).to.equal(0);

    expect(a2.head).to.equal(null);
    expect(countHeads(a2)).to.equal(0);
    expect(a2.deps).to.equal(null);
    expect(countDeps(a2)).to.equal(0);

    a0.addDep(a1, "test-dependent-2"); // overwrite, don't add

    expect(a0.head).to.equal(null);
    expect(countHeads(a0)).to.equal(0);
    expect(a0.deps).to.equal("2:test-dependent-2");
    expect(countDeps(a0)).to.equal(1);

    expect(a1.head).to.equal("1:test-dependent-2");
    expect(countHeads(a1)).to.equal(1);
    expect(a1.deps).to.equal(null);
    expect(countDeps(a1)).to.equal(0);

    expect(a2.head).to.equal(null);
    expect(countHeads(a2)).to.equal(0);
    expect(a2.deps).to.equal(null);
    expect(countDeps(a2)).to.equal(0);

    a0.addDep(a1); // don't overwrite if less data than before

    expect(a0.head).to.equal(null);
    expect(countHeads(a0)).to.equal(0);
    expect(a0.deps).to.equal("2:test-dependent-2");
    expect(countDeps(a0)).to.equal(1);

    expect(a1.head).to.equal("1:test-dependent-2");
    expect(countHeads(a1)).to.equal(1);
    expect(a1.deps).to.equal(null);
    expect(countDeps(a1)).to.equal(0);

    expect(a2.head).to.equal(null);
    expect(countHeads(a2)).to.equal(0);
    expect(a2.deps).to.equal(null);
    expect(countDeps(a2)).to.equal(0);

    a0.changeDep(a2, "test-dependent-3");

    expect(a0.head).to.equal(null);
    expect(countHeads(a0)).to.equal(0);
    expect(a0.deps).to.equal("2:test-dependent-2");
    expect(countDeps(a0)).to.equal(1);

    expect(a1.head).to.equal("1:test-dependent-2");
    expect(countHeads(a1)).to.equal(1);
    expect(a1.deps).to.equal(null);
    expect(countDeps(a1)).to.equal(0);

    expect(a2.head).to.equal(null);
    expect(countHeads(a2)).to.equal(0);
    expect(a2.deps).to.equal(null);
    expect(countDeps(a2)).to.equal(0);

    a0.addDep(a2, "test-dependent-3");

    expect(a0.head).to.equal(null);
    expect(countHeads(a0)).to.equal(0);
    expect(a0.deps).to.equal("2:test-dependent-2|3:test-dependent-3");
    expect(countDeps(a0)).to.equal(2);

    expect(a1.head).to.equal("1:test-dependent-2");
    expect(countHeads(a1)).to.equal(1);
    expect(a1.deps).to.equal(null);
    expect(countDeps(a1)).to.equal(0);

    expect(a2.head).to.equal("1:test-dependent-3");
    expect(countHeads(a2)).to.equal(1);
    expect(a2.deps).to.equal(null);
    expect(countDeps(a2)).to.equal(0);

    a0.changeDep(a2, "test-dependent-4");

    expect(a0.head).to.equal(null);
    expect(countHeads(a0)).to.equal(0);
    expect(a0.deps).to.equal("2:test-dependent-2|3:test-dependent-4");
    expect(countDeps(a0)).to.equal(2);

    expect(a1.head).to.equal("1:test-dependent-2");
    expect(countHeads(a1)).to.equal(1);
    expect(a1.deps).to.equal(null);
    expect(countDeps(a1)).to.equal(0);

    expect(a2.head).to.equal("1:test-dependent-4");
    expect(countHeads(a2)).to.equal(1);
    expect(a2.deps).to.equal(null);
    expect(countDeps(a2)).to.equal(0);

    a0.changeDep(a2);

    expect(a0.head).to.equal(null);
    expect(countHeads(a0)).to.equal(0);
    expect(a0.deps).to.equal("2:test-dependent-2|3:test-dependent-4");
    expect(countDeps(a0)).to.equal(2);

    expect(a1.head).to.equal("1:test-dependent-2");
    expect(countHeads(a1)).to.equal(1);
    expect(a1.deps).to.equal(null);
    expect(countDeps(a1)).to.equal(0);

    expect(a2.head).to.equal("1:test-dependent-4");
    expect(countHeads(a2)).to.equal(1);
    expect(a2.deps).to.equal(null);
    expect(countDeps(a2)).to.equal(0);

    a0.removeDep(a1).removeDep(a2);

    expect(a0.head).to.equal(null);
    expect(countHeads(a0)).to.equal(0);
    expect(a0.deps).to.equal(null);
    expect(countDeps(a0)).to.equal(0);

    expect(a1.head).to.equal(null);
    expect(countHeads(a1)).to.equal(0);
    expect(a1.deps).to.equal(null);
    expect(countDeps(a1)).to.equal(0);

    expect(a2.head).to.equal(null);
    expect(countHeads(a2)).to.equal(0);
    expect(a2.deps).to.equal(null);
    expect(countDeps(a2)).to.equal(0);

    expect(() => { a0.addDep(a3); }).to.throw(E.NotatrixError);
    expect(() => { a0.removeDep(a3); }).to.throw(E.NotatrixError);
    expect(() => { a0.changeDep(a3); }).to.throw(E.NotatrixError);
  });
});

describe("merging", () => {
  const conllu = `1\tA\ta_lemma
2\tB\tb_lemma
3-5\tCDE\tcde_lemma
3\tC\tc_lemma
4\tD\td_lemma
5\tE\te_lemma
6\tF\tf_lemma
7\tG\tg_lemma`;

  it(`should throw errors at the right times`, () => {
    let s = Sentence.fromConllu(conllu);
    const ta = s[0].token, tb = s[1].token, tcde = s[2].token,
          tc = s[2][0].token, td = s[2][1].token, te = s[2][2].token,
          tf = s[3].token, tg = s[4].token;

    expect(() => { ta.mergeWith(ta); }).to.throw(E.NotatrixError);
    // expect(() => { ta.mergeWith(tb); }).to.throw(E.NotatrixError);
    expect(() => { ta.mergeWith(tcde); }).to.throw(E.NotatrixError);
    expect(() => { ta.mergeWith(tc); }).to.throw(E.NotatrixError);
    expect(() => { ta.mergeWith(td); }).to.throw(E.NotatrixError);
    expect(() => { ta.mergeWith(te); }).to.throw(E.NotatrixError);
    expect(() => { ta.mergeWith(tf); }).to.throw(E.NotatrixError);
    expect(() => { ta.mergeWith(tg); }).to.throw(E.NotatrixError);

    // expect(() => { tb.mergeWith(ta); }).to.throw(E.NotatrixError);
    expect(() => { tb.mergeWith(tb); }).to.throw(E.NotatrixError);
    expect(() => { tb.mergeWith(tcde); }).to.throw(E.NotatrixError);
    expect(() => { tb.mergeWith(tc); }).to.throw(E.NotatrixError);
    expect(() => { tb.mergeWith(td); }).to.throw(E.NotatrixError);
    expect(() => { tb.mergeWith(te); }).to.throw(E.NotatrixError);
    expect(() => { tb.mergeWith(tf); }).to.throw(E.NotatrixError);
    expect(() => { tb.mergeWith(tg); }).to.throw(E.NotatrixError);

    expect(() => { tcde.mergeWith(ta); }).to.throw(E.NotatrixError);
    expect(() => { tcde.mergeWith(tb); }).to.throw(E.NotatrixError);
    expect(() => { tcde.mergeWith(tcde); }).to.throw(E.NotatrixError);
    expect(() => { tcde.mergeWith(tc); }).to.throw(E.NotatrixError);
    expect(() => { tcde.mergeWith(td); }).to.throw(E.NotatrixError);
    expect(() => { tcde.mergeWith(te); }).to.throw(E.NotatrixError);
    expect(() => { tcde.mergeWith(tf); }).to.throw(E.NotatrixError);
    expect(() => { tcde.mergeWith(tg); }).to.throw(E.NotatrixError);

    expect(() => { tc.mergeWith(ta); }).to.throw(E.NotatrixError);
    expect(() => { tc.mergeWith(tb); }).to.throw(E.NotatrixError);
    expect(() => { tc.mergeWith(tcde); }).to.throw(E.NotatrixError);
    expect(() => { tc.mergeWith(tc); }).to.throw(E.NotatrixError);
    // expect(() => { tc.mergeWith(td); }).to.throw(E.NotatrixError);
    expect(() => { tc.mergeWith(te); }).to.throw(E.NotatrixError);
    expect(() => { tc.mergeWith(tf); }).to.throw(E.NotatrixError);
    expect(() => { tc.mergeWith(tg); }).to.throw(E.NotatrixError);

    expect(() => { td.mergeWith(ta); }).to.throw(E.NotatrixError);
    expect(() => { td.mergeWith(tb); }).to.throw(E.NotatrixError);
    expect(() => { td.mergeWith(tcde); }).to.throw(E.NotatrixError);
    // expect(() => { td.mergeWith(tc); }).to.throw(E.NotatrixError);
    expect(() => { td.mergeWith(td); }).to.throw(E.NotatrixError);
    // expect(() => { td.mergeWith(te); }).to.throw(E.NotatrixError);
    expect(() => { td.mergeWith(tf); }).to.throw(E.NotatrixError);
    expect(() => { td.mergeWith(tg); }).to.throw(E.NotatrixError);

    expect(() => { te.mergeWith(ta); }).to.throw(E.NotatrixError);
    expect(() => { te.mergeWith(tb); }).to.throw(E.NotatrixError);
    expect(() => { te.mergeWith(tcde); }).to.throw(E.NotatrixError);
    expect(() => { te.mergeWith(tc); }).to.throw(E.NotatrixError);
    // expect(() => { te.mergeWith(td); }).to.throw(E.NotatrixError);
    expect(() => { te.mergeWith(te); }).to.throw(E.NotatrixError);
    expect(() => { te.mergeWith(tf); }).to.throw(E.NotatrixError);
    expect(() => { te.mergeWith(tg); }).to.throw(E.NotatrixError);

    expect(() => { tf.mergeWith(ta); }).to.throw(E.NotatrixError);
    expect(() => { tf.mergeWith(tb); }).to.throw(E.NotatrixError);
    expect(() => { tf.mergeWith(tcde); }).to.throw(E.NotatrixError);
    expect(() => { tf.mergeWith(tc); }).to.throw(E.NotatrixError);
    expect(() => { tf.mergeWith(td); }).to.throw(E.NotatrixError);
    expect(() => { tf.mergeWith(te); }).to.throw(E.NotatrixError);
    expect(() => { tf.mergeWith(tf); }).to.throw(E.NotatrixError);
    // expect(() => { tf.mergeWith(tg); }).to.throw(E.NotatrixError);

    expect(() => { tg.mergeWith(ta); }).to.throw(E.NotatrixError);
    expect(() => { tg.mergeWith(tb); }).to.throw(E.NotatrixError);
    expect(() => { tg.mergeWith(tcde); }).to.throw(E.NotatrixError);
    expect(() => { tg.mergeWith(tc); }).to.throw(E.NotatrixError);
    expect(() => { tg.mergeWith(td); }).to.throw(E.NotatrixError);
    expect(() => { tg.mergeWith(te); }).to.throw(E.NotatrixError);
    // expect(() => { tg.mergeWith(tf); }).to.throw(E.NotatrixError);
    expect(() => { tg.mergeWith(tg); }).to.throw(E.NotatrixError);
  });

  it(`should merge non-subTokens correctly (basics)`, () => {
    let s;

    s = Sentence.fromConllu(conllu);
    s[0].token.mergeWith(s[1].token);
    expect(s.length).to.equal(7);

    s = Sentence.fromConllu(conllu);
    s[1].token.mergeWith(s[0].token);
    expect(s.length).to.equal(7);

    s = Sentence.fromConllu(conllu);
    s[3].token.mergeWith(s[4].token);
    expect(s.length).to.equal(7);

    s = Sentence.fromConllu(conllu);
    s[4].token.mergeWith(s[3].token);
    expect(s.length).to.equal(7);
  });

  it(`should merge subTokens correctly (basics)`, () => {
    let s;

    s = Sentence.fromConllu(conllu);
    s[2][0].token.mergeWith(s[2][1].token);
    expect(s.length).to.equal(7);

    s = Sentence.fromConllu(conllu);
    s[2][1].token.mergeWith(s[2][0].token);
    expect(s.length).to.equal(7);

    s = Sentence.fromConllu(conllu);
    s[2][1].token.mergeWith(s[2][2].token);
    expect(s.length).to.equal(7);

    s = Sentence.fromConllu(conllu);
    s[2][2].token.mergeWith(s[2][1].token);
    expect(s.length).to.equal(7);
  });

  it(`should handle dependencies through merge`, () => {
    let s;

    s = Sentence.fromConllu(conllu);
    s[0].addHead(s[4], "test-head");
    s[0].addDep(s[3], "test-dep");
    s[0].token.mergeWith(s[1].token);
    expect(s[2].head).to.equal("1:test-dep");
    expect(s[3].deps).to.equal("1:test-head");

    s = Sentence.fromConllu(conllu);
    s[0].addHead(s[4], "test-head");
    s[0].addDep(s[3], "test-dep");
    s[1].token.mergeWith(s[0].token);
    expect(s[2].head).to.equal(null);
    expect(s[3].deps).to.equal(null);

    s = Sentence.fromConllu(conllu);
    s[2][0].addHead(s[2][2], "test-head");
    s[2][0].token.mergeWith(s[2][1].token);
    expect(s[2][0].head).to.equal("4:test-head");
    expect(s[2][1].deps).to.equal("3:test-head");

    s = Sentence.fromConllu(conllu);
    s[2][0].addHead(s[2][2], "test-head");
    s[2][1].token.mergeWith(s[2][0].token);
    expect(s[2][0].head).to.equal(null);
    expect(s[2][1].deps).to.equal(null);

    s = Sentence.fromConllu(conllu);
    s[2][0].addDep(s[2][2], "test-dep");
    s[2][0].token.mergeWith(s[2][1].token);
    expect(s[2][0].deps).to.equal("4:test-dep");
    expect(s[2][1].head).to.equal("3:test-dep");

    s = Sentence.fromConllu(conllu);
    s[2][0].addDep(s[2][2], "test-dep");
    s[2][1].token.mergeWith(s[2][0].token);
    expect(s[2][0].deps).to.equal(null);
    expect(s[2][1].head).to.equal(null);
  });
});

describe("nx deserializer", () => {
  const options = {
    help: {head: false, deps: false},
    showEmptyDependencies: false
  };

  _.each(data["CoNLL-U"], (conllu, name) => {
    it(`serialize and deserialize CoNLL-U:${name}`, () => {
      let nx = Sentence.fromConllu(conllu, options).nx;
      let s = Sentence.fromNx(nx);

      expect(s.nx).to.deep.equal(nx);
      expect(clean(s.conllu)).to.equal(clean(conllu));
    });
  });

  _.each(data["CG3"], (cg3, name) => {
    it(`serialize and deserialize CG3:${name}`, () => {
      let nx = Sentence.fromCG3(cg3, options).nx;
      let s = Sentence.fromNx(nx);

      expect(s.nx).to.deep.equal(nx);
      // TODO: get rid of this semicolon hack
      expect(clean(s.cg3).replace(/;/g, ""))
          .to.equal(clean(cg3).replace(/;/g, ""));
    });
  });

  _.each(data["Plain text"], (text, name) => {
    it(`serialize and deserialize Plain text:${name}`, () => {
      let nx = Sentence.fromText(text, options).nx;
      let s = Sentence.fromNx(nx);

      expect(s.nx).to.deep.equal(nx);
      expect(s.text.replace(/\s*/g, "")).to.equal(text.replace(/\s*/g, ""));
    });
  });
});

describe("progress percentage", () => {
  const options = {help: {upostag: false, xpostag: false}};

  _.each(data["CoNLL-U"], (conllu, name) => {
    it(`calculate progress for CoNLL-U:${name}`, () => {
      let s = Sentence.fromConllu(conllu, options);

      expect(() => {s.progress}).to.not.throw();
    });
  });

  _.each(data["CG3"], (cg3, name) => {
    it(`calculate progress for CG3:${name}`, () => {
      let s = Sentence.fromCG3(cg3, options);

      expect(() => {s.progress}).to.not.throw();
    });
  });

  _.each(data["Plain text"], (text, name) => {
    it(`calculate progress for Plain text:${name}`, () => {
      let s = Sentence.fromText(text, options);

      expect(s.progress).to.equal(0);
    });
  });
});

describe("setEmpty", () => {
  it("should allow toggling isEmpty", () => {
    const s = Sentence.fromConllu(data["CoNNL-U"]["empty"]);
    console.log(s);
  });
});

describe("eles", () => {
  _.each(data["CoNLL-U"], (conllu, name) => {
    it(`should not have duplicate elements for CoNLL-U:${name}`, () => {
      let s = Sentence.fromConllu(conllu);
      let eles = new Set();

      _.each(s.eles, ele => {
        if (eles.has(ele.data.id))
          throw new Error(`duplicate: ${ele.data.id}`);
        eles.add(ele.data.id);
      });
    });
  });

  _.each(data["CG3"], (cg3, name) => {
    it(`should not have duplicate elements for CG3:${name}`, () => {
      let s = Sentence.fromCG3(cg3);
      let eles = new Set();

      _.each(s.eles, ele => {
        if (eles.has(ele.data.id))
          throw new Error(`duplicate: ${ele.data.id}`);
        eles.add(ele.data.id);
      });
    });
  });
});

describe("problem cases", () => {
  _.each(
      [
        data["CoNLL-U"].nested_2, data["CoNLL-U"].t,
        data["CoNLL-U"].from_cg3_with_spans
      ],
      conllu => {
        it("should set superToken and isSubToken correctly", () => {
          let s = Sentence.fromConllu(conllu);
          _.each(s.tokens, token => {
            _.each(token.subTokens, subToken => {
              expect(subToken.isSubToken).to.equal(true);
              expect(subToken.superToken instanceof Analysis).to.equal(true);
            });
            expect(token.isSubToken).to.equal(false);
            expect(token.superToken).to.equal(null);
          });
        });
      });

  _.each([data["CoNLL-U"][0], data["CoNLL-U"][1]], conllu => {
    it("should not do the funky _;_ thing when converting between CG3", () => {
      let s1 = Sentence.fromConllu(conllu);
      let s2 = Sentence.fromCG3(s1.cg3);
      let s3 = Sentence.fromConllu(s2.conllu);

      expect(s1.conllu).to.equal(s3.conllu);
      expect(s1.cg3).to.equal(s3.cg3);
    });
  });
});

require("./detector");
require("./splitter");
require("./parser");
require("./generator");
