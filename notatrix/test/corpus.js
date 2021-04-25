"use strict";

const _ = require("underscore"), expect = require("chai").expect,
      sinon = require("sinon"), utils = require("./utils"), nx = require("..");

const fs = require("fs");
const treepath = "/tmp/treebanks/"

describe("corpus", () => {
  it(`should navigate between sentences correctly`, () => {
    let corpus = new nx.Corpus();

    expect(corpus.length).to.equal(0);
    expect(corpus.index).to.equal(-1);
    corpus.first();
    expect(corpus.index).to.equal(-1);
    corpus.last();
    expect(corpus.index).to.equal(-1);
    corpus.prev();
    expect(corpus.index).to.equal(-1);
    corpus.next();
    expect(corpus.index).to.equal(-1);
    corpus.index = -1;
    expect(corpus.index).to.equal(-1);
    corpus.index = Infinity;
    expect(corpus.index).to.equal(-1);
    corpus.index = null;
    expect(corpus.index).to.equal(-1);

    corpus.insertSentence(0, "hello");

    expect(corpus.length).to.equal(1);
    corpus.first();
    expect(corpus.index).to.equal(0);
    corpus.last();
    expect(corpus.index).to.equal(0);
    corpus.prev();
    expect(corpus.index).to.equal(0);
    corpus.next();
    expect(corpus.index).to.equal(0);
    corpus.index = -1;
    expect(corpus.index).to.equal(0);
    corpus.index = Infinity;
    expect(corpus.index).to.equal(0);
    corpus.index = null;
    expect(corpus.index).to.equal(0);

    corpus.insertSentence(1, "hello");
    corpus.insertSentence(2, "world");

    expect(corpus.length).to.equal(3);
    corpus.first();
    expect(corpus.index).to.equal(0);
    corpus.last();
    expect(corpus.index).to.equal(2);
    corpus.prev();
    expect(corpus.index).to.equal(1);
    corpus.prev();
    expect(corpus.index).to.equal(0);
    corpus.prev();
    expect(corpus.index).to.equal(0);
    corpus.next();
    expect(corpus.index).to.equal(1);
    corpus.next();
    expect(corpus.index).to.equal(2);
    corpus.next();
    expect(corpus.index).to.equal(2);
    corpus.index = -1;
    expect(corpus.index).to.equal(0);
    corpus.index = Infinity;
    expect(corpus.index).to.equal(0);
    corpus.index = null;
    expect(corpus.index).to.equal(0);
    corpus.index = 0;
    expect(corpus.index).to.equal(0);
    corpus.index = 1;
    expect(corpus.index).to.equal(1);
    corpus.index = 2;
    expect(corpus.index).to.equal(2);
    corpus.index = 3;
    expect(corpus.index).to.equal(2);
  });

  it(`should insert and remove sentences correctly`, () => {
    const text =
        index => {
          const sent = corpus.getSentence(index);

          if (!sent)
            return sent;

          return sent.to("plain text").output;
        }

    var corpus = nx.Corpus.fromString("test0");

    expect(corpus.length).to.equal(1);
    expect(corpus.index).to.equal(0);
    expect(text(0)).to.equal("test0");
    expect(text(1)).to.equal(null);

    corpus.insertSentence("test1");
    expect(corpus.length).to.equal(2);
    expect(corpus.index).to.equal(1);
    expect(text(0)).to.equal("test0");
    expect(text(1)).to.equal("test1");
    expect(text(2)).to.equal(null);

    corpus.insertSentence(0, "test2");
    expect(corpus.length).to.equal(3);
    expect(corpus.index).to.equal(0);
    expect(text(0)).to.equal("test2");
    expect(text(1)).to.equal("test0");
    expect(text(2)).to.equal("test1");
    expect(text(3)).to.equal(null);

    corpus.insertSentence(-30, "test3");
    expect(corpus.length).to.equal(4);
    expect(corpus.index).to.equal(0);
    expect(text(0)).to.equal("test3");
    expect(text(1)).to.equal("test2");
    expect(text(2)).to.equal("test0");
    expect(text(3)).to.equal("test1");
    expect(text(4)).to.equal(null);

    corpus.insertSentence(2, "test4");
    expect(corpus.length).to.equal(5);
    expect(corpus.index).to.equal(2);
    expect(text(0)).to.equal("test3");
    expect(text(1)).to.equal("test2");
    expect(text(2)).to.equal("test4");
    expect(text(3)).to.equal("test0");
    expect(text(4)).to.equal("test1");
    expect(text(5)).to.equal(null);

    corpus.insertSentence(10000, "test5");
    expect(corpus.length).to.equal(6);
    expect(corpus.index).to.equal(5);
    expect(text(0)).to.equal("test3");
    expect(text(1)).to.equal("test2");
    expect(text(2)).to.equal("test4");
    expect(text(3)).to.equal("test0");
    expect(text(4)).to.equal("test1");
    expect(text(5)).to.equal("test5");
    expect(text(6)).to.equal(null);

    let removed;

    removed = corpus.removeSentence();
    expect(corpus.length).to.equal(5);
    expect(corpus.index).to.equal(4);
    expect(text(0)).to.equal("test3");
    expect(text(1)).to.equal("test2");
    expect(text(2)).to.equal("test4");
    expect(text(3)).to.equal("test0");
    expect(text(4)).to.equal("test1");
    expect(text(5)).to.equal(null);
    expect(removed.to("plain text").output).to.equal("test5");

    removed = corpus.removeSentence(2);
    expect(corpus.length).to.equal(4); // NOTE: extra space
    expect(corpus.index).to.equal(3);
    expect(text(0)).to.equal("test3");
    expect(text(1)).to.equal("test2");
    expect(text(2)).to.equal("test0");
    expect(text(3)).to.equal("test1");
    expect(text(4)).to.equal(null);
    expect(removed.to("plain text").output).to.equal("test4");

    removed = corpus.removeSentence(-100);
    expect(corpus.length).to.equal(3);
    expect(corpus.index).to.equal(2);
    expect(text(0)).to.equal("test2");
    expect(text(1)).to.equal("test0");
    expect(text(2)).to.equal("test1");
    expect(text(3)).to.equal(null);
    expect(removed.to("plain text").output).to.equal("test3");

    removed = corpus.removeSentence(100);
    expect(corpus.length).to.equal(2);
    expect(corpus.index).to.equal(1);
    expect(text(0)).to.equal("test2");
    expect(text(1)).to.equal("test0");
    expect(text(2)).to.equal(null);
    expect(removed.to("plain text").output).to.equal("test1");

    expect(() => corpus.insertSentence(null, "error")).to.throw(nx.NxError);
    expect(() => corpus.removeSentence(null)).to.throw(nx.NxError);

    corpus.pushSentence("push1");
    corpus.pushSentence("push2");
    expect(corpus.length).to.equal(4);
    expect(corpus.index).to.equal(3);
    expect(text(0)).to.equal("test2");
    expect(text(1)).to.equal("test0");
    expect(text(2)).to.equal("push1");
    expect(text(3)).to.equal("push2");
    expect(text(4)).to.equal(null);

    removed = corpus.popSentence();
    expect(corpus.length).to.equal(3);
    expect(corpus.index).to.equal(2);
    expect(text(0)).to.equal("test2");
    expect(text(1)).to.equal("test0");
    expect(text(2)).to.equal("push1");
    expect(text(3)).to.equal(null);
    expect(removed.to("plain text").output).to.equal("push2");

    corpus.setSentence(1, "set2");
    corpus.setSentence(0, "set1");
    corpus.setSentence(2, "set3");
    corpus.setSentence("set5");
    expect(text(0)).to.equal("set1");
    expect(text(1)).to.equal("set2");
    expect(text(2)).to.equal("set5");
    expect(text(3)).to.equal(null);
  });

  it(`should serialize`, () => {
    var corpus = nx.Corpus.fromString("test0");

    expect(() => corpus.serialize()).to.not.throw();

    // preserve _meta stuff

    corpus._meta.test = "testing";
    let serialized = corpus.serialize();
    expect(serialized.meta.test).to.equal("testing");

    // preserve sentence _meta stuff

    corpus._sentences[0]._meta.test = "testing";
    serialized = corpus.serialize();
    expect(serialized.sentences[0].meta.test).to.equal("testing");
  });

  it(`should deserialize`, () => {
    let corpus, serialized, clone;

    corpus = nx.Corpus.fromString("test");
    serialized = corpus.serialize();

    expect(() => nx.Corpus.deserialize(serialized)).to.not.throw();

    corpus._meta.test = "testing";
    serialized = corpus.serialize();
    clone = nx.Corpus.deserialize(serialized);
    clone._meta.test = "testing";
    serialized = corpus.serialize();
    expect(serialized.meta.test).to.equal("testing");

    // preserve sentence _meta stuff

    corpus._sentences[0]._meta.test = "testing";
    serialized = corpus.serialize();
    clone = nx.Corpus.deserialize(serialized);
    clone._meta.test = "testing";
    serialized = corpus.serialize();
    expect(serialized.sentences[0].meta.test).to.equal("testing");
  });

  _.each(nx.data.corpora, (filename, name) => {
    it(`should load, serialize, deserialize ${name}`, (done) => {
      if (name === "czech_train")
        return done(); // this one is just too big lmao

      nx.Corpus.fromFile(filename, corpus => {
        const serial = corpus.serialize();
        nx.Corpus.deserialize(serial);

        done();
      });
    });
  });

  /*
  fs.readdir(treepath +, (err, filenames) => {
    if (err)
      throw err;

    filenames.forEach(filename => {

      const filepath = treepath + + filename;

      it(`should be able to load the corpus from ${filepath}`, done => {

        nx.Corpus.fromFile(filepath, corpus => {

          done();

        });

      }).timeout(5 * 60 * 1000); // allow this to take a long time
    });
  });
  */

  ["myv-ud-dev.conllu",
   "myv_ChetvergovJevgenij_Velenj-vajgeljtj_1992_UD-dev-2011.conllu",
   "myv_jr-ud-dev.conllu"]
      .forEach(path => {
        it(`should handle parse errors from ${path}`, done => {
          path = treepath + path;
          nx.Corpus.fromFile(path, corpus => {
            corpus._sentences.forEach(sent => {
              expect(sent.isParsed).to.equal(!sent.ParseError);

              if (!sent.isParsed)
                utils.forEachFormat(format => {
                  expect(sent.to(format).output).to.equal(null);
                });
            });
            done();
          });
        });
      });

  it(`should generate a snapshot`, done => {
    nx.Corpus.fromFile(nx.data.corpora.assorted, corpus => {
      // hard-coded expectations
      expect(corpus.snapshot).to.deep.equal({
        filename: "assorted.conllu",
        sentences: 21,
        errors: 0,
        labels: [
          {name: "label1", size: 2}, {name: "one_label", size: 2},
          {name: "this-is-a-tag", size: 2}, {name: "too_long_to_cut", size: 1},
          {name: "second", size: 1}, {name: "third-label", size: 1},
          {name: "row_2", size: 1}, {name: "again:here", size: 1},
          {name: "this,", size: 1}, {name: "another_label", size: 1},
          {name: "a-third-label", size: 1}, {name: "test", size: 1},
          {name: "testing", size: 1}, {name: "new", size: 1},
          {name: "press_1986", size: 1}, {name: "ch_syntax", size: 1},
          {name: "p_197", size: 1}, {name: "to_check", size: 1},
          {name: "that", size: 1}
        ]
      });

      done();
    });
  });
});
