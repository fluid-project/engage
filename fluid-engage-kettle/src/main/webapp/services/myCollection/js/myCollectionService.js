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
     * Returns an URL for querying the museum databases for arfitacts.
     * 
     * @param {Object} config, the JSON config file for Engage.
     * @param database, the name of the museum database.
     * @param query, the query to perform.
     */
    var compileArtifactQueryURL = function (config, database, query) {
        return fluid.stringTemplate(config.queryURLTemplate, 
                {dbName: database || "", view: config.views.byId, query: query || ""});
    };
    
    /**
     * Returns a associative array of museums to arrays of artifact ids.
     * 
     * @param {Object} rawData, the collection data as it is returned by CouchDB.
     */
    var getArtifactsByMuseum = function (rawData) {
        var result = []; 
        var collection = rawData.collection;
        fluid.transform(collection.artifacts, function (artifact) {
            if (!result[artifact.museum]) {
                result.push(artifact.museum);
                result[artifact.museum] = [];
            }
            result[artifact.museum].push(artifact.id);
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
            
            return {database: database, url: compileArtifactQueryURL(config, database, query)};
        });
    };
  
    /**
     * Returns an array of artifact ids.
     * 
     * @param rawData, the raw collection data, as returned by CouchDB.
     */
    var getArtifactIds = function (rawData) {
        // External to the transforms, because we need a flat array
        var result = [];
        
        var collection = rawData.collection;

        fluid.transform(collection.artifacts, function (artifact) {
            result.push(artifact.id);
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
     * @param uuid, the unique user id for the owner of the collection.
     */
    var compileData = function (data, dbName, uuid) {
        var baseArtifactURL = "../artifacts/view.html";
        
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
     * Performs a GET method via ajax to retrieve data from the database.
     * 
     * @param url, the url to call
     */
    var ajaxCall = function (url) {
        var data;
        
        var success = function (returnedData) {
            data = returnedData;
        };

        fluid.myCollection.common.ajaxCall(url, success, data, "GET");
        
        if (data) {
            return JSON.parse(data.replace("\n", ""));
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
     *  @param {Object} uuid, the UUID that identifies the collection.
     *  @param {Object} config, the JSON config file for Engage.
     */
    var assembleData = function (uuid, config) {
    	if (!uuid) {
            return {model: {data: []}};
    	}
        var rawData = fluid.myCollection.common.getCollection(uuid, config);

        var urls = compileDataURLs(config, rawData);
        var originalArtifactIds = getArtifactIds(rawData);

        var dataSet = fluid.transform(urls, function (artifactURL) {
            var rawArtifactData = ajaxCall(artifactURL.url);
            var artifactData = getArtifactData(rawArtifactData, artifactURL.database);

            return compileData(artifactData, artifactURL.database, uuid);            
        });

        var data = {
            model: {}
        };
        
        var links = jQuery.map(dataSet, function (dataItem) {        
            return fluid.transform(dataItem, function (link) {
                return link;
            });
        });

        // Restore the original order for artifacts as they have been aggregated by museum

        var artifactIds = fluid.transform(links, function (link) {
            return link.id;
        });
        
        data.model.data = [];
        for (var i = 0; i < originalArtifactIds.length; i++) {
            data.model.data.push(links[$.inArray(originalArtifactIds[i], artifactIds)]);
        }
        
        data.model.collectionId = uuid;
        
        return data;
    };

    /**
     * Creates a handler for My Collection.
     * 
     *  @param {Object} config, the JSON config file for Engage.
     *  @param {Object} app, the Engage application. 
     */
    fluid.myCollection.initMyCollectionService = function (config, app) {
        var handler = fluid.engage.mountRenderHandler({
            config: config,
            app: app,
            target: "users/",
            source: "components/myCollection/html/",
            sourceMountRelative: "engage",
            baseOptions: {
                renderOptions: {
                    cutpoints: [{selector: "#flc-initBlock", id: "initBlock"}]
                }
            }
        });
        
        handler.registerProducer("myCollection", function (context, env) {
        	var query = env.QUERY_STRING;
        	var uuid;
        	var idx = query.indexOf("uuid=");
        	if (idx > 0) {
        		var endIdx = query.indexOf("&", idx);
        		uuid = env.QUERY_STRING.substring(idx + "uuid=".length, endIdx);
        	}
        	
            var initBlock = {
        		ID: "initBlock",
        		functionname: "fluid.engage.myCollection",
        		arguments: [".flc-myCollection", assembleData(uuid, config)]
      		};
            
            return initBlock;
        });
    };

})(jQuery);
