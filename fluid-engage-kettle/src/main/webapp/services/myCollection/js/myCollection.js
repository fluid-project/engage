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

    /**
     * Returns an URL for querying the user database for user collections.
     * 
     *  @param {Object} params, the HTTP parameters passed to this handler.
     *  @param {Object} config, the JSON config file for Engage.
     */
    var compileUserDatabaseURL = function (params, config) {
        var query = "";
        if (params.uuid) {
            query = encodeURIComponent("user AND " + params.uuid);
        }
        
        return fluid.stringTemplate(config.myCollectionQueryURLTemplate, 
            {dbName: "users" || "", view: config.views.byUserCollection,
                query: query});
    };
    
    /**
     * Returns an URL for querying the museum databases for arfitacts.
     * 
     * @param {Object} config, the JSON config file for Engage.
     * @param database, the name of the museum database.
     * @param query, the query to perform.
     */
    var compileDatabaseURL = function (config, database, query) {
        return fluid.stringTemplate(config.myCollectionQueryURLTemplate, 
                {dbName: database || "", view: config.views.byId, query: query || ""});
    };
    
    /**
     * Returns a associative array of museums to arrays of artifact ids.
     * 
     * @param {Object} rawData, the collection data as it is returned by CouchDB.
     */
    var getArtifactsByMuseum = function (rawData) {
        var result = [];
        var rows = rawData.rows || [];
        
        fluid.transform(rows, function (row) {
            var collection = row.doc.collection;
            fluid.transform(collection.artifacts, function (artifact) {
                if (!result[artifact.museum]) {
                    result.push(artifact.museum);
                    result[artifact.museum] = [];
                }
                result[artifact.museum].push(artifact.id);
            });
        });
        
        return result;
    };
    
    /**
     * Returns an array of objects containing the database and the URL to query artifact data by.
     * 
     *  @param {Object} config, the JSON config file for Engage.
     *  @param rawData, the raw collection data, as returned by CouchDB.
     */
    var compileDataURLs = function (config, rawData) {
        var artifactsByMuseum = getArtifactsByMuseum(rawData);
        
        return fluid.transform(artifactsByMuseum, function (artifact, index) {
            var database = artifactsByMuseum[index];
            
            var artifacts = artifactsByMuseum[database];

            var query = "";
            for (var i = 0; i < artifacts.length; i++) {
                query += artifacts[i];
                if (i < artifacts.length - 1) {
                    query += encodeURIComponent(" OR ");
                }
            }
            
            return {database: database, url: compileDatabaseURL(config, database, query)};
        });
    };
  
    /**
     * Returns the CouchDB id for a collection.
     * 
     * @param rawData, the raw collection data, as returned by CouchDB.
     */
    var getCollectionId = function (rawData) {
        if (rawData.rows && rawData.rows[0]) {
            return rawData.rows[0].doc._id;
        }
    };
    
    /**
     * Returns an array of artifact ids.
     * 
     * @param rawData, the raw collection data, as returned by CouchDB.
     */
    var getArtifactIds = function (rawData) {
        var rows = rawData.rows || [];
        
        // External to the transforms, because we need a flat array
        var result = [];
        
        fluid.transform(rows, function (row) {
            var collection = row.doc.collection;
            return fluid.transform(collection.artifacts, function (artifact) {
                result.push(artifact.id);
            });
        });
        
        return result;
    };
    
    /**
     * Returns the URL for opening an artifact in artifact view.
     * 
     * @param URLBase, the URL handling artifact view.
     * @param params, the parameters that need to be passed to the URL.
     */
    var compileTargetURL = function (URLBase, params) {
        return URLBase + "?" + $.param(params); 
    };
    
    /**
     * Creates the data feed returned to the client.
     * 
     * @param {Object} data, the normalized artifact data.
     * @param dbName, the name of the museum database that contains the set of artifacts.
     */
    var compileData = function (data, dbName, uuid) {
        var baseArtifactURL = "view.html";
        
        return fluid.transform(data, function (artifact) {
            return {                
                id: artifact.id,
                museum: dbName,
                target: compileTargetURL(baseArtifactURL, {
                    q: artifact.linkTarget,
                    db: dbName,
                    uuid: uuid
                }),
                image: artifact.linkImage,
                title: artifact.linkTitle,
                dated: artifact.artifactDate
            };
        });
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
     */
    var ajaxCall = function (url, error) {
        var data;
        
        var success = function (returnedData) {
            data = returnedData;
        };
        
        $.ajax({
            url: url,
            dataType: "json",
            async: false,
            success: success,
            error: error
        });
        
        if (data) {
            return JSON.parse(data);
        } else {
            return {};
        }
    };
    
    /**
     * Maps the model to standard JSON ids that will be passed to the client.
     * 
     * @param rawArtifactData, the raw data returned by CouchDB.
     * @param database, the museum database data is originating from.
     */
    var getArtifactData = function (rawArtifactData, database) {
        var dataRows = rawArtifactData.rows || [];
        
        return fluid.transform(dataRows, function (row) {
            var artifact = row.doc;
            return fluid.engage.mapModel(artifact, database);
        });
    };
    
    /**
     * Packs up all other functions to create a data feed of artifacts contained in a user collection.
     * 
     *  @param {Object} params, the HTTP parameters passed to this handler.
     *  @param {Object} config, the JSON config file for Engage.
     */
    var assembleData = function (params, config) {
        var url = compileUserDatabaseURL(params, config);
        
        var rawData = ajaxCall(url, errorCallback);

        var urls = compileDataURLs(config, rawData, params.uuid);
        var collectionId = getCollectionId(rawData);
        var originalArtifactIds = getArtifactIds(rawData);

        var dataSet = fluid.transform(urls, function (artifactURL) {
            var rawArtifactData = ajaxCall(artifactURL.url, errorCallback);
            var artifactData = getArtifactData(rawArtifactData, artifactURL.database);

            return compileData(artifactData, artifactURL.database, params.uuid);            
        });

        var model = {
            data: {}
        };
        
        var links = jQuery.map(dataSet, function (dataItem) {        
            return fluid.transform(dataItem, function (link) {
                return link;
            });
        });

        // Restore the original order for artifacts the as they have been aggregated by museum
        var artifactIds = fluid.transform(links, function (link) {
            return link.id;
        });
        
        model.data.links = [];
        for (var i = 0; i < originalArtifactIds.length; i++) {
            model.data.links.push(links[$.inArray(originalArtifactIds[i], artifactIds)]);
        }
        
        if (collectionId) {
            model.data.collectionId = collectionId;
        }

        return JSON.stringify(model);
    };

    /**
     * Creates an acceptor for My Collection.
     * 
     *  @param {Object} config, the JSON config file for Engage.
     *  @param {Object} app, the Engage application.
     */
    fluid.myCollection.initDataFeed = function (config, app) {
        var dataHandler = function (env) {
            return [200, {"Content-Type": "text/plain"}, assembleData(env.urlState.params, config)];
        };

        var acceptor = fluid.engage.makeAcceptorForResource("myCollection", "json", dataHandler);
        fluid.engage.mountAcceptor(app, "artifacts", acceptor);
    };

    /**
     * Creates a handler for My Collection.
     * 
     *  @param {Object} config, the JSON config file for Engage.
     *  @param {Object} app, the Engage application. 
     */
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
