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

    var messageActions = {
        deleteAction: function(applier, comment, model) {
            applier.requestChange("deleted", true);
        },
        reportAbuseAction: function(applier, comment, model) {
            applier.requestChange("abuseReported."+model.ownId, true); 
        }
    };

    var makeCommentAction = function(model, comment, dataSource) {
        var applier = fluid.kettle.makeSourceApplier(dataSource, {}, comment);
        var messagekey = model.ownId === comment.authorId? "delete" : "reportAbuse";
        return {messagekey: messagekey, decorators: {"jQuery": ["click", function() {
            messageActions[messagekey+"Action"](applier, comment, model);
            return false;
        }]}
        };
    }
    var makeProtoComponents = function(model, options, commentDataSource) {
        return {
          "addNote": {target: options.addNoteTarget},
          "addNoteText": {messagekey: "addNote"},
          "commentCell:": {
            "children": 
            fluid.transform(model.comments, function(comment) {
              return {
                author: comment.author,
                location: comment.location,
                date: fluid.dateUtils.renderLocalisedDate(fluid.dateUtils.parseISO8601(comment.date), options.dateFormat, options.locale),
                commentText: comment.text,
                action: makeCommentAction(model, comment, commentDataSource)
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
                debugMode: false
            }
        });
        that.refreshView();
        that.events.afterRender.fire(that);
    };

    fluid.engage.guestbook = function (container, options) {
        var that = fluid.initView("fluid.engage.guestbook", container, options);
        // TODO: Normalise locale handling and fallback, destroy jquery ui datepicker stopgap
        if (that.options.locale !== "fr") {
            that.options.locale = "en";
        }
        that.model = that.options.model;
        that.model.ownId = fluid.engage.user.currentUser()._id;

        var expander = fluid.renderer.makeProtoExpander({ELstyle: "%"});
        var commentDataSource = fluid.kettle.simpleURLDataSource(that.options.postURL);
        
        that.refreshView = function () {
            var protoTree = makeProtoComponents(that.model, that.options, commentDataSource);
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
            addNote: ".flc-guestbook-addnote-control",
            addNoteText: ".flc-guestbook-addnote-text",
            commentCell: ".flc-guestbook-comment-cell",
            author: ".flc-guestbook-author",
            location: ".flc-guestbook-location",
            date: ".flc-guestbook-date",
            commentText: ".flc-guestbook-text",
            action: ".flc-guestbook-action" 
        },
        postURL: "",
        addNoteTarget: "comments.html",
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
        fluid.log("Submitting text " + text + " to URL " + that.options.postURL);
        var fixedDate = fluid.dateUtils.fromDate(new Date());
        var isoDate = fluid.dateUtils.renderISO8601(fixedDate);
        var user = fluid.engage.user.currentUser();
        var doc = $.extend({text: text, date: isoDate, authorId: user._id}, that.options.docRoot);

        fluid.kettle.operateUrl(that.options.postURL, null, {
            type: "POST",
            data: JSON.stringify(doc)
        });
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
        postURL: "#",
        docRoot: {
            userName: "Anonymous"
        }
    });
      
}(jQuery));