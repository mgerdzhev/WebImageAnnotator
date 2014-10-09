define(function(require) {
    var ImageAnnotator = {};

    ImageAnnotator.Controller = {};
    ImageAnnotator.Controller.Images = require('controller/images');
    ImageAnnotator.Controller.Datasets = require('controller/datasets');
    ImageAnnotator.Controller.Annotations = require('controller/annotations');

    ImageAnnotator.Core = {};
    ImageAnnotator.Core.MediaChooser = require('core/mediaChooser');
    ImageAnnotator.Core.MediaManager = require('core/mediaManager');

    window.ImageAnnotator = ImageAnnotator;

    $ia = window.ImageAnnotator;

    // make all elements with class 'autosize' expand to fit its contents
    $(".autosize").autosize();
});
