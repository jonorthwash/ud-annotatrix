$(document).on('change', '.custom-file-input', function(event) {
	$(this).next('.custom-file-label').html(event.target.files[0].name);
});
$(document).on('visibilitychange', function(event) {
		if (document.hidden) {
			console.log("sleep", document.visibilityState);
		} else  {
			console.log("awake", document.visibilityState);
			location.reload();
		}
});
$(document).ready(function() {

	if (location.protocol === "file:"){
		window.location.href = './annotatrix.html';
	} else {
		$.ajax({
			type: 'GET',
			url: '/running',
			success: function(data) {
				console.info('AJAX connect success with response:', data);
			},
			error: function(data)  {
				console.info('AJAX connect failed with response:', data)
				window.location.href = './annotatrix.html';
			}
		});
	}

	var deletemode = false;
	$(".actmode").click(function() {
		// const url = `${base}/annotatrix?treebank_id=${treebank.id}`; %>
		var this_el = $(this);
		var this_id = this_el.data('id');
		console.log(deletemode, this_id);
		if (deletemode) {
			var formData = new FormData();
			formData.append('id', this_id);
			$.ajax({
				url: 'delete',
				type: 'POST',
				data: formData,
				processData: false, // tell jQuery not to process the data
				contentType: false, // tell jQuery not to set contentType
				success: function(data) {
					if (data.hasOwnProperty("success") && data.success === true) {
						this_el.parent().parent().empty();
					} else {
						alert(data.error);
					}
				}
			});

		} else {
			window.location.href = '/annotatrix?treebank_id=' + this_id;
		}

	});

	$('#actionswitch').change(function() {

		if (this.checked) {
			// var returnVal = confirm("Are you sure?");
			// $(this).prop("checked", returnVal);
			$(".actmode").html('Delete');
			console.log("checked");
			deletemode = true;
		} else {
			$(".actmode").html('Edit');
			console.log("unchecked");
			deletemode = false;
		}
		// $('#textbox1').val(this.checked);
	});

	$("#upload-to-server").click(function() {
	   $('.navbar-collapse').collapse('hide');
		var file2load = $('input[type=file]').val();
		if (file2load) {
			// alert(file2load);
			var formData = new FormData();
			formData.append('file', $('#fileupload')[0].files[0]);
			formData.append('src', 'main');
			$('.spinner-border').removeClass("d-none");

			$.ajax({
				url: 'upload',
				type: 'POST',
				data: formData,
				processData: false, // tell jQuery not to process the data
				contentType: false, // tell jQuery not to set contentType
				success: function(data) {
					// console.log(data);
					// alert(data);
					// location.reload(true);
					if (data.error) {
						alert(data.error);
					}
					$('.spinner-border').addClass("d-none");
					location.reload(true);
				}
			});
		} else {
			alert("No file selected!");
		}
		return false;
	});
	$("#webload").click(function() {
	   $('.navbar-collapse').collapse('hide');
		var url2load = $('#gitlink').val();
		if (url2load) {
			var formData = new FormData();
			formData.append('url', url2load);
			formData.append('src', 'main');
			$('.spinner-border').removeClass("d-none");

			$.ajax({
				url: 'upload',
				type: 'POST',
				data: formData,
				processData: false, // tell jQuery not to process the data
				contentType: false, // tell jQuery not to set contentType
				success: function(data) {
					if (data.error) {
						alert(data.error);
					}
					$('.spinner-border').addClass("d-none");
					location.reload(true);
				}
			});
		} else {
			alert("No file selected!");
		}
		return false;
	});
});
