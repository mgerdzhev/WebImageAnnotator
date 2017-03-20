(function() {
	var Annotation = (function() {
		function Annotation() {
			this.color = Annotation.getRandomColor();
			this.polygon = new Array();
			this.type = null;
			this.id = null;
		}

		Annotation.prototype.addPoint = function(x, y) {
			this.polygon.push(x);
			this.polygon.push(y);
		};

		Annotation.prototype.getPointAt = function(index) {
			if (this.polygon.length > 2 * index + 1)
				return {
					x : this.polygon[2 * index],
					y : this.polygon[2 * index + 1]
				};
		};

		Annotation.prototype.getPolygonLength = function() {
			return this.polygon.length / 2;
		};

		Annotation.prototype.removeLastPoint = function() {
			if (this.polygon.length > 0)
				return {
					y : this.polygon.pop(),
					x : this.polygon.pop()
				};
			else
				return null;
		};

		Annotation.prototype.getPolygon = function() {
			return this.polygon;
		};

		Annotation.prototype.setType = function(type) {
			this.type = type;
		};

		Annotation.prototype.getType = function() {
			return this.type;
		};

		Annotation.prototype.setId = function(id) {
			this.id = id;
		};

		Annotation.prototype.getId = function() {
			return this.id;
		};

		Annotation.getRandomColor = function() {
			var letters = '0123456789ABCDEF'.split('');
			var color = '#';
			for (var i = 0; i < 6; i++) {
				color += letters[Math.round(Math.random() * 15)];
			}

			return color;
		};

		return Annotation;
	})();

	this.Annotations = (function() {
		function Annotations(imageId, savedAnnotations, options) {
			this.imageId = imageId;
			this.page = null;
			this.annotations = savedAnnotations;
			this.bind__onPolygonButtonClick = this.onPolygonButtonClick
					.bind(this);
			this.bind__onRemovePolygonButtonClick = this.onRemovePolygonButtonClick
					.bind(this);
			this.bind__onRemoveLastPointButtonClick = this.onRemoveLastPointButtonClick
					.bind(this);

			this.bind__onZoomInButtonClick = this.onZoomInButtonClick
					.bind(this);
			this.bind__onZoomOutButtonClick = this.onZoomOutButtonClick
					.bind(this);
			this.bind__polygonMouseClickListener = this.polygonMouseClickListener
					.bind(this);
			this.bind__polygonMouseMoveListener = this.polygonMouseMoveListener
					.bind(this);
			this.isFirstPoint = true;
			this.imageDimensions = {};
			this.tempLine = null;
			this.currentId = 0;
			this.onchange = options.onchange;
			this.currentAnnotationType = options.labels;
		}
		;

		Annotations.prototype.setCanvasElement = function(canvasId) {
			this.canvasId = canvasId;
			this.canvasElement = $("#" + canvasId);
			this.imageElement = this.canvasElement.next('.ia-media-img');
			this.canvasElement.width(this.imageElement.width());
			this.canvasElement.height(this.imageElement.height());
			this.canvas = new Raphael(canvasId, this.imageElement.width(),
					this.imageElement.height());
			this.imageDimensions.width = this.imageElement.width();
			this.imageDimensions.height = this.imageElement.height();
			this.canvas.setViewBox(0, 0, this.imageElement.width(),
					this.imageElement.height(), true);
			this.ratio = this.imageElement.height()
					/ this.imageElement.parent().height();
			this.setZoomScale(1 / this.ratio);
			console.log(this.ratio);
		};

		/**
		 * ui element event bindings in order of appearance
		 * 
		 * @param {number}
		 *            page
		 */
		Annotations.prototype.bindUIEvents = function() {
			$("#annotation-polygon-button").on("click",
					this.bind__onPolygonButtonClick);
			$("#annotation-remove-polygon-button").on("click",
					this.bind__onRemovePolygonButtonClick);
			$("#annotation-remove-last-point-button").on("click",
					this.bind__onRemoveLastPointButtonClick);
			$("#annotation-zoom-in-button").on("click",
					this.bind__onZoomInButtonClick);
			$("#annotation-zoom-out-button").on("click",
					this.bind__onZoomOutButtonClick);

			var instance = this;
			// Add the initial annotations
			for (var iterator = 0; iterator < this.annotations.length; iterator++) {
				var annotation = this.annotations[iterator];
				var point = annotation.getPointAt(0);
				var polygonString = "M" + point.x + "," + point.y;
				for (var i = 1; i < annotation.getPolygonLength(); i++) {
					var point = annotation.getPointAt(i);
					polygonString += "L" + point.x + "," + point.y;
				}
				polygonString += "Z";
				var polygon = this.canvas.path(polygonString);
				polygon.id = this.currentId;
				this.currentId++;
				annotation.setId(polygon.id);
				polygon.attr("fill", annotation.color);
				polygon.attr("fill-opacity", 0.1);
				polygon.attr("stroke", annotation.color);
				polygon.attr("stroke-width", 3 * this.ratio);
				this.appendAnnotation(annotation);
			}
			this.setPolygonHoverStates();

			$(document).keyup(function(e) {
				if (e.keyCode == 27) { // escape key maps to keycode `27`
					$("#annotation-remove-last-point-button").click();
				}
			});

			$(document).keypress(
					function(e) {
						var number = e.which - 48;
						// console.log(e.which);
						if (e.which == 80 || e.which == 112) // p
						{
							$("#annotation-polygon-button").click();
						} else if (e.which == 68 || e.which == 100) // d
						{
							$("#annotation-remove-polygon-button").click();
						} else if (e.which == 61 || e.which == 43) // =
						{
							$("#annotation-zoom-in-button").click();
						} else if (e.which == 45) // -
						{
							$("#annotation-zoom-out-button").click();
						}
						if ($('a[name=annotation-type-button][data-number='
								+ number + ']').length < 11) {
							$(
									'a[name=annotation-type-button][data-number='
											+ number + ']').each(function() {
								if (e.which - 48 == $(this).data('number')) {
									$(this).click();
								}
							});
						}
					});

			$('a[name=annotation-type-button]')
					.on(
							"click",
							function(e) {
								e.preventDefault();
								var button = $(e.target);
								if (!$(button).is('a'))
									button = $(button).parent();
								button = button.eq(0);
								if (!button.hasClass('active')) {
									instance.currentAnnotationType = button
											.attr('data-val');
									instance.clearAlertMessage();
									$('#alert-text').addClass('alert-info');
									$('#alert-text')
											.html(
													"Annotating : "
															+ $(
																	'a[name=annotation-type-button][data-val='
																			+ instance.currentAnnotationType
																			+ ']')
																	.eq(0)
																	.data(
																			'name'));
									button.siblings().removeClass('active');
									if (instance.needsSubmitting) {
										button.siblings().removeClass('alert');
										button.siblings().removeClass(
												'alert-danger');
										button.removeClass('alert');
										button.removeClass('alert-danger');
										button.parent().removeClass('alert');
										button.parent().removeClass(
												'alert-danger');
										instance.clearAlertMessage();
										instance.submitLastAnnoatation();
									}
								} else {
									button.removeClass('active');
								}
							});
		};
		Annotations.prototype.clearAlertMessage = function() {
			$('#alert-text').removeClass('alert-danger');
			$('#alert-text').removeClass('alert-info');
			$('#alert-text').removeClass('alert-success');
			$('#alert-text').html("");
		};

		Annotations.prototype.appendAnnotation = function(annotation) {
			var instance = this;
			var tableElement = $('.ia-annotation-table tbody');
			var row = $("<tr data-val=" + annotation.getId() + "></tr>");
			var col1 = '<td><div class="text-center"><a class="btn btn-danger btn-xs annotation-type-delete" href="#" data-val="'
					+ annotation.getId()
					+ '"> <i class="fa fa-trash-o"></i></a></div></td>';
			var annotationName = $(
					'a[name=annotation-type-button][data-val='
							+ annotation.getType() + ']').eq(0).data('name');
			var col2 = '<td><div data-val=' + annotation.getId() + '>'
					+ annotationName + '</div></td>';
			row.html(col1 + col2);
			row.hover(function() {
				instance.setAnnotationHighlighted(annotation, true);
			}, function() {
				instance.setAnnotationHighlighted(annotation, false);
			});
			tableElement.append(row);
			$('a.annotation-type-delete[data-val=' + annotation.getId() + ']')
					.eq(0).on('click', function(e) {
						e.preventDefault();
						instance.deleteAnnotation(annotation);
					});
			var polygon = this.canvas.getById(annotation.getId());
			$(polygon).data('annotation', annotation);
		};

		Annotations.prototype.setAnnotationHighlighted = function(annotation,
				highlighted) {
			var polygon = this.canvas.getById(annotation.getId());
			var tableElement = $('.ia-annotation-table tbody');
			var row = tableElement.children(
					'[data-val=' + annotation.getId() + ']').eq(0);
			if (highlighted) {
				polygon.attr("fill-opacity", 0.8);
				row.addClass('active');
			} else {
				polygon.attr("fill-opacity", 0.1);
				row.removeClass('active');
			}
		};

		Annotations.prototype.deleteAnnotation = function(annotation) {
			var instance = this;
			var index = $.inArray(annotation, instance.annotations);
			if (index != -1) {
				instance.annotations.splice(index, 1);
				var polygon = instance.canvas.getById(annotation.getId());
				polygon.unmouseout();
				polygon.unmouseover();
				polygon.unclick();
				polygon.remove();
				this.onchange(this.annotations);
			} else {
				instance.clearAlertMessage();
				$('#alert-text').addClass('alert-danger');
				$('#alert-text').html("Could not remove annotation");
			}

		}

		Annotations.prototype.onPolygonButtonClick = function(e) {
			e.preventDefault();
			var button = $(e.target);
			if (!$(button).is('a'))
				button = $(button).parent();
			button = button.eq(0);
			if (!button.hasClass('active')) {
				// console.log("Not active polygonButton");
				this.clearAlertMessage();
				this.resetPolygonStates();
				$('#alert-text').addClass('alert-info');
				$('#alert-text').html(
						"Currently annotating: " + this.currentAnnotationType);
				this.canvasElement.css('cursor', 'crosshair');
				button.siblings().removeClass('active');
				this.canvasElement.on("click",
						this.bind__polygonMouseClickListener);
				button.effect('highlight');
			} else {
				this.resetPolygonStates();
				this.setPolygonHoverStates();
			}
			console.log("Polygon");
		};

		Annotations.prototype.resetPolygonStates = function() {
			this.canvasElement.off("click",
					this.bind__polygonMouseClickListener);
			this.canvasElement.off("mousemove",
					this.bind__polygonMouseMoveListener);
			this.canvasElement.css('cursor', '');
			for (i in this.annotations) {
				var polygon = this.canvas.getById(this.annotations[i].getId());
				polygon.attr('cursor', '');
				polygon.unclick();
				polygon.unmouseover();
				polygon.unmouseout();
			}
		}

		Annotations.prototype.setPolygonHoverStates = function() {
			for (i in this.annotations) {
				var polygon = this.canvas.getById(this.annotations[i].getId());
				polygon.attr('cursor', 'pointer');
				var instance = this;
				polygon.mouseover(function() {
					var annotation = $(this).data('annotation');
					instance.setAnnotationHighlighted(annotation, true);
				});
				polygon.mouseout(function() {
					var annotation = $(this).data('annotation');
					instance.setAnnotationHighlighted(annotation, false);
				});
			}
		}

		Annotations.prototype.submitLastAnnoatation = function() {
			if (typeof this.currentAnnotationType == "undefined") {
				$('a[name=annotation-type-button]').addClass('alert');
				$('a[name=annotation-type-button]').addClass('alert-danger');
				$('a[name=annotation-type-button]').eq(0).parent().addClass(
						'alert');
				$('a[name=annotation-type-button]').eq(0).parent().addClass(
						'alert-danger');
				this.clearAlertMessage();
				$('#alert-text').addClass('alert-danger');
				$('#alert-text').html(
						"Select an annotation on the left in order to submit!");
				return;

			}
			var instance = this;
			this.clearAlertMessage();
			this.needsSubmitting = false;

			var annotation = this.annotations[this.annotations.length - 1];
			annotation.type = this.currentAnnotationType;
			instance.appendAnnotation(annotation);

			this.onchange(this.annotations);

		};

		Annotations.prototype.polygonMouseClickListener = function(e) {
			if (this.needsSubmitting)
				return;
			// console.log("click");
			var offset = $(this.canvasElement).offset();
			var coords = {
				x : Math.round((e.pageX - offset.left) / this.scale),
				y : Math.round((e.pageY - offset.top) / this.scale)
			};

			if (this.isFirstPoint) {
				var instance = this;
				this.canvasElement.on("mousemove",
						this.bind__polygonMouseMoveListener);

				var polygon = this.canvas.path("M" + coords.x + "," + coords.y);
				polygon.id = this.currentId;
				// console.log(polygon.id);
				this.currentId++;
				this.tempLine = this.canvas.path("M" + coords.x + ","
						+ coords.y);
				var annotation = new Annotation();
				annotation.addPoint(coords.x, coords.y);
				annotation.setId(polygon.id);
				this.annotations.push(annotation);
				this.isFirstPoint = false;
				var circle = this.canvas.circle(coords.x, coords.y,
						8 * this.ratio);
				circle.id = "initialCircle";
				circle.click(function(e) {
					e.stopPropagation();
					instance.canvasElement.off("click",
							instance.bind__polygonMouseClickListener);
					instance.canvasElement.off("mousemove",
							instance.bind__polygonMouseMoveListener);
					instance.tempLine.remove();
					var polygon = instance.canvas.getById(annotation.getId());
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
			} else {
				var annotation = this.annotations[this.annotations.length - 1];
				var polygon = this.canvas.getById(annotation.getId());
				annotation.addPoint(coords.x, coords.y);
				polygon.attr('path', polygon.attr('path') + "L" + coords.x
						+ "," + coords.y);
				polygon.toBack();
				polygon.attr("stroke", annotation.color);
				polygon.attr("stroke-width", 3 * this.ratio);

			}
		}

		Annotations.prototype.polygonMouseMoveListener = function(e) {
			if (this.needsSubmitting)
				return;
			var offset = $(this.canvasElement).offset();
			var coords = {
				x : Math.round((e.pageX - offset.left) / this.scale),
				y : Math.round((e.pageY - offset.top) / this.scale)
			};

			if (!this.isFirstPoint) {
				var annotation = this.annotations[this.annotations.length - 1];
				var lastPoint = annotation.getPointAt(annotation
						.getPolygonLength() - 1);
				this.tempLine.attr('path', 'M' + lastPoint.x + ','
						+ lastPoint.y + 'L' + coords.x + "," + coords.y);
				this.tempLine.toBack();
				this.tempLine.attr("stroke", annotation.color);
				this.tempLine.attr("stroke-width", 3 * this.ratio);
			}
		}

		Annotations.prototype.onRemovePolygonButtonClick = function(e) {
			var instance = this;
			e.preventDefault();
			this.clearAlertMessage();
			var button = $(e.target);
			if (!$(button).is('a'))
				button = $(button).parent();
			button = button.eq(0);
			if (!button.hasClass('active')) {
				this.clearAlertMessage();
				$('#alert-text').addClass('alert-info');
				$('#alert-text').html("Select annotation to delete");
				button.siblings().removeClass('active');
				// button.addClass('active');
				this.resetPolygonStates();
				this.setPolygonHoverStates();
				this.canvasElement.css('cursor', 'no-drop');
				for (i in this.annotations) {
					var annotation = this.annotations[i];
					var polygon = this.canvas.getById(this.annotations[i]
							.getId());
					polygon.attr('cursor', 'pointer');
					polygon.click(function() {
						var annotation = $(this).data('annotation');
						instance.deleteAnnotation(annotation);
					});
				}
				button.effect('highlight');

			} else {
				this.resetPolygonStates();
				this.setPolygonHoverStates();
			}
			console.log("Polygon Remove");
		};
		Annotations.prototype.onRemoveLastPointButtonClick = function(e) {
			var instance = this;
			e.preventDefault();
			var button = $(e.target);
			if (!$(button).is('a'))
				button = $(button).parent();
			button = button.eq(0);
			button.effect('highlight');
			if (!$("#annotation-polygon-button").hasClass('active')) {
				return;
			}
			var circle = this.canvas.getById("initialCircle");
			if (circle == null) {
				return;
			}
			var annotation = this.annotations[this.annotations.length - 1];
			var polygon = this.canvas.getById(annotation.getId());
			annotation.removeLastPoint();
			if (polygon.attr('path').length > 1) {
				var lastElement = polygon.attr('path').pop();
				polygon.attr('path', polygon.attr('path'));
			} else {
				instance.deleteAnnotation(annotation);
				var circle = this.canvas.getById("initialCircle");
				circle.remove()
				instance.tempLine.remove();
//				this.resetPolygonStates();
//				this.setPolygonHoverStates();
				instance.isFirstPoint = true;
			}

			// polygon.attr("stroke", annotation.color);
			// polygon.attr("stroke-width", 3 * this.ratio);

			console.log("Polygon Remove last point");
		};

		Annotations.prototype.onZoomInButtonClick = function(e) {
			e.preventDefault();
			var button = $(e.target);
			if (!$(button).is('a'))
				button = $(button).parent();
			button = button.eq(0);
			button.effect('highlight');
			this.setZoomScale(this.scale + 0.1);

			console.log("Zoom In");
		};

		Annotations.prototype.setZoomScale = function(scale) {
			if (scale <= 0.001)
				return;
			this.scale = scale;
			this.imageElement.width(Math.round(this.imageDimensions.width
					* this.scale));
			this.imageElement.height(Math.round(this.imageDimensions.height
					* this.scale));
			this.canvasElement.width(Math.round(this.imageDimensions.width
					* this.scale));
			this.canvasElement.height(Math.round(this.imageDimensions.height
					* this.scale));
		}

		Annotations.prototype.onZoomOutButtonClick = function(e) {
			e.preventDefault();
			var button = $(e.target);
			if (!$(button).is('a'))
				button = $(button).parent();
			button = button.eq(0);
			button.effect('highlight');
			this.setZoomScale(this.scale - 0.1);
			console.log("Zoom Out");
		};
		return Annotations;
	})();
}).call(this);
