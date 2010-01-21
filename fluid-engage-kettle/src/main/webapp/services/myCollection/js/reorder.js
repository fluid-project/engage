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
fluid.reorder = fluid.reorder || {};

(function ($) {
    /**
     * Retrieves an user collection an invokes an update on CouchDB with the new order.
     * 
     * @param {Object} params, the HTTP parameters passed to this handler.
     * @param {Object} config, the JSON config file for Engage.  
     */
    var updateCollection = function (params, config) {
        var userCollection = fluid.myCollection.common.getCollection(params, config);
        
        var parsedParams = JSON.parse(decodeURIComponent(params.orderData));
        
        userCollection.collection = parsedParams.collection;
        
        var collectionUrl = fluid.myCollection.common.compileUpdateUrl(userCollection._id, config);
        
        fluid.myCollection.common.ajaxCall(collectionUrl, function () {}, JSON.stringify(userCollection), "PUT");
    };
	
    /**
     * Creates an acceptor for updating CouchDB with the new artifact order.
     * 
     *  @param {Object} config, the JSON config file for Engage.
     *  @param {Object} app, the Engage application.
     */
    fluid.reorder.initAcceptor = function (config, app) {
        var dataHandler = function (env) {
            updateCollection(env.urlState.params, config);
            return [200, {"Content-Type": "text/plain"}, "OK"];
        };

        var acceptor = fluid.engage.makeAcceptorForResource("reorder", "js", dataHandler);
        fluid.engage.mountAcceptor(app, "users", acceptor);
    };
})(jQuery);