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
        if (collect) {
            that.collectLink.text(that.options.strings.collect);
            that.options.operation = "POST";
        } else {
            that.collectLink.text(that.options.strings.uncollect);
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
    	var lang = fluid.engage.getCookie("fluid-engage", {path: "/"}).lang;
        that.collectStatus.attr("href", "http://" + location.host + compileUsersPath() + 
                "/myCollection.html" + "?uuid=" + that.uuid + "&lang=" + lang);
        that.collectStatus.addClass("active");
        
        if (that.options.operation === "POST") {
            that.collectStatus.text(that.options.strings.collectedMessage);
        } else {
            that.collectStatus.text(that.options.strings.uncollectedMessage);
        }
        
        that.collectStatus.fadeTo(1000, 1, function () {
            that.collectStatus.fadeTo(4000, 0, function () {
                switchCollectLink(that, that.options.operation === "DELETE");
                that.collectStatus.removeClass("active").removeAttr("href");
            });
        });
    };
    
    var setupArtifactCollectionView = function (that) {
        // Grab the collect/uncollect link from the DOM and bind the collection toggle handler to it.
        that.collectLink = that.locate("collectLink");
        that.collectLink.click(function (evt) {
            that.toggleCollectedArtifact();
            evt.preventDefault();
        });
        
        // TODO: The user subcomponent should be refactored into a handful of stateless functions.
        that.user = fluid.initSubcomponent(that, "user");

        // Check the cookie to see if we've already met the user. If not, create a new document for them.
        // Note that, despite its name, generateUuid() actually creates a user document in Couch.
        var cookieId = that.user.getUuid();
        that.uuid = cookieId ? cookieId : that.user.generateUuid();

        // Setup the collect/uncollect link and status.
        switchCollectLink(that, !that.options.artifactCollected);
        that.collectStatus = that.locate("status");
    };
    
    /**
     * The component's creator function 
     * 
     * @param {Object} container, the container which will hold the component
     * @param {Object} options, options passed into the component
     */
    fluid.engage.artifactCollectView = function (container, options) {
        var that = fluid.initView("fluid.engage.artifactCollectView", container, options);
        
        /**
         * Collects or uncollects the current artifact.
         */
        that.toggleCollectedArtifact = function () {
            var url = "http://" + location.host + compileArtifactPath(that.uuid, that.options.museum, that.options.artifactId);
            
            $.ajax({
                url: url,
                async: false,
                type: that.options.operation
            });

            confirmCollect(that);
        };        
                
        setupArtifactCollectionView(that);
        return that;
    };
    
    fluid.defaults("fluid.engage.artifactCollectView", {
        user: {
            type: "fluid.user"
        },
        operation: null,
        selectors : {
            collectLink: ".flc-collect-link",
            status: ".flc-collection-link"
        },
        collectId: "artifactCollectLink"
    });
})(jQuery);