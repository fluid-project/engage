/*
 Copyright 2009 University of Toronto

 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.

 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt

 */

/*global jQuery, fluid*/
"use strict";

fluid = fluid || {};
fluid.engage = fluid.engage || {};

(function ($) {
    
    /**
     * Create a restful URL for querying the server side for collect/uncollect operations.
     * @param uuid, the unique ID of the user.
     * @param museum, the museum for this artifact.
     * @param artifactId, the artifact ID.
     */
    var buildCollectURL = function (userId, museum, artifactId) {
        return "../users/" + userId + "/collection/" + museum + "/artifacts/" + artifactId;
    };
    
    var confirmCollect = function (that, message, linkText) {
        // TODO: This needs to be read out of the URL, not out of the cookie. What if the cookie was never set?
        var lang = fluid.engage.getCookie("fluid-engage").lang;
        that.collectLink.text(linkText);
        that.collectStatus.attr("href", "../users/myCollection.html" + 
                                      "?lang=" + lang + "&user=" + that.model.user._id);      
        that.collectStatus.text(message);
        that.collectStatus.show();
        that.collectStatus.fadeOut(4000);
    };
    
    // TODO: This should be implemented as a Couch view, but will do the trick for now.
    var isArtifactInUserCollection = function (artifactId, user) {
        if (!user.collection || !user.collection.artifacts) {
            return false;
        }
        
        var artifacts = user.collection.artifacts;
        for (var i = 0; i < artifacts.length; i++) {
            var artifact = artifacts[i];
            if (artifact.id === artifactId) {
                return true;
            }
        }
        return false;
    };
    
    var setupArtifactCollectionView = function (that) {
        that.model.user = fluid.engage.user.currentUser(that);
        
        // Setup the collect/uncollect link and status.
        that.isCollected = isArtifactInUserCollection(that.model.artifact.uuid, that.model.user);
        that.collectLink = that.locate("collectLink");
        that.collectLink.text(that.isCollected ? that.options.strings.uncollect : 
                                                 that.options.strings.collect);
        that.collectStatus = that.locate("status");
        
        // Bind the collection link's click handler.
        that.collectLink.click(function (evt) {
            that.toggleArtifact();
            evt.preventDefault();
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
        that.model = that.options.model;
        
        that.collectArtifact = function () {
            $.ajax({
                url: buildCollectURL(that.model.user._id, that.model.museumID, that.model.artifact.uuid),
                type: "POST"
            });
            confirmCollect(that, that.options.strings.collectedMessage, that.options.strings.uncollect);
            that.isCollected = true;
        };
        
        that.uncollectArtifact = function () {
            $.ajax({
                url: buildCollectURL(that.model.user._id, that.model.museumID, that.model.artifact.uuid),
                type: "DELETE"
            });
            confirmCollect(that, that.options.strings.uncollectedMessage, that.options.strings.collect);
            that.isCollected = false;
        };
        
        that.toggleArtifact = function () {
            if (that.isCollected) {
                that.uncollectArtifact();
            } else {
                that.collectArtifact();
            }
        };
                
        setupArtifactCollectionView(that);
        return that;
    };
    
    fluid.defaults("fluid.engage.artifactCollectView", {
        selectors : {
            collectLink: ".flc-artifact-collect-link",
            status: ".flc-artifact-collect-status"
        }
    });
})(jQuery);
