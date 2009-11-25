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

	var baseArtifactURL = "view.html?";
	var queryDelim = "&";
	var userQueryType = "type:\"User Collection\" ";
	
	var parseEnv = function (envString, delimiter) {
	    var obj = {};
	    var ampIndex = envString.QUERY_STRING.indexOf(delimiter);
	    
	    obj.database = envString.QUERY_STRING.substring(0, ampIndex);
	    obj.query = envString.QUERY_STRING.substring(ampIndex + 1, envString.QUERY_STRING.length);

	    return obj;
	};

	var compileUserDatabaseURL = function (parsedENV, config) {
		var query = "";
		if (parsedENV.query) {
			query = userQueryType + parsedENV.query;
		}
        
		return fluid.stringTemplate(config.myCollectionsQueryURLTemplate, 
            {dbName: parsedENV.database || "", view: config.views.byUserCollection,
        		query: query});
    };
    
    var compileDatabaseURL = function (config, database, query) {
        return fluid.stringTemplate(config.myCollectionsQueryURLTemplate, 
                {dbName: database || "", view: config.views.byId, query: query || ""});
    };
    
    var getArtifactsByMuseum = function(rawData) {
    	// TODO: refactor the next lines to use jquery and fluid functions
    	var rows = rawData.rows || [];
        for (var row in rows) {
        	if (row.doc) {
	            var collection = row.doc.collection;
	            var result = [];
	            for (var artefact in collection.artefacts) {
	            	result[artefact.museum].push(artefact._id);
	            }
        	}
        };

		return result;
    }
    
    var compileDataURLs = function (parsedENV, config, rawData) {
    	var dataRows = rawData.rows || [];
    	var artifactsByMuseum = getArtifactsByMuseum(rawData);
    	
    	return fluid.transform(artifactsByMuseum, function (artifacts, index) {
    		var database = artifactsByMuseum[index];
    		var query = "";
    		for (var i = o; i < artifacts.length; i++) {
    			var artifact = artifacts[i];
    			
    			query += artifact;
    			if (i < artifacts.length - 1) {
    				query += " OR "
    			}
    		}

    		return compileDatabaseURL(config, database, query);
    	});
    }
    
    var compileTargetURL = function (URLBase, queryDelimiter, query, database) {
        return URLBase + (database || "") + queryDelimiter + query; 
    };
    
    var compileData = function (data, dbName) {
        var model = {
            data: {}
        };
        
        model.data.links = fluid.transform(data, function (artifact) {
            return {
            	target: compileTargetURL(baseArtifactURL, queryDelim, artifact.linkTarget, dbName),
                image: artifact.linkImage,
                title: artifact.linkTitle,
                dated: artifact.artifactDate
            };
        });
        
        return JSON.stringify(model);
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
    	var data = {};
    	
    	var success = function (returnedData) {
    		data = returnedData;
    	}
    	
    	ajaxCall(url, success, error);
    	
    	return JSON.parse(data);
    }
    
    var getArtifactData = function (rawArtifactDataSet, database) {
    	var dataRows = [];
    	
    	for (var rawArtifactData in rawArtifactDataSet) {
            dataRows = dataRows.concat(rawArtifactData.rows);
    	}
    	
        return fluid.transform(dataRows, function (row) {
            var artifact = row.doc;
            return fluid.engage.mapModel(artifact, database);
        });
    };
    
    var getData = function (error, parsedENV, config) {
        var url = compileUserDatabaseURL(parsedENV, config);
        var rawData = getAjax(url, error);
    
        var urls = compileDataURLs(parsedENV, config, rawData);
        var rawArtifactData = [];
        for (var artifactURL in urls) {
        	rawArtifactData.push(getAjax(artifactURL, config));
        }
        
        var dataSet = getArtifactData(rawArtifactData, parsedENV.database);
        
        return compileData(dataSet, parsedENV.database);
    };


    fluid.myCollection.initDataFeed = function (config, app) {
        var dataHandler = function (env) {
	        var parsedENV = parseEnv(env.env, queryDelim);
            return [200, {"Content-Type": "text/plain"}, getData(errorCallback, parsedENV, config)];
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