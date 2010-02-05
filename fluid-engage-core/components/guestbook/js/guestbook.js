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

    makeProtoComponents = function(model) {
        return {
          cells:
            fluid.transform(model.comments, function(comment) {
              
            })
        };
    }

    fluid.engage.guestbook = function (container, options) {
        var that = fluid.initView("fluid.engage.guestbook", container, options);        
        that.model = that.options.model;

        var expander = fluid.renderer.makeProtoExpander({ELstyle: "%"});
        
        that.refreshView = function () {
            var protoTree = makeProtoComponents(that.model);
            var tree = expander(protoTree);
            that.render(tree);
            setupSubcomponents(that);
        };
        
        return that;
    };
    
    fluid.defaults("fluid.engage.guestbook", {
        navigationList: {
            type: "fluid.navigationList",
            options: {
                styles: {
                    titleText: "fl-browse-shortenText"
                },
                useDefaultImage: true
            }
        },
        selectors: {
            commentCell: ".flc-guestbook-comment",
            author: ".flc-guestbook-author",
            location: ".flc-guestbook-location",
            date: ".flc-guestbook-date",
            commentText: ".flc-guestbook-text",
            action: ".flc-guestbook-action" 
        },
        strings: {
            addNote: "Add Note"
        }
    });
      
}(jQuery));