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
		artifact: {
			localTestURL: "../data/demoData.json",
			dataFeedURL: "/artifactData/"
		},
		browse: {
			localTestURL: "../data/demoData.json",
			dataFeedURL: "/artifactBrowseData/"
		}
	};
	
	var isFile;
	var component;
	var componentContainer;
	
	var initEngageComponent = function (options) {
		component(componentContainer || "body", options);
	};
	
	fluid.engage.initComponent = function (location, componentName, container) {
		
		isFile = location.protocol === "file:";
		component = fluid.model.getBeanValue(fluid, componentName);
		componentContainer = container;
		
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