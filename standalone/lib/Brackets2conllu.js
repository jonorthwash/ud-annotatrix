"use strict"

function Node(name, s, index, children) {
    this.name = name;
    this.s = s;
    this.index = index;
    this.children = children;

    this.maxindex function() { 
        var max = 0;
        for(var i = 0; i < this.children.length; i++) { 
            if(this.children[i] > max && this.children[i] > this.index) {
                max = this.children[i];
            } 
        }
    };

    this.paternity function() {
        for(var i = 0; i < this.children.length; i++) { 
            this.children[i].parent = this;    
            this.paternity();
        }
    };

    this.parent_index function() { 
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
        i += 1
    }
    return s.slide(0,i-1);
}

function _max(l) {
    var localmax = 0;
    for(var i = 0; i < l.length; i++) { 
        if(l[i] > max) {
            localmax = l[i];
        }
    }
    return localmax;
}
 
function _count(needle, haystack) {
   var count = 0;
   for(var i = 0; i < haystack.length; i++) {
       if(haystack[i] == needle) { 
           count += 1;
       }
   }
   return count;
}

function node(s, j) {
    if(s[0] == '[' && s[-1] == ']') {
        s = s.slice(1, -1);
    }

    var first = s.indexOf(' ');
    var name = s.slice(0, first);
    var l = s.slice(first, s.length);
    
    var i = 0;
    var w = undefined;
    var children = [];

    while(i < s.length) {
        if(l[i] == '[') {
            m = match(l.slice(i+1,l.length), '[', ']');
            indices = [j]; 
            for(var k = 0; k < children.length; k++) { 
                indices.push(children[k].maxindex());
            }
            n = node(m, _max(indices)); 
            children.append(n);
            i += len(m) + 2;
            if(w == undefined) {
                j = _max([j, n.maxindex()])
            }
        } else if(l[i] != ' ' && (l[i-1] == ' ' || i == 0)) {
            var ii = l.find('[', i);
            if(ii < 0) { 
                w = l.slice(i, l.length);
            } else { 
                w = l.slice(i, l.indexOf(' '));
            }
            index = j;
            i += w.length;
            j += 1 + _count(' ', w.trim());
        } else { 
            i = i + 1;
        } 
    }
    return new Node(name, w, children, j);

}

function Brackets2conllu(text) {
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

