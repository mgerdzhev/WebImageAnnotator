function MyFiles() {
	this.forwardButton = "<button class='cutButton'></button>";
	this.media = null;
	
	this.mediaChooser = new MediaChooser(MyFiles.mediaChooserOptions(MyFiles.Page.PREVIEW));
	//TODO move to media chooser, as this may be a more general function
	this.bind_onRecordingSuccess = this.onRecordingSuccess.bind(this);
	this.bind_onRecordingError = this.onRecordingError.bind(this);
	this.bind_forwardFunction = this.forwardFunction.bind(this);
	
	this.bind__addMediaRow = this._addMediaRow.bind(this);
	this.bind__deleteFile = this._deleteFile.bind(this);
	this.bind__updateMediaRow = this._updateMediaRow.bind(this);
	
	dust.compileFn($("#mediaRow").html(), "mediaRow");
}

MyFiles.TAG = "MyFiles";

MyFiles.Page = {
		INDEX: 0,
		PREVIEW: 1,
};

/**
 * MediaChooser options for each related page that uses MediaChooser
 * @param {number} page
 * @param {number} postId
 */
MyFiles.mediaChooserOptions = function(page) {
	switch (page) {
	case MyFiles.Page.INDEX:
		return {
			element: $("#preview"),
			isPopUp: true,
			callbacks: {
				success: function(media) {
					context.bind__addMediaRow(media);
				},
				reset: function() {
					
				}
			},
			isFileSelection: false
		};
	case MyFiles.Page.PREVIEW:
		return {
			element: $("#preview"),
			isPopUp: true,
			callbacks: {
				success: function(media) {
					console.log("Done previewing");
					context.bind__updateMediaRow(media);
				},
				reset: function() {
					
				}
			},
			isFileSelection: false
		};
	}
};

/**
 * ui element event bindings in order of appearance
 * @param {number} page
 */
MyFiles.prototype.bindUIEvents = function(page) {
	console.log("%s: %s- page=%d", MyFiles.TAG, "bindUIEvents", page);
	
	switch (page) {
	case MyFiles.Page.INDEX:
		this._bindUIEventsIndex();
		break;
	}
};

/**
 * @param {object} options
 */
MyFiles.prototype._bindUIEventsIndex = function() {
	console.log("%s: %s", MyFiles.TAG, "_bindUIEventsIndex");
	
	Media.bindUIEvents(MyFiles.mediaChooserOptions(MyFiles.Page.INDEX));
	var instance = this;
	$(".preview-button").on("click", function(e){ instance.onPreviewButtonClick(e);});
	
	$(".delete-button").on("click", function(e){instance.onDeleteButtonClick(e);});
};

/**
 * @param {object} videoElement
 */
//TODO move to media chooser, as this may be a more general function
MyFiles.prototype.createVideoRecorder = function(videoElement) {
	console.log("%s: %s", MyFiles.TAG, "createVideoRecorder");
	
	this.player = new Player(videoElement, {
		areaSelectionEnabled: false,
		updateTimeType: Player.DENSITY_BAR_UPDATE_TYPE_ABSOLUTE,
		type: Player.DENSITY_BAR_TYPE_RECORDER,
		audioBar: false,
		volumeControl: false,
		recordingSuccessFunction: this.bind_onRecordingSuccess,
		recordingErrorFunction: this.bind_onRecordingError,
		recordingPostURL: Routing.generate('imdc_myfiles_add_recording'),
		forwardButtons: [this.forwardButton],
		forwardFunctions: [this.bind_forwardFunction],
	});
	this.player.createControls();

	//TODO revise
	videoElement.parents(".ui-dialog").on("dialogbeforeclose", (function(event, ui) {
		console.log("videoElement dialogbeforeclose");
		if (this.player != null) {
			this.player.destroyRecorder();
		}
	}).bind(this));
};

//TODO move to media chooser, as this may be a more general function
MyFiles.prototype.onRecordingSuccess = function(data) {
	console.log("%s: %s- mediaId=%d", MyFiles.TAG, "onRecordingSuccess", data.media.id);
	
	this.media = data.media;
	mediaChooser.setMedia(this.media);
};

//TODO move to media chooser, as this may be a more general function
MyFiles.prototype.onRecordingError = function(e) {
	console.log("%s: %s- e=%s", MyFiles.TAG, "onRecordingError", e);
};

//TODO move to media chooser, as this may be a more general function
MyFiles.prototype.forwardFunction = function() {
	console.log("%s: %s", MyFiles.TAG, "forwardFunction");
	
	this.player.destroyRecorder();
	
//	mediaChooser = this.mediaChooser;
	mediaChooser.previewMedia({
		type: MediaChooser.TYPE_RECORD_VIDEO,
		mediaUrl: Routing.generate('imdc_myfiles_preview', { mediaId: this.media.id }),
		mediaId: this.media.id,
		recording: true
	});
};

MyFiles.prototype._addMediaRow = function(media) {
	console.log("%s: %s", MyFiles.TAG, "_addMediaRow");
	
	this.media = media;
	
	var data = {
			media: this.media
	};
	
	if (this.media.isReady == 0) {
		data.previewDisabled = true;
	}
	
	//TODO revise
	switch (this.media.type) {
	case 0:
		data.icon = "fa-picture-o";
		data.mediaType = "Image";
		break;
	case 1:
		data.icon = "fa-film";
		data.mediaType = "Video";
		data.canInterpret = true;
		break;
	case 2:
		data.icon = "fa-headphones";
		data.mediaType = "Audio";
		data.canInterpret = true;
		break;
	default:
		data.icon = "fa-film";
		data.mediaType = "Other";
		break;
	}
	
	//TODO revise
	var timeUploaded = new Date(this.media.metaData.timeUploaded.date);
	var ampm = timeUploaded.getHours()>=12?"pm":"am";
	var hours = (timeUploaded.getHours()>12?timeUploaded.getHours()-12:timeUploaded.getHours());
	hours = hours<10?"0"+hours:hours;
	var time = hours+":"+(timeUploaded.getMinutes()<10?"0"+timeUploaded.getMinutes():timeUploaded.getMinutes())+ampm ;
	var timeDateString = time+" "+$.datepicker.formatDate('M d', timeUploaded);
	
	data.dateString = timeDateString;
	
	if (this.media.metaData.size > 0) {
		data.mediaSize = (this.media.metaData.size / 1024 / 1024).toFixed(2);
	}
	var instance = this;
	
	data.deleteUrl = Routing.generate('imdc_myfiles_remove', { mediaId: this.media.id });
	data.previewUrl = Routing.generate('imdc_myfiles_preview', { mediaId: this.media.id });
	data.newThreadUrl = Routing.generate('imdc_thread_new_from_media', { resourceid: this.media.id });
	data.simulRecordUrl = Routing.generate('imdc_media_simultaneous_record', { mediaID: this.media.id });
	
	dust.render("mediaRow", data, function(err, out) {
		$("#files-table").append(out);
	});
	
	$(".preview-button").on("click",  function(e){ instance.onPreviewButtonClick(e);});
	
	$(".delete-button").on("click",  function(e){ instance.onDeleteButtonClick(e);});
};

MyFiles.prototype._updateMediaRow = function(media) {
	//At this points it updates the title and the file-size
	console.log("%s: %s", MyFiles.TAG, "_updateMediaRow");
	
	this.media = media;
	
	var data = {
			media: this.media
	};
	
	if (this.media.metaData.size > 0) {
		data.mediaSize = (this.media.metaData.size / 1024 / 1024).toFixed(2) + " MB";
	}
	data.title = media.title;
	var row = $('a[data-val|='+data.media.id+']').eq(0).parent().parent();
	row.children().eq(1).text(data.title);
	row.children().eq(4).text(data.mediaSize);
	var instance = this;
	
};

MyFiles.prototype._deleteFile = function(currentElement, message) {
	console.log("%s: %s", MyFiles.TAG, "_deleteFile");
	
	var response = confirm(message);
	if (!response) {
		return false;
	}
	var address = $(currentElement).data("url");

	$.ajax({
		url: address,
		type: "POST",
		contentType: "application/x-www-form-urlencoded",
		data: {
			mediaId: $(currentElement).data("val")
		},
		success: function(data) {
			if (data.responseCode == 200) {
				$(currentElement).parent().parent().remove();
			} else if (data.responseCode == 400) { // bad request
				alert('Error: ' + data.feedback);
			} else {
				alert('An unexpected error occured');
			}
		},
		error: function(request) {
			console.log(request.statusText);
		}
	});
};

MyFiles.prototype.onPreviewButtonClick = function(e) {
	e.preventDefault();
	console.log("Preview");
	if ($(e.target).hasClass("disabled")) {
		return false;
	}
	$('#preview').html('');
	mediaChooser = this.mediaChooser;
	this.mediaChooser.previewMedia({
		mediaUrl: $(e.target).data("url"),
		mediaId: $(e.target).data("val")
	});
};

MyFiles.prototype.onDeleteButtonClick = function(e) {
	e.preventDefault();
	
	this.bind__deleteFile($(e.target), $("#mediaDeleteConfirmMessage").html());
};












var recorder;


//function recordVideo(destinationDivElement, address, recorderConfiguration) {
//	$.ajax({
//		url : address,
//		type : "POST",
//		// contentType : "application/x-www-form-urlencoded",
//		data : {
//			recorderConfiguration : recorderConfiguration
//		},
//		success : function(data) {
//			destinationDivElement.html(data);
//		},
//		error : function(request) {
//			console.log(request);
//			alert(request.statusText);
//		}
//	});
//	return false;
//}

//function previewFileLink(currentElement, destinationDivElement, isPopUp) {
//	var mediaId = $(currentElement).attr('data-val');
//	var mediaURL = $(currentElement).attr('data-url'); // Used to obtain the
//														// URL for the media
//
//	previewMediaFile(mediaId, mediaURL, destinationDivElement, isPopUp);
//}

//function popUp(destinationDivElement, functionName, title) {
//	destinationDivElement.dialog({
//
//		autoOpen : false,
//		resizable : false,
//		modal : true,
//		draggable : false,
//		closeOnEscape : true,
//		dialogClass : "player-dialog",
//		open : function(event, ui) {
//			// $(".ui-dialog-titlebar-close", this.parentNode).hide();
//			functionName;
//		},
//		create : function(event, ui) {
//			$(event.target).parent().css('position', 'relative'); // Dumb
//																	// comment
//																	// at this
//																	// line!
//		},
//		position : {
//			my : "center top",
//			// at : "center top",
//			of : $("body")
//		},
//		show : "blind",
//		hide : "blind",
//		minWidth : 740,
//		title : title
//	});
//
//	destinationDivElement.dialog("open");
//}

//function previewMediaFile(mediaId, mediaURL, destinationDivElement, isPopUp) {
//	if (isPopUp) {
//		popUp(destinationDivElement, loadMediaPage(mediaId, mediaURL,
//				destinationDivElement), "Preview");
//	} else {
//		loadMediaPage(mediaId, mediaURL, destinationDivElement);
//	}
//
//}

//function loadMediaPage(mediaId, mediaURL, destinationDivElement) {
//	$.ajax({
//		url : mediaURL,
//		type : "POST",
//		contentType : "application/x-www-form-urlencoded",
//		data : {
//			mediaId : mediaId
//		},
//		success : function(data) {
//			destinationDivElement.html(data);
//		},
//		error : function(request) {
//			console.log(request);
//			alert(request.statusText);
//		}
//	});
//}

function hidePIP(pipDiv) {
	var clip = $(pipDiv);

	if (this.value == "show") {
		clip.show();
		var selectedAudio = $("input[type='radio']:checked").prop('value');
		if ((selectedAudio == "both") || (selectedAudio == "clip1")) {
			clip[0].volume = 1;
		}
		$(this).prop('value', 'hide').html("Hide PiP");
	} else {
		clip.hide();
		$(this).prop('value', 'show').html("Show PiP");
	}

}

function swapPIP(pipDiv, sourceDiv, hidePIPButton) {
	var clip1 = $(pipDiv);
	var clip2 = $(sourceDiv);

	var piprole;
	var sourcerole;

	if ((clip1.draggable("option", "disabled"))) {
		// clip 1 is acting as the source
		piprole = clip2;
		sourcerole = clip1;
	} else {
		piprole = clip1;
		sourcerole = clip2;
	}

	// get position, size, z-index of pip
	var piproleheight = piprole.height();
	var piprolewidth = piprole.width();
	var piprolezindex = piprole.css("z-index");
	var piproleposition = piprole.position(); // returns object accessible
												// with var.left or var.top
	var piprolepositionleft = piprole.css("left"); // need these explicit css
													// calls as .position
	var piprolepositiontop = piprole.css("top"); // doesn't return correct
													// values if elements are
													// hidden
	var piprolevisible = piprole.is(":visible");

	if (piprolepositionleft == "auto")
		piprolepositionleft = "0px";
	if (piprolepositiontop == "auto")
		piprolepositiontop = "0px";

	console.log(piprolepositionleft);
	// get position, size, z-index of source
	var sourceroleheight = sourcerole.height();
	var sourcerolewidth = sourcerole.width();
	var sourcerolezindex = sourcerole.css("z-index");
	var sourceroleposition = sourcerole.position(); // returns object accessible
													// with var.left or var.top
	var sourcerolepositionleft = sourcerole.css("left");
	var sourcerolepositiontop = sourcerole.css("top");

	// disable draggable and resizeable on pip
	piprole.draggable("option", "disabled", true);

	// switch css classes
	piprole.removeClass("pipstyle");
	piprole.addClass("sourcestyle");

	sourcerole.removeClass("sourcestyle");
	sourcerole.addClass("pipstyle");

	/** ************** PIP now acting as SOURCE from here ******** */
	/** ************** PIP now acting as SOURCE from here ******** */

	// swap positions
	// get position of container div element
	var vidcontainer = $("div#videoContainer");
	var vidcontainerpos = vidcontainer.offset();
	var vidcontainerpadding = vidcontainer.css("padding");

	var vcont = parseInt(vidcontainerpos.top, 10)
			+ parseInt(vidcontainerpadding, 10);
	var vconl = parseInt(vidcontainerpos.left, 10)
			+ parseInt(vidcontainerpadding, 10);

	// copy old pip's size and position attributes to 'new' pip
	// check if pip is hidden
	if (!piprolevisible) {
		// previous PIP video was hidden before swap started
		sourcerole.show();
		piprole.show();

		// reset show/hide pip button
		hidePIPButton.prop('value', 'hide').html("Hide PIP");
	}
	// fix for absolute position as resizable messes it up
	/*
	 * sourcerole.css({"height" : piproleheight, "width" : piprolewidth,
	 * "position" : "absolute", "left" : piprolepositionleft, "top" :
	 * piprolepositiontop});
	 *  // reset acting source movie dimensions, fix for absolute position
	 * piprole.css({ "position" : "absolute", "left" : vconl, "top" : vcont});
	 */

	sourcerole.css({
		"left" : piprolepositionleft,
		"top" : piprolepositiontop
	});

	// reset acting source movie dimensions, fix for absolute position
	piprole.css({
		"left" : 0,
		"top" : 0
	});

	// make sourcerole (now acting as pip) draggable and resizeable
	sourcerole.draggable("option", "disabled", false);

	// reveal close button element on new pip
	sourcerole.find('i').show();

	// hide close button element on old pip
	piprole.find('i').hide();

};