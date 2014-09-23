$(document).ready(function() {
	$('.fullscreen-toggle').on("click", function(e) {
		e.preventDefault();
		var element = $(this).parent().parent(); 
		toggleFullScreen(element);
	});
	/*$(window).resize(function(e) {
		resizeImage($("img.preview"));
	});*/
	
//	$(document).on("fullscreenchange", function() {
//		onFullScreenChange(document.fullscreen);
//	});
//
//	$(document).on("mozfullscreenchange", function() {
//		onFullScreenChange(document.mozFullScreen);
//	});
//
//	$(document).on("webkitfullscreenchange", function() {
//		onFullScreenChange(document.webkitIsFullScreen);
//	});
});

function toggleFullScreen(element) 
{
	console.log("toggle Full Screen");
	var htmlElelemnt = element[0];
	if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) 
	{ 
		if (htmlElelemnt.requestFullscreen) 
		{
			htmlElelemnt.requestFullscreen();
		} 
		else if (htmlElelemnt.mozRequestFullScreen) 
		{
			htmlElelemnt.mozRequestFullScreen();
		} 
		else if (htmlElelemnt.webkitRequestFullscreen) 
		{
			htmlElelemnt.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		}
		
		$(element).addClass('fullScreen');
		$(element).addClass('full-height');		
		$("img.preview").addClass("hidden");
		$(".image-preview a").addClass("showBackground").css('background-image', 'url("'+$("img.preview")[0].src+'")');
	} 
	else 
	{
		if (document.cancelFullScreen) 
		{
			document.cancelFullScreen();
		} 
		else if (document.mozCancelFullScreen) 
		{
			document.mozCancelFullScreen();
		} 
		else if (document.webkitCancelFullScreen) 
		{
			document.webkitCancelFullScreen();
		}
		$(element).removeClass('fullScreen');
		$(element).removeClass('full-height');
		$("img.preview").removeClass("hidden");
		$(".image-preview a").removeClass("showBackground").css('background-image', 'none');
	}
};

/*function resizeImage(imageElement)
{
	console.log("Resizing element");
	var imageParent = imageElement.parent();
	
	var newImg = new Image();

    newImg.onload = function() 
    {
    	var height = newImg.height;
    	var width = newImg.width;
    	var aspectRatio = width / height;
    	console.log("aspectRatio: "+aspectRatio);
    	imageElement.addC
  	
	  	if ( (imageParent.width() / aspectRatio ) > imageParent.height() ) 
	  	{
	  		imageElement.css("height", imageParent.height());
	  		imageElement.css("width", "auto");
//	  	    imageElement.removeClass('auto-height').addClass('auto-width');
	  	} 
	  	else 
	  	{
	  		imageElement.css("width", imageParent.width());
	  		imageElement.css("height", "auto");
//	  		imageElement.removeClass('auto-width').addClass('auto-height');
	  	}	
    }

    newImg.src = imageElement[0].src; // this must be done AFTER setting onload
	
}*/