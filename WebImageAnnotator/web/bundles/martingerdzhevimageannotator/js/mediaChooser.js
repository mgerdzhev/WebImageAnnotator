function MediaChooser(options) {
	Media.prototype.constructor.apply(this, arguments);
	
	this.element = options.element.dialog({ autoOpen: false });
	this.isPopUp = options.isPopUp;
	this.callbacks = options.callbacks;
	this.isFileSelection = typeof options.isFileSelection != "undefined" ? options.isFileSelection : true;
	this.isPost = typeof options.isPost != "undefined" ? options.isPost : false;
	this.isNewPost = typeof options.isNewPost != "undefined" ? options.isNewPost : false;
	this.postId = options.postId;
	
	this.media = null;
	
	this.bind__previewVideoForwardFunctionCut = this._previewVideoForwardFunctionCut.bind(this);
	this.bind__previewVideoForwardFunctionDone = this._previewVideoForwardFunctionDone.bind(this);
	this.bind__previewVideoForwardFunctionDoneAndPost = this._previewVideoForwardFunctionDoneAndPost.bind(this);
	this.bind__previewVideoBackFunction = this._previewVideoBackFunction.bind(this);
}

MediaChooser.extend(Media);

MediaChooser.TAG = "MediaChooser";

MediaChooser.TYPE_ALL = 0;
MediaChooser.TYPE_UPLOAD_AUDIO = 1;
MediaChooser.TYPE_UPLOAD_IMAGE = 2;
MediaChooser.TYPE_UPLOAD_OTHER = 3;
MediaChooser.TYPE_RECORD_VIDEO = 4;
MediaChooser.TYPE_RECORD_AUDIO = 5;
MediaChooser.TYPE_UPLOAD_VIDEO = 6;

MediaChooser.DIALOG_TITLE_SELECT = "Select from My Files";
MediaChooser.DIALOG_TITLE_PREVIEW = "Preview";
MediaChooser.DIALOG_RECORD_VIDEO = "Record a new video";
MediaChooser.DIALOG_RECORD_AUDIO = "Record a new audio";

/**
 * @param {object} options
 */
MediaChooser.bindUIEvents = function(options) {
	console.log("%s: %s", MediaChooser.TAG, "bindUIEvents");
	
	if (options.isPost) {
		MediaChooser._bindUIEventsPost(options);
		return;
	}
	
	Media.bindUIEvents(options);
	
	var instance = new MediaChooser(options);
	
	$("#selectFile").click(function(e) {
		e.preventDefault();
		
		mediaChooser = instance;
		mediaChooser.chooseFile({});
	});
	
	$("#removeFile").click(function(e) {
		e.preventDefault();
		
		mediaChooser = instance;
		mediaChooser.onReset();
	});
};

/**
 * @param {object} options
 */
MediaChooser._bindUIEventsPost = function(options) {
	console.log("%s: %s- postId=%d", MediaChooser.TAG, "_bindUIEventsPost", options.postId);
	
	var postId = options.postId;
	var instance = new MediaChooser(options);
	
	$("#recordVideoPost" + postId).on("click", function(e) {
		e.preventDefault();
		
		mediaChooser = instance;
		mediaChooser.chooseFile({
			type: MediaChooser.TYPE_RECORD_VIDEO
		});
	});
	
	$("#selectFilePost" + postId).on("click", function(e) {
		e.preventDefault();
		
		mediaChooser = instance;
		mediaChooser.chooseFile({});
	});
	
	Media._bindUIEventsUploadFile(
			$("#uploadFormsPost" + postId),
			$("#uploadFilePost" + postId),
			instance);
	
	$("#removeFilePost" + postId).on("click", function(e) {
		e.preventDefault();
		
		mediaChooser = instance;
		mediaChooser.onReset();
	});
};

MediaChooser.bindUIEventsSelectFromMyFiles = function() {
	console.log("%s: %s", MediaChooser.TAG, "bindUIEventsSelectFromMyFiles");
	
	$(".preview-button").on("click", function(e) {
		e.preventDefault();
		
		if ($(e.target).hasClass("disabled")) {
			return false;
		}
		
		$("#preview").html("");
		
		mediaChooser.previewMedia({
			mediaUrl: $(e.target).data("url"),
			mediaId: $(e.target).data("val")
		});
	});

    $(".select-button").on("click", function(e) {
		e.preventDefault();

		mediaChooser.setMedia({
			id: $(e.target).data("val"),
			title: $(e.target).data("title")
		});
		mediaChooser.onSuccess();
		mediaChooser._terminatingFunction();
    });
};

MediaChooser._dialogTitleForType = function(type) {
	console.log("%s: %s", MediaChooser.TAG, "_dialogTitleForType");
	
	switch (type) {
	case MediaChooser.TYPE_ALL:
		return MediaChooser.DIALOG_TITLE_SELECT;
	case MediaChooser.TYPE_RECORD_VIDEO:
		return MediaChooser.DIALOG_RECORD_VIDEO;
	case MediaChooser.TYPE_RECORD_AUDIO:
		return MediaChooser.DIALOG_RECORD_AUDIO;
	case MediaChooser.TYPE_UPLOAD_AUDIO:
	case MediaChooser.TYPE_UPLOAD_IMAGE:
	case MediaChooser.TYPE_UPLOAD_OTHER:
	case MediaChooser.TYPE_UPLOAD_VIDEO:
	default:
		return MediaChooser.DIALOG_TITLE_PREVIEW;
	}
};

MediaChooser._cleanFileNameNoExt = function(fileName) {
	//FIXME extract proper file name
	fileName = fileName.split(/(\\|\/)/g).pop()
	return (fileName.substr(0, fileName.lastIndexOf('.')) || fileName).replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
};

/**
 * @param {object} options
 */
MediaChooser.prototype.chooseFile = function(options) {
	console.log("%s: %s", MediaChooser.TAG, "chooseFile");
	
	var type = (typeof options.type === "undefined") ? MediaChooser.TYPE_ALL : options.type;
	
	if (this.isPopUp) {
		this._popUp(
				type,
				function() {
					this._loadChooserPage(type, options.data);
				});
	} else {
		this._loadChooserPage(type, options.data);
	}
};

MediaChooser.prototype._loadChooserPage = function(type, data) {
	console.log("%s: %s", MediaChooser.TAG, "_loadChooserPage");
	
	var request = {
		url: Routing.generate('imdc_media_chooser_by_type', { type: type }),
		type: "POST",
		contentType: "application/x-www-form-urlencoded",
		processData: true,
		success: (function(data) {
			console.log("%s: %s: %s", MediaChooser.TAG, "_loadChooserPage", "success");
			
			this.element.html(data.page);
		}).bind(this),
		error: function(request) {
			console.log("%s: %s: %s", MediaChooser.TAG, "_loadChooserPage", "error");
			
			console.log(request.statusText);
		}
	};
	
	data = (typeof data === "undefined") ? { type: type } : data;
	data.type = (typeof data.type === "undefined") ? type : data.type;
	request.data = data;
	
	$.ajax(request);
};

MediaChooser.prototype.previewMedia = function(options) {
	console.log("%s: %s", MediaChooser.TAG, "previewMedia");
	
	this.recording = options.recording;
	if (this.isPopUp && !this.element.dialog("isOpen")) {
		this._popUp(
				options.type,
				function() {
					this._loadMediaPage(options.mediaUrl, options.mediaId);
				});
	} else {
		this.element.dialog("option", "title", MediaChooser._dialogTitleForType(options.type));
		this._loadMediaPage(options.mediaUrl, options.mediaId);
	}
};

MediaChooser.prototype._loadMediaPage = function(mediaUrl, mediaId) {
	console.log("%s: %s", MediaChooser.TAG, "_loadMediaPage");
	
	this.loadNextPage({
		url: mediaUrl,
		method: "POST",
		data: { mediaId: mediaId }
	});
};

MediaChooser.prototype.loadNextPage = function(options) {
	console.log("%s: %s", MediaChooser.TAG, "loadNextPage");
	
	var request = {
		url: options.url,
		data: options.data,
		success: (function(data) {
			console.log("%s: %s: %s- finished=%s", MediaChooser.TAG, "loadNextPage", "success", data.finished);
			
			this.setMedia(data.media);
			
			if (data.finished !== "undefined" && data.finished === true) {
				if (this.media != null) {
					this.onSuccess();
				}
				this._terminatingFunction();
			} else {
				this.element.html(data.page);
			}
		}).bind(this),
		error: function(request) {
			console.log("%s: %s: %s- %s", MediaChooser.TAG, "loadNextPage", "error", request.statusText);
			
		}
	};
	
	request.type = (typeof options.method === "undefined") ? "GET" : options.method;
	
	if (options.method != "GET") {
		request.processData = false;
		request.contentType = false;
	}
	
	$.ajax(request);
};

MediaChooser.prototype._popUp = function (type, onOpen) {
	console.log("%s: %s", MediaChooser.TAG, "_popUp");
	
	this.element.dialog({
		autoOpen: false,
		resizable: false,
		modal: true,
		draggable: false,
		closeOnEscape: true,
		dialogClass: "popup-dialog",
		open: (function(event, ui) {
			console.log("%s: %s: %s", MediaChooser.TAG, "_popUp", "open");
			
			// $(".ui-dialog-titlebar-close", this.parentNode).hide();
			onOpen.call(this);
		}).bind(this),
		create: function(event, ui) {
			console.log("%s: %s: %s", MediaChooser.TAG, "_popUp", "create");
			
			//$(event.target).parent().css('position', 'relative'); 
		},
		close: (function(event, ui) {
			console.log("%s: %s: %s", MediaChooser.TAG, "_popUp", "close");
			
			// $(".ui-dialog-titlebar-close", this.parentNode).hide();
			this.element.html("");
			this._terminatingFunction();
		}).bind(this),
		show: "blind",
		hide: "blind",
		minWidth: 740,
		position: {
			at: "top+200"
		},
		title: MediaChooser._dialogTitleForType(type)
	});

	this.element.dialog("open");
};

MediaChooser.prototype.previewVideo = function() {
	console.log("%s: %s", MediaChooser.TAG, "previewVideo");
	var forwardButtons = ["<button class='cutButton'></button>", "<button class='doneButton'></button>"];
	var forwardFunctions = [this.bind__previewVideoForwardFunctionCut, this.bind__previewVideoForwardFunctionDone];
	console.log("isPost: %s postID: %s", this.isPost, this.postId);
	if (this.isPost || this.isNewPost)
	{
		forwardButtons = ["<button class='cutButton'></button>", "<button class='doneButton'></button>", "<button class='doneAndPostButton'></button>"];
		forwardFunctions = [this.bind__previewVideoForwardFunctionCut, this.bind__previewVideoForwardFunctionDone, this.bind__previewVideoForwardFunctionDoneAndPost];
	}
	var backButtons;
	var backFunctions;
	if (typeof this.recording != 'undefined' && this.recording)
    {
     	backButtons = ["<button class='backButton'></button>"]
     	backFunctions = [this.bind__previewVideoBackFunction]
 	}
	this.player = new Player($("#" + this.media.id), {
		areaSelectionEnabled: true,
		updateTimeType: Player.DENSITY_BAR_UPDATE_TYPE_RELATIVE,
		//playHeadImage: "images/feedback_icons/round_plus.png",
		//playHeadImageOnClick: function(){ alert("plus");},
		forwardButtons: forwardButtons,
		forwardFunctions: forwardFunctions,
        backButtons: backButtons,
        backFunctions: backFunctions
	});
	this.player.createControls();
};

MediaChooser.prototype._previewVideoBackFunction = function(data) {
    console.log("%s: %s", MediaChooser.TAG, "_previewVideoBackFunction");

    // delete the current media!
    var mediaManager = new MediaManager();
    mediaManager.deleteMedia(this.media.id);
    
    //Go back to recording
    this.element.html("");
    this.media = null;
    this._loadChooserPage(MediaChooser.TYPE_RECORD_VIDEO);
};

MediaChooser.prototype._previewVideoForwardFunctionCut = function(data) {
	console.log("%s: %s", MediaChooser.TAG, "_previewVideoForwardFunctionCut");
	
	// console.log(recorderConfiguration);
	// var fn = window[recorderConfiguration.forwardFunction]||null;
	// fn(data);
	//console.log('Cut!', data);
	
	var mediaManager = new MediaManager();
	mediaManager.trimMedia(this.media.id, this.player.currentMinTimeSelected, this.player.currentMaxTimeSelected);
};

MediaChooser.prototype._previewVideoForwardFunctionDone = function(data) {
	console.log("%s: %s", MediaChooser.TAG, "_previewVideoForwardFunctionDone");
	
	// console.log(recorderConfiguration);
	// var fn = window[recorderConfiguration.forwardFunction]||null;
	// fn(data);
	//console.log('Done!', data);

	if (this.media != null) {
		var mediaManager = new MediaManager();
		this.media.title = $('#preview-media-title').val();
		mediaManager.updateMedia(this.media);
		
		this.onSuccess();
	}
	this._terminatingFunction();
};

MediaChooser.prototype._previewVideoForwardFunctionDoneAndPost = function(data) {
	console.log("%s: %s", MediaChooser.TAG, "_previewVideoForwardFunctionDoneAndPost");
	
	// console.log(recorderConfiguration);
	// var fn = window[recorderConfiguration.forwardFunction]||null;
	// fn(data);
	//console.log('Done!', data);

	if (this.media != null) {
		var mediaManager = new MediaManager();
		this.media.title = $('#preview-media-title').val();
		mediaManager.updateMedia(this.media);
		this.onSuccess(true);
	}
	this._terminatingFunction();
};

MediaChooser.prototype._terminatingFunction = function() {
	console.log("%s: %s", MediaChooser.TAG, "_terminatingFunction");
	
	if (this.element.dialog("isOpen")) {
		this.element.off("dialogclose");
		this.element.dialog("close");
	}
};

MediaChooser.prototype.onSuccess = function(post) {
	console.log("%s: %s", MediaChooser.TAG, "onSuccess");
	
	if (this.isPost) {
		if (this.isFileSelection) {
			$("#chooseFilePost" + this.postId).hide();
			$("#selectedFileTitlePost" + this.postId).html(this.media.title);
			$("#selectedFilePost" + this.postId).show();
		}
		if (typeof post != "undefined" && post == true)
			this.callbacks.successAndPost(this.media, this.postId);
		else
			this.callbacks.success(this.media, this.postId);
		return;
	}
	
	if (this.isFileSelection) {
		$("#chooseFile").hide();
		$("#selectedFileTitle").html(this.media.title);
		$("#selectedFile").show();
	}
	if (this.isNewPost && typeof post != "undefined" && post == true)
		this.callbacks.successAndPost(this.media);
	else
		this.callbacks.success(this.media);
};

MediaChooser.prototype.onReset = function() {
	console.log("%s: %s", MediaChooser.TAG, "onReset");
	
	if (this.isPost) {
		if (this.isFileSelection) {
			$("#selectedFilePost" + this.postId).hide();
			$("#selectedFileTitlePost" + this.postId).html("");
			$("#chooseFilePost" + this.postId).show();
		}
		
		this.callbacks.reset(this.postId);
		return;
	}
	
	if (this.isFileSelection) {
		$("#selectedFile").hide();
		$("#selectedFileTitle").html("");
		$("#chooseFile").show();
	}
	
	this.callbacks.reset();
};

MediaChooser.prototype.setMedia = function(media) {
	console.log("%s: %s", MediaChooser.TAG, "setMedia");
	
	this.media = typeof media != "undefined" ? media : this.media;
};
