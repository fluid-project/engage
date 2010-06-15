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
        },
        abuseReportedAction : function () {
          
        }
    };

    var makeCommentAction = function(model, comment, dataSource) {
        var applier = fluid.kettle.makeSourceApplier(dataSource, {}, comment);
        applier.modelChanged.addListener(function() {
            document.location.reload();          
        });
        var messagekey = model.ownId === comment.authorId? 
            "delete" : 
            comment.abuseReported? "abuseReported" : "reportAbuse";
        var togo = {messagekey: messagekey, decorators: [{"jQuery": ["click", function() {
            messageActions[messagekey+"Action"](applier, comment, model);

            return false;
        }]}]
        };
        if (messagekey === "abuseReported") {
            togo.decorators.push({"removeClass": "fl-guestbook-action"});
        }
        return togo;
    };
    
    var makeProtoComponents = function(model, options, commentDataSource) {
        return {
          "title": {messagekey: "title"},
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

    fluid.engage.disturbUrl = function(url) {
      // TODO: do this in a less silly way
        var qpos = url.indexOf("?");
        var dpos = url.indexOf("&disturb");
        if (dpos !== -1) {
            url = url.substring(0, dpos);
        }
        url += (qpos === -1? "?" : "&") + "disturb="+Math.floor(Math.random()*1e6);
        return url;
    };

    fluid.engage.guestbook = function (container, options) {
        var that = fluid.initView("fluid.engage.guestbook", container, options);
        // TODO: Normalise locale handling and fallback, destroy jquery ui datepicker stopgap
        if (that.options.locale !== "fr") {
            that.options.locale = "en";
        }
        that.model = that.options.model;
        that.model.ownId = fluid.engage.user.currentUser()._id;
        var returnUrl = fluid.engage.disturbUrl(fluid.engage.url.location());
        that.options.addNoteTarget = that.options.addNoteTarget + "&" + $.param({"returnUrl": returnUrl});

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
            title: ".flc-guestbook-title",
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
        addNoteTarget: "comment.html?param1=1",
        locale: "en",
        dateFormat: "MMMM dd, yyyy",
        events: {
            afterRender: null
        },
        strings: {
            "addNote": "Add Note",
            "delete": "Delete",
            "reportAbuse": "Report Abuse",
            "abuseReported": "Abuse reported. Pending moderator review",
            "cancel": "Cancel",
            "submit": "Submit",
            "commentEntry": "Comment Entry" 
            }
    });
    
    fluid.engage.setText = function(node, text) {
        if (node.length) {
            /^input$/i.test(node[0].tagName)? node.attr("value", text) : node.text(text);
        }
    };
    
    fluid.engage.quickI18N = function(dom, strings, map) {
        fluid.transform(map, function(key, value) {
            fluid.engage.setText(dom.locate(key), strings[value]);
        });
    };
    
    var bindCommentHandlers = function(that) {
        that.locate("cancel").click(function() { 
            that.goBack();
            return false;
           });
        that.locate("form").submit(function() {
            that.submit();
            //that.goBack(); // cannot do this here - on Safari, navigation cancels XHR
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
        // TODO: update to use dataSource
        fluid.kettle.operateUrl(that.options.postURL, null, {
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            data: JSON.stringify(doc)
        }, that.goBack);
    };
    
    fluid.engage.guestbookComment = function (container, options) {
        var that = fluid.initView("fluid.engage.guestbookComment", container, options);    
        that.model = that.options.model;
        that.navBar = fluid.initSubcomponent(that, "navigationBar", [that.container, fluid.COMPONENT_OPTIONS]);
        
        bindCommentHandlers(that);
        fluid.engage.quickI18N(that.dom, that.options.strings, {
          cancel: "cancel", submit: "submit", commentEntry: "commentEntry"});
        that.submit = function() {submitComment(that)};
        var params = fluid.engage.url.params();
        that.goBack = function() {
            if (params.returnUrl) {
                fluid.engage.url.location(params.returnUrl);
            }
            else {
                fluid.engage.url.history.back();
            }
        };
        
        return that;
    };
    
    fluid.defaults("fluid.engage.guestbookComment", {
        navigationBar: {
            type: "fluid.engage.navigationBar"
        },
        selectors: {
            text: ".flc-guestbook-text",
            cancel: ".flc-guestbook-cancel",
            submit: ".flc-guestbook-submit",
            commentEntry: ".flc-guestbook-commentEntry",
            form: ".flc-guestbook-form"
        },
        userid: "anonymous",
        postURL: "#",
        docRoot: {
            userName: "Anonymous"
        },
        strings: {
            cancel: "Cancel",
            submit: "Submit",
            commentEntry: "Comment Entry",
        },
    });
      
}(jQuery));