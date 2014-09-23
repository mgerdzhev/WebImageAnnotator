function Media() {
	
}

Media.TAG = "Media";

Media.MEDIA_TYPES = ["audio", "video", "image", "other"];

/**
 * @param {object} options
 */
Media.bindUIEvents = function(options) {
	console.log("%s: %s", Media.TAG, "bindUIEvents");
	
	var instance = new MediaChooser(options);
	
	$("#recordVideo").click(function(e) {
		e.preventDefault();
		
		mediaChooser = instance;
		mediaChooser.chooseFile({
			type: MediaChooser.TYPE_RECORD_VIDEO
		});
	});
	
	Media._bindUIEventsUploadFile(
			$("#uploadForms"),
			$("#uploadFile"),
			instance);
	return instance;
};

/**
 * @param {object} formRootElement
 * @param {object} linkRootElement
 * @param {object} instance
 */
Media._bindUIEventsUploadFile = function(formRootElement, linkRootElement, instance) {
	console.log("%s: %s", Media.TAG, "_bindUIEventsUploadFile");
	
	$.each(Media.MEDIA_TYPES, function(index, value) {
		var resourceFile = formRootElement.find("#imdc_terptube_" + value + "_media_resource_file");
		var title = formRootElement.find("#imdc_terptube_" + value + "_media_title");
		var form = formRootElement.find("form[name=imdc_terptube_" + value + "_media]");
		
		resourceFile.change(function(e) {
			if (resourceFile.val() == "") {
				return;
			}
			
			title.val(MediaChooser._cleanFileNameNoExt(resourceFile.val()));
			
			mediaChooser = instance;
			mediaChooser.loadNextPage({
				url: Routing.generate("imdc_files_gateway_" + value),
				method: "POST",
				data: new FormData(form[0])
			});
			
			resourceFile.val("");
			title.val("");
		});
	});
	
	$.each(Media.MEDIA_TYPES, function(index, value) {
		var link = linkRootElement.find("#upload-" + value + "-link");
		var resourceFile = formRootElement.find("#imdc_terptube_" + value + "_media_resource_file");
		
		link.click(function(e) {
			e.preventDefault();
			
			resourceFile.click();
		});
	});
};
