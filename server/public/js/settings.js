$(document).on('visibilitychange', function(event) {
		if (!document.hidden) {
			location.reload();
		}
});
$(document).ready(function() {
	var usernum = $('#usernum');
	var qty = parseInt(usernum.text());
	var errorbox = $('#error');
	function showError(obj){
		errorbox.removeClass("d-none");
		errorbox.html(obj.hasOwnProperty("error")?obj.error:"Unknown error");
		setTimeout(function (){
		  errorbox.addClass("d-none");
		}, 10000);
	}
	$(".access").on('click', function(event){
		$.post( "/settings", { 'open_access': $(this).attr('value'), 'treebank': $('#treebank').html() }, function(data) {
			if (!data.hasOwnProperty("success")) {
				showError(data);
			}
		});
	});
	$("#grant").on('click', function(event){
		var user_input = $("#github_user");
		var username = user_input.val();

		if (username && username.replace(/\s/g, '').length){
			$.post( "/settings", { 'editor': username, 'treebank': $('#treebank').html(), 'mode': 1 }, function(data) {
				if (data.hasOwnProperty("success") && data.success) {
					var fragment = $('#editorslist> ul> li:first.d-none').clone().removeClass('d-none').addClass('d-flex');
					fragment.find('h6').text("@"+username);
					fragment.find('button').data('user', username);
					fragment.insertBefore('#owner');
					usernum.text(++qty);
					user_input.val("");
				} else {
					showError(data);
				}
			});
		}
	});

	$('body').on('click', '.remove', function(event){
		var item  = $(this).closest('li');

		$.post( "/settings", { 'editor': $(this).data('user'), 'treebank': $('#treebank').html(), 'mode': 0 }, function(data) {
			if (data.hasOwnProperty("success") && data.success) {
				item.remove();
				usernum.text(--qty);
			} else {
				showError(data);
			}
		});
	});

});
