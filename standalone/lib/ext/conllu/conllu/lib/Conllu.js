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
