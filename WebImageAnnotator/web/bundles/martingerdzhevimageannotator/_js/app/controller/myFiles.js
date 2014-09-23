define(['core/mediaChooser', 'core/mediaManager'], function(MediaChooser, MediaManager) {
    var MyFiles = function() {
        this.page = null;
        this.mediaChooser = null;
        this.mediaManager = new MediaManager();
        this.forwardButton = "<button class='forwardButton'></button>";

        this.bind__onPreviewButtonClick = this.onPreviewButtonClick.bind(this);
        this.bind__onDeleteButtonClick = this.onDeleteButtonClick.bind(this);
        this.bind__onSuccess = this._onSuccess.bind(this);
        this.bind__onDialogClose = this._onDialogClose.bind(this);
        this.bind_forwardFunction = this.forwardFunction.bind(this);

        dust.compileFn($("#mediaRow").html(), "mediaRow");
    }

    MyFiles.TAG = "MyFiles";

    MyFiles.Page = {
        INDEX: 0,
        PREVIEW: 1
    };

    /**
     * MediaChooser options for each related page that uses MediaChooser
     * @param {number} page
     */
    MyFiles.mediaChooserOptions = function(page) {
        switch (page) {
            case MyFiles.Page.INDEX:
                return {
                    element: $("#preview"),
                    isPopUp: true,
                    isFileSelection: false
                };
            case MyFiles.Page.PREVIEW:
                return {};
        }
    };

    /**
     * ui element event bindings in order of appearance
     * @param {number} page
     */
    MyFiles.prototype.bindUIEvents = function(page) {
        console.log("%s: %s- page=%d", MyFiles.TAG, "bindUIEvents", page);

        this.page = page;

        switch (this.page) {
            case MyFiles.Page.INDEX:
                this._bindUIEventsIndex();
                break;
            case MyFiles.Page.PREVIEW:
                break;
        }
    };

    MyFiles.prototype._bindUIEventsIndex = function() {
        console.log("%s: %s", MyFiles.TAG, "_bindUIEventsIndex");

        this.mediaChooser = new MediaChooser(MyFiles.mediaChooserOptions(MyFiles.Page.INDEX));
        $(this.mediaChooser).on(MediaChooser.Event.SUCCESS, this.bind__onSuccess);
        $(this.mediaChooser).on(MediaChooser.Event.DIALOG_CLOSE, this.bind__onDialogClose);
        this.mediaChooser.bindUIEvents();

        $(".preview-button").on("click", this.bind__onPreviewButtonClick);
        $(".delete-button").on("click", this.bind__onDeleteButtonClick);
    };

    MyFiles.prototype.onPreviewButtonClick = function(e) {
        e.preventDefault();
        console.log("Preview");
        if ($(e.target).hasClass("disabled")) {
            return false;
        }
        $('#preview').html('');
        this.page = MyFiles.Page.PREVIEW;
        this.mediaChooser.previewMedia({
            mediaUrl: $(e.target).data("url"),
            mediaId: $(e.target).data("val")
        });
    };

    MyFiles.prototype.onDeleteButtonClick = function(e) {
        e.preventDefault();

        var file = $(e.target);

        $(this.mediaManager).one(MediaManager.EVENT_DELETE_SUCCESS, function() {
            file.parent().parent().parent().remove();
        });
        $(this.mediaManager).one(MediaManager.EVENT_DELETE_ERROR, function(error, e) {
            if (e.status == 500) {
                alert(e.statusText);
            } else {
                alert('Error: ' + error);
            }
        });

        return this.mediaManager.deleteMedia(file.data("val"), $("#mediaDeleteConfirmMessage").html());

        /*var response = confirm($("#mediaDeleteConfirmMessage").html());
        if (!response) {
            return false;
        }
        var file = $(e.target);
        var address = file.data("url");

        $.ajax({
            url: address,
            type: "POST",
            contentType: "application/x-www-form-urlencoded",
            data: {
                mediaId: file.data("val")
            },
            success: function(data) {
                if (data.responseCode == 200) {
                    file.parent().parent().remove();
                } else if (data.responseCode == 400) { // bad request
                    alert('Error: ' + data.feedback);
                } else {
                    alert('An unexpected error occured');
                }
            },
            error: function(request) {
                console.log(request.statusText);
            }
        });*/
    };

    MyFiles.prototype._onSuccess = function(e) {
        switch (this.page) {
            case MyFiles.Page.INDEX:
                this._addMediaRow(e.media); //FIXME pagination makes this impractical
                break;
            case MyFiles.Page.PREVIEW:
                console.log("Done previewing");
                break;
        }
    };

    MyFiles.prototype._onDialogClose = function(e) {
        switch (this.page) {
            case MyFiles.Page.PREVIEW:
                this.page = MyFiles.Page.INDEX;
                console.log("Terminating function called");
                console.log(e.media);
                this._updateMediaRow(e.media);
                break;
        }
    };

    /**
     * @param {object} videoElement
     */
    MyFiles.prototype.createVideoRecorder = function(videoElement) {
        console.log("%s: %s", MyFiles.TAG, "createVideoRecorder");

        this.mediaChooser.createVideoRecorder({
            videoElement: videoElement,
            forwardButtons: [this.forwardButton],
            forwardFunctions: [this.bind_forwardFunction]
        });
    };

    MyFiles.prototype.forwardFunction = function() {
        console.log("%s: %s", MyFiles.TAG, "forwardFunction");

        this.mediaChooser.destroyVideoRecorder();

        this.mediaChooser.previewMedia({
            type: MediaChooser.TYPE_RECORD_VIDEO,
            mediaUrl: Routing.generate('imdc_myfiles_preview', { mediaId: this.mediaChooser.media.id }),
            mediaId: this.mediaChooser.media.id,
            recording: true
        });
    };

    MyFiles.prototype._addMediaRow = function(media) { //FIXME pagination makes this impractical
        console.log("%s: %s", MyFiles.TAG, "_addMediaRow");

        var data = {
                media: media
        };

        if (media.isReady == 0) {
            data.previewDisabled = true;
        }

        //TODO revise
        switch (media.type) {
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
        var timeUploaded = new Date(media.metaData.timeUploaded.date);
        var ampm = timeUploaded.getHours()>=12?"pm":"am";
        var hours = (timeUploaded.getHours()>12?timeUploaded.getHours()-12:timeUploaded.getHours());
        hours = hours<10?"0"+hours:hours;
        var time = hours+":"+(timeUploaded.getMinutes()<10?"0"+timeUploaded.getMinutes():timeUploaded.getMinutes())+ampm ;
        var timeDateString = time+" "+$.datepicker.formatDate('M d', timeUploaded);

        data.dateString = timeDateString;

        if (media.metaData.size > 0) {
            data.mediaSize = (media.metaData.size / 1024 / 1024).toFixed(2);
        }
        var instance = this;

        data.deleteUrl = Routing.generate('imdc_myfiles_remove', { mediaId: media.id });
        data.previewUrl = Routing.generate('imdc_myfiles_preview', { mediaId: media.id });
        data.newThreadUrl = Routing.generate('imdc_thread_new_from_media', { resourceid: media.id });
        data.simulRecordUrl = Routing.generate('imdc_media_simultaneous_record', { mediaID: media.id });

        dust.render("mediaRow", data, function(err, out) {
            $(".tt-myFiles-table").append(out);
        });

        $(".preview-button:last").on("click", this.bind__onPreviewButtonClick);
        $(".delete-button:last").on("click", this.bind__onDeleteButtonClick);
    };

    MyFiles.prototype._updateMediaRow = function(media) {
        //At this points it updates the title and the file-size
        console.log("%s: %s", MyFiles.TAG, "_updateMediaRow");

        var data = {
                media: media
        };

        if (media.metaData.size > 0) {
            data.mediaSize = (media.metaData.size / 1024 / 1024).toFixed(2) + " MB";
        }
        data.title = media.title;
        var row = $('a[data-val|='+data.media.id+']').eq(0).parents('tr').eq(0);
        console.log(row);
        row.children().eq(1).text(data.title);
        row.children().eq(4).text(data.mediaSize);
        var instance = this;

    };

    return MyFiles;
});
