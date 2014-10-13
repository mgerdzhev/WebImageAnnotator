define("core/mediaManager",[],function(){var e=function(){};return e.EVENT_DELETE_SUCCESS="delete_media_success",e.EVENT_DELETE_ERROR="delete_media_error",e.EVENT_UPDATE_SUCCESS="update_media_success",e.EVENT_UPDATE_ERROR="update_media_error",e.prototype.deleteMedia=function(t,n){var r=this;if(typeof n!="undefined"){var i=confirm(n);if(!i)return!1}var s=Routing.generate("image_annotator_image_remove",{imageId:t}),o={imageId:t};$.ajax({url:s,type:"POST",contentType:"application/x-www-form-urlencoded",data:o,success:function(t){t.responseCode==200?$(r).trigger(e.EVENT_DELETE_SUCCESS):t.responseCode==400?($(r).trigger(e.EVENT_DELETE_ERROR,t.feedback),console.log("Error: "+t.feedback)):($(r).trigger(e.EVENT_DELETE_ERROR,"Unknown Error"),console.log("An unexpected error occured"))},error:function(t){$(r).trigger(e.EVENT_DELETE_ERROR,t),console.log(t)}})},e.prototype.trimMedia=function(e,t,n){var r=this,i=Routing.generate("imdc_myfiles_trim",{mediaId:e,startTime:t,endTime:n}),s={mediaId:e,startTime:t,endTime:n};$.ajax({url:i,type:"POST",contentType:"application/x-www-form-urlencoded",data:s,success:function(e){console.log(e),e.responseCode==200?r.media=e.media:e.responseCode==400?console.log("Error: "+e.feedback):console.log("An unexpected error occured")},error:function(e){console.log(e)}})},e.prototype.updateMedia=function(t){var n=this;typeof t=="undefined"&&($(n).trigger(e.EVENT_UPDATE_ERROR,"Must send a media object"),console.log("Error: Must send a media object"));var r=Routing.generate("imdc_myfiles_update",{mediaId:t.id});console.log(t);var i={mediaId:t.id,media:JSON.stringify(t)};console.log(i),$.ajax({url:r,type:"POST",contentType:"application/x-www-form-urlencoded",data:i,success:function(t){t.responseCode==200?$(n).trigger(e.EVENT_UPDATE_SUCCESS):t.responseCode==400?($(n).trigger(e.EVENT_UPDATE_ERROR,t.feedback),console.log("Error: "+t.feedback)):($(n).trigger(e.EVENT_UPDATE_ERROR,"Unknown Error"),console.log("An unexpected error occured"))},error:function(t){$(n).trigger(e.EVENT_UPDATE_ERROR,t),console.log(t)}})},e}),define("core/mediaChooser",["core/mediaManager"],function(e){var t=function(t){this.element=t.element.dialog({autoOpen:!1}),this.isPopUp=t.isPopUp,this.mediaManager=new e,this.media=null,this.datasetId=null};return t.TAG="MediaChooser",t.Event={SUCCESS:"success",SUCCESS_AND_POST:"successAndPost",ERROR:"error",RESET:"reset",DIALOG_CLOSE:"dialogClose"},t.MEDIA_TYPES=["image"],t.TYPE_ALL=0,t.TYPE_UPLOAD_IMAGE=2,t.DIALOG_TITLE_SELECT="Select from My Files",t.DIALOG_TITLE_PREVIEW="Preview",t.prototype.bindUIEvents=function(){console.log("%s: %s",t.TAG,"bindUIEvents"),this._bindUIEventsUploadFile($("#uploadForms"),$("#chooseFile")),$("#selectFile").on("click",function(e){e.preventDefault(),this.chooseFile({})}.bind(this)),$("#removeFile").on("click",function(e){e.preventDefault(),this._invokeReset()}.bind(this))},t.prototype._bindUIEventsUploadFile=function(e,n){console.log("%s: %s",t.TAG,"_bindUIEventsUploadFile");var r=e.find("#image_annotator_image_media_resource_file"),i=e.find("#image_annotator_image_media_title"),s=e.find("form[name=image_annotator_image_media]"),o=e.find("#image_annotator_image_media_dataset");o.val(this.datasetId),r.on("change",function(e){if(r.val()=="")return;i.val(t._cleanFileNameNoExt(r.val())),$("#uploadingFileTitle"+this.postSuffix).html(i.val()),$("#chooseFile"+this.postSuffix).hide(),this.loadNextPage({url:Routing.generate("image_annotator_image_add_image"),method:"POST",data:new FormData(s[0]),uploadProgress:!0}),r.val(""),i.val("")}.bind(this));var u=n.find("#upload-image-link");u.on("click",function(e){e.preventDefault(),r.click()})},t._dialogTitleForType=function(e){console.log("%s: %s",t.TAG,"_dialogTitleForType");switch(e){case t.TYPE_ALL:return t.DIALOG_TITLE_SELECT;case t.TYPE_UPLOAD_AUDIO:case t.TYPE_UPLOAD_IMAGE:default:return t.DIALOG_TITLE_PREVIEW}},t._cleanFileNameNoExt=function(e){return e=e.split(/(\\|\/)/g).pop(),(e.substr(0,e.lastIndexOf("."))||e).replace(/[^a-z0-9\s]/gi,"").replace(/[_\s]/g,"-")},t.prototype._onUploadProgress=function(e){console.log("%s: %s- percentComplete=%d",t.TAG,"_onUploadProgress",e),t._updateUploadProgress($("#uploadProgress"+this.postSuffix),e)},t._updateUploadProgress=function(e,t){var n=e.find(".progress-bar");e.show(),n.attr("aria-valuenow",t),n.css("width",t+"%"),n.html(t+"%")},t.prototype.previewMedia=function(e){console.log("%s: %s",t.TAG,"previewMedia"),this.recording=e.recording,this.isPopUp&&!this.element.dialog("isOpen")?this._popUp(e.type,function(){this._loadMediaPage(e.mediaUrl,e.mediaId)}):(this.element.dialog("option","title",t._dialogTitleForType(e.type)),this._loadMediaPage(e.mediaUrl,e.mediaId))},t.prototype._loadMediaPage=function(e,n){console.log("%s: %s",t.TAG,"_loadMediaPage"),this.loadNextPage({url:e,method:"POST",data:{mediaId:n},preview:!0,isPost:this.isPost?1:0})},t.prototype.loadNextPage=function(e){console.log("%s: %s",t.TAG,"loadNextPage");var n={url:e.url,data:e.data,success:function(e,n,r){console.log("%s: %s: %s- finished=%s",t.TAG,"loadNextPage","success",e.finished),this.setMedia(e.media),typeof e.finished!="undefined"&&e.finished===!0?(this.media!=null&&this._invokeSuccess(),this._terminatingFunction()):this.element.html(e.page)}.bind(this),error:function(e,n,r){console.log("%s: %s: %s",t.TAG,"loadNextPage","error"),this._invokeError(e)}.bind(this)};n.type=typeof e.method=="undefined"?"GET":e.method,e.method!="GET"&&(n.processData=!1,n.contentType=!1),e.uploadProgress&&(n.xhr=function(){var e=$.ajaxSettings.xhr();return e.upload.addEventListener("progress",function(e){if(!e.lengthComputable)return;this._onUploadProgress(Math.floor(e.loaded/e.total*100))}.bind(this),!1),e}.bind(this)),$.ajax(n)},t.prototype._popUp=function(e,n){console.log("%s: %s",t.TAG,"_popUp"),this.element.dialog({autoOpen:!1,resizable:!1,modal:!0,draggable:!1,closeOnEscape:!0,dialogClass:"ia-popup-dialog",open:function(e,r){console.log("%s: %s: %s",t.TAG,"_popUp","open"),n.call(this)}.bind(this),create:function(e,n){console.log("%s: %s: %s",t.TAG,"_popUp","create")},close:function(e,n){console.log("%s: %s: %s",t.TAG,"_popUp","close"),this.element.html(""),this._terminatingFunction()}.bind(this),show:"blind",hide:"blind",minWidth:740,position:{at:"top",my:"top"},title:t._dialogTitleForType(e)}),this.element.dialog("open")},t.prototype._terminatingFunction=function(){console.log("%s: %s",t.TAG,"_terminatingFunction"),this.element.dialog("isOpen")&&(this.element.off("dialogclose"),this.element.dialog("close")),$(this).trigger($.Event(t.Event.DIALOG_CLOSE,{media:this.media}))},t.prototype._invokeSuccess=function(e){console.log("%s: %s",t.TAG,"_invokeSuccess");var n={media:this.media,postId:this.postId};$("#uploadingFileTitle"+this.postSuffix).html(""),$("#uploadProgress"+this.postSuffix).hide(),this.isFileSelection?($("#chooseFile"+this.postSuffix).hide(),$("#selectedFileTitle"+this.postSuffix).html(this.media.title),$("#selectedFile"+this.postSuffix).show()):$("#chooseFile"+this.postSuffix).show(),typeof e!="undefined"&&e==1?$(this).trigger($.Event(t.Event.SUCCESS_AND_POST,n)):$(this).trigger($.Event(t.Event.SUCCESS,n))},t.prototype._invokeError=function(e){console.log("%s: %s- jqXHR=%o",t.TAG,"_invokeError",e),$("#uploadingFileTitle"+this.postSuffix).html(""),$("#uploadProgress"+this.postSuffix).hide(),$("#chooseFile"+this.postSuffix).show(),this.isFileSelection&&($("#selectedFile"+this.postSuffix).hide(),$("#selectedFileTitle"+this.postSuffix).html("")),$(this).trigger($.Event(t.Event.ERROR,{jqXHR:e}))},t.prototype._invokeReset=function(){console.log("%s: %s",t.TAG,"_invokeReset"),$("#uploadingFileTitle"+this.postSuffix).html(""),$("#uploadProgress"+this.postSuffix).hide(),$("#chooseFile"+this.postSuffix).show(),this.isFileSelection&&($("#selectedFile"+this.postSuffix).hide(),$("#selectedFileTitle"+this.postSuffix).html("")),this.setMedia(null),$(this).trigger($.Event(t.Event.RESET,{postId:this.postId}))},t.prototype.setMedia=function(e){console.log("%s: %s",t.TAG,"setMedia"),this.media=typeof e!="undefined"?e:this.media},t}),define("controller/images",["core/mediaChooser","core/mediaManager"],function(e,t){var n=function(){this.page=null,this.mediaChooser=null,this.mediaManager=new t,this.forwardButton="<button class='forwardButton'></button>",this.datasetId=null,this.bind__onPreviewButtonClick=this.onPreviewButtonClick.bind(this),this.bind__onDeleteButtonClick=this.onDeleteButtonClick.bind(this),this.bind__onSuccess=this._onSuccess.bind(this),this.bind__onDialogClose=this._onDialogClose.bind(this),this.bind_forwardFunction=this.forwardFunction.bind(this)};return n.TAG="Images",n.Page={INDEX:0,PREVIEW:1},n.mediaChooserOptions=function(e){switch(e){case n.Page.INDEX:return{element:$("#preview"),isPopUp:!0,isFileSelection:!1,datasetId:this.datasetId};case n.Page.PREVIEW:return{}}},n.prototype.bindUIEvents=function(e){console.log("%s: %s- page=%d",n.TAG,"bindUIEvents",e),this.page=e;switch(this.page){case n.Page.INDEX:this._bindUIEventsIndex();break;case n.Page.PREVIEW:}},n.prototype._bindUIEventsIndex=function(){console.log("%s: %s",n.TAG,"_bindUIEventsIndex"),this.mediaChooser=new e(n.mediaChooserOptions(n.Page.INDEX)),this.mediaChooser.datasetId=this.datasetId,$(this.mediaChooser).on(e.Event.SUCCESS,this.bind__onSuccess),$(this.mediaChooser).on(e.Event.DIALOG_CLOSE,this.bind__onDialogClose),this.mediaChooser.bindUIEvents(),$(".delete-button").on("click",this.bind__onDeleteButtonClick)},n.prototype.onPreviewButtonClick=function(e){e.preventDefault(),console.log("Preview");if($(e.target).hasClass("disabled"))return!1;$("#preview").html(""),this.page=n.Page.PREVIEW,this.mediaChooser.previewMedia({mediaUrl:$(e.target).data("url"),mediaId:$(e.target).data("val")})},n.prototype.onDeleteButtonClick=function(e){e.preventDefault();var n=$(e.target);return $(this.mediaManager).one(t.EVENT_DELETE_SUCCESS,function(){n.parent().parent().parent().remove()}),$(this.mediaManager).one(t.EVENT_DELETE_ERROR,function(e,t){t.status==500?alert(t.statusText):alert("Error: "+e)}),this.mediaManager.deleteMedia(n.data("val"),$("#mediaDeleteConfirmMessage").html())},n.prototype._onSuccess=function(e){switch(this.page){case n.Page.INDEX:console.log("Image successfully uploaded");break;case n.Page.PREVIEW:console.log("Done previewing")}},n.prototype._onDialogClose=function(e){switch(this.page){case n.Page.PREVIEW:this.page=n.Page.INDEX,console.log("Terminating function called"),console.log(e.media)}},n.prototype.forwardFunction=function(){console.log("%s: %s",n.TAG,"forwardFunction"),this.mediaChooser.destroyVideoRecorder(),this.mediaChooser.previewMedia({type:e.TYPE_RECORD_VIDEO,mediaUrl:Routing.generate("imdc_myfiles_preview",{mediaId:this.mediaChooser.media.id}),mediaId:this.mediaChooser.media.id,recording:!0})},n}),define("controller/datasets",["core/mediaChooser","core/mediaManager"],function(e,t){var n=function(){this.page=null,this.mediaChooser=null,this.mediaManager=new t,this.bind__onPreviewButtonClick=this.onPreviewButtonClick.bind(this),this.bind__onDeleteButtonClick=this.onDeleteButtonClick.bind(this),this.bind__onSuccess=this._onSuccess.bind(this),this.bind__onDialogClose=this._onDialogClose.bind(this),this.bind_forwardFunction=this.forwardFunction.bind(this)};return n.TAG="Datasets",n.Page={INDEX:0,PREVIEW:1},n.mediaChooserOptions=function(e){switch(e){case n.Page.INDEX:return{element:$("#preview"),isPopUp:!0,isFileSelection:!1};case n.Page.PREVIEW:return{}}},n.prototype.bindUIEvents=function(e){console.log("%s: %s- page=%d",n.TAG,"bindUIEvents",e),this.page=e;switch(this.page){case n.Page.INDEX:this._bindUIEventsIndex();break;case n.Page.PREVIEW:}},n.prototype._bindUIEventsIndex=function(){console.log("%s: %s",n.TAG,"_bindUIEventsIndex"),this.mediaChooser=new e(n.mediaChooserOptions(n.Page.INDEX)),$(this.mediaChooser).on(e.Event.SUCCESS,this.bind__onSuccess),$(this.mediaChooser).on(e.Event.DIALOG_CLOSE,this.bind__onDialogClose),this.mediaChooser.bindUIEvents(),$(".preview-button").on("click",this.bind__onPreviewButtonClick),$(".delete-button").on("click",this.bind__onDeleteButtonClick)},n.prototype.onPreviewButtonClick=function(e){e.preventDefault(),console.log("Preview");if($(e.target).hasClass("disabled"))return!1;$("#preview").html(""),this.page=n.Page.PREVIEW,this.mediaChooser.previewMedia({mediaUrl:$(e.target).data("url"),mediaId:$(e.target).data("val")})},n.prototype.onDeleteButtonClick=function(e){e.preventDefault();var n=$(e.target);return $(this.mediaManager).one(t.EVENT_DELETE_SUCCESS,function(){n.parent().parent().parent().remove()}),$(this.mediaManager).one(t.EVENT_DELETE_ERROR,function(e,t){t.status==500?alert(t.statusText):alert("Error: "+e)}),this.mediaManager.deleteMedia(n.data("val"),$("#mediaDeleteConfirmMessage").html())},n.prototype._onSuccess=function(e){switch(this.page){case n.Page.INDEX:this._addMediaRow(e.media);break;case n.Page.PREVIEW:console.log("Done previewing")}},n.prototype._onDialogClose=function(e){switch(this.page){case n.Page.PREVIEW:this.page=n.Page.INDEX,console.log("Terminating function called"),console.log(e.media),this._updateMediaRow(e.media)}},n.prototype.forwardFunction=function(){console.log("%s: %s",n.TAG,"forwardFunction"),this.mediaChooser.destroyVideoRecorder(),this.mediaChooser.previewMedia({type:e.TYPE_RECORD_VIDEO,mediaUrl:Routing.generate("imdc_myfiles_preview",{mediaId:this.mediaChooser.media.id}),mediaId:this.mediaChooser.media.id,recording:!0})},n}),define("core/annotation",["core/annotation"],function(){var e=function t(){this.color=t.getRandomColor(),this.polygon=new Array,this.type=null,this.id=null,this.polygonId=null};return Annotation.prototype.addPoint=function(e,t){this.polygon.push(e),this.polygon.push(t)},Annotation.prototype.getPointAt=function(e){if(this.polygon.length>2*e+1)return{y:this.polygon[2*e],x:this.polygon[2*e+1]}},Annotation.prototype.getPolygonLength=function(){return this.polygon.length/2},Annotation.prototype.removeLastPoint=function(){return this.polygon.length>0?{y:this.polygon.pop(),x:this.polygon.pop()}:null},Annotation.prototype.getPolygon=function(){return this.polygon},Annotation.prototype.getPolygonId=function(){return this.polygonId},Annotation.prototype.setPolygonId=function(e){this.polygonId=e},Annotation.prototype.setType=function(e){this.type=e},Annotation.prototype.getType=function(){return this.type},Annotation.prototype.setId=function(e){this.id=e},Annotation.prototype.getId=function(){return this.id},Annotation.getRandomColor=function(){var e="0123456789ABCDEF".split(""),t="#";for(var n=0;n<6;n++)t+=e[Math.round(Math.random()*15)];return t},e}),define("controller/annotations",["core/mediaChooser","core/mediaManager","core/annotation"],function(e,t,n){var r=function(){this.page=null,this.mediaChooser=null,this.mediaManager=new t,this.annotations=new Array,this.bind__onPolygonButtonClick=this.onPolygonButtonClick.bind(this),this.bind__onRemovePolygonButtonClick=this.onRemovePolygonButtonClick.bind(this),this.bind__onZoomInButtonClick=this.onZoomInButtonClick.bind(this),this.bind__onZoomOutButtonClick=this.onZoomOutButtonClick.bind(this),this.bind__onSaveButtonClick=this.onSaveButtonClick.bind(this),this.bind__polygonMouseClickListener=this.polygonMouseClickListener.bind(this)};return r.TAG="Annotations",r.Page={INDEX:0,PREVIEW:1},r.prototype.setCanvasElement=function(e){this.canvasId=e,this.canvasElement=$("#"+e),this.imageElement=this.canvasElement.next(".ia-media-img"),this.canvasElement.width(this.imageElement.width()),this.canvasElement.height(this.imageElement.height()),console.log(this.canvasElement.eq(0)),this.canvas=new Raphael(e,this.imageElement.width(),this.imageElement.height())},r.mediaChooserOptions=function(e){switch(e){case r.Page.INDEX:return{element:$("#preview"),isPopUp:!0,isFileSelection:!1};case r.Page.PREVIEW:return{}}},r.prototype.bindUIEvents=function(e){console.log("%s: %s- page=%d",r.TAG,"bindUIEvents",e),this.page=e;switch(this.page){case r.Page.INDEX:this._bindUIEventsIndex();break;case r.Page.PREVIEW:}},r.prototype._bindUIEventsIndex=function(){console.log("%s: %s",r.TAG,"_bindUIEventsIndex"),$("#annotation-polygon-button").on("click",this.bind__onPolygonButtonClick),$("#annotation-remove-polygon-button").on("click",this.bind__onRemovePolygonButtonClick),$("#annotation-zoom-in-button").on("click",this.bind__onZoomInButtonClick),$("#annotation-zoom-out-button").on("click",this.bind__onZoomOutButtonClick),$("#annotation-save-button").on("click",this.bind__onSaveButtonClick)},r.prototype.onPolygonButtonClick=function(e){e.preventDefault(),console.log("Polygon"),this.canvasElement.off("click",this.bind__polygonMouseClickListener),this.isFirstPoint=!0,this.canvasElement.on("click",this.bind__polygonMouseClickListener)},r.prototype.polygonMouseClickListener=function(e){console.log("click");var t=$(this.canvasElement).offset(),r={x:e.clientX-t.left,y:e.clientY-t.top};if(this.isFirstPoint){var i=this.canvas.path("M"+r.x+" "+r.y),s=new n;s.addPoint(r.x,r.y),s.setPolygonId(i.id),this.annotations.push(s),this.isFirstPoint=!1;var o=this.canvas.circle(r.x,r.y,8);o.attr("fill","#000000"),console.log("First point")}else{var s=this.annotations[this.annotations.length-1],i=this.canvas.getById(s.getPolygonId());i.remove(),s.addPoint(r.x,r.y);var u=s.getPointAt(0),a="M"+u.x+" "+u.y;for(var f=1;f<s.getPolygonLength();f++)a+=",L"+r.x+" "+r.y;i=this.canvas.path(a),s.setPolygonId(i.id),i.attr("stroke",s.color),console.log("new point")}},r.prototype.onRemovePolygonButtonClick=function(e){e.preventDefault(),console.log("Polygon Remove")},r.prototype.onZoomInButtonClick=function(e){e.preventDefault(),console.log("Zoom In")},r.prototype.onZoomOutButtonClick=function(e){e.preventDefault(),console.log("Zoom Out")},r.prototype.onSaveButtonClick=function(e){e.preventDefault(),console.log("Save")},r.prototype.onPreviewButtonClick=function(e){e.preventDefault(),console.log("Preview");if($(e.target).hasClass("disabled"))return!1;$("#preview").html(""),this.page=r.Page.PREVIEW,this.mediaChooser.previewMedia({mediaUrl:$(e.target).data("url"),mediaId:$(e.target).data("val")})},r.prototype.onDeleteButtonClick=function(e){e.preventDefault();var n=$(e.target);return $(this.mediaManager).one(t.EVENT_DELETE_SUCCESS,function(){n.parent().parent().parent().remove()}),$(this.mediaManager).one(t.EVENT_DELETE_ERROR,function(e,t){t.status==500?alert(t.statusText):alert("Error: "+e)}),this.mediaManager.deleteMedia(n.data("val"),$("#mediaDeleteConfirmMessage").html())},r.prototype._onSuccess=function(e){switch(this.page){case r.Page.INDEX:this._addMediaRow(e.media);break;case r.Page.PREVIEW:console.log("Done previewing")}},r.prototype._onDialogClose=function(e){switch(this.page){case r.Page.PREVIEW:this.page=r.Page.INDEX,console.log("Terminating function called"),console.log(e.media),this._updateMediaRow(e.media)}},r.prototype.forwardFunction=function(){console.log("%s: %s",r.TAG,"forwardFunction"),this.mediaChooser.destroyVideoRecorder(),this.mediaChooser.previewMedia({type:e.TYPE_RECORD_VIDEO,mediaUrl:Routing.generate("imdc_myfiles_preview",{mediaId:this.mediaChooser.media.id}),mediaId:this.mediaChooser.media.id,recording:!0})},r}),define("main",["require","controller/images","controller/datasets","controller/annotations","core/mediaChooser","core/mediaManager"],function(e){var t={};t.Controller={},t.Controller.Images=e("controller/images"),t.Controller.Datasets=e("controller/datasets"),t.Controller.Annotations=e("controller/annotations"),t.Core={},t.Core.MediaChooser=e("core/mediaChooser"),t.Core.MediaManager=e("core/mediaManager"),window.ImageAnnotator=t,$ia=window.ImageAnnotator,$(".autosize").autosize()}),require(["main"]);