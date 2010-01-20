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
    
    var buildComponentTree = function (that) {
        var utils = fluid.engage.renderUtils;
        return {
            children: [
                utils.uiBound("about", "About:"),
                utils.uiBound("navBarTitle", that.model.title),
                utils.uiBound("displayDate", that.model.displayDate),
                utils.uiBound("shortDescription", that.model.shortDescription),
                utils.uiBound("description", that.model.introduction ? that.model.introduction : that.model.content),
                utils.uiBound("catalogue", fluid.stringTemplate(that.options.strings.catalogue, {
                    size: that.model.catalogueSize
                })),
                utils.uiBound("guestbook", fluid.stringTemplate(that.options.strings.guestbook, {
                    size: that.model.guestbookSize || 0
                })),
                utils.uiBound("guestbookLinkText", that.options.strings.guestbookLinkText),
                utils.attrDecoratedUIBound("guestbookLink", "href", that.model.guestbookLink),
                utils.attrDecoratedUIBound("image", "src", that.model.image),
                utils.attrDecoratedUIBound("catalogueLink", "href", that.model.catalogueLink),
                utils.uiBound("catalogueLinkText", that.options.strings.catalogueLinkText),
                utils.attrDecoratedUIBound("aboutLink", "href", that.model.aboutLink),
                utils.uiBound("aboutLinkText", that.options.strings.aboutLink),
                utils.uiBound("title", that.model.title),
                utils.uiBound("guestbookInvitation", that.model.comments || that.options.strings.guestBookInvitationString)
            ]
        };
    };
    
    var renderExhibition = function (that, buildTree) {
        fluid.engage.renderUtils.createRendererFunction(that.container,
            that.options.selectors, {
                selectorsToIgnore: ["exhibitionPreview"]
            })(buildTree(that));
    };
    
    var setupSubcomponents = function (that) {
        that.model.cataloguePreview = [{
            title: "TITLE",
            target: "#",
            thumbnail: "http://helios.gsfc.nasa.gov/image_euv_press.jpg",
            media: true
        }];
        that.exhibitionPreview = fluid.initSubcomponent(that, "exhibitionPreview", 
            [that.locate("exhibitionPreview"), 
             {model: that.model.cataloguePreview ? that.model.cataloguePreview : []}]);
    };
    
    var setup = function (that) {
        renderExhibition(that, buildComponentTree);
        setupSubcomponents(that);
    };
    
    fluid.exhibition = function (container, options) {
        var that = fluid.initView("fluid.exhibition", container, options);        
        that.model = that.options.model;
        setup(that);        
        return that;
    };
    
    fluid.defaults("fluid.exhibition", {
        selectors: {
            about: ".flc-exhibition-about",
            aboutLink: ".flc-exhibition-aboutLink",
            aboutLinkText: ".flc-exhibition-aboutLinkText",
            navBarTitle: ".flc-exhibition-navBarTitle",
            title: ".flc-exhibition-title",
            image: ".flc-exhibition-image",
            shortDescription: ".flc-exhibtion-shortDescription",
            description: ".flc-exhibition-description",
            displayDate: ".flc-exhibition-displayDate",
            catalogue: ".flc-exhibition-catalogue",
            catalogueLink: ".flc-exhibition-catalogueLink",
            catalogueLinkText: ".flc-exhibition-catalogueLinkText",
            guestbook: ".flc-exhibition-guestbook",
            guestbookLink: ".flc-exhibition-guestbookLink",
            guestbookLinkText: ".flc-exhibition-guestbookLinkText",
            guestbookInvitation: ".flc-exhibition-guestbookInvitation",
            exhibitionPreview: ".flc-exhibition-preview"
        },
        strings: {
            guestBookInvitationString: "No comments yet. Create your own comment.",
            catalogue: "Catalogue (%size)",
            guestbook: "Guestbook (%size)",
            guestbookLinkText: "Read all comments",
            catalogueLinkText: "View the full catalogue",
            aboutLink: "Read more"
        },
        exhibitionPreview: {
            type: "fluid.engage.preview"
        }
    });
}(jQuery));