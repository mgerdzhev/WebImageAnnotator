define(['core/mediaManager'], function(MediaManager) {
    var MediaChooser = function(options) {
        this.element = options.element.dialog({ autoOpen: false });
        this.isPopUp = options.isPopUp;
        this.isFileSelection = typeof options.isFileSelection != "undefined" ? options.isFileSelection : true;
        this.isPost = typeof options.isPost != "undefined" ? options.isPost : false;
        this.isNewPost = typeof options.isNewPost != "undefined" ? options.isNewPost : false;
        this.postId = options.postId;

        this.postSuffix = (this.isPost ? "Post" + this.postId : "");
        this.recorder = null;
        this.player = null;
        this.mediaManager = new MediaManager();
        this.media = null;

        this.bind__onRecordingSuccess = this._onRecordingSuccess.bind(this);
        this.bind__onRecordingError = this._onRecordingError.bind(this);
        //this.bind__onUploadProgress = this._onUploadProgress.bind(this);
        this.bind__previewVideoForwardFunctionCut = this._previewVideoForwardFunctionCut.bind(this);
        this.bind__previewVideoForwardFunctionDone = this._previewVideoForwardFunctionDone.bind(this);
        this.bind__previewVideoForwardFunctionDoneAndPost = this._previewVideoForwardFunctionDoneAndPost.bind(this);
        this.bind__previewVideoBackFunction = this._previewVideoBackFunction.bind(this);
    };

    MediaChooser.TAG = "MediaChooser";

    MediaChooser.Event = {
        SUCCESS: "success",
        SUCCESS_AND_POST: "successAndPost",
        ERROR: "error",
        RESET: "reset",
        DIALOG_CLOSE: "dialogClose"
    };

    MediaChooser.MEDIA_TYPES = ["audio", "video", "image", "other"];

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

    MediaChooser.prototype.bindUIEvents = function() {
        console.log("%s: %s", MediaChooser.TAG, "bindUIEvents");

        if (this.isPost) {
            this._bindUIEventsPost();
            return;
        }

        $("#recordVideo").on("click", (function(e) {
            e.preventDefault();

            this.chooseFile({
                type: MediaChooser.TYPE_RECORD_VIDEO
            });
        }).bind(this));

        this._bindUIEventsUploadFile(
            $("#uploadForms"),
            $("#uploadFile"));

        $("#selectFile").on("click", (function(e) {
            e.preventDefault();

            this.chooseFile({});
        }).bind(this));

        $("#removeFile").on("click", (function(e) {
            e.preventDefault();

            this._invokeReset();
        }).bind(this));
    };

    MediaChooser.prototype._bindUIEventsPost = function() {
        console.log("%s: %s", MediaChooser.TAG, "_bindUIEventsPost");

        $("#recordVideoPost" + this.postId).on("click", (function(e) {
            e.preventDefault();

            this.chooseFile({
                type: MediaChooser.TYPE_RECORD_VIDEO
            });
        }).bind(this));

        $("#selectFilePost" + this.postId).on("click", (function(e) {
            e.preventDefault();

            this.chooseFile({});
        }).bind(this));

        this._bindUIEventsUploadFile(
            $("#uploadFormsPost" + this.postId),
            $("#uploadFilePost" + this.postId));

        $("#removeFilePost" + this.postId).on("click", (function(e) {
            e.preventDefault();

            this._invokeReset();
        }).bind(this));
    };

    /**
     * @param {object} formRootElement
     * @param {object} linkRootElement
     */
    MediaChooser.prototype._bindUIEventsUploadFile = function(formRootElement, linkRootElement) {
        console.log("%s: %s", MediaChooser.TAG, "_bindUIEventsUploadFile");

        $.each(MediaChooser.MEDIA_TYPES, (function(index, value) {
            var resourceFile = formRootElement.find("#imdc_terptube_" + value + "_media_resource_file");
            var title = formRootElement.find("#imdc_terptube_" + value + "_media_title");
            var form = formRootElement.find("form[name=imdc_terptube_" + value + "_media]");

            resourceFile.on("change", (function(e) {
                if (resourceFile.val() == "") {
                    return;
                }

                title.val(MediaChooser._cleanFileNameNoExt(resourceFile.val()));

                $("#uploadingFileTitle" + this.postSuffix).html(title.val());
                $("#chooseFile" + this.postSuffix).hide();

                this.loadNextPage({
                    url: Routing.generate("imdc_myfiles_add_" + value),
                    method: "POST",
                    data: new FormData(form[0]),
                    uploadProgress: true
                });

                resourceFile.val("");
                title.val("");
            }).bind(this));
        }).bind(this));

        $.each(MediaChooser.MEDIA_TYPES, function(index, value) {
            var link = linkRootElement.find("#upload-" + value + "-link");
            var resourceFile = formRootElement.find("#imdc_terptube_" + value + "_media_resource_file");

            link.on("click", function(e) {
                e.preventDefault();

                resourceFile.click();
            });
        });
    };

    MediaChooser.prototype.bindUIEventsSelectFromMyFiles = function() {
        console.log("%s: %s", MediaChooser.TAG, "bindUIEventsSelectFromMyFiles");

        $(".preview-button").on("click", (function(e) {
            e.preventDefault();

            if ($(e.target).hasClass("disabled")) {
                return false;
            }

            $("#preview").html("");

            this.previewMedia({
                mediaUrl: $(e.target).data("url"),
                mediaId: $(e.target).data("val")
            });
        }).bind(this));

        $(".select-button").on("click", (function(e) {
            e.preventDefault();

            this.setMedia({
                id: $(e.target).data("val"),
                title: $(e.target).data("title")
            });
            this._invokeSuccess();
            this._terminatingFunction();
        }).bind(this));
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
	fileName = fileName.split(/(\\|\/)/g).pop();
        return (fileName.substr(0, fileName.lastIndexOf('.')) || fileName).replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
    };

    /**
     * @param {object} options
     */
    MediaChooser.prototype.createVideoRecorder = function(options) {
        console.log("%s: %s", MediaChooser.TAG, "createVideoRecorder");

        this.recorder = new Player(options.videoElement, {
            areaSelectionEnabled: false,
            updateTimeType: Player.DENSITY_BAR_UPDATE_TYPE_ABSOLUTE,
            type: Player.DENSITY_BAR_TYPE_RECORDER,
            audioBar: false,
            volumeControl: false,
            recordingSuccessFunction: this.bind__onRecordingSuccess,
            recordingErrorFunction: this.bind__onRecordingError,
            recordingPostURL: Routing.generate('imdc_myfiles_add_recording'),
            forwardButtons: options.forwardButtons,
            forwardFunctions: options.forwardFunctions
        });

        $(this.recorder).on(Player.EVENT_RECORDING_UPLOAD_PROGRESS, function(e, percentComplete) {
            MediaChooser._updateUploadProgress($("#recordVideoUploadProgress"), percentComplete);
        });

        $(this.recorder).on(Player.EVENT_RECORDING_UPLOADED, function(data) {
            $("#recordVideoUploadProgress").hide();
        });

        this.recorder.createControls();

        //TODO revise
        options.videoElement.parents(".ui-dialog").on("dialogbeforeclose", (function(event, ui) {
            console.log("videoElement dialogbeforeclose");
            if (this.recorder != null) {
                this.recorder.destroyRecorder();
            }
        }).bind(this));
    };

    MediaChooser.prototype._onRecordingSuccess = function(data) {
        console.log("%s: %s- mediaId=%d", MediaChooser.TAG, "_onRecordingSuccess", data.media.id);

        this.setMedia(data.media);
    };

    MediaChooser.prototype._onRecordingError = function(e) {
        console.log("%s: %s- e=%s", MediaChooser.TAG, "_onRecordingError", e);
    };

    MediaChooser.prototype.destroyVideoRecorder = function() {
        console.log("%s: %s", MediaChooser.TAG, "destroyVideoRecorder");

        this.recorder.destroyRecorder();
    };

    MediaChooser.prototype._onUploadProgress = function(percentComplete) {
        console.log("%s: %s- percentComplete=%d", MediaChooser.TAG, "_onUploadProgress", percentComplete);

        MediaChooser._updateUploadProgress($("#uploadProgress" + this.postSuffix), percentComplete);
    };

    MediaChooser._updateUploadProgress = function(element, percentComplete) {
        var progressBar = element.find(".progress-bar");

        element.show();

        progressBar.attr("aria-valuenow", percentComplete);
        progressBar.css("width", percentComplete + "%");
        progressBar.html(percentComplete + "%");
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

    //TODO rename after merge with loadNextPage
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
        data.isPost = this.isPost ? 1 : 0;
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

    //TODO try to eliminate this step
    MediaChooser.prototype._loadMediaPage = function(mediaUrl, mediaId) {
        console.log("%s: %s", MediaChooser.TAG, "_loadMediaPage");
        this.loadNextPage({
            url: mediaUrl,
            method: "POST",
            data: {mediaId: mediaId},
            preview: true,
            isPost: this.isPost ? 1 : 0
        });
    };

    //TODO try to merge into _loadChooserPage
    MediaChooser.prototype.loadNextPage = function(options) {
        console.log("%s: %s", MediaChooser.TAG, "loadNextPage");

        var request = {
            url: options.url,
            data: options.data,
            success: (function(data, textStatus, jqXHR) {
                console.log("%s: %s: %s- finished=%s", MediaChooser.TAG, "loadNextPage", "success", data.finished);

                this.setMedia(data.media);

                if (typeof data.finished !== "undefined" && data.finished === true) {
                    if (this.media != null) {
                        this._invokeSuccess();
                    }
                    this._terminatingFunction();
                } else {
                    this.element.html(data.page);

                    if (options.preview) {
                        $('#preview-media-title').blur((function(e) {
                            console.log('updated title');
                            this.media.title = $('#preview-media-title').val();
                            this.mediaManager.updateMedia(this.media);
                        }).bind(this));
                    }
                }
            }).bind(this),
            error: (function(jqXHR, textStatus, errorThrown) {
                console.log("%s: %s: %s", MediaChooser.TAG, "loadNextPage", "error");

                this._invokeError(jqXHR);
            }).bind(this)
        };

        request.type = (typeof options.method === "undefined") ? "GET" : options.method;

        if (options.method != "GET") {
            request.processData = false;
            request.contentType = false;
        }

        if (options.uploadProgress) {
            request.xhr = (function() {
                var xhr = $.ajaxSettings.xhr();
                xhr.upload.addEventListener("progress", (function(e) {
                    if (!e.lengthComputable) return;

                    this._onUploadProgress(Math.floor((e.loaded / e.total) * 100));
                }).bind(this), false);

                return xhr;
            }).bind(this);
        }

        $.ajax(request);
    };

    MediaChooser.prototype._popUp = function(type, onOpen) {
        console.log("%s: %s", MediaChooser.TAG, "_popUp");

        this.element.dialog({
            autoOpen: false,
            resizable: false,
            modal: true,
            draggable: false,
            closeOnEscape: true,
            dialogClass: "tt-popup-dialog",
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
                at: "top",
                my: "top"
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
        if (this.isPost || this.isNewPost) {
            forwardButtons = ["<button class='cutButton'></button>", "<button class='doneButton'></button>", "<button class='doneAndPostButton'></button>"];
            forwardFunctions = [this.bind__previewVideoForwardFunctionCut, this.bind__previewVideoForwardFunctionDone, this.bind__previewVideoForwardFunctionDoneAndPost];
        }
        var backButtons;
        var backFunctions;
        if (typeof this.recording != 'undefined' && this.recording)
        {
        	backButtons = ["<button class='backButton'></button>"];
        	backFunctions = [this.bind__previewVideoBackFunction];
    	}
        
        this.player = new Player($("#" + this.media.id), {
            areaSelectionEnabled: true,
            audioBar : false,
            updateTimeType: Player.DENSITY_BAR_UPDATE_TYPE_RELATIVE,
            //playHeadImage: "images/feedback_icons/round_plus.png",
            //playHeadImageOnClick: function(){ alert("plus");},
            forwardButtons: forwardButtons,
            forwardFunctions: forwardFunctions,
            backButtons: backButtons,
            backFunctions: backFunctions,
            selectedRegionColor : "#0000ff"
        });
        this.player.createControls();
    };

    MediaChooser.prototype._previewVideoBackFunction = function(data) {
        console.log("%s: %s", MediaChooser.TAG, "_previewVideoBackFunction");

        // delete the current media!
        this.mediaManager.deleteMedia(this.media.id);

        // Go back to recording
        this.element.html("");
        this.media = null;
        this._loadChooserPage(MediaChooser.TYPE_RECORD_VIDEO);
    };

    MediaChooser.prototype._previewVideoForwardFunctionCut = function(data) {
        console.log("%s: %s", MediaChooser.TAG, "_previewVideoForwardFunctionCut");

        var previousMinMaxTimes = this.player.getCurrentMinMaxTime();
        var currentMinMaxTimes = this.player.getAreaSelectionTimes();
        this.player.setCurrentMinMaxTime(currentMinMaxTimes.minTime, currentMinMaxTimes.maxTime);

        // console.log(recorderConfiguration);
        // var fn = window[recorderConfiguration.forwardFunction]||null;
        // fn(data);
        // console.log('Cut!', data);

        console.log("Current Min/Max Times %s %s", currentMinMaxTimes.minTime, currentMinMaxTimes.maxTime);
        console.log("Cutting to Min/Max Times %s %s", currentMinMaxTimes.minTime - previousMinMaxTimes.minTime, currentMinMaxTimes.maxTime - previousMinMaxTimes.minTime);

        this.mediaManager.trimMedia(this.media.id,
            currentMinMaxTimes.minTime - previousMinMaxTimes.minTime,
            currentMinMaxTimes.maxTime - previousMinMaxTimes.minTime);
    };

    MediaChooser.prototype._previewVideoForwardFunctionDone = function(data) {
        console.log("%s: %s", MediaChooser.TAG, "_previewVideoForwardFunctionDone");

        // console.log(recorderConfiguration);
        // var fn = window[recorderConfiguration.forwardFunction]||null;
        // fn(data);
        // console.log('Done!', data);

        if (this.media != null) {
            // var mediaManager = new MediaManager();
            // this.media.title = $('#preview-media-title').val();
            // mediaManager.updateMedia(this.media);
            this._invokeSuccess();
        }
        this._terminatingFunction();
    };

    MediaChooser.prototype._previewVideoForwardFunctionDoneAndPost = function(data) {
        console.log("%s: %s", MediaChooser.TAG, "_previewVideoForwardFunctionDoneAndPost");

        // console.log(recorderConfiguration);
        // var fn = window[recorderConfiguration.forwardFunction]||null;
        // fn(data);
				// console.log('Done!', data);

        if (this.media != null) {
            // var mediaManager = new MediaManager();
            // this.media.title = $('#preview-media-title').val();
            // mediaManager.updateMedia(this.media);
            this._invokeSuccess(true);
        }
        this._terminatingFunction();
    };

    MediaChooser.prototype._terminatingFunction = function() {
        console.log("%s: %s", MediaChooser.TAG, "_terminatingFunction");

        if (this.element.dialog("isOpen")) {
            this.element.off("dialogclose");
            this.element.dialog("close");
        }

        /*if (jQuery.isFunction(this.callbacks.dialogClose)) {
            this.callbacks.dialogClose(this.media);
        }*/
        $(this).trigger($.Event(MediaChooser.Event.DIALOG_CLOSE, {media: this.media}));
    };

    MediaChooser.prototype._invokeSuccess = function(doPost) {
        console.log("%s: %s", MediaChooser.TAG, "_invokeSuccess");

        var event = {
            media: this.media,
            postId: this.postId
        };

        $("#uploadingFileTitle" + this.postSuffix).html("");
        $("#uploadProgress" + this.postSuffix).hide();

        if (this.isFileSelection) {
            $("#chooseFile" + this.postSuffix).hide();
            $("#selectedFileTitle" + this.postSuffix).html(this.media.title);
            $("#selectedFile" + this.postSuffix).show();
        } else {
            $("#chooseFile" + this.postSuffix).show();
        }

        if (typeof doPost != "undefined" && doPost == true)
            //this.callbacks.successAndPost(this.media);
            $(this).trigger($.Event(MediaChooser.Event.SUCCESS_AND_POST, event));
        else
            //this.callbacks.success(this.media);
            $(this).trigger($.Event(MediaChooser.Event.SUCCESS, event));
    };

    MediaChooser.prototype._invokeError = function(jqXHR) {
        console.log("%s: %s- jqXHR=%o", MediaChooser.TAG, "_invokeError", jqXHR);

        $("#uploadingFileTitle" + this.postSuffix).html("");
        $("#uploadProgress" + this.postSuffix).hide();
        $("#chooseFile" + this.postSuffix).show();

        if (this.isFileSelection) {
            $("#selectedFile" + this.postSuffix).hide();
            $("#selectedFileTitle" + this.postSuffix).html("");
        }

        $(this).trigger($.Event(MediaChooser.Event.ERROR, {jqXHR: jqXHR}));
    };

    MediaChooser.prototype._invokeReset = function() {
        console.log("%s: %s", MediaChooser.TAG, "_invokeReset");

        $("#uploadingFileTitle" + this.postSuffix).html("");
        $("#uploadProgress" + this.postSuffix).hide();
        $("#chooseFile" + this.postSuffix).show();

        if (this.isFileSelection) {
            $("#selectedFile" + this.postSuffix).hide();
            $("#selectedFileTitle" + this.postSuffix).html("");
        }

        this.setMedia(null);

        //this.callbacks.reset();
        $(this).trigger($.Event(MediaChooser.Event.RESET, {postId: this.postId}));
    };

    MediaChooser.prototype.setMedia = function(media) {
        console.log("%s: %s", MediaChooser.TAG, "setMedia");

        this.media = typeof media != "undefined" ? media : this.media;
    };

    return MediaChooser;
});
