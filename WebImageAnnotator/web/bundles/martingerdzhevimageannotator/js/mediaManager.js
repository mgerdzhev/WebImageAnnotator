MediaManager.EVENT_DELETE_SUCCESS = "delete_media_success";
MediaManager.EVENT_DELETE_ERROR = "delete_media_error";
MediaManager.EVENT_UPDATE_SUCCESS = "update_media_success";
MediaManager.EVENT_UPDATE_ERROR = "update_media_error";

function MediaManager()
{
}

/**
 * Gateway function to all media choosing functions
 * 
 * @param type -
 *            the type of media to choose, defaults to MediaChooser.TYPE_ALL
 */
MediaManager.prototype.deleteMedia = function(mediaID, confirmationMessage)
{
	var instance = this;
	if (typeof confirmationMessage !== "undefined")
	{

		var response = confirm(confirmationMessage);
		if (!response)
			return false;
	}
	
	var address = Routing.generate('imdc_myfiles_remove', {'mediaId': mediaID});
	var data = {'mediaId' : mediaID};
	$.ajax({
		url : address,
		type : "POST",
		contentType : "application/x-www-form-urlencoded",
		data : data,
		success : function(data)
		{
			if (data.responseCode == 200)
			{
				$(instance).trigger(MediaManager.EVENT_DELETE_SUCCESS);
			}
			else if (data.responseCode == 400)
			{ // bad request
				$(instance).trigger(MediaManager.EVENT_DELETE_ERROR,data.feedback);
				console.log('Error: ' + data.feedback);
			}
			else
			{
				$(instance).trigger(MediaManager.EVENT_DELETE_ERROR,"Unknown Error");
				console.log('An unexpected error occured');
			}
		},
		error : function(request)
		{
			$(instance).trigger(MediaManager.EVENT_DELETE_ERROR,request);
			console.log(request);
		}
	});
};

MediaManager.prototype.trimMedia = function(mediaID, startTime, endTime)
{
	var instance = this;
	
	var address = Routing.generate('imdc_myfiles_trim', {'mediaId': mediaID, 'startTime': startTime, 'endTime': endTime});
	var data = {'mediaId': mediaID, 'startTime': startTime, 'endTime': endTime};
	$.ajax({
		url : address,
		type : "POST",
		contentType : "application/x-www-form-urlencoded",
		data : data,
		success : function(data)
		{
			console.log(data);
			if (data.responseCode == 200)
			{
//				console.log(data);
//				$(instance).trigger(MediaManager.EVENT_DELETE_SUCCESS);
				instance.media = data.media;
			}
			else if (data.responseCode == 400)
			{ // bad request
//				$(instance).trigger(MediaManager.EVENT_DELETE_ERROR,data.feedback);
				console.log('Error: ' + data.feedback);
			}
			else
			{
//				$(instance).trigger(MediaManager.EVENT_DELETE_ERROR,"Unknown Error");
				console.log('An unexpected error occured');
			}
		},
		error : function(request)
		{
//			$(instance).trigger(MediaManager.EVENT_DELETE_ERROR,request);
			console.log(request);
		}
	});
};

MediaManager.prototype.updateMedia = function(media)
{
	var instance = this;
	if (typeof media == 'undefined')
	{
		$(instance).trigger(MediaManager.EVENT_UPDATE_ERROR, "Must send a media object");
		console.log('Error: ' + "Must send a media object");	
	}
	var address = Routing.generate('imdc_myfiles_update', {'mediaId': media.id});
	console.log(media);
	var data = {'mediaId' : media.id, 'media' : JSON.stringify(media)};
	console.log(data);
	$.ajax({
		url : address,
		type : "POST",
		contentType : "application/x-www-form-urlencoded",
		data : data,
		success : function(data)
		{
			if (data.responseCode == 200)
			{
				$(instance).trigger(MediaManager.EVENT_UPDATE_SUCCESS);
			}
			else if (data.responseCode == 400)
			{ // bad request
				$(instance).trigger(MediaManager.EVENT_UPDATE_ERROR,data.feedback);
				console.log('Error: ' + data.feedback);
			}
			else
			{
				$(instance).trigger(MediaManager.EVENT_UPDATE_ERROR,"Unknown Error");
				console.log('An unexpected error occured');
			}
		},
		error : function(request)
		{
			$(instance).trigger(MediaManager.EVENT_UPDATE_ERROR,request);
			console.log(request);
		}
	});
};
