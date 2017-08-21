function testConversion() {
	var CG = $("#indata").val();
	var conStr = CG2conllu(CG);
	console.log("result: ");
	console.log(conStr);
}

function CG2conllu(CGtext) {
	console.log(CGtext);

	return "0";
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