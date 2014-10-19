define(
	[ 'core/mediaManager' ],
	function(MediaManager)
	{
	    var MediaChooser = function(options)
	    {
		this.element = options.element.dialog(
		{
		    autoOpen : false
		});
		this.isPopUp = options.isPopUp;

		this.mediaManager = new MediaManager();
		this.media = null;
		this.datasetId = null;
	    };

	    MediaChooser.TAG = "MediaChooser";

	    MediaChooser.Event =
	    {
		SUCCESS : "success",
		SUCCESS_AND_POST : "successAndPost",
		ERROR : "error",
		RESET : "reset",
		DIALOG_CLOSE : "dialogClose"
	    };

	    MediaChooser.MEDIA_TYPES = [ "image" ];

	    MediaChooser.TYPE_ALL = 0;
	    MediaChooser.TYPE_UPLOAD_IMAGE = 2;

	    MediaChooser.DIALOG_TITLE_SELECT = "Select from My Files";
	    MediaChooser.DIALOG_TITLE_PREVIEW = "Preview";

	    MediaChooser.prototype.bindUIEvents = function()
	    {
		console.log("%s: %s", MediaChooser.TAG, "bindUIEvents");

		this._bindUIEventsUploadFile($("#uploadForms"),
			$("#chooseFile"));

		$("#selectFile").on("click", (function(e)
		{
		    e.preventDefault();

		    this.chooseFile({});
		}).bind(this));

		$("#removeFile").on("click", (function(e)
		{
		    e.preventDefault();

		    this._invokeReset();
		}).bind(this));
	    };

	    /**
	     * @param {object}
	     *                formRootElement
	     * @param {object}
	     *                linkRootElement
	     */
	    MediaChooser.prototype._bindUIEventsUploadFile = function(
		    formRootElement, linkRootElement)
	    {
		console.log("%s: %s", MediaChooser.TAG,
			"_bindUIEventsUploadFile");

		var resourceFile = formRootElement
			.find("#image_annotator_image_media_resource_file");
		resourceFile.attr('multiple', 'multiple');
		var title = formRootElement
			.find("#image_annotator_image_media_title");
		var form = formRootElement
			.find("form[name=image_annotator_image_media]");
		var datasetId = formRootElement
			.find("#image_annotator_image_media_dataset");
		datasetId.val(this.datasetId);

		resourceFile
			.on(
				"change",
				(function(e)
				{
				    if (resourceFile.val() == "")
				    {
					return;
				    }
				    var fileList = resourceFile.get(0).files;
				    $("#uploadNumber").data('total',
					    resourceFile.get(0).files.length);
				    $("#uploadNumber").data('current', 0);
				    $("#uploadNumber").text("Uploaded files: "+$("#uploadNumber").data('current') + '/' + $("#uploadNumber").data('total'));
				    $("#uploadNumber").show();
				    title.empty();
				    for (var i = 0; i < fileList.length; i++)
				    {
					var newForm = new FormData();
					newForm
						.append(
							'image_annotator_image_media[title]',
							MediaChooser
								._cleanFileNameNoExt(fileList[i].name));

					newForm
						.append(
							'image_annotator_image_media[dataset]',
							this.datasetId);

					newForm
						.append(
							'image_annotator_image_media[resource][file]',
							fileList[i]);
					newForm
						.append(
							'image_annotator_image_media[_token]',
							$(
								'#image_annotator_image_media__token')
								.val());

					this
						.loadNextPage(
						{
						    url : Routing
							    .generate("image_annotator_image_add_image"),
						    method : "POST",
						    data : newForm,
						    uploadProgress : true
						});

				    }

				    $("#uploadProgress" + this.postSuffix)
					    .show();

				    resourceFile.val("");

				}).bind(this));

		var link = linkRootElement.find("#upload-image-link");

		link.on("click", function(e)
		{
		    e.preventDefault();

		    resourceFile.click();
		});
	    };

	    // MediaChooser.prototype._bindUIEventsUploadFile =
	    // function(formRootElement, linkRootElement)
	    // {
	    // console.log("%s: %s", MediaChooser.TAG,
	    // "_bindUIEventsUploadFile");
	    //
	    // var resourceFile =
	    // formRootElement.find("#image_annotator_image_media_resource_file");
	    // // var resourceFiles =
	    // formRootElement.find("#image_annotator_image_resource_file_file");
	    // var title =
	    // formRootElement.find("#image_annotator_image_media_titles");
	    // var form =
	    // formRootElement.find("form[name=image_annotator_image_media]");
	    // var datasetId =
	    // formRootElement.find("#image_annotator_image_media_dataset");
	    // datasetId.val(this.datasetId);
	    // var titlePrototype = title.data('prototype');
	    // resourceFile.attr('name', resourceFile.attr('name')+'[]');
	    //
	    // resourceFile.on("change", (function(e)
	    // {
	    // if (resourceFile.val() == "")
	    // {
	    // return;
	    // }
	    // title.empty();
	    // for (var i = 0; i < resourceFile.get(0).files.length; i++)
	    // {
	    // var newTitle = titlePrototype.replace(/__name__/g,i);
	    // newTitle = newTitle.replace(/input type/g,'input
	    // value="'+MediaChooser._cleanFileNameNoExt(resourceFile.get(0).files[i].name)+'"
	    // type');
	    // newTitle = title.append(newTitle);
	    //		
	    // // console.log(newTitle);
	    // //
	    // newTitle.children('input').eq(0).val(MediaChooser._cleanFileNameNoExt(resourceFile.get(0).files[0].name));
	    //		
	    // }
	    // //
	    // title.val(MediaChooser._cleanFileNameNoExt(resourceFile.val()));
	    // //
	    // // $("#uploadingFileTitle" + this.postSuffix).html(title.val());
	    // // $("#chooseFile" + this.postSuffix).hide();
	    // this.loadNextPage({
	    // url : Routing.generate("image_annotator_image_add_images"),
	    // method : "POST",
	    // data : new FormData(form[0]),
	    // uploadProgress : true
	    // });
	    //
	    // // resourceFile.val("");
	    // // title.val("");
	    //
	    // }).bind(this));
	    //
	    // var link = linkRootElement.find("#upload-image-link");
	    //
	    // link.on("click", function(e)
	    // {
	    // e.preventDefault();
	    //
	    // resourceFile.click();
	    // });
	    // };

	    MediaChooser._dialogTitleForType = function(type)
	    {
		console.log("%s: %s", MediaChooser.TAG, "_dialogTitleForType");

		switch (type)
		{
		case MediaChooser.TYPE_ALL:
		    return MediaChooser.DIALOG_TITLE_SELECT;
		case MediaChooser.TYPE_UPLOAD_AUDIO:
		case MediaChooser.TYPE_UPLOAD_IMAGE:
		default:
		    return MediaChooser.DIALOG_TITLE_PREVIEW;
		}
	    };

	    MediaChooser._cleanFileNameNoExt = function(fileName)
	    {
		// FIXME extract proper file name
		fileName = fileName.split(/(\\|\/)/g).pop();
		return (fileName.substr(0, fileName.lastIndexOf('.')) || fileName)
			.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
	    };

	    MediaChooser.prototype._onUploadProgress = function(percentComplete)
	    {
		console.log("%s: %s- percentComplete=%d", MediaChooser.TAG,
			"_onUploadProgress", percentComplete);

		MediaChooser._updateUploadProgress($("#uploadProgress"
			+ this.postSuffix), percentComplete);
	    };

	    MediaChooser._updateUploadProgress = function(element,
		    percentComplete)
	    {
		var progressBar = element.find(".progress-bar");

		element.show();

		progressBar.attr("aria-valuenow", percentComplete);
		progressBar.css("width", percentComplete + "%");
		progressBar.html(percentComplete + "%");
	    };

	    MediaChooser.prototype.previewMedia = function(options)
	    {
		console.log("%s: %s", MediaChooser.TAG, "previewMedia");

		this.recording = options.recording;

		if (this.isPopUp && !this.element.dialog("isOpen"))
		{
		    this._popUp(options.type, function()
		    {
			this._loadMediaPage(options.mediaUrl, options.mediaId);
		    });
		}
		else
		{
		    this.element.dialog("option", "title", MediaChooser
			    ._dialogTitleForType(options.type));
		    this._loadMediaPage(options.mediaUrl, options.mediaId);
		}
	    };

	    // TODO try to eliminate this step
	    MediaChooser.prototype._loadMediaPage = function(mediaUrl, mediaId)
	    {
		console.log("%s: %s", MediaChooser.TAG, "_loadMediaPage");
		this.loadNextPage(
		{
		    url : mediaUrl,
		    method : "POST",
		    data :
		    {
			mediaId : mediaId
		    },
		    preview : true,
		    isPost : this.isPost ? 1 : 0
		});
	    };

	    // TODO try to merge into _loadChooserPage
	    MediaChooser.prototype.loadNextPage = function(options)
	    {
		console.log("%s: %s", MediaChooser.TAG, "loadNextPage");

		var request =
		{
		    url : options.url,
		    data : options.data,
		    success : (function(data, textStatus, jqXHR)
		    {
			console.log("%s: %s: %s- finished=%s",
				MediaChooser.TAG, "loadNextPage", "success",
				data.finished);

			this.setMedia(data.media);
			// window.URL.revokeObjectURL(options.fileURL);
			if (typeof data.finished !== "undefined"
				&& data.finished === true)
			{
			    if (this.media != null)
			    {
				this._invokeSuccess();
			    }
			    this._terminatingFunction();
			}
			else
			{
			    this.element.html(data.page);
			}
		    }).bind(this),
		    error : (function(jqXHR, textStatus, errorThrown)
		    {
			console.log("%s: %s: %s", MediaChooser.TAG,
				"loadNextPage", "error");
			window.URL.revokeObjectURL(options.fileURL);
			this._invokeError(jqXHR);
		    }).bind(this)
		};

		request.type = (typeof options.method === "undefined") ? "GET"
			: options.method;

		if (options.method != "GET")
		{
		    request.processData = false;
		    request.contentType = false;
		}

		if (options.uploadProgress)
		{
		    request.xhr = (function()
		    {
			var xhr = $.ajaxSettings.xhr();
			xhr.upload.addEventListener("progress", (function(e)
			{
			    if (!e.lengthComputable)
				return;

			    this._onUploadProgress(Math
				    .floor((e.loaded / e.total) * 100));
			}).bind(this), false);

			return xhr;
		    }).bind(this);
		}

		$.ajax(request);
	    };

	    MediaChooser.prototype._popUp = function(type, onOpen)
	    {
		console.log("%s: %s", MediaChooser.TAG, "_popUp");

		this.element.dialog(
		{
		    autoOpen : false,
		    resizable : false,
		    modal : true,
		    draggable : false,
		    closeOnEscape : true,
		    dialogClass : "ia-popup-dialog",
		    open : (function(event, ui)
		    {
			console.log("%s: %s: %s", MediaChooser.TAG, "_popUp",
				"open");

			// $(".ui-dialog-titlebar-close",
			// this.parentNode).hide();
			onOpen.call(this);
		    }).bind(this),
		    create : function(event, ui)
		    {
			console.log("%s: %s: %s", MediaChooser.TAG, "_popUp",
				"create");

			// $(event.target).parent().css('position', 'relative');
		    },
		    close : (function(event, ui)
		    {
			console.log("%s: %s: %s", MediaChooser.TAG, "_popUp",
				"close");

			// $(".ui-dialog-titlebar-close",
			// this.parentNode).hide();
			this.element.html("");
			this._terminatingFunction();
		    }).bind(this),
		    show : "blind",
		    hide : "blind",
		    minWidth : 740,
		    position :
		    {
			at : "top",
			my : "top"
		    },
		    title : MediaChooser._dialogTitleForType(type)
		});

		this.element.dialog("open");
	    };

	    MediaChooser.prototype._terminatingFunction = function()
	    {
		console.log("%s: %s", MediaChooser.TAG, "_terminatingFunction");

		if (this.element.dialog("isOpen"))
		{
		    this.element.off("dialogclose");
		    this.element.dialog("close");
		}

		/*
		 * if (jQuery.isFunction(this.callbacks.dialogClose)) {
		 * this.callbacks.dialogClose(this.media); }
		 */
		$(this).trigger($.Event(MediaChooser.Event.DIALOG_CLOSE,
		{
		    media : this.media
		}));
	    };

	    MediaChooser.prototype._invokeSuccess = function(doPost)
	    {
		console.log("%s: %s", MediaChooser.TAG, "_invokeSuccess");

		var event =
		{
		    media : this.media,
		    postId : this.postId
		};

		$("#uploadingFileTitle" + this.postSuffix).html("");
		$("#uploadProgress" + this.postSuffix).hide();
		$("#uploadNumber").data('current',
			Number($("#uploadNumber").data('current')) + 1);
		$("#uploadNumber").text("Uploading file: "+$("#uploadNumber").data('current') + '/' + $("#uploadNumber").data('total'));
		if ($("#uploadNumber").data('current') == $("#uploadNumber")
			.data('total'))
		{
		    $("#uploadNumber").hide();
		}

		if (this.isFileSelection)
		{
		    $("#chooseFile" + this.postSuffix).hide();
		    $("#selectedFileTitle" + this.postSuffix).html(
			    this.media.title);
		    $("#selectedFile" + this.postSuffix).show();
		}
		else
		{
		    $("#chooseFile" + this.postSuffix).show();
		}

		if (typeof doPost != "undefined" && doPost == true)
		    // this.callbacks.successAndPost(this.media);
		    $(this)
			    .trigger(
				    $
					    .Event(
						    MediaChooser.Event.SUCCESS_AND_POST,
						    event));
		else
		    // this.callbacks.success(this.media);
		    $(this).trigger($.Event(MediaChooser.Event.SUCCESS, event));
	    };

	    MediaChooser.prototype._invokeError = function(jqXHR)
	    {
		console.log("%s: %s- jqXHR=%o", MediaChooser.TAG,
			"_invokeError", jqXHR);

		$("#uploadingFileTitle" + this.postSuffix).html("");
		$("#uploadProgress" + this.postSuffix).hide();
		$("#chooseFile" + this.postSuffix).show();

		if (this.isFileSelection)
		{
		    $("#selectedFile" + this.postSuffix).hide();
		    $("#selectedFileTitle" + this.postSuffix).html("");
		}

		$(this).trigger($.Event(MediaChooser.Event.ERROR,
		{
		    jqXHR : jqXHR
		}));
	    };

	    MediaChooser.prototype._invokeReset = function()
	    {
		console.log("%s: %s", MediaChooser.TAG, "_invokeReset");

		$("#uploadingFileTitle" + this.postSuffix).html("");
		$("#uploadProgress" + this.postSuffix).hide();
		$("#chooseFile" + this.postSuffix).show();

		if (this.isFileSelection)
		{
		    $("#selectedFile" + this.postSuffix).hide();
		    $("#selectedFileTitle" + this.postSuffix).html("");
		}

		this.setMedia(null);

		// this.callbacks.reset();
		$(this).trigger($.Event(MediaChooser.Event.RESET,
		{
		    postId : this.postId
		}));
	    };

	    MediaChooser.prototype.setMedia = function(media)
	    {
		console.log("%s: %s", MediaChooser.TAG, "setMedia");

		this.media = typeof media != "undefined" ? media : this.media;
	    };

	    return MediaChooser;
	});
