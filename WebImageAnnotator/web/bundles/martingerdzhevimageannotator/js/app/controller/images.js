define(['core/mediaChooser', 'core/mediaManager'], function(MediaChooser, MediaManager) {
    var Images = function() {
        this.page = null;
        this.mediaChooser = null;
        this.mediaManager = new MediaManager();
        this.forwardButton = "<button class='forwardButton'></button>";
        this.datasetId = null;

        this.bind__onDeleteButtonClick = this.onDeleteButtonClick.bind(this);
        this.bind__onSuccess = this._onSuccess.bind(this);

    };

    Images.TAG = "Images";

    Images.Page = {
        INDEX: 0,
        PREVIEW: 1
    };

    /**
     * MediaChooser options for each related page that uses MediaChooser
     * @param {number} page
     */
    Images.mediaChooserOptions = function(page) {
        switch (page) {
            case Images.Page.INDEX:
                return {
                    element: $("#preview"),
                    isPopUp: true,
                    isFileSelection: false,
                    datasetId:this.datasetId
                };
            case Images.Page.PREVIEW:
                return {};
        }
    };

    /**
     * ui element event bindings in order of appearance
     * @param {number} page
     */
    Images.prototype.bindUIEvents = function(page) {
        console.log("%s: %s- page=%d", Images.TAG, "bindUIEvents", page);

        this.page = page;

        switch (this.page) {
            case Images.Page.INDEX:
                this._bindUIEventsIndex();
                break;
            case Images.Page.PREVIEW:
                break;
        }
    };

    Images.prototype._bindUIEventsIndex = function() {
        console.log("%s: %s", Images.TAG, "_bindUIEventsIndex");

        this.mediaChooser = new MediaChooser(Images.mediaChooserOptions(Images.Page.INDEX));
        this.mediaChooser.datasetId = this.datasetId;
        $(this.mediaChooser).on(MediaChooser.Event.SUCCESS, this.bind__onSuccess);
        $(this.mediaChooser).on(MediaChooser.Event.DIALOG_CLOSE, this.bind__onDialogClose);
        this.mediaChooser.bindUIEvents();

      //  $(".preview-button").on("click", this.bind__onPreviewButtonClick);
        $(".delete-button").on("click", this.bind__onDeleteButtonClick);
    };

    Images.prototype.onDeleteButtonClick = function(e) {
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
    Images.prototype.addRow = function(image)
    {
	console.log('appendImage');
	var tableElement = $('.ia-myFiles-table tbody');
	console.log(tableElement);
	var row = $("#image-row").html();
	
	var timeUploaded = new Date(image.metaData.timeUploaded.date);
        var ampm = timeUploaded.getHours()>=12?"pm":"am";
        var hours = (timeUploaded.getHours()>12?timeUploaded.getHours()-12:timeUploaded.getHours());
//        hours = hours<10?"0"+hours:hours;
        var time = hours+":"+(timeUploaded.getMinutes()<10?"0"+timeUploaded.getMinutes():timeUploaded.getMinutes())+ampm ;
        var timeDate = time+" "+$.datepicker.formatDate('M d yy', timeUploaded);
        var preview_url =  Routing.generate('image_annotator_image_preview', {'imageId': image.id});

        row = row.replace(/__image_id__/g, image.id);
	row = row.replace(/__image_title__/g, image.title);
	row = row.replace(/__image_date__/g, timeDate);
	row = row.replace(/__preview_path__/g, preview_url);
	tableElement.prepend(row);
	
        $(".delete-button:first").on("click", this.bind__onDeleteButtonClick);
    };
    
    Images.prototype._onSuccess = function(e) {
        switch (this.page) {
            case Images.Page.INDEX:
                console.log("Image successfully uploaded"); 
                for (var i=0; i<e.media.length; i++)
                {
                    this.addRow(e.media[i]);
                }
                break;
            case Images.Page.PREVIEW:
                console.log("Done previewing");
                break;
        }
    };

    return Images;
});
