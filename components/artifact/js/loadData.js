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

	var initArtifact = function (data) { 
		fluid.artifact(".artifact-container", {toRender: data});
	};
	
	demo.loadJson = function (location) {
		if (location.protocol === "file:") {
			fluid.artifact(".artifact-container", {modelURL: "../data/demoData.json"});
		}
		else {
			$.ajax({
				url: "/artifactData/",
				success: initArtifact,
				dataType: "json",
				data: location.search.substring(1)
			});
		}
	};
	
}(jQuery));