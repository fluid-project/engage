/*
 Copyright 2009 University of Toronto

 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.

 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt

 */

fluid = fluid || {};

(function ($) {
	
	var toggleCollectLink = function(that) {
		if (that.options.operation === "collect") {
			fluid.jById("artifactCollectLink").text("Uncollect Artifact");
    		that.options.operation = "uncollect";
    	} else {
    		fluid.jById("artifactCollectLink").text("Collect Artifact");
    		that.options.operation = "collect";
    	}
	};
	
    fluid.collectionOperations = function (container, options) {
        var that = fluid.initView("fluid.collectionOperations", container, options);
        
        var userCollection = options.userCollection;
        var operation;
        
        that.collectLink = that.locate("collect");
        
        if (userCollection === 0 || userCollection) {
        	that.collectLink.text("Uncollect Artifact");
            that.options.operation = "uncollect";
        } else {
        	that.collectLink.text("Collect Artifact");
        	that.options.operation = "collect";
        }

        that.collectHandler = function() {
            var path = location.pathname.substring(0, location.pathname.lastIndexOf("/"));
            var url = "http://" + location.host + path + "/updateDatabase.js";
            var data = "operation=" + that.options.operation + "&artifactData=" +
            	encodeURIComponent(JSON.stringify({
            		collectionId: userCollection,
            		museum: options.museum,
            		id: options.artifactId,
            		userid: that.options.userid
            	}));
            
            $.ajax({
                url: url,
                async: false,
                data: data
            });

            toggleCollectLink(that);
    	};
    	
        return that;
    }
    
    fluid.defaults("fluid.collectionOperations", {
        userid: "3",
        operation: null,
        selectors : {
    		collect: ".flc-collect-link"
    	}
    });
})(jQuery);