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

