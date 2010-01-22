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
    
	var compileArtifactPath = function (uuid, museum, artifactId) {
        var tmpPath = location.pathname.substring(0, location.pathname.lastIndexOf("/"));
        var path = tmpPath.substring(0, tmpPath.lastIndexOf("/"));

        path += "/users/" + uuid;
        path += "/collection/" + museum;
        path += "/artifacts/" + artifactId;
        
        return path;
	};
	
	var compileUsersPath = function () {
        var artifactPath = location.pathname.substring(0, location.pathname.lastIndexOf("/"));
        return artifactPath.substring(0, artifactPath.lastIndexOf("/")) + "/users";		
	};
	
    var confirmCollect = function (that) {
        var collectLink = fluid.jById("artifactCollectLink");
        var collectStatus = collectLink.next().children();
        
        var path = location.pathname.substring(0, location.pathname.lastIndexOf("/"));
        collectStatus.attr("href", "http://" + location.host + compileUsersPath() + 
                "/myCollection.html" + "?uuid=" + that.uuid);
        collectStatus.addClass("active");
        
        if (that.options.operation === "POST") {
            collectStatus.text("This artifact has been added to your personal collection; tap here to go there now.");
        } else {
            collectStatus.text("This artifact has been removed from your personal collection; tap here to go there now.");
        }
        
        collectStatus.fadeTo(1000, 1, function () {
            collectStatus.fadeTo(4000, 0, function () {
                if (that.options.operation === "POST") {
                    collectLink.text("Uncollect Artifact");
                    that.options.operation = "DELETE";
                } else {
                    collectLink.text("Collect Artifact");
                    that.options.operation = "POST";
                }
                
                collectStatus.removeClass("active");
                collectStatus.removeAttr("href");
            });
        });
    };
    
    fluid.collectionOperations = function (container, options) {
        var that = fluid.initView("fluid.collectionOperations", container, options);
        
        that.user = fluid.initSubcomponent(that, "user");

        that.uuid = that.user.getUuid();
        
        if (!that.uuid) {
            that.uuid = that.user.generateUuid();
        } 

        that.collectLink = that.locate("collect");
        
        if (!options.artifactCollected) {
            that.collectLink.text("Collect Artifact");
            that.options.operation = "POST";
        } else {
            that.collectLink.text("Uncollect Artifact");
            that.options.operation = "DELETE";
        }
        
        that.collectHandler = function () {
            var url = "http://" + location.host + compileArtifactPath(that.uuid, options.museum, options.artifactId);
            
            $.ajax({
                url: url,
                async: false,
                type: that.options.operation
            });

            confirmCollect(that);
        };
        
        return that;
    };
    
    fluid.defaults("fluid.collectionOperations", {
        user: {
            type: "fluid.user"
        },
        operation: null,
        selectors : {
            collect: ".flc-collect-link",
            status: ".flc-collect-status"
        }        
    });
})(jQuery);