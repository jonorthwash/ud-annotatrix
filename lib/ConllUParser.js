"use strict"


var Sentence = function(text) {
    this.text = text;
    this.tokens = [];
    var lines = text.split("\n");
    $.each(lines, function(i, line) {
        var token = new Token(line, i)
        this.tokens.push(token)
    })
};


var Token = function(line, i) {
    this.line = line;    
    line = line.split("\t");
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
    this.lineidx = lineidx; 
};


var Tree = function(sent){
    //code
};