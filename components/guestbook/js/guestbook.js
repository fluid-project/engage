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
    fluid.setLogging(true);

    var makeCommentAction = function(model, comment) {
        return {messagekey: model.ownid === comment.authorid? "delete" : "reportAbuse"};
    }
    var makeProtoComponents = function(model, locale, dateFormat) {
        if (locale !== "fr") {
            locale = "en";
        }
        return {
          "commentCell:": {
            "children": 
            fluid.transform(model.comments, function(comment) {
              return {
                author: comment.author,
                location: comment.location,
                date: fluid.dateUtils.renderLocalisedDate(fluid.dateUtils.parseISO8601(comment.date), dateFormat, locale),
                commentText: comment.text,
                action: makeCommentAction(model, comment)
              }; 
            })
        }};
    };

    var setupSubcomponents = function (that) {
        that.navBar = fluid.initSubcomponent(that, "navigationBar", [that.container, fluid.COMPONENT_OPTIONS]);
    };

    var setup = function (that) {
        var messageLocator = fluid.messageLocator(that.options.strings, fluid.stringTemplate);
        that.render = fluid.engage.renderUtils.createRendererFunction(that.container, that.options.selectors, {
            repeatingSelectors: ["commentCell"],
            templateSource: that.options.templateSource? that.options.templateSource : {node: that.container},
            rendererOptions: {
                messageLocator: messageLocator,
                model: that.model,
                debugMode: true
            }
        });
        that.refreshView();
        that.events.afterRender.fire(that);
    };

    fluid.engage.guestbook = function (container, options) {
        var that = fluid.initView("fluid.engage.guestbook", container, options);        
        that.model = that.options.model;

        var expander = fluid.renderer.makeProtoExpander({ELstyle: "%"});
        
        that.refreshView = function () {
            var protoTree = makeProtoComponents(that.model, that.options.locale, that.options.dateFormat);
            var tree = expander(protoTree);
            that.render(tree);
            setupSubcomponents(that);
        };
        
        setup(that);
        
        return that;
    };
    
    fluid.defaults("fluid.engage.guestbook", {
        navigationBar: {
            type: "fluid.engage.navigationBar"
        },
        
        selectors: {
            commentCell: ".flc-guestbook-comment-cell",
            author: ".flc-guestbook-author",
            location: ".flc-guestbook-location",
            date: ".flc-guestbook-date",
            commentText: ".flc-guestbook-text",
            action: ".flc-guestbook-action" 
        },
        locale: "en",
        dateFormat: "MMMM dd, yyyy",
        events: {
            afterRender: null
        },
        strings: {
            "addNote": "Add Note",
            "delete": "Delete",
            "reportAbuse": "Report Abuse"
            }
    });
    
    var bindCommentHandlers = function(that) {
        that.locate("cancel").click(function() { 
            history.back();
            return false;
           });
        that.locate("form").submit(function() {
            that.submit();
            history.back();
            return false;
        });
    };
    
    var submitComment = function(that) {
        var text = that.locate("text").val();
        fluid.log("Submitting text " + text + " to URL " + that.postURL);
    };
    
    fluid.engage.guestbookComment = function (container, options) {
        var that = fluid.initView("fluid.engage.guestbookComment", container, options);    
        that.model = that.options.model;
        that.navBar = fluid.initSubcomponent(that, "navigationBar", [that.container, fluid.COMPONENT_OPTIONS]);
        
        bindCommentHandlers(that);
        that.submit = function() {submitComment(that)};
        
        return that;
    }
    
    fluid.defaults("fluid.engage.guestbookComment", {
        navigationBar: {
            type: "fluid.engage.navigationBar"
        },
        selectors: {
            text: ".flc-guestbook-text",
            cancel: ".flc-guestbook-cancel",
            submit: ".flc-guestbook-submit",
            form: ".flc-guestbook-form"
        },
        userid: "anonymous",
        userName: "Anonymous",
        postUrl: "#",
        directModel: {
            path: "comments"
        }
    });
      
}(jQuery));