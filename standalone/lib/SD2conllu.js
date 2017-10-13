"use strict"

function SD2conllu(text) {
    /* Takes a string in CG, returns a string in conllu. */
    var sent = new conllu.Sentence();
    var inputLines = text.split("\n");
    var comments = "";
//    var comments = "# sent_id = _" + "\n# text = " + inputLines[0];
    var textTokens = inputLines[0].split(" ");

    var tokId = 1;
    var tokens = []; // list of tokens
    var tokenToId = {}; // convert from a token to index
    var tokenCounter = {}; // keep a count of duplicate tokens
    var heads = []; // e.g. heads[1] = 3
    var deprels = []; // e.g. deprels[1] = nsubj

    // first enumerate the tokens 
    for(var i = 0; i < textTokens.length; i++) { 
      tokenToId[textTokens[i]] = tokId;
      tokId = tokId + 1;
    }

    // TODO: This will break if you have two tokens with the same surface form in the same
    // sentence. The right way to deal with that in SDParse is to use indexes in the relations,
    // e.g. 
    // the bear eats the crisps.
    // det(bear, the-1)
    // det(crisps, the-4)
    // nsubj(eats, bear) 
    //
    // In fact, these numbers are optional for all, so det(bear-2, the-1) would also be valid

    // now process the dependency relations
    for(var i = 1; i < inputLines.length; i++) {
      //console.log(inputLines[i]);
      var curLine = inputLines[i];
      
      if(curLine.search(",") < 0) { // root node
        continue; 
      }
      
      var deprel = "";
      var headTok = "";
      var depTok = ""; 
      var state = 0; // 0 = reading deprel, 1 = reading head, 2 = reading dep
      for(var j = 0; j < curLine.length; j++) { // I have a feeling it should be easier to do this
        if(state == 0 && curLine[j] == "(") { 
          state = 1;
          continue;
        }
        if(state == 1 && curLine[j] == ",") { 
          state = 2;
          continue;
        }
        if(state == 2 && curLine[j-1] == "," && curLine[j] == " ") {
          continue;
        }
        if(state == 2 && curLine[j] == ")") { 
          continue;
        }
        if(state == 0) {
          deprel = deprel + curLine[j];
        }else if(state == 1) {
          headTok = headTok + curLine[j];
        }else if(state == 2) {
          depTok = depTok + curLine[j];
        }
      }
      var depId = tokenToId[depTok];
      var headId = tokenToId[headTok];
      if(depTok.search(/-[0-9]+/) > 0) {
        depId = parseInt(depTok.split("-")[1]);
      }
      if(headTok.search(/-[0-9]+/) > 0) {
        headId = parseInt(headTok.split("-")[1]);
      }
      //console.log(depTok + " → " + headTok + " @" + deprel + " | " + tokenToId[depTok] + " : " + tokenToId[headTok] + " // " + depId + "→" + headId);
      heads[depId] = headId;
      deprels[depId] = deprel;
    }


    for(var i = 0; i < textTokens.length; i++) { 
      var newToken = new conllu.Token();
      tokId = i+1;
      newToken["form"] = textTokens[i];
      newToken["id"] = tokId;
      newToken["head"] = heads[tokId];
      newToken["deprel"] = deprels[tokId];
      //console.log('@@@' + newToken["form"] + " " + newToken["id"] + " " + newToken["head"] + " " + newToken["deprel"]);
      tokens.push(newToken); 
    }


    // TODO: automatical recognition of punctuation's POS
    //lines = lines.concat(tokens);

    sent.comments = comments;
    sent.tokens = tokens;
    return sent.serial;        
}

