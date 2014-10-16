define([ 'core/mediaChooser', 'core/mediaManager', 'core/annotation' ],
	function(MediaChooser, MediaManager, Annotation)
	{
	    var Annotations = function()
	    {
		this.page = null;
		this.mediaChooser = null;
		this.mediaManager = new MediaManager();
		this.annotations = new Array();
		this.bind__onPolygonButtonClick = this.onPolygonButtonClick.bind(this);
		this.bind__onRemovePolygonButtonClick = this.onRemovePolygonButtonClick.bind(this);
		this.bind__onZoomInButtonClick = this.onZoomInButtonClick.bind(this);
		this.bind__onZoomOutButtonClick = this.onZoomOutButtonClick.bind(this);
		this.bind__onSaveButtonClick = this.onSaveButtonClick.bind(this);
		this.bind__polygonMouseClickListener = this.polygonMouseClickListener.bind(this);
		this.isFirstPoint = true;
	    };

	    Annotations.TAG = "Annotations";

	    Annotations.Page = {
		INDEX : 0,
		PREVIEW : 1
	    };

	    Annotations.prototype.setCanvasElement = function(canvasId)
	    {
		this.canvasId = canvasId;
		this.canvasElement = $("#" + canvasId);
		this.imageElement = this.canvasElement.next('.ia-media-img');
		this.canvasElement.width(this.imageElement.width());
		this.canvasElement.height(this.imageElement.height());
		console.log(this.canvasElement.eq(0));
		this.canvas = new Raphael(canvasId, this.imageElement.width(), this.imageElement.height());
	    };
	    /**
	     * MediaChooser options for each related page that uses MediaChooser
	     * 
	     * @param {number}
	     *                page
	     */
	    Annotations.mediaChooserOptions = function(page)
	    {
		switch (page)
		{
		case Annotations.Page.INDEX:
		    return {
			element : $("#preview"),
			isPopUp : true,
			isFileSelection : false
		    };
		case Annotations.Page.PREVIEW:
		    return {};
		}
	    };

	    /**
	     * ui element event bindings in order of appearance
	     * 
	     * @param {number}
	     *                page
	     */
	    Annotations.prototype.bindUIEvents = function(page)
	    {
		console.log("%s: %s- page=%d", Annotations.TAG, "bindUIEvents", page);

		this.page = page;

		switch (this.page)
		{
		case Annotations.Page.INDEX:
		    this._bindUIEventsIndex();
		    break;
		case Annotations.Page.PREVIEW:
		    break;
		}
	    };

	    Annotations.prototype._bindUIEventsIndex = function()
	    {
		console.log("%s: %s", Annotations.TAG, "_bindUIEventsIndex");
		$("#annotation-polygon-button").on("click", this.bind__onPolygonButtonClick);
		$("#annotation-remove-polygon-button").on("click", this.bind__onRemovePolygonButtonClick);
		$("#annotation-zoom-in-button").on("click", this.bind__onZoomInButtonClick);
		$("#annotation-zoom-out-button").on("click", this.bind__onZoomOutButtonClick);
		$("#annotation-save-button").on("click", this.bind__onSaveButtonClick);

		var instance = this;

		$('a[name=annotation-type-button]').on("click", function(e)
		{
		    e.preventDefault();
		    var button = $(e.target);
		    if (!$(button).is('a'))
			button = $(button).parent();
		    button = button.eq(0);
		    console.log(button);
		    if (!button.hasClass('active'))
		    {
			instance.currentAnnotationType = button.attr('data-val');
			button.siblings().removeClass('active');
		    }
		    else
		    {
			button.removeClass('active')
		    }
		});
	    };

	    Annotations.prototype.onPolygonButtonClick = function(e)
	    {
		e.preventDefault();
		var button = $(e.target);
		if (!$(button).is('a'))
		    button = $(button).parent();
		button = button.eq(0);
		console.log(button);
		if (!button.hasClass('active'))
		{
		    button.siblings().removeClass('active');
		    this.canvasElement.on("click", this.bind__polygonMouseClickListener);
		}
		console.log("Polygon");
//		this.canvasElement.off("click", this.bind__polygonMouseClickListener);
		
		
	    };

	    Annotations.prototype.polygonMouseClickListener = function(e)
	    {
		console.log("click");
		var offset = $(this.canvasElement).offset();
		var coords = {
		    x : Math.round(e.clientX - offset.left),
		    y : Math.round(e.clientY - offset.top)
		};

		if (this.isFirstPoint)
		{
		    var instance = this;
		    var polygon = this.canvas.path("M" + coords.x + "," + coords.y);
		    var annotation = new Annotation();
		    annotation.addPoint(coords.x, coords.y);
		    annotation.setPolygonId(polygon.id);
		    this.annotations.push(annotation);
		    this.isFirstPoint = false;
		    var circle = this.canvas.circle(coords.x, coords.y, 8);
		    circle.click(function(e)
		    {
			instance.canvasElement.off("click", instance.bind__polygonMouseClickListener);
			var polygon = instance.canvas.getById(annotation.getPolygonId());
			// console.log(polygon.attr('path'));
			polygon.attr('path', polygon.attr('path') + 'Z');
			polygon.attr("fill", annotation.color);
			polygon.attr("fill-opacity", 0.5);
			console.log("Annotation polygon closed");
			circle.remove();
//			instance.canvasElement.on("click", instance.bind__polygonMouseClickListener);
			
			image_annotator_annotation_add
			
			instance.isFirstPoint = true;
			$("#annotation-polygon-button").click();
			
		    });
		    circle.attr("fill", "#FFFFFF");
		    circle.attr("stroke", "#FF0000");
		    console.log("First point");
		}
		else
		{
		    var annotation = this.annotations[this.annotations.length - 1];
		    var polygon = this.canvas.getById(annotation.getPolygonId());
		    annotation.addPoint(coords.x, coords.y);
		    polygon.attr('path', polygon.attr('path') + "L" + coords.x + "," + coords.y);
		    polygon.toBack();
		    polygon.attr("stroke", annotation.color);
		    // polygon.attr("fill", annotation.color);
		    // polygon.attr("fill-opacity", 0.5);
		    console.log("new point");

		}
	    }
	    Annotations.prototype.onRemovePolygonButtonClick = function(e)
	    {
		e.preventDefault();
		var button = $(e.target);
		if (!$(button).is('a'))
		    button = $(button).parent();
		button = button.eq(0);
		console.log(button);
		if (!button.hasClass('active'))
		{
		    button.siblings().removeClass('active');
		    this.canvasElement.off("click", this.bind__polygonMouseClickListener);
		}
		console.log("Polygon Remove");
	    };

	    Annotations.prototype.onZoomInButtonClick = function(e)
	    {
		e.preventDefault();
		var button = $(e.target);
		if (!$(button).is('a'))
		    button = $(button).parent();
		button = button.eq(0);
		console.log(button);
		if (!button.hasClass('active'))
		{
		    this.canvasElement.off("click", this.bind__polygonMouseClickListener);
		    button.siblings().removeClass('active');
		}
		console.log("Zoom In");
	    };

	    Annotations.prototype.onZoomOutButtonClick = function(e)
	    {
		e.preventDefault();
		var button = $(e.target);
		if (!$(button).is('a'))
		    button = $(button).parent();
		button = button.eq(0);
		console.log(button);
		if (!button.hasClass('active'))
		{
		    this.canvasElement.off("click", this.bind__polygonMouseClickListener);
		    button.siblings().removeClass('active');
		}
		console.log("Zoom Out");
	    };

	    Annotations.prototype.onSaveButtonClick = function(e)
	    {
		e.preventDefault();
		var button = $(e.target);
		if (!$(button).is('a'))
		    button = $(button).parent();
		button = button.eq(0);
		console.log(button);
		if (!button.hasClass('active'))
		{
		    this.canvasElement.off("click", this.bind__polygonMouseClickListener);
		    button.siblings().removeClass('active');
		}
		console.log("Save");
	    };

	    Annotations.prototype.onPreviewButtonClick = function(e)
	    {
		e.preventDefault();
		console.log("Preview");
		if ($(e.target).hasClass("disabled"))
		{
		    return false;
		}
		$('#preview').html('');
		this.page = Annotations.Page.PREVIEW;
		this.mediaChooser.previewMedia({
		    mediaUrl : $(e.target).data("url"),
		    mediaId : $(e.target).data("val")
		});
	    };

	    Annotations.prototype.onDeleteButtonClick = function(e)
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

	    Annotations.prototype._onSuccess = function(e)
	    {
		switch (this.page)
		{
		case Annotations.Page.INDEX:
		    this._addMediaRow(e.media); // FIXME pagination makes this
		    // impractical
		    break;
		case Annotations.Page.PREVIEW:
		    console.log("Done previewing");
		    break;
		}
	    };

	    Annotations.prototype._onDialogClose = function(e)
	    {
		switch (this.page)
		{
		case Annotations.Page.PREVIEW:
		    this.page = Annotations.Page.INDEX;
		    console.log("Terminating function called");
		    console.log(e.media);
		    this._updateMediaRow(e.media);
		    break;
		}
	    };

	    Annotations.prototype.forwardFunction = function()
	    {
		console.log("%s: %s", Annotations.TAG, "forwardFunction");

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

	    return Annotations;
	});
