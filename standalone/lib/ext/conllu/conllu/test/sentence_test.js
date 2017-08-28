
var rewire = require('rewire');

var module = rewire("../lib/Sentence.js");
var Token = function () {};
module.__set__('Token', Token);

var MultiwordToken = function () {
    this.tokens = [];
};
MultiwordToken.prototype = new Token();
module.__set__('MultiwordToken', MultiwordToken);

var TokenAggregate = function () {
    this.__token_aggregate__ = true;
};
module.__set__('TokenAggregate', TokenAggregate);

var Sentence = module.Sentence;


chai = require("chai");
var assert = chai.assert;
var conllu_gold = require("../test/example1/conllu_obj.js").conllu;

var assertTokensEquivalent = function (tokens, gold_tokens, parent) {
    if (parent === undefined) {
        parent = '';
    } else {
        parent = ' of '+parent;
    }

    assert.lengthOf(tokens, gold_tokens.length, 'expected tokens array to have length '+gold_tokens.length);
    gold_tokens.forEach(function (gold_token, index) {

        // every token should be an instance of Token and should have matching properties (except for id)
        assert.instanceOf(tokens[index],
            Token,
            'expected token '+index+parent+' to be a Token');

        assert.strictEqual(tokens[index].form,
            gold_token.form,
            'expected token '+index+parent+' to have form '+gold_token.form);
        assert.strictEqual(tokens[index].lemma,
            gold_token.lemma,
            'expected token '+index+parent+' to have lemma '+gold_token.lemma);
        assert.strictEqual(tokens[index].upostag,
            gold_token.upostag,
            'expected token '+index+parent+' to have upostag '+gold_token.upostag);
        assert.strictEqual(tokens[index].xpostag,
            gold_token.xpostag,
            'expected token '+index+parent+' to have xpostag '+gold_token.xpostag);
        assert.strictEqual(tokens[index].feats,
            gold_token.feats,
            'expected token '+index+parent+' to have feats '+gold_token.feats);
        assert.strictEqual(tokens[index].head,
            gold_token.head,
            'expected token '+index+parent+' to have head '+gold_token.head);
        assert.strictEqual(tokens[index].deprel,
            gold_token.deprel,
            'expected token '+index+parent+' to have deprel '+gold_token.deprel);
        assert.strictEqual(tokens[index].deps,
            gold_token.deps,
            'expected token '+index+parent+' to have deps '+gold_token.deps);
        assert.strictEqual(tokens[index].misc,
            gold_token.misc,
            'expected token '+index+parent+' to have misc '+gold_token.misc);

        // if gold has a tokens property, it reperesents a MultiwordToken
        if(gold_token.hasOwnProperty('tokens')) {
            assert.instanceOf(tokens[index],
                MultiwordToken,
                'expected token '+index+' to be a MultiwordToken');

            assert.lengthOf(tokens[index].tokens,
                gold_token.tokens.length,
                'expected MultiwordToken '+index+'('+gold_token.form+') to have '+gold_token.tokens.length+' subtokens');


            gold_token.tokens.forEach(function (subtok_gold, subindex) {
                assert.instanceOf(tokens[index].tokens[subindex],
                    Token,
                    'expected subtoken '+subindex+' of MultiwordToken '+index+'('+gold_token.form+') to be a Token');
            });

            assertTokensEquivalent(tokens[index].tokens, gold_token.tokens, 'token '+index+' ('+gold_token.form+')');
        } else {
            // Do not check id of MultiwordTokens, since it is a computed property
            assert.strictEqual(tokens[index].id,
                gold_token.id,
                'expected token '+index+parent+' to have id '+gold_token.id);
        }
    });
};


describe("A Sentence object created by an empty construcor", function() {
    var sentence;
    beforeEach(function() {
        sentence = new Sentence();
    });

    describe("object inheritance", function () {

        it("should inherit from TokenAggregate's constructor", function () {
            assert.property(sentence,'__token_aggregate__');
            assert.strictEqual(sentence.__token_aggregate__,true);
        });
    });

    describe("property 'comments'", function () {
        it("should be a property", function () {
            assert.property(sentence, 'comments');
        });

        it("should be a direct property", function () {
            assert(sentence.hasOwnProperty('comments'));
        });

        it("should be an array", function () {
            assert.typeOf(sentence.comments, 'array');
        });

        it("should be empty", function () {
            assert.lengthOf(sentence.comments, 0);
        });
    });

    describe("property 'tokens'", function () {
        it("should be a property", function () {
            assert.property(sentence, 'tokens');
        });

        it("should be a direct property", function () {
            assert(sentence.hasOwnProperty('tokens'));
        });

        it("should be an array", function () {
            assert.typeOf(sentence.tokens, 'array');
        });

        it("should be empty", function () {
            assert.lengthOf(sentence.tokens, 0);
        });
    });

    describe("method 'expand'", function () {
        it("should be a property", function () {
            assert.property(sentence, 'expand');
        });

        it("should be a function", function () {
            assert.typeOf(sentence.expand, 'function');
        });

        var tests = [
            {
                sentence: "I haven't a clue.",
                token: 2,
                index: 4,
                before: [{id: 1, form: 'I'}, {id: 2, form: 'haven\'t'}, {id: 3, form: 'a'}, {id: 4, form: 'clue'},{id:5, form: '.'}],
                after: [{id: 1, form: 'I'},
                    {
                        id: '2-3',
                        form: 'haven\'t',
                        tokens: [{id: 2, form: 'have'}, {id: 3, form: 'n\'t'}]
                    }, {id: 4, form: 'a'}, {id: 5, form: 'clue'},{id:6, form: '.'}]
            }
        ];

        tests.forEach(function(test) {
            context("Sentence: "+test.sentence, function () {
                beforeEach(function () {
                    test.before.forEach(function (obj, index) {
                        if(obj.hasOwnProperty('tokens')) {
                            sentence.tokens[index] = new MultiwordToken();
                            sentence.tokens[index].id = obj.id;
                            sentence.tokens[index].form = obj.form;
                        } else {
                            sentence.tokens[index] = new Token();
                            sentence.tokens[index].id = obj.id;
                            sentence.tokens[index].form = obj.form;
                        }
                    });
                    sentence.expand(test.token,test.index);
                });

                describe("tokens property after calling expand("+test.token+","+test.index+")", function () {
                    it('should have tokens matching gold', function () {
                        assert.property(sentence,'tokens');
                        assert.typeOf(sentence.tokens,'array');
                        assertTokensEquivalent(sentence.tokens, test.after);
                    });
                });
            });
        });
    });

    describe("method 'collapse'", function () {
        it("should be a property", function () {
            assert.property(sentence, 'collapse');
        });

        it("should be a function", function () {
            assert.typeOf(sentence.collapse, 'function');
        });


        var tests = [
            {
                sentence: "I haven't a clue.",
                token: '2-3',
                before: [{id: 1, form: 'I'},
                    {
                        id: '2-3',
                        form: 'haven\'t',
                        tokens: [{id: 2, form: 'have'}, {id: 3, form: 'n\'t'}]
                    }, {id: 4, form: 'a'}, {id: 5, form: 'clue'},{id:6, form: '.'}],
                after: [{id: 1, form: 'I'}, {id: 2, form: 'haven\'t'}, {id: 3, form: 'a'}, {id: 4, form: 'clue'},{id:5, form: '.'}]
            }
        ];

        tests.forEach(function(test) {
            context("Sentence: "+test.sentence, function () {
                beforeEach(function () {
                    test.before.forEach(function (obj, index) {
                        if(obj.hasOwnProperty('tokens')) {
                            sentence.tokens[index] = new MultiwordToken();
                            sentence.tokens[index].form = obj.form;
                            obj.tokens.forEach(function (t, index2) {
                                sentence.tokens[index].tokens[index2] = new Token();
                                sentence.tokens[index].tokens[index2].id = t.id;
                                sentence.tokens[index].tokens[index2].form = t.form;
                            })
                        } else {
                            sentence.tokens[index] = new Token();
                            sentence.tokens[index].id = obj.id;
                            sentence.tokens[index].form = obj.form;
                        }
                    });
                    sentence.collapse(test.token.id);
                });

                describe("tokens property after calling collapse("+test.token+")", function () {
                    it('should have tokens matching gold', function () {
                        assert.property(sentence,'tokens');
                        assert.typeOf(sentence.tokens,'array');
                        assertTokensEquivalent(sentence.tokens, test.after);
                    });
                });
            });
        });
    });

    describe("property 'serial'", function () {
        it("should be a property", function () {
            assert.property(sentence, 'serial');
        });

        describe("get", function () {
            conllu_gold.sentences.forEach(function (sent_gold) {
                context("Sentence: "+sent_gold.text, function () {
                    beforeEach(function () {
                        // create dummy sentences whose serial properties match the conllu file
                        sentence.tokens = sent_gold.tokens;
                        sentence.comments = sent_gold.comments;
                    });

                    it("Should equal "+sent_gold.serial, function () {
                        assert.strictEqual(sentence.serial, sent_gold.serial);
                    });
                });
            });
        });

        describe("set", function () {
            conllu_gold.sentences.forEach(function (sent_gold) {
                context("Sentence: " + sent_gold.text, function () {
                    beforeEach(function () {
                        sentence.serial = sent_gold.serial;
                    });

                    it("should have "+sent_gold.comments.length+" comments", function () {
                        assert.lengthOf(sentence.comments, sent_gold.comments.length);
                    });

                    sent_gold.comments.forEach(function (comment_gold, index) {
                        it('comment '+index+" should be "+comment_gold, function () {
                            assert.strictEqual(sentence.comments[index],comment_gold);
                        });
                    });

                    it("should have "+sent_gold.tokens.length+" tokens", function () {
                        assert.lengthOf(sentence.tokens, sent_gold.tokens.length);
                    });

                    sent_gold.tokens.forEach(function (token_gold, index) {
                        it('token '+index+" should have serial "+token_gold.serial, function () {
                            assert.strictEqual(sentence.tokens[index].serial, token_gold.serial);
                        });
                    });
                });
            });
        });
    });

});