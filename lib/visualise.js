function cgParse(content) {
	var outtokens = ["ROOT"];
	var tuples = new Array();
	var lines = content.split("\n");
	var lemmaFound = false ;
	$.each(lines, function(n, line) {
		tokens = line.split(" ");
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
		newcontent += tuple[0] + "(" + from + ", " + to + ")\n" ;
	});
	return newcontent;
}
