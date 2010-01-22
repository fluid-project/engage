/*
Copyright 2009 University of Cambridge
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery, fluid*/

fluid = fluid || {};
fluid.collectOperations = fluid.collectOperations || {};

(function ($) {
    
    /** Those constants are used to parse the restful URL that is handled by this acceptor */
    var UUID_INDEX = 1;
    var MUSEUM_INDEX = 3;
    var ARTIFACT_INDEX = 5;
    
    /**
     * Extracts the artifact data from a restful path object.
     * 
     * @param {Object} pathInfo, the parsed path segments of the query URL.
     */
    var compileArtifactData = function (pathInfo) {
        return {
            id: pathInfo[ARTIFACT_INDEX],
            museum: pathInfo[MUSEUM_INDEX],
            uuid: pathInfo[UUID_INDEX]
        };
    };
    
    /**
     * Helper function for adding an artifact to a collection object.
     * @param {Object} userCollection, the user collection.
     * @param {Object} artifactData, the artifact object.
     */
    var addArtifact = function (userCollection, artifactData) {    
        userCollection.collection.artifacts.push({"museum": artifactData.museum, "id": artifactData.id});
    };
    
    /**
     * Helper function for removing an artifact from a collection object.
     * @param {Object} userCollection, the user collection.
     * @param {Object} artifactData, the artifact object.
     */
    var removeArtifact = function (userCollection, artifactData) {
        userCollection.collection.artifacts = $.makeArray(
            $(userCollection.collection.artifacts).filter(function () {
                return this.id !== artifactData.id;
            })
        );
    };
    
    /**
     * Collect/uncollect logic - the user collection is retreived from CouchDB and updated.
     * 
     * @param {Object} pathInfo, the parsed path segments of the query URL.
     * @param config, the JSON config file for Engage.
     * @param {Function} fn, alternatively the add/remove artifact function.
     */
    var collectOperation = function (pathInfo, config, fn) {
        var artifactData = compileArtifactData(pathInfo);
        
        var userCollection = fluid.myCollection.common.getCollection(artifactData, config);
        
        fn(userCollection, artifactData);
        
        var collectionUrl = fluid.myCollection.common.compileUserDocumentUrl(userCollection._id, config);
        
        fluid.myCollection.common.ajaxCall(collectionUrl, function () {}, JSON.stringify(userCollection), "PUT");       
    };
    
    /**
     * Creates an acceptor for adding and removing artifacts from the user collection.
     * 
     *  @param {Object} config, the JSON config file for Engage.
     *  @param {Object} app, the Engage application.
     */
    fluid.collectOperations.initAcceptor = function (config, app) {
        var dataHandler = function (env) {
            if (env.env.REQUEST_METHOD === "POST") {
                collectOperation(env.urlState.pathInfo, config, addArtifact);
            } else if (env.env.REQUEST_METHOD === "DELETE") {
                collectOperation(env.urlState.pathInfo, config, removeArtifact);
            } else {
                fluid.log("Bad HTTP method: " + env.env.REQUEST_METHOD);
                return [500, {"Content-Type": "text/plain"}, "Bad HTTP method '" + env.env.REQUEST_METHOD + "'"];
            }
            return [200, {"Content-Type": "text/plain"}, "OK"];
        };

        var acceptor = fluid.engage.makeAcceptorForResource("users/.*/collection/.*/artifacts/.*", "", dataHandler);
        fluid.engage.mountAcceptor(app, "users", acceptor);
    };
})(jQuery);