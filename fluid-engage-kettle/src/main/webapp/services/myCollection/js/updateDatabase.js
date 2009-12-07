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
    
    var compileDatabaseURL = function (params, config) {
        return fluid.stringTemplate(config.myCollectionQueryURLTemplate, 
                {dbName: dbName || "", view: config.views.byId,
                    query: idField + params._id});
    }
    
    var compileCollectionURL = function (params, config) {
        return fluid.stringTemplate(config.myCollectionUpdateURLTemplate, 
            {id: params._id});
    };
    
    var errorCallback = function (XMLHttpRequest, textStatus, errorThrown) {
        fluid.log("Status: " + textStatus);
        fluid.log("Error: " + errorThrown);
    };
    
    var ajaxCall = function (url, success, error, data, type) {
        $.ajax({
            url: url,
            async: false,
            success: success,
            error: error,            
            data: data,
            dataType: "json",
            type: type
        });
    };
    
    var getCollection = function (params, config) {
        var databaseUrl = compileDatabaseURL(params, config);
        
        var data;
        
        var success = function (returnedData) {
            data = returnedData;
        }
        
        ajaxCall(databaseUrl, success, errorCallback, {}, getOperation);
        
        // We have made a query by id so there should be only one row
        return JSON.parse(data).rows[0].doc;
    }
    
    var updateCollection = function (params, config) {
        var userCollection = getCollection(params, config);
        
        userCollection.userid = params.userid;
        
        var collectionUrl = compileCollectionURL(params, config);
                
        ajaxCall(collectionUrl, function() {}, errorCallback, userCollection, putOperation);
    };
    
    fluid.updateDatabase.initDataFeed = function (config, app) {
        var dataHandler = function (env) {
            updateCollection(env.urlState.params, config);
            return [200, {"Content-Type": "text/plain"}, "OK"];
        };

        var acceptor = fluid.engage.makeAcceptorForResource("updateDatabase", "js", dataHandler);
        fluid.engage.mountAcceptor(app, "artifacts", acceptor);
    };
})(jQuery);