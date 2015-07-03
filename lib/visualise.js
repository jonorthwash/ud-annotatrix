function cgParse(content) {
	var outtokens = ["ROOT"];
	var tuples = new Array();
	var lines = content.split("\n");
	var lemmaFound = false ;
	$.each(lines, function(n, line) {
		if (line.match(/".*? .*?"/)) {
			// first replace space (0020) with ·
			//    for lemmas and forms containing whitespace.
			//    otherwise, SD parser gets confused
			//    (with ANY type of spacing character, it seems).
			//    then, split on space
			quoted = line.replace(/.*(".*?").*/, '$1');
			forSubst = quoted.replace(/ /g, "·");
			var tokens = line.replace(/".*"/, forSubst).split(" ");
		} else {
			var tokens = line.split(" ");
		}
		var relFrom ;
		var relTo ;
		var relName ;
		$.each(tokens, function(n, token) {
			if (n == 0 && token.match(/"<.*>"/)) {
				lemmaFound = false ;
				outtokens.push(token.replace(/"<(.*)>"/, '$1'));
			}
			else if (lemmaFound && token.match(/"[^<>]*"/)) {
				//alert(lemmaFound);
				outtokens.push(token.replace(/"([^<>]*)"/, '$1'));
			}
			else if (token.match(/#[0-9]+->[0-9]+/)) {
				relTo = token.replace(/#([0-9]+)->([0-9]+)/, '$1');
				relFrom = token.replace(/#([0-9]+)->([0-9]+)/, '$2');
				//alert(relFrom+" "+relTo);
			}
			else if (token.match(/@[a-z:]+/)) {
				relName = token.replace(/@([a-z:]+)/, '$1');
				//alert(relName);
			}
			if (token.match(/"[^<>]*"/)) {
				lemmaFound = true;
				//alert(token+" "+formFound);
			}
			//alert(token);
			
		});
		if (relName != undefined) {
			var thisTuple = [relName, relFrom, relTo];
			tuples.push(thisTuple);
		}
	});
	newcontent = outtokens.join(' ');
	newcontent += "\n";
	$.each(tuples, function(n, tuple) {
		var from = outtokens[tuple[1]];
		var to = outtokens[tuple[2]];
		var name = tuple[0];
		newcontent += name + "(" + from + ", " + to + ")\n" ;
	});
	return newcontent;
}
