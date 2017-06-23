'use strict';

var rewire = require('rewire');
var module = rewire('../lib/Conllu.js');
var Conllu = module.Conllu;

var conllu_gold = require("../test/example1/conllu_obj.js").conllu;

var chai = require("chai");
var assert = chai.assert;
var Sentence = function () {};

describe("Conllu", function () {
    var conllu;
    beforeEach(function () {
        // Stub for Sentence
        module.__set__('Sentence', Sentence);

        // Stub for MultiwordToken
        var MultiwordToken = function () {

        };
        module.__set__('MultiwordToken', MultiwordToken);
        conllu = new Conllu();
    });

    describe("object inheritance", function () {
        it("should be an instance of Conllu", function () {
            assert.instanceOf(conllu, Conllu);
        });
    });

    describe("property 'sentences'", function () {
        it("should be a property", function () {
            assert.property(conllu, 'sentences');
        });

        // The sentences should not be shared with other instances of Conllu
        it("should be a direct property", function () {
            assert(conllu.hasOwnProperty('sentences'));
        });

        it("should be an array", function () {
            assert.typeOf(conllu.sentences, 'array');
        });

        it("should be empty", function () {
            assert.lengthOf(conllu.sentences, 0);
        });
    });

    describe("property 'serial'", function () {
        it("should be a property", function () {
            assert.property(conllu, 'serial');
        });

        describe("get", function () {
            beforeEach(function () {
                // create dummy sentences whose serial properties match the conllu file
                conllu.sentences = conllu_gold.sentences;
            });

            it("should return the sentences' serial properties concatenated with new lines. ", function () {
                assert.strictEqual(conllu.serial, conllu_gold.serial);
            });
        });

        describe("seting to conllu gold file contents", function () {
            beforeEach( function () {
                conllu.serial = conllu_gold.serial;
            });
            
            it("should have "+conllu_gold.sentences.length+" sentences", function () {
                assert.lengthOf(conllu.sentences, conllu_gold.sentences.length);
            });

            conllu_gold.sentences.forEach(function (sentence_gold, index) {
                context("sentence "+index, function () {

                    it("should be an instance of Sentence", function () {
                        assert.instanceOf(conllu.sentences[index], Sentence);
                    });

                    it("should have serial set to "+sentence_gold.serial, function () {
                        assert.strictEqual(conllu.sentences[index].serial, sentence_gold.serial);
                    });
                });
            });
        });
    });

});