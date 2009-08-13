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
  // function to make live easier since the provided data has differences in structure.
  function getImageURL(jsonData) {
    if (jsonData.artefacts.artefact.images.image instanceof Array) {
      return jsonData.artefacts.artefact.images.image[0].imagesfiles.imagefile[4].textvalue;
    }
    else {
      return jsonData.artefacts.artefact.images.image.imagesfiles.imagefile[4].textvalue;
    }
  }

	var initArtifact = function (jsonData) {
    // retrieve the image url from the json data. url is handed to the artifact.js through lookup
    var imageUrl = getImageURL(jsonData);
       
		// initialize the artifact component 
		fluid.artifact(".artifact-container", {
      data: jsonData, 
      lookup: {
        "artName": "artefacts.artefact.object.textvalue",
        "artDated": "artefacts.artefact.dated.textvalue",
        "artSize": "artefacts.artefact.dimensions.textvalue",
        'artMedium': "artefacts.artefact.medium.textvalue",
        "artDonor": "artefacts.artefact.mention.textvalue",
        "artPicture": imageUrl,
        "artDesc": "artefacts.artefact.descriptions.description_museum.textvalue"
      }
    });
	};
	
	demo.loadJson = function () {
		// Do an ajax call to load the data.
		$.ajax({
//			url: "http://localhost:5984/artifacts/Cartoon",
			url: "../data/Headdress.json", 
      success: initArtifact,
			dataType: "json"
		});
	};
	
}(jQuery));