$(document).ready(function() {
	
	// make all elements with class 'autosize' to be autosizeable
	$(".autosize").autosize();
	
	$(".toolPop").tooltip();
	
	$(".sign-popover").popover({trigger: 'hover', html: true, delay: { show: 750, hide: 100 }});
});
