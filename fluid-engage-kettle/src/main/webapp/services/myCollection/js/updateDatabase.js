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
    
    var dbName = "users";
    var idField = "_id:";
    var getOperation = "GET";
    var putOperation = "PUT";
    
    /**
     * Returns an URL for querying the museum databases for arfitacts.
     *
     * @param {Object} params, the HTTP parameters passed to this handler.
     * @param {Object} config, the JSON config file for Engage.
     */
    var compileDatabaseURL = function (params, config) {
        return fluid.stringTemplate(config.myCollectionQueryURLTemplate, 
                {dbName: dbName || "", view: config.views.byId,
                    query: idField + params.collectionId});
    };
    
    /**
     * Returns the collection URL used for updating the collection order.
     * 
     * @param {Object} params, the HTTP parameters passed to this handler.
     * @param {Object} config, the JSON config file for Engage.
     */
    var compileCollectionURL = function (params, config) {
        return fluid.stringTemplate(config.myCollectionUpdateURLTemplate, 
            {id: params.collectionId});
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
     * @param async, whether or not to permorm an asynchronous call.
     */
    var ajaxCall = function (url, success, error, data, type, async) {
        $.ajax({
            url: url,
            async: async,
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
        var databaseUrl = compileDatabaseURL(params, config);
        
        var data;
        
        var success = function (returnedData) {
            data = returnedData;
        };
        
        ajaxCall(databaseUrl, success, errorCallback, "", getOperation, false);        
        
        // We have made a query by id so there should be only one row
        return JSON.parse(data).rows[0].doc;
    };
    
    /**
     * Main method - retrieves an user collection an invokes an update on CouchDB with the new order.
     * 
     * @param {Object} params, the HTTP parameters passed to this handler.
     * @param {Object} config, the JSON config file for Engage.  
     */
    var updateCollection = function (params, config) {
        var userCollection = getCollection(params, config);
        
        userCollection.collection = params.collection;
        
        var collectionUrl = compileCollectionURL(params, config);
        
        ajaxCall(collectionUrl, function () {}, errorCallback, JSON.stringify(userCollection), putOperation, true);
    };
    
    /**
     * Creates an acceptor for updating CouchDB with the new artifact order.
     * 
     *  @param {Object} config, the JSON config file for Engage.
     *  @param {Object} app, the Engage application.
     */
    fluid.updateDatabase.initAcceptor = function (config, app) {
        var dataHandler = function (env) {
            updateCollection(JSON.parse(decodeURIComponent(env.urlState.params.orderData)), config);
            return [200, {"Content-Type": "text/plain"}, "OK"];
        };

        var acceptor = fluid.engage.makeAcceptorForResource("updateDatabase", "js", dataHandler);
        fluid.engage.mountAcceptor(app, "artifacts", acceptor);
    };
})(jQuery);