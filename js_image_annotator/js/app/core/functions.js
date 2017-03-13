define(function()
{
    var Functions = function()
    {
    };

    Functions.prototype.ajaxLoadPage = function(url, data, onSuccess, onError)
    {
	var request = {
	    type : "POST",
	    contentType : "application/x-www-form-urlencoded",
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
    };

    return Functions;
});
