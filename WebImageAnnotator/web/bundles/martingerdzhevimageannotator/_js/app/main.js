define(function(require) {
    var ImageAnnotator = {};

    ImageAnnotator.Controller = {};
    ImageAnnotator.Controller.MyFiles = require('controller/myFiles');
    ImageAnnotator.Controller.Profile = require('controller/profile');

    ImageAnnotator.Core = {};
    ImageAnnotator.Core.MediaChooser = require('core/mediaChooser');
    ImageAnnotator.Core.MediaManager = require('core/mediaManager');

    window.ImageAnnotator = ImageAnnotator;

    $ia = window.ImageAnnotator;

    // make all elements with class 'autosize' expand to fit its contents
    $(".autosize").autosize();
});
