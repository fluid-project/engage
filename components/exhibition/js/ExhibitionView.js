/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid*/
"use strict";

fluid = fluid || {};

(function ($) {
    
    function makeProtoComponents(model) {
        var proto = {
            navBarTitle: "%title",
            displayDate: "%displayDate",
            shortDescription: "%shortDescription",
            description: {markup: model.introduction ? model.introduction : model.content},
            guestbook: {messagekey: "guestbook", args: {size: "%guestbookSize"}},
            guestbookLink: {target: "%guestbookLink"},
            guestbookLinkText: {messagekey: "guestbookLinkText"},
            image: {target: "%image"},
            catalogueLink: {target: "%catalogueLink"},
            catalogueLinkText: {messagekey: "catalogueLinkText"},
            aboutLink: {target: "%aboutLink"},
            aboutLinkText: {messagekey: "aboutLink"},
            title: "%title",
            guestbookInvitation: model.comments || {messagekey: "guestbookInvitationString"}
        };
        if (model.catalogueSize > 0) {
            fluid.renderer.mergeComponents(proto, {
                catalogueTitle: {messagekey: "catalogueTitle", args: {size: "%catalogueSize"}}
            });
        }
        return proto;
    }
    
    var setupSubcomponents = function (that) {
        // Render the Exhibition Preview component only if we have artifacts to preview.
        if (that.model.catalogueSize > 0 && that.model.cataloguePreview) {
            // Prepare model for NavList
            var cataloguePreview = fluid.transform(that.model.cataloguePreview, function (artifact) {
                return {
                    target: artifact.target,
                    showBadge: artifact.media,
                    image: artifact.image,
                    title: artifact.title
                };
            });
            
            $.extend(that.options.exhibitionPreview.options, {model: cataloguePreview});
            that.exhibitionPreview = fluid.initSubcomponent(that, "exhibitionPreview", [
                that.locate("catalogue"), 
                fluid.COMPONENT_OPTIONS
            ]);
        }
        
        that.navBar = fluid.initSubcomponent(that, "navigationBar", [that.container, fluid.COMPONENT_OPTIONS]);
        // Avoid for view where guestbook is not configured triggering an error since most likely code is not loaded (about view)
        if (that.options.guestbook.options.model) {
            that.guestbook = fluid.initSubcomponent(that, "guestbook", [that.locate("guestbook"), fluid.COMPONENT_OPTIONS]);
        }
    };
    
    var setup = function (that) {        
        var messageLocator = fluid.messageLocator(that.options.strings, fluid.stringTemplate);
        var selectorsToIgnore = [];
        if (that.model.catalogueSize) {
            selectorsToIgnore.push("catalogue");
        }
        that.render = fluid.engage.renderUtils.createRendererFunction(that.container, that.options.selectors, {
            selectorsToIgnore: selectorsToIgnore,
            rendererOptions: {
                messageLocator: messageLocator,
                model: that.model
            }
        });
        
        that.refreshView();
    };
    
    fluid.engage.exhibitionView = function (container, options) {
        var that = fluid.initView("fluid.engage.exhibitionView", container, options);        
        that.model = that.options.model;

        var expander = fluid.renderer.makeProtoExpander({ELstyle: "%"});
        
        that.refreshView = function () {
            var protoTree = makeProtoComponents(that.model);
            var tree = expander(protoTree);
            that.render(tree);
            setupSubcomponents(that);
        };
        
        setup(that);        
        return that;
    };
    
    fluid.defaults("fluid.engage.exhibitionView", {
        exhibitionPreview: {
            type: "fluid.navigationList",
            options: {
                defaultToGrid: true
            }
        },
        
        guestbook: {
            type: "fluid.engage.guestbook",
            options: {
                navigationBar: {
                    options: {
                        disabled: true
                    }
                }
            }
        },
                
        navigationBar: {
            type: "fluid.engage.navigationBar"
        },
        
        selectors: {
            aboutLink: ".flc-exhibition-aboutLink",
            aboutLinkText: ".flc-exhibition-aboutLinkText",
            navBarTitle: ".flc-exhibition-navBarTitle",
            title: ".flc-exhibition-title",
            image: ".flc-exhibition-image",
            shortDescription: ".flc-exhibition-shortDescription",
            description: ".flc-exhibition-description",
            displayDate: ".flc-exhibition-displayDate",
            catalogue: ".flc-exhibition-catalogue",
            catalogueTitle: ".flc-exhibition-catalogue-title",
            catalogueLink: ".flc-exhibition-catalogueLink",
            catalogueLinkText: ".flc-exhibition-catalogueLinkText",
            guestbook: ".flc-exhibition-guestbook",
            guestbookLink: ".flc-exhibition-guestbookLink",
            guestbookLinkText: ".flc-exhibition-guestbookLinkText",
            guestbookInvitation: ".flc-exhibition-guestbookInvitation"
        },
        
        strings: {
            guestbookInvitationString: "No comments yet. Create your own comment.",
            catalogueTitle: "Catalogue (%size)",
            guestbook: "Guestbook (%size)",
            guestbookLinkText: "Read all comments",
            catalogueLinkText: "View the full catalogue",
            aboutLink: "Read more"
        }
    });
}(jQuery));