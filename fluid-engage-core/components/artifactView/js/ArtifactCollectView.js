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

    /**
     * Creates an URL for the users namespace.
     */
    var compileUsersPath = function () {
        var artifactPath = location.pathname.substring(0, location.pathname.lastIndexOf("/"));
        return artifactPath.substring(0, artifactPath.lastIndexOf("/")) + "/users";     
    };
    
    /**
     * Create a restful URL for querying the server side for collect/uncollect operations.
     * @param uuid, the unique ID of the user.
     * @param museum, the museum for this artifact.
     * @param artifactId, the artifact ID.
     */
    var compileArtifactPath = function (uuid, museum, artifactId) {
        var path = compileUsersPath();

        path += "/" + uuid;
        path += "/collection/" + museum;
        path += "/artifacts/" + artifactId;
        
        return path;
    };
    
    /**
     * Changes the collect/uncollect link text and changes the next operation to be performed -
     * add artifact or remove artifact from collection.
     * 
     * @param {Object} that, the component
     * @param collect, boolean indicating whether we should change the state to "collect" or
     * "uncollect"
     */
    var switchCollectLink = function (that, collect) {
        // TODO: that.locate won't work on a rendered DOM, we need to make it work
        var collectLink = fluid.jById(that.options.collectId);
        if (collectLink.length === 0) {
            collectLink = that.locate("collect");
        }
        
        if (collect) {
            collectLink.text(that.options.strings.collect);
            that.options.operation = "POST";
        } else {
            collectLink.text(that.options.strings.uncollect);
            that.options.operation = "DELETE";          
        }
    };
    
    /**
     * Visualize a confirmation status message that is also a link to the my collection
     * page.
     * 
     * @param {Object} that, the component.
     */
    var confirmCollect = function (that) {
        // TODO: that.locate won't work on a rendered DOM, we need to make it work
        var collectLink = fluid.jById(that.options.collectId);
        var collectStatus = collectLink.next().children();
        
        collectStatus.attr("href", "http://" + location.host + compileUsersPath() + 
                "/myCollection.html" + "?uuid=" + that.uuid);
        collectStatus.addClass("active");
        
        if (that.options.operation === "POST") {
            collectStatus.text(that.options.strings.collectedMessage);
        } else {
            collectStatus.text(that.options.strings.uncollectedMessage);
        }
        
        collectStatus.fadeTo(1000, 1, function () {
            collectStatus.fadeTo(4000, 0, function () {
                switchCollectLink(that, that.options.operation === "DELETE");
                collectStatus.removeClass("active");
                collectStatus.removeAttr("href");
            });
        });
    };
    
    /**
     * The component's creator function 
     * 
     * @param {Object} container, the container which will hold the component
     * @param {Object} options, options passed into the component
     */
    fluid.engage.artifactCollectView = function (container, options) {
        var that = fluid.initView("fluid.engage.artifactCollectView", container, options);
        
        that.user = fluid.initSubcomponent(that, "user");

        that.uuid = that.user.getUuid();
        
        if (!that.uuid) {
            that.uuid = that.user.generateUuid();
        } 

        switchCollectLink(that, !options.artifactCollected);
        
        that.collectHandler = function () {
            var url = "http://" + location.host + compileArtifactPath(that.uuid, options.museum, options.artifactId);
            
            $.ajax({
                url: url,
                async: false,
                type: that.options.operation
            });

            confirmCollect(that);
        };        
        
        that.collectStatus = that.locate("status");
        
        return that;
    };
    
    fluid.defaults("fluid.engage.artifactCollectView", {
        user: {
            type: "fluid.user"
        },
        operation: null,
        selectors : {
            collect: ".flc-collect-link",
            status: ".flc-collection-link"
        },
        collectId: "artifactCollectLink",
        strings: {
            collect: "Collect Artifact",
            uncollect: "Uncollect Artifact",
            collectedMessage: "This artifact has been added to your personal collection; tap here to go there now.",
            uncollectedMessage: "This artifact has been removed from your personal collection; tap here to go there now."               
        }
    });
})(jQuery);