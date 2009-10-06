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

(function ($, fluid) {
	
	fluid.engage = fluid.engage || {};
	
	var engageComponents = {
		"fluid.artifact": {
			localTestURL: "../data/demoData.json",
			dataFeedURL: "/artifactData/"
		},
		"fluid.browse": {
			localTestURL: "../data/demoData.json",
			dataFeedURL: "/artifactBrowseData/"
		}
	};
	
	fluid.engage.initComponent = function (location, componentName, container) {
		
		var initEngageComponent = function (options) {
			fluid.invokeGlobalFunction(componentName, [container || "body", options]);
		};
		
		var isFile = location.protocol === "file:";		
		var componentOptions = engageComponents[componentName];
		
		$.ajax({
			url: isFile ? componentOptions.localTestURL : componentOptions.dataFeedURL,
			success: initEngageComponent,
			dataType: "json",
			async: false,
			data: isFile ? null : location.search.replace("?", ""),
		});
	};
	
})(jQuery, fluid);