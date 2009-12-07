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
fluid.myCollection = fluid.myCollection || {};

(function ($) {

    var compileUserDatabaseURL = function (params, config) {
        var query = "";
        if (params.q) {
            query = "type:\"User%20Collection\"%20AND%20" + params.q;
        }
        
        return fluid.stringTemplate(config.myCollectionQueryURLTemplate, 
            {dbName: params.db || "", view: config.views.byUserCollection,
                query: query});
    };
    
    var compileDatabaseURL = function (config, database, query) {
        return fluid.stringTemplate(config.myCollectionQueryURLTemplate, 
                {dbName: database || "", view: config.views.byId, query: query || ""});
    };
    
    var getArtifactsByMuseum = function (rawData) {
        // TODO - find a way to avoid this global
        var result = [];
        var rows = rawData.rows || [];
        
        fluid.transform(rows, function (row) {
            var collection = row.doc.collection;
            fluid.transform(collection.artefacts, function (artefact) {
                if (!result[artefact.museum]) {
                    result.push(artefact.museum);
                    result[artefact.museum] = [];
                }
                result[artefact.museum].push(artefact._id);
            });
        });
        
        return result;
    };
    
    var compileDataURLs = function (config, rawData) {
        var artifactsByMuseum = getArtifactsByMuseum(rawData);
        
        return fluid.transform(artifactsByMuseum, function (artifact, index) {
            var database = artifactsByMuseum[index];
            
            var artifacts = artifactsByMuseum[database];

            var query = "";
            for (var i = 0; i < artifacts.length; i++) {
                query += artifacts[i];
                if (i < artifacts.length - 1) {
                    query += "%20OR%20";
                }
            }
            
            return {database: database, url: compileDatabaseURL(config, database, query)};
        });
    };
    
    var compileTargetURL = function (URLBase, params) {
        return URLBase + "?" + $.param(params); 
    };
    
    var compileData = function (data, dbName) {
        var baseArtifactURL = "view.html";
        
        return fluid.transform(data, function (artifact) {
            return {
                target: compileTargetURL(baseArtifactURL, {
                    q: artifact.linkTarget,
                    db: dbName
                }),
                image: artifact.linkImage,
                title: artifact.linkTitle,
                dated: artifact.artifactDate
            };
        });
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
            dataType: "json",
            async: false,
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
        
        if (data) {
            return JSON.parse(data);
        } else {
            return {};
        }
    };
    
    var getArtifactData = function (rawArtifactData, database) {
        var dataRows = rawArtifactData.rows || [];
        
        return fluid.transform(dataRows, function (row) {
            var artifact = row.doc;
            return fluid.engage.mapModel(artifact, database);
        });
    };
    
    var getData = function (error, params, config) {
        var url = compileUserDatabaseURL(params, config);
        var rawData = getAjax(url, error);

        var urls = compileDataURLs(config, rawData);

        var dataSet = fluid.transform(urls, function (artifactURL) {
            var rawArtifactData = getAjax(artifactURL.url, error);
            var artifactData = getArtifactData(rawArtifactData, artifactURL.database);

            return compileData(artifactData, artifactURL.database);            
        });

        var model = {
            data: {}
        };
        
        model.data.links = jQuery.map(dataSet, function (dataItem) {        
            return fluid.transform(dataItem, function (link) {
                return link;
            });         
        });
        
        return JSON.stringify(model);
    };


    fluid.myCollection.initDataFeed = function (config, app) {
        var dataHandler = function (env) {
            return [200, {"Content-Type": "text/plain"}, getData(errorCallback, env.urlState.params, config)];
        };

        var acceptor = fluid.engage.makeAcceptorForResource("myCollection", "json", dataHandler);
        fluid.engage.mountAcceptor(app, "artifacts", acceptor);
    };

    fluid.myCollection.initMarkupFeed = function (config, app) {
        var handler = fluid.engage.mountRenderHandler({
            config: config,
            app: app,
            target: "artifacts/",
            source: "components/myCollection/html/",
            sourceMountRelative: "engage"
        });
        
        handler.registerProducer("myCollection", function (context, env) {
            return {};
        });
    };

})(jQuery);
