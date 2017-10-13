"use strict"

function CG2conllu(CGtext) {
    /* Takes a string in CG, returns a string in conllu. */

    if (ambiguetyPresent(CGtext)) { // to abort conversion if there are ambiguous analyses
        return;
    }
    // remove extra spaces before newline before processing text
    CGtext = CGtext.replace(/ +\n/, '\n');
    var sent = new conllu.Sentence();
    var comments = findComments(CGtext);
    sent.comments = comments;
    var tokens = formTokens(CGtext);
    sent.tokens = tokens;
    return sent.serial;        
}


function findComments(CGtext) {
    /* Takes a string in CG, returns 2 arrays with strings. */
    var lines = CGtext.split("\n");
    var comments = [];
    $.each(lines, function(n, line) {
        if (line[0] == "#") {
            line = line.replace(/^#+/, "");
            comments.push(line);
        }
    });
    return comments;
}


function ambiguetyPresent(CGtext) {
    var lines = CGtext.split(/"<(.*)>"/);

    // suppose the indent is consistent troughout the sentence
    for (var i = 2; i < lines.length; i += 2) {
        var indent = lines[i].replace("\n", "").split(/[^\s]/)[0];
        var ana = lines[i].trim(); 
        if (ana.includes(indent) && !ana.includes(indent + indent)) {
            // console.log(lines[i]);
            return true;
        }
    }
    return false;
}


function formTokens(CGtext) {

    // i use the presupposition that there are no ambiguous readings,
    // because i've aboted conversion of ambiguous sentences in ambiguetyPresent
    var tokens = [];
    var lines = CGtext.split(/"<(.*)>"/).slice(1);
    var tokId = 1;
    $.each(lines, function(n, line) {
        if (n % 2 == 1) {
            var form = lines[n - 1];
            line = line.replace(/^\n?;?( +|\t)/, "");
            if (!line.match(/(  |\t)/)) {
                var token = getAnalyses(line, {"form": form, "id": tokId});
                tokens.push(formNewToken(token));
                tokId ++;
            } else {
                var subtokens = line.trim().split("\n");
                var supertoken = formSupertoken(subtokens, form, tokId);
                tokens.push(supertoken);
                tokId += subtokens.length;
            }
        }
    })
    return tokens;
}


function getAnalyses(line, analyses) {
    // first replace space (0020) with · for lemmas and forms containing
    // whitespace, so that the parser doesn't get confused.
    var quoted = line.replace(/.*(".*?").*/, '$1');
    var forSubst = quoted.replace(/ /g, "·");
    var gram = line.replace(/".*"/, forSubst);

    gram = gram.replace(/[\n\t]+/, "").trim().split(" "); // then split on space and iterate
    $.each(gram, function(n, ana) { 
        if (ana.match(/"[^<>]*"/)) {
            analyses.lemma = ana.replace(/"([^<>]*)"/, '$1');
        } else if (ana.match(/#[0-9]+->[0-9]+/)) {
            analyses.head = ana.replace(/#([0-9]+)->([0-9]+)/, '$2').trim();
        } else if (ana.match(/#[0-9]+->/)) {
            // pass
        } else if (ana.match(/@[a-z:]+/)) {
            analyses.deprel = ana.replace(/@([a-z:]+)/, '$1');
        } else if (n < 2) {
            analyses.upostag = ana; // TODO: what about xpostag?
        } else {
            // saving other data
            if (!analyses.feats) {
                analyses.feats = ana;
            } else {
                analyses.feats += "|" + ana;
            }
        }
    })
    return analyses;
}


function formNewToken(attrs) {
    /* Takes a dictionary of attributes. Creates a new token, assigns
    values to the attributes given. Returns the new token. */

    var newToken = new conllu.Token();
    $.each(attrs, function(attr, val){
        newToken[attr] = val;
    });
    return newToken;
}


function formSupertoken(subtokens, form, tokId) {
    var sup = new conllu.MultiwordToken();
    sup.form = form;

    $.each(subtokens, function(n, tok) {
        var newTok = getAnalyses(tok, {"id": tokId, "form": "_"});
        sup.tokens.push(formNewToken(newTok));
        tokId ++;
    })
    return sup;
}


function conllu2CG(conlluText, indent) {
    var sent = new conllu.Sentence();
    sent.serial = conlluText;
    if (indent == undefined) {
        var indent = "\t";
    }

    var CGtext = (sent.comments.length) ? "#" + sent.comments.join("\n#") : "";

    $.each(sent.tokens, function(i, tok) {

        var form = (tok.form) ? ('\n"<' + tok.form + '>"\n') : '';
        CGtext += form;
        if (tok.tokens == undefined) {
            CGtext += indent + newCgAna(i, tok);
        } else {
            var anas = [];
            $.each(tok.tokens, function(j, subtok) {
                 anas.push(indent.repeat(j + 1) + newCgAna(j, subtok));
            })
            CGtext += anas.join("\n");
        }
    })

    return CGtext.trim();
}


function newCgAna(i, tok) {
    var lemma = (tok.lemma) ? ('"' + tok.lemma + '"') : '';
    var pos = (tok.upostag) ? tok.upostag : tok.xpostag;
    if (pos == undefined) { pos = "_" };
    var feats = (tok.feats) ? " " + tok.feats.replace(/\|/g, " ") : '';
    var deprel = (tok.deprel) ? " @" + tok.deprel : " @x"; // is it really what we want by default?
    var head = (tok.head) ? tok.head : '';
    var cgToken = lemma + " " + pos + feats + deprel + " #" + tok.id + "->" + head;
    return cgToken;
}
