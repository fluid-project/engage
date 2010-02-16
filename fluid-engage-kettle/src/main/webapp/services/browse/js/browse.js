/*
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
fluid.browseDemo = fluid.browseDemo || {};

(function ($) {
    var compileDatabaseURL = function (params, config) {
        return fluid.stringTemplate(config.queryURLTemplate, 
            {dbName: params.db || "", view: config.views.byCollectionCategory, query: params.q || ""});
    };
    
    var compileTargetURL = function (URLBase, params) {
        return URLBase + "?" + $.param(params); 
    };
    
    var compileData = function (data, dbName) {
        var baseArtifactURL = "view.html";
        
        var categoryText = (typeof data[0].category === "string") ? 
                data[0].category : $.makeArray(data[0].category).toString();
             
        var model = {
            categories: [
                {
                    name: categoryText,
                    artifacts: []
                }
            ]
        };
        
        // TODO: Address the issue here that we're hard baking the data feed to a single category
        model.categories[0].artifacts = fluid.transform(data, function (artifact) {
            return {
                url: compileTargetURL(baseArtifactURL, {
                    q: artifact.linkTarget,
                    db: dbName
                }),
                imageUrl: artifact.linkImage,
                title: artifact.linkTitle,
                description: artifact.linkDescription
            };
        });
        
        return model;
    };
    
    var errorCallback = function (XMLHttpRequest, textStatus, errorThrown) {
        fluid.log("XMLHttpRequest: " + XMLHttpRequest);
        fluid.log("Status: " + textStatus);
        fluid.log("Error: " + errorThrown);
        return [500, {"Content-Type": "text/plain"}, errorThrown];
    };
        
    var ajaxCall = function (url, success, error) {
        $.ajax({
            url: url,
            success: success,
            error: error
        });
    };
    
    var getAjax = function (url, error) {
        var data;
        var success = function (returnedData) {
            data = returnedData;
        };
        
        ajaxCall(url, success, error);
        
        return JSON.parse(data);
    };
    
    var getArtifactData = function (rawData, database) {
        var dataRows = rawData.rows || [];
        return fluid.transform(dataRows, function (row) {
            var artifact = row.doc;
            return fluid.engage.mapModel(artifact, database);
        });
    };
    
    var getData = function (error, params, config) {
        var url = compileDatabaseURL(params, config);
        var db = params.db;
        var rawData = getAjax(url, error);
        
        var dataSet = getArtifactData(rawData, db);
        
        return compileData(dataSet, db);
    };
    
    fluid.browseDemo.initBrowseDataFeed = function (config, app) {
        var browseDataHandler = function (env) {
            return [200, {"Content-Type": "text/plain"}, JSON.stringify(getData(errorCallback, env.urlState.params, config))];
        };
    
        var acceptor = fluid.engage.makeAcceptorForResource("browse", "json", browseDataHandler);
        fluid.engage.mountAcceptor(app, "artifacts", acceptor);
    };
    
    var afterMap = function (data) {
        data.categories = $.map(data.categories, function (value) {
            return {
                name: value.name,
                items: value.artifacts
            };
        });
        data.title = "Artifacts";
        return data;
    };

    var addCatagoryTitles = function (strings, data) {
        fluid.transform(data.categories, function (category) {
            strings[category.name] = "Viewing " + category.name;
        });
        return strings;
    };
    
    fluid.browseDemo.initBrowseDemo = function (config, app) {
        var renderHandlerConfig = {
            config: config,
            app: app,
            target: "artifacts/",
            source: "components/browse/html/",
            sourceMountRelative: "engage",
            baseOptions: {
                renderOptions: {
                    cutpoints: [{selector: "#flc-initBlock", id: "initBlock"}]
                }
            }
        };
        var handler = fluid.engage.mountRenderHandler(renderHandlerConfig);
            
        handler.registerProducer("browse", function (context, env) {
            var params = context.urlState.params;
            var data = getData(errorCallback, params, config);
            var strings = {
                title: data.title
            };
            
            var options = {
                model: afterMap(data),
                strings: addCatagoryTitles(strings, data)
            };

            return {
                ID: "initBlock", 
                functionname: "fluid.browse", 
                "arguments": [".flc-browse", options]
            };
        });
            
    };
})(jQuery);