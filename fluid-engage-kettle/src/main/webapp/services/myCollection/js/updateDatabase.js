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
fluid.updateDatabase = fluid.updateDatabase || {};

(function ($) {
    
    var getOperation = "GET";
    var putOperation = "PUT";
    var postOperation = "POST";
    
    var compileDatabaseUrl = function (params, config) {
        return fluid.stringTemplate(config.myCollectionDocumentURLTemplate, 
                {dbName: "users", id: params.uuid});
    };

    var compileUpdateUrl = function (id, config) {
        return fluid.stringTemplate(config.myCollectionDocumentURLTemplate, 
            {dbName: "users", id: id ? id : ""});
    };

    /**
     * Error callback function - logs errors.
     * 
     * @param {Object} XMLHttpRequest, the object used to do network operations.
     * @param textStatus, a textual representation of the error status.
     * @param errorThrown, the error thrown.
     */
    var errorCallback = function (XMLHttpRequest, textStatus, errorThrown) {
        fluid.log("Status: " + textStatus);
        fluid.log("Error: " + errorThrown);
    };

    /**
     * Invokes jQuery $.ajax function.
     * 
     * @param url, the url to call
     * @param success, the success callback
     * @param error, the error callback
     * @param data, the data passed to the server.
     * @param type, the HTTP method - GET or PUT.
     */
    var ajaxCall = function (url, success, error, data, type) {
        $.ajax({
            url: url,
            async: false,
            success: success,
            error: error,
            data: data,
            type: type,
            contentType: "application/json",
            processData: false
        });
    };

    /**
     * Returns the JSON object returned by CouchDB for a user collection.
     * 
     * @param {Object} params, the HTTP parameters passed to this handler.
     * @param {Object} config, the JSON config file for Engage. 
     */
    var getCollection = function (params, config) {
        var databaseUrl = compileDatabaseUrl(params, config);
        
        var data;
        
        var success = function (returnedData) {
            data = returnedData.replace("\n", "");
        };
        
        ajaxCall(databaseUrl, success, errorCallback, "", getOperation);        
        
        if (data) {
            return JSON.parse(data);
        }
    };

    var addArtifact = function (userCollection, artifactData) {    
    	userCollection.collection.artifacts.push({"museum": artifactData.museum, "id": artifactData.id});
    };
    
    var removeArtifact = function (userCollection, artifactData) {
        userCollection.collection.artifacts = $.makeArray(
            $(userCollection.collection.artifacts).filter(function () {
                return this.id !== artifactData.id;
            })
        );
    };
    
    var collectOperation = function (artifactData, config, fn) {
        var userCollection = getCollection(artifactData, config);
        
        fn(userCollection, artifactData);
        
        var collectionUrl = compileUpdateUrl(userCollection._id, config);
        
        ajaxCall(collectionUrl, function () {}, errorCallback, JSON.stringify(userCollection), putOperation);    	
    };
    
    /**
     * Retrieves an user collection an invokes an update on CouchDB with the new order.
     * 
     * @param {Object} params, the HTTP parameters passed to this handler.
     * @param {Object} config, the JSON config file for Engage.  
     */
    var updateCollection = function (params, config) {
        var userCollection = getCollection(params, config);
        
        var parsedParams = JSON.parse(decodeURIComponent(params.orderData));
        
        userCollection.collection = parsedParams.collection;
        
        var collectionUrl = compileUpdateUrl(userCollection._id, config);
        
        ajaxCall(collectionUrl, function () {}, errorCallback, JSON.stringify(userCollection), putOperation);
    };
    
    /**
     * Creates an acceptor for updating CouchDB with the new artifact order.
     * 
     *  @param {Object} config, the JSON config file for Engage.
     *  @param {Object} app, the Engage application.
     */
    fluid.updateDatabase.initAcceptor = function (config, app) {
        var dataHandler = function (env) {
            var params = env.urlState.params;
            if (params.operation === "collect") {
                collectOperation(JSON.parse(decodeURIComponent(params.artifactData)), config, addArtifact);
            } else if (params.operation === "uncollect") {
                collectOperation(JSON.parse(decodeURIComponent(params.artifactData)), config, removeArtifact);
            } else if (params.operation === "updateOrder") {
                updateCollection(params, config);
            } else {
                fluid.log("Bad operation: " + params.operation);
                return [500, {"Content-Type": "text/plain"}, "Invalid operation '" + params.operation];
            }
            return [200, {"Content-Type": "text/plain"}, "OK"];
        };

        var acceptor = fluid.engage.makeAcceptorForResource("updateDatabase", "js", dataHandler);
        fluid.engage.mountAcceptor(app, "users", acceptor);
    };
})(jQuery);