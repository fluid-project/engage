/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/

fluid = fluid || {};

(function ($) {
    
    var generateTreeForArtifact = function (artifact) {
        var itemChildren = [
            fluid.engage.renderUtils.uiBound("previewItemCaption", artifact.title),
            {
                ID: "previewItemLink",
                target: artifact.target
            },
            {
                ID: "previewItemImage",
                target: artifact.thumbnail
            }
        ];
        
        // Add the media icon badge if this artifact has media associated with it.
        if (artifact.media) {
            itemChildren.push({
                ID: "badgeIcon"
            });
        }
        
        return fluid.engage.renderUtils.uiContainer("previewItems:", itemChildren)
    };
    
    var generateComponentTree = function (model) {
        return {
            children: fluid.transform(model, generateTreeForArtifact)
        };
    };
    
    var setup = function (that) {
        that.render = fluid.engage.renderUtils.createRendererFunction(that.container, that.options.selectors, {
                repeatingSelectors: ["previewItems"]
        });
        
        // TODO: This smells! Why are we blasting a component's parent if we have no model?    
        if (that.model.length && that.model.length > 0) {
            that.refreshView();
        }
        else {
            that.container.parent().remove();
        }
    }; 
    
    fluid.engage.preview = function (container, options) {
        var that = fluid.initView("fluid.engage.preview", container, options);
        that.model = that.options.model;
        
        that.refreshView = function () {
            that.render(generateComponentTree(that.model))
        };
        
        setup(that);
        return that;
    };

    fluid.defaults("fluid.engage.preview", {
        selectors: {
            previewItems: ".flc-preview-items",
            previewItemLink: ".flc-preview-item-link",
            previewItemImage: ".flc-preview-item-image",
            previewItemCaption: ".flc-preview-item-caption",
            badgeIcon: ".flc-preview-badge-icon"
        }
    });
}(jQuery));