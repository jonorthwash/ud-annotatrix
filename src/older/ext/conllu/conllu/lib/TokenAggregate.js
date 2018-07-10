
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
