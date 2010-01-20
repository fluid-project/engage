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
fluid.userService = fluid.userService || {};

(function ($) {
    var compileUrl = function (config) {
        return fluid.stringTemplate(config.myCollectionDocumentURLTemplate, 
                {dbName: "users", id: ""});
    };
    
    var generateUuid = function (config) {
        var data;
        
        var errorCallback = function (XMLHttpRequest, textStatus, errorThrown) {
            fluid.log("Status: " + textStatus);
            fluid.log("Error: " + errorThrown);
        };
        
        var successCallback = function (returnedData) {
            data = returnedData.replace("\n", ""); // CouchDB inserts a new line at the end of its response
                                                   // that seems to crash the JSON parser, so we remove it.
        };

        var url = compileUrl(config);
        
        var userDocument = {};
        userDocument.type = "user";
        userDocument.email = "";
        userDocument.collection = {};
        userDocument.collection.artifacts = [];

        $.ajax({
            url: url,
            async: false,
            success: successCallback,
            error: errorCallback,
            data: JSON.stringify(userDocument),
            processData: false,
            dataType: "json",
            type: "POST"});
        
        return JSON.parse(data).id;
    };
    
    fluid.userService.initAcceptor = function (config, app) {
        var dataHandler = function (env) {
            var uuid = generateUuid(config);
            
            return [200, {"Content-Type": "text/plain"}, uuid];
        };

        var acceptor = fluid.engage.makeAcceptorForResource("userService", "js", dataHandler);
        fluid.engage.mountAcceptor(app, "users", acceptor);
    };
})(jQuery);