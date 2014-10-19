define(
	[ 'core/mediaChooser', 'core/mediaManager', 'core/functions' ],
	function(MediaChooser, MediaManager, Functions)
	{
	    var Datasets = function()
	    {
		this.page = null;
		this.dataset = null;

		this.functions = new Functions();
		this.bind__onDeleteButtonClick = this.onDeleteButtonClick.bind(this);
		this.bind__onSuccess = this._onSuccess.bind(this);
		this.bind__onDialogClose = this._onDialogClose.bind(this);
		this.bind__onAnnotationTypeAddButtonClick = this._onAnnotationTypeAddButtonClick.bind(this);
		this.bind__onAnnotationTypeDeleteButtonClick = this._onAnnotationTypeDeleteButtonClick.bind(this);
	    };

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
		this.functions.ajaxLoadPage(url, data, function(data)
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
			instance.functions.ajaxLoadPage(url, data, function(data)
			{

			    if (data.responseCode == 400)
				console.log("Already exists");
			    else
			    {
				instance.appendAnnotationType(data.annotationType);
				console.log("Successfully added");
			    }
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
			instance.functions.ajaxLoadPage(url, data, function(data)
			{

			    if (data.responseCode == 400)
				console.log("Already exists");
			    else
			    {
				instance.appendAnnotationType(data.annotationType);
				console.log("Successfully added");
			    }
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
		this.deleteAnnotationType($(e.target).data('val'));
	    }

	    Datasets.prototype.appendAnnotationType = function(annotationType)
	    {
		console.log('appendAnnotation');
		var tableElement = $('.ia-annotation-types-table tbody');
		console.log(tableElement);
		var row = $("<tr></tr>");
		var col1 = '<td><div class="text-center"><a class="btn btn-danger btn-xs annotation-type-delete" href="#" data-val="'
			+ annotationType.id
			+ '"> <i class="fa fa-trash-o"></i>'
			+ $('.hide[data-val=annotation-type-delete-text]').eq(0).html() + '</a></div></td>';
		var col2 = '<td>' + annotationType.name + '</td>';
		row.html(col1 + col2);
		tableElement.append(row);
		$('a.annotation-type-delete[data-val=' + annotationType.id + ']').eq(0).on('click',
			this.bind__onAnnotationTypeDeleteButtonClick);
	    };

	    Datasets.prototype.deleteAnnotationType = function(annotationTypeId)
	    {
		var instance = this;
		var url = Routing.generate('image_annotator_dataset_annotation_types_remove', {
		    annotationTypeId : annotationTypeId,
		    datasetId : this.datasetId
		});
		var data = {
		    'annotationTypeId' : annotationTypeId,
		    'datasetId' : this.datasetId
		};
		this.functions.ajaxLoadPage(url, data, function(data)
		{
		    if (data.responseCode == 200)
		    {
			$('a.annotation-type-delete[data-val=' + annotationTypeId + ']').eq(0).parent().parent()
				.parent().remove();
			console.log("Deleted annotation type");
		    }
		    else
		    {
			console.log("error deleting annotation type");
		    }

		}, function(e)
		{
		    console.log("error deleting annotation type");
		});
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
		 * var response = confirm($("#mediaDeleteConfirmMessage").html()); if (!response) { return false; } var
		 * file = $(e.target); var address = file.data("url");
		 * 
		 * $.ajax({ url: address, type: "POST", contentType: "application/x-www-form-urlencoded", data: {
		 * mediaId: file.data("val") }, success: function(data) { if (data.responseCode == 200) {
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
		    console.log(e.media);
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

	    return Datasets;
	});
