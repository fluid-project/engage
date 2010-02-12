/*
Copyright 2009 University of Cambridge
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery, fluid*/
"use strict";

fluid = fluid || {};
fluid.artifactView = fluid.artifactView || {};

(function ($) {
    
    var getData = function (modelURL) {
        var model = {};
        
        var successCallback = function (data, status) {
            model = JSON.parse(data.substring(0, data.length - 1));
            if (model.total_rows && model.total_rows > 0) {
                model = model.rows[0];
            }       
        };   
        
        $.ajax({
            url: modelURL, 
            success: successCallback,
            dataType: "json",
            async: false
        });
        
        return model;
    };
    
    var buildDataURL = function (params, config) {
        return fluid.stringTemplate(config.viewURLTemplateWithKey, {
            dbName: params.db, 
            view: config.views.artifactByAccession, 
            key: JSON.stringify({
                accessNumber: params.accessNumber,
                lang: params.lang
            })
        }); 
    };
    
    var checkCollectStatus = function (config, params, artifactId) {
        if (!params.uuid) {
            return false;
        }
        
        var url = fluid.stringTemplate(config.queryURLTemplate, {
            dbName: "users",
            view: config.views.byUserArtifact,
            query: encodeURIComponent("user AND " + params.uuid + " AND " + artifactId)
        });
        
        var collected = false;
        
        var successCallback = function (data) {
            collected = JSON.parse(data).total_rows > 0;
        };
        
        var errorCallback = function (XMLHttpRequest, textStatus, errorThrown) {
            fluid.log("Status: " + textStatus);
            fluid.log("Error: " + errorThrown);
        };
        
        $.ajax({url: url, async: false, success: successCallback, error: errorCallback});
        
        return collected;
    };
    
    var fetchAndNormalizeModel = function (params, config) {
        var urlBase = "browse.html?";
        var data = getData(buildDataURL(params, config));
        var artifactModel = fluid.engage.mapModel(data, params.db);
        return {
            artifact: artifactModel,
            artifactId: data.id,
            museum: params.db,
            artifactCollected: checkCollectStatus(config, params, data.id)            
        };
    };
    
    fluid.artifactView.initDataFeed = function (config, app) {
        var artifactDataHandler = function (env) {            
            return [200, {"Content-Type": "text/plain"}, JSON.stringify(fetchAndNormalizeModel(env.urlState.params, config))];
        };
        
        var acceptor = fluid.engage.makeAcceptorForResource("view", "json", artifactDataHandler);
        fluid.engage.mountAcceptor(app, "artifacts", acceptor);
    };
    
    fluid.artifactView.initMarkupFeed = function (config, app) {
    	var renderHandlerConfig = {
            config: config,
            app: app,
            target: "artifacts/",
            source: "components/artifactView/html/",
            sourceMountRelative: "engage",
            baseOptions: {
                renderOptions: {
                    cutpoints: [{selector: "#flc-initBlock", id: "initBlock"}]
                }
            }
        };
    	
        var handler = fluid.engage.mountRenderHandler(renderHandlerConfig);
        
        handler.registerProducer("view", function (context, env) {
            var options = {
                model: fetchAndNormalizeModel(context.urlState.params, config)
            };
            
            var strings =
            	fluid.kettle.getBundle(renderHandlerConfig, context.urlState.params) || {};
            
            options.strings = strings;

            return {
                ID: "initBlock", 
                functionname: "fluid.engage.artifactView", 
                "arguments": [".flc-artifact", options]
            };
        });
    };
})(jQuery);
