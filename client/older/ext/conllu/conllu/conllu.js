require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// if using Node.js export module
if (typeof exports !== 'undefined' && this.exports !== exports) {
    var Sentence = require("./Sentence.js").Sentence;
    var MultiwordToken = require("./MultiwordToken.js").MultiwordToken;
}
/**
 * Conllu
 * A Conllu represents the contents of a Conllu file.
 * It is, in essence, a list of the sentences found in the file.
 * 
 * @constructor
 */
var Conllu = function() {
    this.sentences = [];
};

Conllu.prototype = {


    splitSentence : function (sentence_index, token_id) {

        for (var i = 0; i < this.sentences.length; i++) {

            if (i === sentence_index) {
                var newSentence = new Sentence;
                currentId = 0;
                newId = 1;
                removeIds = [];
                for (var j = token_id; j < this.sentences[i].tokens.length; j++) {
                    if (!(this.sentences[i].tokens[j] instanceof MultiwordToken)) {
                        newSentence.tokens.push(this.sentences[i].tokens[j]);
                        newSentence.tokens[currentId].id = newId;
                        newId = newId + 1;
                        currentId = currentId + 1;
                        removeIds.push(j)
                    } else {
                        newSentence.tokens.push(this.sentences[i].tokens[j]);
                        newSentence.tokens[currentId].tokens.forEach (function (child) {
                            child.id = newId;
                            newId = newId + 1;
                            removeIds.push(j);
                        });
                        currentId = currentId + 1
                    }
                }
                for (var h = removeIds.length-1; h >= 0; h--) {
                    var id = removeIds[h];
                    this.sentences[i].tokens.splice(id,1);
                }
            }
        }
        this.sentences.splice(sentence_index+1, 0, newSentence);
    },


    mergeSentence : function (sentence_index) {
        var sentence = this.sentences[sentence_index];

        // remove each token from the next sentence and push it to the previous sentence
        while (this.sentences[sentence_index + 1].tokens[0] !== undefined){ // when the first item of the second sentence is not a token, iteration must end
            var current = this.sentences[sentence_index+1].tokens.shift();
            this.sentences[sentence_index].tokens.push(current);
        }

        // remove the old sentence object
        this.sentences.splice(sentence_index+1, 1);

        // update token id's and multiword token id's from 1 till end of merged sentence
        var id = 0;
        for (var x in this.sentences[sentence_index].tokens){
            var word = this.sentences[sentence_index].tokens[x];

            //if the token is a normal Token
            if (!(word instanceof MultiwordToken)){
                id++;
                word.id = id;
            }

            //if the token is a multi word token
            else {
                for (var subtoken in word.tokens){
                    id++;
                    word.tokens[subtoken].id = id;
                }
            }
        }
    }
};




/**
 * serial 
 * The serial property is the string representation of the file.
 * The contents of the Conllu object may be updated by modifying this string. However, for better
 * performance, it is recommended to modify the object itself.
 * @type {String}
 */

Object.defineProperty(Conllu.prototype,'serial',
    {
        get: function() {
            var serialArray = [];

            for (var i= 0; i < this.sentences.length; i++) {
                serialArray.push(this.sentences[i].serial);
            }

            return serialArray.join("\n");


        },
        set: function(arg) {
            var lines = arg.split("\n"); //splits input text on newline
            var sent = []; //creates dummy sentence array

            for (var i = 0; i < lines.length; i ++){
                if (lines[i] === ""){ //flags empty lines as end of sentence
                    sent.push(lines[i]); //add empty line to dummy sentence array
                    var sentCat = sent.join("\n"); //join dummy sentence array on newline
                    var setSentence = new Sentence();
                    setSentence.serial = sentCat; //set sentence serial property to joined dummy sentence
                    this.sentences.push(setSentence); //add this sentence to conllu sentences array
                    sent = []
                } else {
                    sent.push(lines[i]); //adds all lines before empty line to dummy sentence array
                }
            }
        }

    }
);

// if using Node.js export module
if (typeof exports !== 'undefined' && this.exports !== exports) {
    exports.Conllu = Conllu;
}

},{"./MultiwordToken.js":2,"./Sentence.js":3}],2:[function(require,module,exports){

// if using Node.js export module
if (typeof exports !== 'undefined' && this.exports !== exports) {
    var Token = require("./Token.js").Token;
    var TokenAggregate = require("./TokenAggregate.js").TokenAggregate;
}

/**
 * A MultiwordToken is any token which consists of subtokens
 * For example, a MultiwordToken may represent the following lines in a Conllu file:
 *
 * 2-3  haven't ...
 * 2    have    ...
 * 3    n't     ...
 *
 * @property tokens {Array}
 * The tokens property is the list of subtokens this MultiwordToken is responsible for.
 *
 * @extends Token
 * @inherits TokenAggregate
 *
 * @constructor
 */
var MultiwordToken = function() {
    //constructor for Multi-word Tokens
    Token.call(this); // gives the MWT all the properties created in the Token constructor (note: not token prototype)
    this.tokens = []; // creates the array that contains the children of the MWT
    TokenAggregate.call(this,'tokens'); //gives the MWT all the properties created in the Token Aggregate constructor
};
MultiwordToken.prototype = new Token(); // gives new instance of MWT the properties of a new instance of Token

/**
 * The id in a MultiwordToken is based on the MultiwordToken's subtokens.
 * The id will be: smallestid-largestid
 * The id cannot be updated here.
 * @type {String}
 */
Object.defineProperty(MultiwordToken.prototype,'id',{
    get: function() {
        if (this.tokens.length < 1){
            return "?-?"; // if the multi-word token doesn't have any children (length of sub-array tokens is 0), alert. Do not allow to save.
        }
        var first = this.tokens[0]; // id of first child
        var last = this.tokens[this.tokens.length-1]; // id of last child
        id = first.id + "-" + last.id; // assign mwt id to be "smallestID-largestID"
        return String(id); //return in string version
    },

    set: function(value) { // does nothing
    }
});

Object.defineProperty(MultiwordToken.prototype,'serial',{
    get: function() {
        // get annotated multi word token into conllu string form

        var finalString = "";

        // handle apostrophes inside the token
        var parentForm = this.form;
        if (parentForm.includes("'")){
            parentForm = parentForm.replace("'", "\'")
        }

        // Find the serial property from the Token object, and use that to serialize the MWT line
        var parentSerialGetter = Object.getOwnPropertyDescriptor(Token.prototype,'serial');
        var parentMWT = parentSerialGetter.get.call(this);

        finalString = finalString + parentMWT; // add parent mwt to the final conllu format string for the text

        for (word in this.tokens){
            finalString = finalString + "\n" + this.tokens[word].serial;// iteratively add each child to the final string.
        }

        return finalString;
    },

    set: function(mwtString) {
        // set multi word token string to modifiable form

        // Split the initial string into separate lines as would be found in Conllu format
        var mwtLines = mwtString.split("\n");

        // First item in array (first line) turned into mwt "parent"
        // Find the serial property from the Token object, and use that to serialize the MWT line
        var parentSerialSetter = Object.getOwnPropertyDescriptor(Token.prototype,'serial');
        parentSerialSetter.set.call(this, mwtLines[0]);

        this.tokens = []; //ensure the subtokens array is clear

        // Iterate over the subtokens and set them using the existing Token setter. Push them to subtokens array.
        for (i = 1; i < mwtLines.length; i++){
            var subToken = new Token();
            subToken.serial = mwtLines[i];
            this.tokens.push(subToken);
        }
    }
});


// if using Node.js export module
if (typeof exports !== 'undefined' && this.exports !== exports) {
    exports.MultiwordToken = MultiwordToken;
}

},{"./Token.js":4,"./TokenAggregate.js":5}],3:[function(require,module,exports){
// if using Node.js export module
if (typeof exports !== 'undefined' && this.exports !== exports) {
    var Token = require("./Token.js").Token;
    var MultiwordToken = require("./MultiwordToken.js").MultiwordToken;
    var TokenAggregate = require("./TokenAggregate.js").TokenAggregate;

}
/**
 * A Sentence is a collection of comments, Tokens, and MultiwordTokens representing a sentence within a Conllu file.
 * For example, a Sentence may represent the following lines in a file:
 *
 * # sent_id 2
 * # ...
 * 1	I	I	PRON	PRP	Case=Nom|Number=Sing|Person=1	2	nsubj	_	_
 * 2-3	haven't	_	_	_	_	_	_	_	_
 * 2	have	have	VERB	VBP	Number=Sing|Person=1|Tense=Pres	0	root	_	_
 * 3	not	not	PART	RB	Negative=Neg	2	neg	_	_
 * 4	a	a	DET	DT	Definite=Ind|PronType=Art	4	det	_	_
 * 5	clue	clue	NOUN	NN	Number=Sing	2	dobj	_	SpaceAfter=No
 * 6	.	.	PUNCT	.	_	2	punct	_	_
 * 
 * @property comments {Array}
 * The comments property maintains an ordered list of all comments
 * 
 * @property tokens {Array}
 * The tokens property maintains an ordered list of all Tokens and Multiword tokens. 
 * In the example given above, a single MultiwordToken would be responsible for lines starting with ids 1-2, 2, and 3
 * 
 * @constructor
 */
var Sentence = function() {
    /**
     * comments should be an ordered list of strings representing the comments of this sentence.
     * The strings should not include the initial '#' character - only the content of the comment.
     * @type {Array}
     */
    this.comments = [];
    
    /**
     * tokens should be an ordered list of tokens and multiword tokens.
     * We will rely on the ordering of this list to display the tokens in the correct order - not the ids
     * of the tokens. Note, however, that the ids of the tokens/multiwordtokens and subtokens should be
     * maintained by the sentence.
     * @type {Array}
     */
    this.tokens = [];

    TokenAggregate.call(this,'tokens');
};

Sentence.prototype = {

    expand : function (token_id, index) {
        var found = false;
        for (var i=0; i < this.tokens.length; i++) {
            if (found === true) {

                if (!(this.tokens[i] instanceof MultiwordToken)) {
                    this.tokens[i].id++; //increases id's by 1 after expansion
                    //console.log(this.tokens[i]);
                }
                else {

                    this.tokens[i].tokens.forEach(function (child) {
                        child.id++; //updates the id's of the children in every multi-word token.
                        //the parent in a multi-word token updates automatically based on the children.
                    });
                }
            }
            else if (this.tokens[i].id === token_id && !(this.tokens[i] instanceof MultiwordToken)) {
                var initial = new Token(); //variable to store first half of expanded token
                var second = new Token(); //variable to store second half of expanded token
                var expandToken = new MultiwordToken(); //create new instance of mwt for expanded token//

                expandToken.form = this.tokens[i].form; // only duplicate form; id depends on id's of sub-tokens; other properties should be undefined
                initial.form = this.tokens[i].form.slice(0, index);
                initial.id = this.tokens[i].id; //update id of first sub-token
                second.form = this.tokens[i].form.slice(index);
                second.id = Number(this.tokens[i].id) + 1; //update id of second sub-token
                expandToken.tokens.push(initial);
                expandToken.tokens.push(second);
                this.tokens.splice((i), 1, expandToken);// inserts new word at the correct index in the array, removes original token
                //note: all information stored in initial token is lost. To be confirmed.
                found = true;
                //console.log(this.tokens[1]);
            }

        }
    },

    collapse: function(token_id) {

        var found = false;
        for (var i=0; i < this.tokens.length; i++) {

            if (found === true) {
                if (!(this.tokens[i] instanceof MultiwordToken)) {
                    this.tokens[i].id = Number(this.tokens[i].id - (mwt_length-1)); //updates the id's of every token after collapse
                    //note: also valid if mwt has more than 2 sub-tokens
                }
                else {
                    this.tokens[i].tokens.forEach(function (child) {
                        child.id = Number(child.id - (mwt_length-1));//updates the id's of the children in every multi-word token.
                        //the parent in a multi-word token updates automatically based on the children.
                    });
                }
            }
            else if (this.tokens[i].id === token_id) { // note: must be a string, since the id of a mwt is a string
                if (this.tokens[i] instanceof MultiwordToken) { //collapse only applies to mwt
                    var mwt_length = this.tokens[i].tokens.length;// find the length of the mwt sub-tokens array, for updating other values
                    var collapsed = new Token(); // note: is not a mwt
                    //collapsed.id = Number(this.tokens[i].id.slice(0,1)); // wouldn't work for mwt token 34-35, for example.
                    collapsed.id = Number(this.tokens[i].tokens[0].id);// token "collapsed" can be assigned an id: takes the id of the first child of the mwt
                    collapsed.form = this.tokens[i].form;
                    this.tokens.splice((i), 1, collapsed);
                    found = true;
                }
                //if this.tokens[i] isn't an instance of a MultiwordToken, do nothing.
            }
        }
    },
    splitComment: function (comment_index, character_index) { //new comment line from splitting point
        for (var i = 0; i < this.comments.length; i ++) {
            if (i === comment_index) {
                var newComment = this.comments[i].slice(character_index);
                this.comments[i] = this.comments[i].slice(0, character_index)
                this.comments.splice((i + 1), 0, newComment)
            }
        }
    },

    mergeComment: function (comment_index) { //removes comment at index 0 from comments array
        this.comments[comment_index] = this.comments[comment_index] + this.comments[comment_index+1];
        this.comments.splice(comment_index+1, 1);

    }

};

Object.defineProperty(Sentence.prototype,'serial',
    {
        get: function () {

            var serialArray = [];

            for (var i = 0; i < this.comments.length; i++) {
                serialArray.push("#" + this.comments[i]);

            }

            for (var i = 0; i < this.tokens.length; i++) {
                serialArray.push(this.tokens[i].serial);
            }
            serialArray.push(""); //add empty string for line break after sentence
            return serialArray.join("\n");
        },
        set: function (arg) {
            this.comments = [];
            this.tokens = [];
            var lines = arg.split("\n");
            for (var i = 0; i < lines.length; i++) { //identify comments in string & add to comments array
                if (lines[i].startsWith("\#")) {
                    this.comments.push(lines[i]);
                    this.comments[i] = this.comments[i].substring(1);
                }
            }

            var mwtSubIds = [];
            for (var i = 0; i < lines.length; i++){
                var fields = [];
                fields = lines[i].split("\t"); //split into subfields to identify mwt ids
                var currentLineId = fields[0];
                if (!(lines[i].startsWith("\#")) && !(lines[i] === '')) { //find non-comments/non-empty lines
                    var mwtId = null;
                    if (fields[0].includes("-")){
                        mwtString = lines[i] + "\n";
                        mwtId = fields[0];
                        dashIndex = fields[0].indexOf("-");
                        var first = Number(mwtId.slice(0, dashIndex)); //everything before/after slash
                        var last = Number(mwtId.slice(dashIndex+1));
                        var span = [];
                        while(first <= last) {
                            span.push(Number(first++)); //get span of mwt ids to match all mwt subtoken ids
                        }
                        mwtSubIds = span.map(function(id){
                            return id
                        });
                        span = span.map(String);
                        for (var j = 0; j < lines.length; j++) { //add all subtokens to mwt string
                            var innerFields = [];
                            innerFields = lines[j].split("\t");
                            for (var x = 0; x < span.length; x++){
                                if (span[x] === innerFields[0]){
                                    mwtString = mwtString + (lines[j] + "\n");
                                }
                            }
                        }
                        mwtString = mwtString.substring(0, mwtString.length - 1);
                        var setMwt = new MultiwordToken();
                        setMwt.serial = mwtString;//serialize mwt string
                        this.tokens.push(setMwt);

                    } else if (mwtSubIds.indexOf(Number(currentLineId)) === -1) {

                            var setToken = new Token();
                            setToken.serial = lines[i];
                            this.tokens.push(setToken);
                    }
            }

            }
        }
    }
);
// if using Node.js export module
if (typeof exports !== 'undefined' && this.exports !== exports) {
    exports.Sentence = Sentence;
}
},{"./MultiwordToken.js":2,"./Token.js":4,"./TokenAggregate.js":5}],4:[function(require,module,exports){
/**
 * A Token represents a single token represented in a Conllu file
 * For example, a Token may represent the following line:
 *
 * 1	I	I	PRON	PRP	Case=Nom|Number=Sing|Person=1	2	nsubj	_	_
 *
 * @constructor
 */
var Token = function() {};

Token.prototype = {
    // note: id is generally managed by Sentence
    id: undefined,
    form: '',
    lemma: undefined,
    upostag: undefined,
    xpostag: undefined,
    feats: undefined,
    head: undefined,
    deprel: undefined,
    deps: undefined,
    misc: undefined
};

Object.defineProperty(Token.prototype,'serial',
    {
        get: function() {
            // takes this token object and returns a string
            // no iteration through the properties of the object, because of non-conllu properties (ex: "serialize" property)
            var id_output = "_";
            if (!(this.id === undefined) && !(this.id === "")){
                id_output = String(this.id);
            }

            var form_output = "_";
            if (!(this.id === undefined) && !(this.id === "")){
                form_output = String(this.form);
            }

            var lemma_output = "_";
            if (!(this.lemma === undefined) && !(this.lemma === "")){
                lemma_output = String(this.lemma);
            }

            var upostag_output = "_";
            if (!(this.upostag === undefined) && !(this.upostag === "")){
                upostag_output = String(this.upostag);
            }

            var xpostag_output = "_";
            if (!(this.xpostag === undefined) && !(this.xpostag === "")){
                xpostag_output = String(this.xpostag);
            }

            var feats_output = "_";
            if (!(this.feats === undefined) && !(this.feats === "")){
                feats_output = String(this.feats);
            }

            var head_output = "_";
            if (!(this.head === undefined) && !(this.head === "")){
                head_output = String(this.head);
            }

            var deprel_output = "_";
            if (!(this.deprel === undefined) && !(this.deprel === "")){
                deprel_output = String(this.deprel);
            }

            var deps_output = "_";
            if (!(this.deps === undefined) && !(this.deps === "")){
                deps_output = String(this.deps);
            }

            var misc_output = "_";
            if (!(this.misc === undefined) && !(this.misc === "")){
                misc_output = String(this.misc);
            }

            return (id_output + "\t" + form_output + "\t" + lemma_output + "\t" + upostag_output + "\t" + xpostag_output + "\t" + feats_output + "\t" + head_output + "\t" + deprel_output + "\t" + deps_output + "\t" +  misc_output);
        },

        set: function(arg) {
            //takes a string and sets this object's value to match the string.

            var fields = arg.split("\t");

            this.id = Number(fields[0]);
            if (this.id === "_")
                this.id = undefined;

            this.form = fields[1];
            if (this.form === "_")
                this.form = undefined;

            this.lemma = fields[2];
            if (this.lemma === "_")
                this.lemma = undefined;

            this.upostag = fields[3];
            if (this.upostag === "_")
                this.upostag = undefined;

            this.xpostag = fields[4];
            if (this.xpostag === "_")
                this.xpostag = undefined;

            this.feats = fields[5];
            if (this.feats === "_")
                this.feats = undefined;

            this.head = fields[6];
            if (this.head === "_")
                this.head = undefined;

            this.deprel = fields[7];
            if (this.deprel === "_")
                this.deprel = undefined;

            this.deps = fields[8];
            if (this.deps === "_")
                this.deps = undefined;

            this.misc = fields[9];
            if (this.misc === "_")
                this.misc = undefined;
        }
    }
);


// if using Node.js export module
if (typeof exports !== 'undefined' && this.exports !== exports) {
    exports.Token = Token;
}


},{}],5:[function(require,module,exports){

// if using Node.js export module
if (typeof exports !== 'undefined' && this.exports !== exports) {
    var Token = require("./Token.js").Token;
    var MultiwordToken = require("./MultiwordToken.js").MultiwordToken;

}
/**
 * A TokenAggregate is responsible to managing a collection of Tokens.
 * Specifically, it provides utilities for splitting and merging Tokens in an ordered list.
 * 
 * This function is meant to be called on an existing object in order to give it TokenAggregate capabilities.
 * The name of the property containing the Token list is given in the constructor, enabling us to use this 
 * functionality on any object containing a Token list, regardless of the name of that list.
 * 
 * For example:
 * 
 * var obj = { tokens: [{id: 1, form: 'token1'}, {id: 2, form:'token2'}] };
 * TokenAggregate.call(obj,'tokens');
 * obj.split(1,3);
 * obj.merge(1);  
 * 
 * @param token_array
 * @constructor
 */
var TokenAggregate = function(token_array) {
    // Note: access the token array using: this[token_array] (instead of this.token_array)

    /**
     * split splits a token into two tokens.
     * This function finds the token with the given id, and splits it at that index.
     * For example, if we have tokens [{id: 1, form: 'token1'}, {id: 2, form:'token2'}],
     * calling split(1,2) would result in [{id: 1, form: 'to'},{id: 2, form:'ken1'}, {id: 3, form:'token2'}]
     * @param token_id
     * @param string_index
     */
    this.split = function(token_id, string_index) {
        var found = false;
        for (var x=0; x< this[token_array].length; x++) {
            if (found === true) {
                var MultiwordToken = require("../lib/MultiwordToken.js").MultiwordToken; //TODO: figure out how to move this
                if (!(this[token_array][x] instanceof MultiwordToken)) {
                    this[token_array][x].id++; //gives cheeky +1 to the id's coming after the split. Makes space for our split (at least in id domain)
                }
                else {
                    this[token_array][x].tokens.forEach(function (child) {
                        child.id++; //updates the id's of the children in every multi-word token.
                        //the parent in a multi-word token updates automatically based on the children.
                    });
                }
            }
            else if (this[token_array][x].id === token_id) {
                var splitter = this[token_array][x];//find the splitter who is at the given token_id & assign to variable
                var word = new Token(); // makes the new word an instance of Token

                // updates new word's id
                if (String(token_id).includes("-")){ // if the given token is a MWT parent (of the form "2-3")
                    word.id = (splitter.tokens[splitter.tokens.length-1].id); // give the new word the index of the last sub-token (what about + 1 ??)
                }
                else { // if the given token is a normal token
                    word.id = token_id; // why not +1?? Was like this already and seems to work...
                }

                //updates new word's form and splitter's form, and inserts new word into array
                word.form = splitter.form.slice(string_index);
                splitter.form = splitter.form.slice(0, string_index);
                this[token_array].splice((x + 1), 0, word);// inserts new word at the correct index in the array

                found = true;
            } else {
                var MultiwordToken = require("../lib/MultiwordToken.js").MultiwordToken; //TODO: figure out how to move this
                if (this[token_array][x] instanceof MultiwordToken) {
                    var prev_length = this[token_array][x].tokens.length;
                    this[token_array][x].split(token_id, string_index);
                    if(prev_length !== this[token_array][x].tokens.length) {
                        found = true;
                    }
                }
            }
        }
    };



    /**
     * merge removes the next word and links it to the current word.
     * For example, if we have [{id: 1, form: 'to'},{id: 2, form:'ken1'}, {id: 3, form:'token2'}]
     * calling merge(1) would result in [{id:1, form: 'token1'}, {id: 2, form:'token2'}]
     * @param token_id
     */
    this.merge = function(token_id) {
        found = false;
        for (var x in this[token_array]) {
            if (found === true) {
                var MultiwordToken = require("../lib/MultiwordToken.js").MultiwordToken; //TODO: figure out how to move this
                if (!(this[token_array][x] instanceof MultiwordToken)) {
                    this[token_array][x].id = this[token_array][x].id - 1; //updates the id's of every token after the merge
                }
                else {
                    this[token_array][x].tokens.forEach(function (child) {
                        child.id = child.id - 1; //updates the id's of the children in every multi-word token.
                        //the parent in a multi-word token updates automatically based on the children.
                    });
                }
            }
            else if (this[token_array][x].id === token_id) {
                var merger = this[token_array][x];
                var gone = this[token_array][Number(x) + 1];
                merger.form = merger.form + gone.form;
                this[token_array].splice((Number(x) + 1), 1);
                found = true;
            }else {
                var MultiwordToken = require("../lib/MultiwordToken.js").MultiwordToken; //TODO: figure out how to move this
                if (this[token_array][x] instanceof MultiwordToken) {
                    var prev_length = this[token_array][x].tokens.length;
                    this[token_array][x].merge(token_id);
                    if(prev_length !== this[token_array][x].tokens.length) {
                        found = true;
                    }
                }
            }
        }
    };
};


// if using Node.js export module
if (typeof exports !== 'undefined' && this.exports !== exports) {
    exports.TokenAggregate = TokenAggregate;
}

},{"../lib/MultiwordToken.js":2,"./MultiwordToken.js":2,"./Token.js":4}],"conllu":[function(require,module,exports){
exports.Conllu = require('./lib/Conllu.js').Conllu;
exports.MultiwordToken = require('./lib/MultiwordToken.js').MultiwordToken;
exports.Sentence = require('./lib/Sentence.js').Sentence;
exports.Token = require('./lib/Token.js').Token;


},{"./lib/Conllu.js":1,"./lib/MultiwordToken.js":2,"./lib/Sentence.js":3,"./lib/Token.js":4}]},{},[]);
