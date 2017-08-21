function testConversion() {
	var CG = $("#indata").val();
	var conStr = CG2conllu(CG);
	console.log("result: ");
	console.log(conStr);
}

function CG2conllu(CGtext) {
	/* Takes a string in CG, returns a string in conllu. */
	var sent = new conllu.Sentence();
	console.log(CGtext);
	var separated = findComments(CGtext);
	sent.comments = separated[0];

	var tokens = formTokens(separated[1]);
	sent.tokens = tokens;

	return sent.serial;
}


function findComments(CGtext) {
	/* Takes a string in CG, returns 2 arrays with strings. */
	var lines = CGtext.split("\n");
	var comments = [];
	var tokens = [];
	$.each(lines, function(n, line) {
		if (line[0] == "#") {
			comments.push(line);
		} else {
			tokens.push(line);
		}
	});
	return [comments, tokens];
}


function formTokens(lines) {
	var id = 1;
	return [];
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
