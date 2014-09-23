define(function() {
    var Profile = function() {
        this.page = null;
    }

    Profile.TAG = "Profile";

    Profile.Page = {
        EDIT: 0
    };

    /**
     * ui element event bindings in order of appearance
     * @param {number} page
     */
    Profile.prototype.bindUIEvents = function(page) {
        console.log("%s: %s", Profile.TAG, "bindUIEvents");

        this.page = page;

        switch (page) {
            case Profile.Page.EDIT:
                this._bindUIEventsEdit();
                break;
        }
    };

    Profile.prototype._bindUIEventsEdit = function() {
        console.log("%s: %s", Profile.TAG, "_bindUIEventsEdit");

        $("#addAnotherLanguage").on("click", function(e) {
            e.preventDefault();
            Profile.addLanguage(this);
        });

        $(".tt-delete-language").on("click", function(e) {
            e.preventDefault();
            Profile.deleteLanguage(this);
        });
    };

    Profile.addLanguage = function(element) {
        var languageList = $("#foss_user_profile_form_languages");
        var deleteButton;
        var deleteLanguageButtonText = languageList.data("delete-language-text");
        var newWidget = languageList.data("prototype"); // grab the prototype template
        var languageCount = $("#foss_user_profile_form_languages > li").length;

        $('#no-languages').remove();

        //TODO dustjs?
        deleteButton = $("<button class=\"btn btn-danger btn-sm tt-delete-language\"></a>").html(deleteLanguageButtonText);
        deleteButton.click(function(e){
            e.preventDefault();
            Profile.deleteLanguage(this);
        });

        // replace the "__name__" used in the id and name of the prototype
        // with a number that's unique to your languages
        newWidget = newWidget.replace(/__name__/g, languageCount);
        languageCount++;

        // create a new list element and add it to the list
        var newLi = $("<li></li>").html(newWidget);
        newLi.append(deleteButton);
        $('#foss_user_profile_form_languages').append(newLi);
    };

    Profile.deleteLanguage = function(element) {
        var languageList = $("#foss_user_profile_form_languages");
        var emptyTitle = languageList.data("no-languages-text");
        var noLanguages = $("<span id=\"no-languages\"></span>").html(emptyTitle); //TODO dustjs?

        $(element).parent().remove();

        if ($("#foss_user_profile_form_languages > li").length == 0) {
            $('#foss_user_profile_form_languages').append(noLanguages);
        }
    };

    return Profile;
});
