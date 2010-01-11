/*
 Copyright 2009 University of Toronto

 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.

 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt

 */

/*global jQuery, fluid*/

fluid = fluid || {};

(function ($) {
    
    var confirmCollect = function (that) {
        var collectLink = fluid.jById("artifactCollectLink");
        var collectStatus = collectLink.next();
        
        if (that.options.operation === "collect") {
            collectStatus.text("This artifact has been added to your personal collection");
        } else {
            collectStatus.text("This artifact has been removed from your personal collection");
        }
        
        collectStatus.fadeTo(1000, 1, function () {
            collectStatus.fadeTo(1000, 0, function () {
                if (that.options.operation === "collect") {
                    collectLink.text("Uncollect Artifact");
                    that.options.operation = "uncollect";
                } else {
                    collectLink.text("Collect Artifact");
                    that.options.operation = "collect";
                }
            });
        });
    };
    
    fluid.collectionOperations = function (container, options) {
        var that = fluid.initView("fluid.collectionOperations", container, options);
        
        var userCollection = options.userCollection;
        
        that.collectLink = that.locate("collect");
        
        if (userCollection === 0 || userCollection) {
            that.collectLink.text("Uncollect Artifact");
            that.options.operation = "uncollect";
        } else {
            that.collectLink.text("Collect Artifact");
            that.options.operation = "collect";
        }

        that.collectHandler = function () {
            var path = location.pathname.substring(0, location.pathname.lastIndexOf("/"));
            var url = "http://" + location.host + path + "/updateDatabase.js";
            var data = "operation=" + that.options.operation + "&artifactData=" +
                encodeURIComponent(JSON.stringify({
                    collectionId: userCollection,
                    museum: options.museum,
                    id: options.artifactId,
                    userid: that.options.userid
                }));
            
            $.ajax({
                url: url,
                async: false,
                data: data
            });

            confirmCollect(that);
        };
        
        return that;
    };
    
    fluid.defaults("fluid.collectionOperations", {
        userid: "3",
        operation: null,
        selectors : {
            collect: ".flc-collect-link",
            status: ".flc-collect-status"
        }
    });
})(jQuery);