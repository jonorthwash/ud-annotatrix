$(document).ready(function() {
	$(".access").on('click', function(event){
		event.stopPropagation();
		event.stopImmediatePropagation();

		$.post( "/settings", { 'open_access': $(this).attr('value'), 'treebank': $('#treebank').html() }, function(data) {
			console.log(data);
		});
	});
	$("#grant").on('click', function(event){
		event.stopPropagation();
		event.stopImmediatePropagation();
		var user_input = $("#github_user");
		var username = user_input.val();
		
		if (username && username.replace(/\s/g, '').length){
			$.post( "/settings", { 'editor': username, 'treebank': $('#treebank').html(), 'mode': 1 }, function(data) {
				console.log(data);
				user_input.val("");
			});
		}
	});	
	
});
