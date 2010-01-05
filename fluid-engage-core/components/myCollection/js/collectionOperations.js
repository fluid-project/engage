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
    fluid.collectionOperations = function (container, options) {
        var that = fluid.initView("fluid.collectionOperations", container, options);
        
        
        var userCollection = options.userCollection;
        var path = location.pathname.substring(0, location.pathname.lastIndexOf("/"));      
        var operation;
        
        if (userCollection === 0 || userCollection) {
            container.html("Uncollect Artifact");
            container[0].href = "http://" + location.host + path + "/browse.html?q=Merchandising&db=" + options.museum;
            operation = "uncollect";
        } else {
            container.html("Collect Artifact");
            container[0].href = "http://" + location.host + path + "/myCollection.html?db=users&q=" + that.options.userid;
            operation = "collect";
        }
        
        container.click(function () {
            var url = "http://" + location.host + path + "/updateDatabase.js";
            var data = "operation=" + operation + "&artifactData=" + encodeURIComponent(JSON.stringify({
                collectionId: userCollection,
                museum: options.museum,
                id: options.artifactId,
                userid: that.options.userid}));
            
            $.ajax({
                url: url,
                async: false,
                data: data
            });
            
            return true;
        });
    }
    
    fluid.defaults("fluid.collectionOperations", {
        userid: "3" 
    });
})(jQuery);