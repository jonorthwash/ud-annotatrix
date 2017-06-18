function cgParse(content) {
	content = content.trim('\n');
	var outtokens = [];
	var tuples = [];
	var lines = content.split("\n");
	var lemmaFound = false ;
	$.each(lines, function(n, line) {

			// first replace space (0020) with ·
			//    for lemmas and forms containing whitespace.
			//    otherwise, SD parser gets confused
			//    (with ANY type of spacing character, it seems).
			//    then, split on space
		if (line.match(/".*? .*?"/)) {
			quoted = line.replace(/.*(".*?").*/, '$1');
			forSubst = quoted.replace(/ /g, "·");
			var tokens = line.replace(/".*"/, forSubst).split(" ");
		} else {
			var tokens = line.split(" ");
		}

		var relFrom ;
		var relTo ;
		var relName ;
		var posTag = false ;
		$.each(tokens, function(n, token) {
			if (n == 0 && token.match(/"<.*>"/)) {
				lemmaFound = false ;
				outtokens.push(token.replace(/"<(.*)>"/, '$1'));
			}
			else if (lemmaFound && token.match(/"[^<>]*"/)) {
				//alert(lemmaFound);
				outtokens.push(token.replace(/"([^<>]*)"/, '$1'));
			}

			else if (lemmaFound && token.match(/([^<>#@]*)/) && posTag == false) {
				posTag = token.replace(/([^<>#@]*)/, '$1');
			}

			// if token is of the form #x->y for integers x,y
			else if (token.match(/#[0-9]+->[0-9]+/)) {
				relTo = token.replace(/#([0-9]+)->([0-9]+)/, '$1');
				relFrom = token.replace(/#([0-9]+)->([0-9]+)/, '$2');
				//alert(relFrom+" "+relTo);
			}

			// if token is of the form @x for some string x
			else if (token.match(/@[a-z:]+/)) {
				relName = token.replace(/@([a-z:]+)/, '$1');
				//alert(relName);
			}

			// if token is of the form "x" for some string x
			if (token.match(/"[^<>]*"/)) {
				lemmaFound = true;
				//alert(token);
			}
			//alert(token);
			
		});
		
		if (relName != undefined) {
			var thisTuple = [relName, relFrom, relTo, posTag];
			tuples.push(thisTuple);
		} else if (lemmaFound) {
			var thisTuple = ["UND", n + 1, "", "UND"];
			tuples.push(thisTuple);
		}
	});

	var newcontent = "";

	/* conllx format */
	newcontent = "0	ROOT	_	_	ROOT	_	_	_	_\n";
	$.each(tuples, function(n, tuple) {
		var thisLine = "";
		var thisFrom = tuple[1];
		var thisTo = tuple[2]; // should be same as n
		var thisPos = tuple[3].toUpperCase() ;
		var name = tuple[0];
		var thisLemma = outtokens[n] ; // FIXME: implement lemmas here!

		//if (n == 0) { // the ROOT node
		//	thisLine = thisTo + "	" + outtokens[n] + "	" + thisLemma + "	_	ROOT	_	_	" + thisFrom + "	" + name + "\n" ;
		//} else { // everything but the extra ROOT node
			thisLine += thisTo + "	" + outtokens[n] + "	" + thisLemma + "	_	" + thisPos + "	_	" + thisFrom + "	" + name + "\n" ;
		//}
		newcontent += thisLine;
	});

	/* conllu format */
	/***
	newcontent = outtokens.join(' ');
	newcontent += "\n";
	$.each(tuples, function(n, tuple) {
		var from = outtokens[tuple[1]];
		var to = outtokens[tuple[2]];
		var name = tuple[0];
		newcontent += name + "(" + from + ", " + to + ")\n" ;
	});
	***/

	return newcontent;
}
