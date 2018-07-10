
var TokenAggregate = require("../lib/TokenAggregate.js").TokenAggregate;
var Token = require("../lib/Token.js").Token;
var MultiwordToken = require("../lib/MultiwordToken.js").MultiwordToken;

chai = require("chai");
var assert = chai.assert;

describe("A TokenAggregate object", function() {
    var tokens;
    var ta;
    beforeEach(function () {
        tokens = 'tokens';
        var A = function() {
            this[tokens] = [];
            TokenAggregate.call(this,tokens);
        };
        ta = new A();
    });

    describe("method 'split'", function () {
        it("should be a property", function () {
            assert.property(ta, 'split');
        });

        it("should be a function", function () {
            assert.typeOf(ta.split, 'function');
        });

        var tests = [
            {
                sentence: "I haven't a clue.",
                token: 4,
                index: 4,
                before: [{id: 1, form: 'I'}, {id: 2, form: 'haven\'t'}, {id: 3, form: 'a'}, {id: 4, form: 'clue.'}],
                after: [{id: 1, form: 'I'}, {id: 2, form: 'haven\'t'}, {id: 3, form: 'a'}, {id: 4, form: 'clue'},{id:5, form: '.'}]
            },
            {
                sentence: "This is asentence.",
                token: 3,
                index: 1,
                before: [{id: 1, form: 'This'}, {id: 2, form: 'is'}, {id: 3, form: 'asentence'}, {id: 4, form: '.'}],
                after: [{id: 1, form: 'This'}, {id: 2, form: 'is'}, {id: 3, form: 'a'},{id: 4, form: 'sentence'}, {id: 5, form: '.'}]
            },
            {
                sentence: "Example with unusual token ids",
                token: 8,
                index: 2,
                before: [{id: 6, form: 'Example'}, {id:7, form:'with'}, {id:8, form:'unusual'}, {id:9, form:'token'},{id:10, form:'ids'}],
                after: [{id: 6, form: 'Example'}, {id:7, form:'with'}, {id:8, form:'un'}, {id:9, form:'usual'}, {id:10, form:'token'},{id:11, form:'ids'}]
            }
        ];

        tests.forEach(function (test) {
            context("Sentence: "+test.sentence, function () {
                beforeEach(function () {
                    test.before.forEach(function (obj, index) {
                        if(obj.hasOwnProperty('tokens')) {
                            ta.tokens[index] = new MultiwordToken();
                            ta.tokens[index].id = obj.id;
                            ta.tokens[index].form = obj.form;
                        } else {
                            ta.tokens[index] = new Token();
                            ta.tokens[index].id = obj.id;
                            ta.tokens[index].form = obj.form;
                        }
                    });
                    ta.split(test.token, test.index);
                });

                describe("tokens property after calling split("+test.token+","+test.index+")", function () {


                    it("should be length "+test.after.length, function () {
                        assert.lengthOf(ta.tokens,test.after.length);
                    });


                    test.after.forEach(function (gold,index) {
                        describe("Token in position "+index, function () {

                            it("should have form "+gold.form, function () {
                                assert.strictEqual(ta.tokens[index].form,gold.form);
                            });

                            it("should be an instance of Token", function () {
                                assert.instanceOf(ta.tokens[index],Token);
                            });

                            if(gold.hasOwnProperty('tokens')) {

                                it("should be an instance of MultiwordToken", function () {
                                    assert.instanceOf(ta.tokens[index],MultiwordToken);
                                });

                                it("should have "+gold.tokens.length+" subtokens", function () {
                                    assert.lengthOf(ta.tokens[index].tokens,gold.tokens.length);
                                });


                                for (var mindex in gold.tokens) {
                                    describe("Subtoken in position "+mindex, function () {
                                        it("should be an instance of Token", function () {
                                            assert.instanceOf(ta.tokens[index].tokens[mindex],Token);
                                        });

                                        it("should have id "+gold.tokens[mindex].id, function () {
                                            assert.strictEqual(ta.tokens[index].tokens[mindex].id,gold.tokens[mindex].id)
                                        });

                                        it("should have form "+gold.tokens[mindex].form, function () {
                                            assert.strictEqual(ta.tokens[index].tokens[mindex].form,gold.tokens[mindex].form);
                                        });
                                    });
                                };

                            } else {
                                it("should not be an instance of MultiwordToken", function () {
                                    assert.notInstanceOf(ta.tokens[index],MultiwordToken);
                                });

                                // We do not check the id of MultiwordTokens because it is a computed field,
                                // and this is just meant to test that all id and form values are set properly.
                                it("should have id "+gold.id, function () {
                                    assert.strictEqual(ta.tokens[index].id,gold.id)
                                });
                            }
                        });
                    });
                });
            });
        });
    });

    describe("method 'merge'", function () {
        it("should be a property", function () {
            assert.property(ta, 'merge');
        });

        it("should be a function", function () {
            assert.typeOf(ta.merge, 'function');
        });

        tests = [
            {
                sentence: "I haven't a clue.",
                token: 4,
                before: [{id: 1, form: 'I'}, {id: 2, form: 'haven\'t'}, {id: 3, form: 'a'}, {id: 4, form: 'clue'},{id:5, form: '.'}],
                after: [{id: 1, form: 'I'}, {id: 2, form: 'haven\'t'}, {id: 3, form: 'a'}, {id: 4, form: 'clue.'}]
            },
            {
                sentence: "This is a sentence.",
                token: 3,
                index: 1,
                before: [{id: 1, form: 'This'}, {id: 2, form: 'is'}, {id: 3, form: 'a'},{id: 4, form: 'sentence'}, {id: 5, form: '.'}],
                after: [{id: 1, form: 'This'}, {id: 2, form: 'is'}, {id: 3, form: 'asentence'}, {id: 4, form: '.'}]
            },
            {
                sentence: "Example with unusual token ids",
                token: 8,
                index: 2,
                before: [{id: 6, form: 'Example'}, {id:7, form:'with'}, {id:8, form:'un'}, {id:9, form:'usual'}, {id:10, form:'token'},{id:11, form:'ids'}],
                after: [{id: 6, form: 'Example'}, {id:7, form:'with'}, {id:8, form:'unusual'}, {id:9, form:'token'},{id:10, form:'ids'}]
            }
        ];

        tests.forEach(function (test) {
            context("Sentence: "+test.sentence, function () {
                beforeEach(function () {
                    test.before.forEach(function (obj, index) {
                        if(obj.hasOwnProperty('tokens')) {
                            ta.tokens[index] = new MultiwordToken();
                            ta.tokens[index].id = obj.id;
                            ta.tokens[index].form = obj.form;
                        } else {
                            ta.tokens[index] = new Token();
                            ta.tokens[index].id = obj.id;
                            ta.tokens[index].form = obj.form;
                        }
                    });
                    ta.merge(test.token);
                });

                describe("tokens property after calling merge("+test.token+")", function () {


                    it("should be length "+test.after.length, function () {
                        assert.lengthOf(ta.tokens,test.after.length);
                    });


                    test.after.forEach(function (gold,index) {
                        describe("Token in position "+index, function () {

                            it("should have form "+gold.form, function () {
                                assert.strictEqual(ta.tokens[index].form,gold.form);
                            });

                            it("should be an instance of Token", function () {
                                assert.instanceOf(ta.tokens[index],Token);
                            });

                            if(gold.hasOwnProperty('tokens')) {

                                it("should be an instance of MultiwordToken", function () {
                                    assert.instanceOf(ta.tokens[index],MultiwordToken);
                                });

                                it("should have "+gold.tokens.length+" subtokens", function () {
                                    assert.lengthOf(ta.tokens[index].tokens,gold.tokens.length);
                                });


                                for (var mindex in gold.tokens) {
                                    describe("Subtoken in position "+mindex, function () {
                                        it("should be an instance of Token", function () {
                                            assert.instanceOf(ta.tokens[index].tokens[mindex],Token);
                                        });

                                        it("should have id "+gold.tokens[mindex].id, function () {
                                            assert.strictEqual(ta.tokens[index].tokens[mindex].id,gold.tokens[mindex].id)
                                        });

                                        it("should have form "+gold.tokens[mindex].form, function () {
                                            assert.strictEqual(ta.tokens[index].tokens[mindex].form,gold.tokens[mindex].form);
                                        });
                                    });
                                }

                            } else {
                                it("should not be an instance of MultiwordToken", function () {
                                    assert.notInstanceOf(ta.tokens[index],MultiwordToken);
                                });

                                // We do not check the id of MultiwordTokens because it is a computed field,
                                // and this is just meant to test that all id and form values are set properly.
                                it("should have id "+gold.id, function () {
                                    assert.strictEqual(ta.tokens[index].id,gold.id)
                                });
                            }
                        });
                    });
                });
            });
        });
    });

});



