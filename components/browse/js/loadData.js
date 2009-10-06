/*
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/

var demo = demo || {};

(function ($) {
    var componentContainer;
    
	var initBrowse = function (options) { 
        console.log(options);
		fluid.browse(componentContainer || "body", options);
	};
	
	demo.loadJson = function (location, container) {
        componentContainer = container;
        
        var isFile = location.protocol === "file:";
        
		$.ajax({
			url: isFile ? "../data/demoData.json" : "/artifactBrowseData/", 
			success: initBrowse,
			dataType: "json",
			data: isFile ? null : location.search.substring(0)
		});
	};
    
}(jQuery));