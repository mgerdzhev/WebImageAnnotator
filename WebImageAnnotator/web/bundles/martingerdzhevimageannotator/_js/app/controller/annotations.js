define(['core/mediaChooser', 'core/mediaManager'], function(MediaChooser, MediaManager) {
    var Annotations = function() {
        this.page = null;
        this.mediaChooser = null;
        this.mediaManager = new MediaManager();
        this.forwardButton = "<button class='forwardButton'></button>";

        this.bind__onPreviewButtonClick = this.onPreviewButtonClick.bind(this);
        this.bind__onDeleteButtonClick = this.onDeleteButtonClick.bind(this);
        this.bind__onSuccess = this._onSuccess.bind(this);
        this.bind__onDialogClose = this._onDialogClose.bind(this);
        this.bind_forwardFunction = this.forwardFunction.bind(this);

    }

    Annotations.TAG = "Annotations";

    Annotations.Page = {
        INDEX: 0,
        PREVIEW: 1
    };

    /**
     * MediaChooser options for each related page that uses MediaChooser
     * @param {number} page
     */
    Annotations.mediaChooserOptions = function(page) {
        switch (page) {
            case Annotations.Page.INDEX:
                return {
                    element: $("#preview"),
                    isPopUp: true,
                    isFileSelection: false
                };
            case Annotations.Page.PREVIEW:
                return {};
        }
    };

    /**
     * ui element event bindings in order of appearance
     * @param {number} page
     */
    Annotations.prototype.bindUIEvents = function(page) {
        console.log("%s: %s- page=%d", Annotations.TAG, "bindUIEvents", page);

        this.page = page;

        switch (this.page) {
            case Annotations.Page.INDEX:
                this._bindUIEventsIndex();
                break;
            case Annotations.Page.PREVIEW:
                break;
        }
    };

    Annotations.prototype._bindUIEventsIndex = function() {
        console.log("%s: %s", Annotations.TAG, "_bindUIEventsIndex");

        this.mediaChooser = new MediaChooser(Annotations.mediaChooserOptions(Annotations.Page.INDEX));
        $(this.mediaChooser).on(MediaChooser.Event.SUCCESS, this.bind__onSuccess);
        $(this.mediaChooser).on(MediaChooser.Event.DIALOG_CLOSE, this.bind__onDialogClose);
        this.mediaChooser.bindUIEvents();

        $(".preview-button").on("click", this.bind__onPreviewButtonClick);
        $(".delete-button").on("click", this.bind__onDeleteButtonClick);
    };

    Annotations.prototype.onPreviewButtonClick = function(e) {
        e.preventDefault();
        console.log("Preview");
        if ($(e.target).hasClass("disabled")) {
            return false;
        }
        $('#preview').html('');
        this.page = Annotations.Page.PREVIEW;
        this.mediaChooser.previewMedia({
            mediaUrl: $(e.target).data("url"),
            mediaId: $(e.target).data("val")
        });
    };

    Annotations.prototype.onDeleteButtonClick = function(e) {
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

    Annotations.prototype._onSuccess = function(e) {
        switch (this.page) {
            case Annotations.Page.INDEX:
                this._addMediaRow(e.media); //FIXME pagination makes this impractical
                break;
            case Annotations.Page.PREVIEW:
                console.log("Done previewing");
                break;
        }
    };

    Annotations.prototype._onDialogClose = function(e) {
        switch (this.page) {
            case Annotations.Page.PREVIEW:
                this.page = Annotations.Page.INDEX;
                console.log("Terminating function called");
                console.log(e.media);
                this._updateMediaRow(e.media);
                break;
        }
    };


    Annotations.prototype.forwardFunction = function() {
        console.log("%s: %s", Annotations.TAG, "forwardFunction");

        this.mediaChooser.destroyVideoRecorder();

        this.mediaChooser.previewMedia({
            type: MediaChooser.TYPE_RECORD_VIDEO,
            mediaUrl: Routing.generate('imdc_myfiles_preview', { mediaId: this.mediaChooser.media.id }),
            mediaId: this.mediaChooser.media.id,
            recording: true
        });
    };



    return Annotations;
});
