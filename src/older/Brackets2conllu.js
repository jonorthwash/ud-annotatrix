"use strict"

// This code is for parsing bracketted notation like:
// [root [nsubj I] have [obj [amod [advmod too] many] commitments] [advmod right now] [punct .]]
// Thanks to Nick Howell for help with a Python version.

function Node(name, s, index, children) {
    this.name = name;
    this.s = s;
    this.index = index;
    this.children = children;

    this.maxindex = function() { 
        // Returns the maximum index for the node
        // mx = max([c.index for c in self.children] + [self.index])
        var localmax = 0;
        if(parseInt(this.index) > localmax) {
            localmax = parseInt(this.index);
        }
        for(var i = 0; i < this.children.length; i++) { 
            if(parseInt(this.children[i].index) > localmax) {
                localmax = parseInt(this.children[i].index);
            } 
        }
        //console.log('maxindex: ' + localmax + ' /// this.index: ' + this.index);
        return localmax;
    };

    this.paternity = function() {
        for(var i = 0; i < this.children.length; i++) { 
            this.children[i].parent = this;    
            this.children[i].paternity();
        }
        return this;
    };

    this.parent_index = function() { 
        if(this.parent != undefined) { 
            if(this.parent.index != undefined) {
                return this.parent.index;
            } 
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
    //console.log('match() ' + i + ' | ' + res);
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
    //console.log("_max " + l + " = " + localmax);
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
   //console.log('_count "'+needle+'" in "' + haystack + '" = ' + count);
   return count;
}

function node(s, j) {
    // Parse a bracketted expression 
    // @s = the expression
    // @j = the index we are at
    //console.log('node() ' + s + ' || ' + j);
    if(s[0] == '[' && s[-1] == ']') {
        s = s.slice(1, -1);
    }

    var first = s.indexOf(' '); // first space delimiter
    var name = s.slice(0, first); // dependency relation name
    var l = s.slice(first, s.length); // remainder

    var i = 0; 
    var j; // token id
    var w; // the current word
    var children = []; // current list of children

    // While there is input left
    while(i < l.length) {
        //console.log('@j: ' + j);
        // We're starting a new expression
        if(l[i] == '[') { 
            var m = match(l.slice(i+1,l.length), '[', ']'); 
            var indices = []; 
            indices.push(j);
            for(var k = 0; k < children.length; k++) { 
                indices.push(children[k].maxindex());
            }
            //console.log('>> [ ' + m + ' || ' + indices);
            var n = node(m, _max(indices)); 
            children.push(n);
            i += m.length + 2;
            if(!w) {
                j = _max([j, n.maxindex()])
            }
        } else if(l[i] != ' ' && (l[i-1] == ' ' || i == 0)) {
            var ii = l.indexOf('[', i);
            //console.log('<< ] ' + ii);
            if(ii < 0) { 
                w = l.slice(i, l.length);
            } else { 
                w = l.slice(i, l.indexOf(' ', i));
            }
            i += w.length;
            j = j + 1 + _count(' ', w.trim());
        } else { 
            i = i + 1;
        } 
    }
    var newNode = new Node(name, w, j, children);
    //console.log('%%% newNode: (' + j +') ' + newNode.index + ' ' + newNode.name + ' ' +  newNode.s);
    return newNode;

}

function fillTokens(node, tokens) {
    var newToken = new conllu.Token();
    newToken["form"] = node.s;
    // TODO: automatical recognition of punctuation's POS
    if(newToken["form"].match(/^[!.)(»«:;?¡,"\-><]+$/)) {
      newToken["upostag"] = "PUNCT";
    }
    newToken["id"] = node.index;
    newToken["head"] = node.parent_index();
    newToken["deprel"] = node.name;
    //console.log('@@@ ' + newToken["form"] + " " + newToken["id"] + " " + newToken["head"] + " " + newToken["deprel"]);
    tokens.push(newToken); 

    for(var i = 0; i < node.children.length; i++) {
        tokens = fillTokens(node.children[i], tokens);
    }
 
    return tokens;
}

function Brackets2conllu(text) {
    /* Takes a string in bracket notation, returns a string in conllu. */
    //console.log('Brackets2conllu() ' + text);
    var sent = new conllu.Sentence();
    var inputLines = text.split("\n");
    var comments = "";

    var tokens = []; // list of tokens
    var root = node(inputLines[0], 0); 

    root.paternity();
    tokens = fillTokens(root, tokens); 

    //console.log('||| ' + tokens);

    sent.comments = comments;
    sent.tokens = tokens;
    return sent.serial;        
}
