define([ 'core/mediaChooser', 'core/mediaManager' ], function(MediaChooser, MediaManager)
{
    var Datasets = function()
    {
	this.page = null;
	this.dataset = null;

	this.bind__onDeleteButtonClick = this.onDeleteButtonClick.bind(this);
	this.bind__onSuccess = this._onSuccess.bind(this);
	this.bind__onDialogClose = this._onDialogClose.bind(this);
	this.bind_forwardFunction = this.forwardFunction.bind(this);
	this.bind__onAnnotationTypeAddButtonClick = this._onAnnotationTypeAddButtonClick.bind(this);
	this.bind__onAnnotationTypeDeleteButtonClick = this._onAnnotationTypeDeleteButtonClick.bind(this)

    }

    Datasets.TAG = "Datasets";

    Datasets.Page = {
	INDEX : 0,
	BROWSE : 1
    };

    /**
     * MediaChooser options for each related page that uses MediaChooser
     * 
     * @param {number}
     *                page
     */
    Datasets.mediaChooserOptions = function(page)
    {
	switch (page)
	{
	case Datasets.Page.INDEX:
	    return {};
	case Datasets.Page.BROWSE:
	    return {};
	}
    };

    /**
     * ui element event bindings in order of appearance
     * 
     * @param {number}
     *                page
     */
    Datasets.prototype.bindUIEvents = function(page)
    {
	console.log("%s: %s- page=%d", Datasets.TAG, "bindUIEvents", page);

	this.page = page;

	switch (this.page)
	{
	case Datasets.Page.INDEX:
	    this._bindUIEventsIndex();
	    break;
	case Datasets.Page.BROWSE:
	    this._bindUIEventsBrowse();
	    break;
	}
    };

    Datasets.prototype._bindUIEventsIndex = function()
    {
	console.log("%s: %s", Datasets.TAG, "_bindUIEventsIndex");

	this.element = $("#annotation-type-chooser");

	$("#annotation-type-add").on("click", this.bind__onAnnotationTypeAddButtonClick);
	$(".annotation-type-delete").on("click", this.bind__onAnnotationTypeDeleteButtonClick);
    };

    Datasets.prototype._bindUIEventsBrowse = function()
    {
	console.log("%s: %s", Datasets.TAG, "_bindUIEventsIndex");

	this.element = $("#annotation-type-chooser");

	$("#annotation-type-add").on("click", this.bind__onAnnotationTypeAddButtonClick);
	$(".annotation-type-delete").on("click", this.bind__onAnnotationTypeDeleteButtonClick);
    };

    Datasets.prototype.showAnnotationTypeChooser = function()
    {
	var instance = this;
	var url = Routing.generate('image_annotator_dataset_annotation_types_show', {
	    datasetId : this.datasetId,
	    type : 'remaining'
	});
	var data = {
	    datasetId : this.datasetId,
	    type : 'remaining'
	};
	this.ajaxLoadPage(url, data, function(data)
	{
	    console.log("success");
	    instance.element.html(data.page);

	    // Add event listeners to the buttons
	    $("#annotation-type-add-to-dataset").on("click", function(e)
	    {
		var annotationName = $('#annotaion-type-name').val();
		var url = Routing.generate('image_annotator_dataset_annotation_types_create', {
		    datasetId : instance.datasetId,
		    name : annotationName
		});
		var data = {
		    datasetId : instance.datasetId,
		    name : annotationName
		};
		instance.ajaxLoadPage(url, data, function(data)
		{

		    if (data.responseCode == 400)
			console.log("Already exists");
		    else
			console.log("Successfully added");
		    instance.element.dialog("close");
		}, function(data)
		{
		    console.log("Error adding");
		});

	    });

	    $("#annotation-type-choose").on("click", function(e)
	    {
		var annotationChoice = $('#annotation-type-choice').val();
		if (annotationChoice == null)
		{
		    return;
		}
		var url = Routing.generate('image_annotator_dataset_annotation_types_add', {
		    datasetId : instance.datasetId,
		    annotationTypeId : annotationChoice
		});
		var data = {
		    datasetId : instance.datasetId,
		    annotationTypeId : annotationChoice
		};
		instance.ajaxLoadPage(url, data, function(data)
		{

		    if (data.responseCode == 400)
			console.log("Already exists");
		    else
			console.log("Successfully added");
		    instance.element.dialog("close");
		}, function(data)
		{
		    console.log("Error adding");
		});

	    });
	}, function(e)
	{
	    console.log("error");
	})
    }

    Datasets.prototype.ajaxLoadPage = function(url, data, onSuccess, onError)
    {
	var request = {
	    type : "POST",
	    processData : false,
	    contentType : false,
	    url : url,
	    data : data,
	    success : (function(data, textStatus, jqXHR)
	    {
		onSuccess.call(this, data);
	    }).bind(this),
	    error : (function(jqXHR, textStatus, errorThrown)
	    {
		onError.call(this, errorThrown);

	    }).bind(this)
	};
	$.ajax(request);
    }

    Datasets.prototype._onAnnotationTypeAddButtonClick = function(e)
    {
	console.log("Add clicked");

	this.element.dialog({
	    autoOpen : false,
	    resizable : false,
	    modal : true,
	    draggable : false,
	    closeOnEscape : true,
	    dialogClass : "ia-popup-dialog",
	    open : (function(event, ui)
	    {
		console.log("%s: %s: %s", MediaChooser.TAG, "_popUp", "open");

		// $(".ui-dialog-titlebar-close", this.parentNode).hide();
		this.showAnnotationTypeChooser();
	    }).bind(this),
	    create : function(event, ui)
	    {
		console.log("%s: %s: %s", MediaChooser.TAG, "_popUp", "create");

		// $(event.target).parent().css('position', 'relative');
	    },
	    close : (function(event, ui)
	    {
		console.log("%s: %s: %s", MediaChooser.TAG, "_popUp", "close");

		// $(".ui-dialog-titlebar-close", this.parentNode).hide();
		this.element.html("");
	    }).bind(this),
	    show : "blind",
	    hide : "blind",
	    minWidth : 740,
	    position : {
		at : "top",
		my : "top"
	    },
	    title : 'Add annotation type'
	});

	this.element.dialog("open");
    };

    Datasets.prototype._onAnnotationTypeDeleteButtonClick = function(e)
    {
	console.log("Delete Annotation clicked");
    }

    Datasets.prototype.onDeleteButtonClick = function(e)
    {
	e.preventDefault();

	var file = $(e.target);

	$(this.mediaManager).one(MediaManager.EVENT_DELETE_SUCCESS, function()
	{
	    file.parent().parent().parent().remove();
	});
	$(this.mediaManager).one(MediaManager.EVENT_DELETE_ERROR, function(error, e)
	{
	    if (e.status == 500)
	    {
		alert(e.statusText);
	    }
	    else
	    {
		alert('Error: ' + error);
	    }
	});

	return this.mediaManager.deleteMedia(file.data("val"), $("#mediaDeleteConfirmMessage").html());

	/*
	 * var response = confirm($("#mediaDeleteConfirmMessage").html()); if (!response) { return false; } var file =
	 * $(e.target); var address = file.data("url");
	 * 
	 * $.ajax({ url: address, type: "POST", contentType: "application/x-www-form-urlencoded", data: { mediaId:
	 * file.data("val") }, success: function(data) { if (data.responseCode == 200) {
	 * file.parent().parent().remove(); } else if (data.responseCode == 400) { // bad request alert('Error: ' +
	 * data.feedback); } else { alert('An unexpected error occured'); } }, error: function(request) {
	 * console.log(request.statusText); } });
	 */
    };

    Datasets.prototype._onSuccess = function(e)
    {
	switch (this.page)
	{
	case Datasets.Page.INDEX:
	    this._addMediaRow(e.media); // FIXME pagination makes this impractical
	    break;
	case Datasets.Page.PREVIEW:
	    console.log("Done previewing");
	    break;
	}
    };

    Datasets.prototype._onDialogClose = function(e)
    {
	switch (this.page)
	{
	case Datasets.Page.PREVIEW:
	    this.page = Datasets.Page.INDEX;
	    console.log("Terminating function called");
	    console.log(e.media);
	    this._updateMediaRow(e.media);
	    break;
	}
    };

    Datasets.prototype.forwardFunction = function()
    {
	console.log("%s: %s", Datasets.TAG, "forwardFunction");

	this.mediaChooser.destroyVideoRecorder();

	this.mediaChooser.previewMedia({
	    type : MediaChooser.TYPE_RECORD_VIDEO,
	    mediaUrl : Routing.generate('imdc_myfiles_preview', {
		mediaId : this.mediaChooser.media.id
	    }),
	    mediaId : this.mediaChooser.media.id,
	    recording : true
	});
    };

    return Datasets;
});
