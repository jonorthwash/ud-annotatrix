"use strict"

// This code is for parsing bracketted notation like:
// [root [nsubj I] have [obj [amod [advmod too] many] commitments] [advmod right now] [punct .]]

function Node(name, s, index, children) {
    this.name = name;
    this.s = s;
    this.index = index;
    this.children = children;

    this.maxindex = function() { 
        var localmax = 0;
        for(var i = 0; i < this.children.length; i++) { 
            if(this.children[i] > localmax && this.children[i] > this.index) {
                localmax = this.children[i];
            } 
        }
        return localmax;
    };

    this.paternity = function() {
        for(var i = 0; i < this.children.length; i++) { 
            this.children[i].parent = this;    
            this.paternity();
        }
    };

    this.parent_index = function() { 
        if(this.parent.index != undefined) {
            return this.parent.index;
        } 
        return 0;
    };

}

function match(s, up, down) {
    var depth = 0;
    var i = 0;
    while(i < s.length && depth >= 0) {
        if(s[i] == up) {
            depth += 1;
        }
        if(s[i] == down) {
            depth -= 1;
        }
        i += 1;
    }
    var res = s.slice(0, i-1);
    console.log('match() ' + i + ' | ' + res);
    return s.slice(0,i-1);
}

function _max(l) {
    // Return the largest number in a list otherwise return 0
    // @l = the list to search in
    var localmax = 0;
    for(var i = 0; i < l.length; i++) { 
        if(l[i] > localmax) {
            localmax = l[i];
        }
    }
    return localmax;
}
 
function _count(needle, haystack) {
   // Return the number of times you see needle in the haystack
   // @needle = string to search for
   // @haystack = string to search in
   var count = 0;
   for(var i = 0; i < haystack.length; i++) {
       if(haystack[i] == needle) { 
           count += 1;
       }
   }
   return count;
}

function node(s, j) {
    // Parse a bracketted expression 
    // @s = the expression
    // @j = the index we are at
    console.log('node() ' + s + ' || ' + j);
    if(s[0] == '[' && s[-1] == ']') {
        s = s.slice(1, -1);
    }

    var first = s.indexOf(' '); // first space delimiter
    var name = s.slice(0, first); // dependency relation name
    var l = s.slice(first, s.length); // remainder

    console.log('@name = ' + name + ' || remain:' +  l);
    
    var i = 0;
    var w = undefined;
    var children = [];

    while(i < l.length) {
        console.log('! ' + l.length + ' !! l[' + i + '] = ' + l[i]);
        if(l[i] == '[') {
            var m = match(l.slice(i+1,l.length), '[', ']');
            var indices = [j]; 
            for(var k = 0; k < children.length; k++) { 
                indices.push(children[k].maxindex());
            }
            console.log('!! [ ' + m + ' || ' + indices);
            var n = node(m, _max(indices)); 
            children.push(n);
            i += m.length + 2;
            if(w == undefined) {
                j = _max([j, n.maxindex()])
            }
        } else if(l[i] != ' ' && (l[i-1] == ' ' || i == 0)) {
            var ii = l.indexOf('[', i);
            console.log('!! ] ' + ii);
            if(ii < 0) { 
                w = l.slice(i, l.length);
            } else { 
                w = l.slice(i, l.indexOf(' ', i));
            }
            var index = j;
            i += w.length;
            j += 1 + _count(' ', w.trim());
        } else { 
            console.log('!! * ' + i + ' ' + l[i]);
            i = i + 1;
        } 
    }
    var newNode = new Node(name, w, j, children);
    console.log('newNode: ' + newNode.index + ' ' + newNode.name + ' ' +  newNode.s);
    return newNode;

}

function Brackets2conllu(text) {
    console.log('Brackets2conllu() ' + text);
    /* Takes a string in bracket notation, returns a string in conllu. */
    var sent = new conllu.Sentence();
    var inputLines = text.split("\n");
    var comments = "";

    var tokId = 1;
    var tokens = []; // list of tokens
    var tokenToId = {}; // convert from a token to index
    var tokenCounter = {}; // keep a count of duplicate tokens
    var heads = []; // e.g. heads[1] = 3
    var deprels = []; // e.g. deprels[1] = nsubj

    var tree = node(inputLines[0], 0); 

    console.log(tree.children[0]);

    for(var i = 0; i < textTokens.length; i++) { 
      var newToken = new conllu.Token();
      tokId = i+1;
      newToken["form"] = textTokens[i];
      // TODO: automatical recognition of punctuation's POS
      if(textTokens[i].match(/\W/)) {
        newToken["upostag"] = "PUNCT";
      }
      newToken["id"] = tokId;
      newToken["head"] = heads[tokId];
      newToken["deprel"] = deprels[tokId];
      //console.log('@@@' + newToken["form"] + " " + newToken["id"] + " " + newToken["head"] + " " + newToken["deprel"]);
      tokens.push(newToken); 
    }

    sent.comments = comments;
    sent.tokens = tokens;
    return sent.serial;        
}
