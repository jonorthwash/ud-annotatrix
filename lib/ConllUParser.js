"use strict"


var Sentence = function(text) {
    this.text = text;
    this.tokens = [];
    var lines = text.split("\n");
    $.each(lines, function(i, line) {
        var token = new Token(line);
        this.tokens.push(token);
    })
};


var Token = function(line) {
    this.line = line;   
    line = line.split("\t");
    if (line.length == 10){
        this.id = line[0];
        this.form = line[1];
        this.lemma = line[2];
        this.upostag = line[3];
        this.xpostag = line[4];
        this.feats = line[5];
        this.head = line[6];
        this.deprel = line[7];
        this.deps = line[8];
        this.misc = line[9];
    } else {
        alert("line: " + line + ".\nShould contain 9 elements.");
    };

    this.rebuildLine = function() {
        var allFeatures = [this.id, this.form, this.lemma, this.upostag,
        this.xpostag, this.feats, this.head, this.deprel, this.deps, this.misc];
        this.line = allFeatures.join("\t");
        return this.line;
    }
};


var Tree = function(sent){
    //code
};