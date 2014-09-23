    var languageCount = $('#foss_user_profile_form_languages > li').length;;
	function addLanguage (currentElement, emptyTitle, deleteLanguageButtonText)
    {
    	$('#no-languages').remove();
        var languageList = $('#foss_user_profile_form_languages');

        var deleteLanguageButtonText = languageList.attr('data-delete-language-text');
        var emptyTitle = languageList.attr('data-no-languages-text');
        
        // grab the prototype template
        var newWidget = languageList.attr('data-prototype');
        
        deleteButton = $('<a href="#" class="delete-language"></a>').html(deleteLanguageButtonText);
        $(deleteButton).click(function(e){
        	return deleteLanguage($(this), emptyTitle);
            });
        // replace the "__name__" used in the id and name of the prototype
        // with a number that's unique to your languages
        newWidget = newWidget.replace(/__name__/g,languageCount);
        languageCount++;

        // create a new list element and add it to the list
        var newLi = $('<li></li>').html(newWidget);
        newLi.appendTo($('#foss_user_profile_form_languages'));
		deleteButton.appendTo($(newLi));
        return false;
    }
	function deleteLanguage (currentElement)
	{
	    $(currentElement).parent().remove();
	    var languageList = $('#foss_user_profile_form_languages');
	    var emptyTitle = languageList.attr('data-no-languages-text');
	    if ($('#foss_user_profile_form_languages > li').length == 0)
	    {
	    	var noLanguages= $('<span id="no-languages"></span>').html(emptyTitle);
			noLanguages.appendTo($('#foss_user_profile_form_languages'));
	    }
	    return false;
	}
