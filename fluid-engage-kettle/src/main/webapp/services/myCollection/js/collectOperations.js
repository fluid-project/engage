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
    var USER_ID_INDEX = 1;
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
            uuid: pathInfo[USER_ID_INDEX]
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
        
        var userCollection = fluid.myCollection.common.getCollection(artifactData.uuid, config);
        
        fn(userCollection, artifactData);
        
        var collectionUrl = fluid.myCollection.common.compileUserDocumentUrl(userCollection._id, config);
        
        fluid.myCollection.common.ajaxCall(collectionUrl, function () {}, JSON.stringify(userCollection), "PUT");       
    };
    
    var collectArtifact = function (pathInfo, config) {
        collectOperation(pathInfo, config, addArtifact);
    };
    
    var uncollectArtifact = function (pathInfo, config) {
        collectOperation(pathInfo, config, removeArtifact);
    };
    
    fluid.collectOperations.initAcceptor = function (config, app) {
        // Custom acceptor for collecting/uncollecting artifacts. This acceptor responds to URLs like:
        //        /users/[userId]/collection/[museumId]/artifacts/[artifactId]
        // POST will collect the specified artifact into the user's personal collection; DELETE will uncollect
        fluid.engage.mountAcceptor(app, "users", {
            accept: function (segment, relPath, pathInfo, context) {
                var pathSegs = pathInfo.pathInfo;
                var method = context.method;
                
                // TODO: This is totally hard coded. A framework-wide solution to resource-oriented URL mounting is needed.
                if (pathSegs.length !== 6 || pathSegs[2] !== "collection" || pathSegs[4] !== "artifacts") {
                    return null;
                }
                
                var collectFn;
                var acceptor = {
                    handle: function (env) {
                        collectFn(env.urlState.pathInfo, config)
                    }
                };
                
                // TODO: This should really be replaced by framework-specific code for matching methods, ala makeAcceptorForResource()
                if (method === "POST") {
                    collectFn = collectArtifact;
                    return acceptor;
                } else if (method === "DELETE") {
                    collectFn = uncollectArtifact;
                    return acceptor;
                }
                
                return fluid.kettle.METHOD_NOT_ALLOWED;
            }
        });
    };
})(jQuery);
