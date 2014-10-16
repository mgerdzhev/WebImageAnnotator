define(
	[ 'core/mediaChooser', 'core/mediaManager', 'core/annotation',
		'core/functions' ],
	function(MediaChooser, MediaManager, Annotation, Functions)
	{
	    var Annotations = function(imageId, savedAnnotations)
	    {
		this.imageId = imageId;
		this.page = null;
		this.functions = new Functions();
		this.annotations = savedAnnotations;
		this.bind__onPolygonButtonClick = this.onPolygonButtonClick
			.bind(this);
		this.bind__onRemovePolygonButtonClick = this.onRemovePolygonButtonClick
			.bind(this);
		this.bind__onZoomInButtonClick = this.onZoomInButtonClick
			.bind(this);
		this.bind__onZoomOutButtonClick = this.onZoomOutButtonClick
			.bind(this);
		this.bind__onSaveButtonClick = this.onSaveButtonClick
			.bind(this);
		this.bind__polygonMouseClickListener = this.polygonMouseClickListener
			.bind(this);
		this.isFirstPoint = true;
	    };

	    Annotations.TAG = "Annotations";

	    Annotations.Page =
	    {
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
		this.canvas = new Raphael(canvasId, this.imageElement.width(),
			this.imageElement.height());
	    };

	    /**
	     * ui element event bindings in order of appearance
	     * 
	     * @param {number}
	     *                page
	     */
	    Annotations.prototype.bindUIEvents = function(page)
	    {
		console.log("%s: %s- page=%d", Annotations.TAG, "bindUIEvents",
			page);

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

	    Annotations.prototype.clearAlertMessage = function()
	    {
		$('#alert-text').removeClass('alert-danger');
		$('#alert-text').removeClass('alert-info');
		$('#alert-text').removeClass('alert-success');
		$('#alert-text').html("");
	    };

	    Annotations.prototype.appendAnnotation = function(annotation)
	    {
		var instance = this;
		var tableElement = $('.ia-annotation-table tbody');
		var row = $("<tr></tr>");
		var col1 = '<td><div class="text-center"><a class="btn btn-danger btn-xs annotation-type-delete" href="#" data-val="'
			+ annotation.id
			+ '"> <i class="fa fa-trash-o"></i></a></div></td>';
		var annotationName = $(
			'a[name=annotation-type-button][data-val='
				+ annotation.type + ']').eq(0).data('name');
		var col2 = '<td>' + annotationName + '</td>';
		row.html(col1 + col2);
		row.hover(function()
		{
		    var polygon = instance.canvas.getById(annotation.getPolygonId());
		    polygon.attr("fill-opacity", 0.8);
		}, function()
		{
		    var polygon = instance.canvas.getById(annotation.getPolygonId());
		    polygon.attr("fill-opacity", 0.1);
		});
		tableElement.append(row);
	    };

	    Annotations.prototype._bindUIEventsIndex = function()
	    {
		console.log("%s: %s", Annotations.TAG, "_bindUIEventsIndex");
		$("#annotation-polygon-button").on("click",
			this.bind__onPolygonButtonClick);
		$("#annotation-remove-polygon-button").on("click",
			this.bind__onRemovePolygonButtonClick);
		$("#annotation-zoom-in-button").on("click",
			this.bind__onZoomInButtonClick);
		$("#annotation-zoom-out-button").on("click",
			this.bind__onZoomOutButtonClick);
		$("#annotation-save-button").on("click",
			this.bind__onSaveButtonClick);

		var instance = this;
		for (var iterator = 0; iterator < this.annotations.length; iterator++)
		{
		    var annotation = this.annotations[iterator];
		    console.log(annotation);
		    var point = annotation.getPointAt(0);
		    var polygonString = "M" + point.x + "," + point.y;
		    for (var i = 1; i < annotation.getPolygonLength(); i++)
		    {
			var point = annotation.getPointAt(i);
			polygonString += "L" + point.x + "," + point.y;
		    }
		    polygonString += "Z";
		    var polygon = this.canvas.path(polygonString);
		    annotation.setPolygonId(polygon.id);
		    polygon.attr("fill", annotation.color);
		    polygon.attr("fill-opacity", 0.1);
		    polygon.attr("stroke", annotation.color);
		    polygon.attr("stroke-width", 3);
		    this.appendAnnotation(annotation);
		}

		$(document).keypress(
			function(e)
			{
			    var number = e.which - 48;
			    if ($('a[name=annotation-type-button][data-number='
				    + number + ']').length < 11)
			    {
				$(
					'a[name=annotation-type-button][data-number='
						+ number + ']').each(function()
				{
				    if (e.which - 48 == $(this).data('number'))
				    {
					$(this).click();
				    }
				});
			    }
			});

		$('a[name=annotation-type-button]')
			.on(
				"click",
				function(e)
				{
				    e.preventDefault();
				    var button = $(e.target);
				    if (!$(button).is('a'))
					button = $(button).parent();
				    button = button.eq(0);
				    if (!button.hasClass('active'))
				    {
					instance.currentAnnotationType = button
						.attr('data-val');
					$('#alert-text').addClass('alert-info');
					$('#alert-text')
						.html(
							"Current annotation type is: "
								+ $(
									'a[name=annotation-type-button][data-val='
										+ instance.currentAnnotationType
										+ ']')
									.eq(0)
									.html());
					button.siblings().removeClass('active');
					if (instance.needsSubmitting)
					{
					    button.siblings().removeClass(
						    'alert');
					    button.siblings().removeClass(
						    'alert-danger');
					    button.removeClass('alert');
					    button.removeClass('alert-danger');
					    button.parent()
						    .removeClass('alert');
					    button.parent().removeClass(
						    'alert-danger');
					    instance.clearAlertMessage();
					    instance.submitLastAnnoatation();
					}
				    }
				    else
				    {
					button.removeClass('active');
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
		    this.clearAlertMessage();
		    $('#alert-text').addClass('alert-info');
		    $('#alert-text')
			    .html(
				    "Current annotation type is: "
					    + $(
						    'a[name=annotation-type-button][data-val='
							    + this.currentAnnotationType
							    + ']').eq(0).html());
		    this.canvasElement.css('cursor', 'crosshair');
		    button.siblings().removeClass('active');
		    this.canvasElement.on("click",
			    this.bind__polygonMouseClickListener);
		}
		else
		{
		    this.canvasElement.css('cursor', 'auto');
		}
		console.log("Polygon");
	    };

	    Annotations.prototype.submitLastAnnoatation = function()
	    {
		if (typeof this.currentAnnotationType == "undefined")
		{
		    $('a[name=annotation-type-button]').addClass('alert');
		    $('a[name=annotation-type-button]')
			    .addClass('alert-danger');
		    $('a[name=annotation-type-button]').eq(0).parent()
			    .addClass('alert');
		    $('a[name=annotation-type-button]').eq(0).parent()
			    .addClass('alert-danger');
		    this.clearAlertMessage();
		    $('#alert-text').addClass('alert-danger');
		    $('#alert-text')
			    .html(
				    "Select an annotation on the left in order to submit!");
		    return;

		}
		var instance = this;
		this.clearAlertMessage();
		this.needsSubmitting = false;

		var annotation = this.annotations[this.annotations.length - 1];
		annotation.type = this.currentAnnotationType;
		console.log(annotation.type);
		var url = Routing.generate('image_annotator_annotation_add',
		{
		    imageId : this.imageId
		});
		var data =
		{
		    'imageId' : this.imageId,
		    'annotation' : JSON.stringify(annotation)
		};
		this.functions.ajaxLoadPage(url, data, function(e)
		{
		    console.log($('a[name=annotation-type-button][data-val='
			    + annotation.type + ']'));
		    console.log("Annotation saved");
		    $('#alert-text').addClass('alert-success');
		    $('#alert-text').html(
			    "Annotation type "
				    + $(
					    'a[name=annotation-type-button][data-val='
						    + annotation.type + ']')
					    .eq(0).html()
				    + " saved successfully");
		    instance.appendAnnotation(annotation);
		}, function(e)
		{
		    console.log("Annotation failed to save");
		    $('#alert-text').addClass('alert-danger');
		    $('#alert-text').html(
			    "Annotation type "
				    + $(
					    'a[name=annotation-type-button][data-val='
						    + annotation.type + ']')
					    .eq(0).html() + "failed to save");
		});

	    };

	    Annotations.prototype.polygonMouseClickListener = function(e)
	    {
		if (this.needsSubmitting)
		    return;
		console.log("click");
		var offset = $(this.canvasElement).offset();
		var coords =
		{
		    x : Math.round(e.clientX - offset.left),
		    y : Math.round(e.clientY - offset.top)
		};

		if (this.isFirstPoint)
		{
		    var instance = this;
		    var polygon = this.canvas.path("M" + coords.x + ","
			    + coords.y);
		    var annotation = new Annotation();
		    annotation.addPoint(coords.x, coords.y);
		    annotation.setPolygonId(polygon.id);
		    this.annotations.push(annotation);
		    this.isFirstPoint = false;
		    var circle = this.canvas.circle(coords.x, coords.y, 8);
		    circle.click(function(e)
		    {
			instance.canvasElement.off("click",
				instance.bind__polygonMouseClickListener);
			var polygon = instance.canvas.getById(annotation
				.getPolygonId());
			polygon.attr('path', polygon.attr('path') + 'Z');
			polygon.attr("fill", annotation.color);
			polygon.attr("fill-opacity", 0.1);
			console.log("Annotation polygon closed");
			circle.remove();
			instance.needsSubmitting = true;
			instance.submitLastAnnoatation();

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
		    var polygon = this.canvas
			    .getById(annotation.getPolygonId());
		    annotation.addPoint(coords.x, coords.y);
		    polygon.attr('path', polygon.attr('path') + "L" + coords.x
			    + "," + coords.y);
		    polygon.toBack();
		    polygon.attr("stroke", annotation.color);
		    polygon.attr("stroke-width", 3);
		    // polygon.attr("fill", annotation.color);
		    // polygon.attr("fill-opacity", 0.5);
		    console.log("new point");

		}
	    }
	    Annotations.prototype.onRemovePolygonButtonClick = function(e)
	    {
		e.preventDefault();
		this.clearAlertMessage();
		var button = $(e.target);
		if (!$(button).is('a'))
		    button = $(button).parent();
		button = button.eq(0);
		console.log(button);
		if (!button.hasClass('active'))
		{
		    button.siblings().removeClass('active');
		    this.canvasElement.off("click",
			    this.bind__polygonMouseClickListener);
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
		    this.canvasElement.off("click",
			    this.bind__polygonMouseClickListener);
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
		    this.canvasElement.off("click",
			    this.bind__polygonMouseClickListener);
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
		    this.canvasElement.off("click",
			    this.bind__polygonMouseClickListener);
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
		this.mediaChooser.previewMedia(
		{
		    mediaUrl : $(e.target).data("url"),
		    mediaId : $(e.target).data("val")
		});
	    };

	    Annotations.prototype.onDeleteButtonClick = function(e)
	    {
		e.preventDefault();

		var file = $(e.target);

		$(this.mediaManager).one(MediaManager.EVENT_DELETE_SUCCESS,
			function()
			{
			    file.parent().parent().parent().remove();
			});
		$(this.mediaManager).one(MediaManager.EVENT_DELETE_ERROR,
			function(error, e)
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

		return this.mediaManager.deleteMedia(file.data("val"), $(
			"#mediaDeleteConfirmMessage").html());

		/*
		 * var response =
		 * confirm($("#mediaDeleteConfirmMessage").html()); if
		 * (!response) { return false; } var file = $(e.target); var
		 * address = file.data("url");
		 * 
		 * $.ajax({ url: address, type: "POST", contentType:
		 * "application/x-www-form-urlencoded", data: { mediaId:
		 * file.data("val") }, success: function(data) { if
		 * (data.responseCode == 200) { file.parent().parent().remove(); }
		 * else if (data.responseCode == 400) { // bad request
		 * alert('Error: ' + data.feedback); } else { alert('An
		 * unexpected error occured'); } }, error: function(request) {
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

		this.mediaChooser.previewMedia(
		{
		    type : MediaChooser.TYPE_RECORD_VIDEO,
		    mediaUrl : Routing.generate('imdc_myfiles_preview',
		    {
			mediaId : this.mediaChooser.media.id
		    }),
		    mediaId : this.mediaChooser.media.id,
		    recording : true
		});
	    };

	    return Annotations;
	});
