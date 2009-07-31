/*
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_1_2 fluid*/

fluid_1_2 = fluid_1_2 || {};
fluid = fluid || fluid_1_2;

(function ($, fluid) {
	//start of Renderer function that changes the template
	var renderArtifactPage = function (that) {
		//start of selector map
		var selMap = [
      {
			  selector: that.options.selectors.artifactName,
			  id: "artName"
		  },
      {
        selector: that.options.selectors.artifactDated,
        id: "artDated"
      },
      {
        selector: that.options.selectors.artifactSize,
        id: "artSize"
      },
      {
        selector: that.options.selectors.artifactMedium,
        id: "artMedium"
      },
      {
        selector: that.options.selectors.artifactDonor,
        id: "artDonor"
      },
      {
        selector: that.options.selectors.artifactPicture,
        id: "artPicture"
      },
      {
        selector: that.options.selectors.artifactDesc,
        id: "artDesc"
      }
    ];
		//end of selector map
		
		//start of component tree
		var artifactTree = {
			children: [
				{
					ID: "artName",
					valuebinding: that.options.lookup.artName
				},
        {
					ID: "artDated",
					valuebinding: that.options.lookup.artDated
				},
        {
					ID: "artSize",
					valuebinding: that.options.lookup.artSize
				},
        {
					ID: "artMedium",
					valuebinding: that.options.lookup.artMedium
				},
        {
					ID: "artDonor",
          valuebinding: that.options.lookup.artDonor     
				},
        {
					ID: "artPicture",
					value: null,
					decorators: {
            attrs: {src: that.options.lookup.artPicture}
          }
				},
        {
					ID: "artDesc",
          valuebinding: that.options.lookup.artDesc     
				}
			]
		};
		//end of component tree
		  
    //alert ("that.options.data." + that.options.lookup.artDonor);
    
		// calling the self renderer function (with model: we define the data to use for rendering and with valuebinding
    // in the selector map we define the path to the actual data to be rendered)
		fluid.selfRender(that.locate("renderScope"), artifactTree, {cutpoints: selMap, model: that.options.data, debug: true});
	};
	//end of Renderer function that changes the template

  //start of function to attach action listener
  var attachHandlers = function (that) {
//    var yyy = that.locate("artifactPanelTagsContent");
    // attach a handler to tags panel
    that.locate("artifactPanelTagsTitle").click(function () {
//      alert (yyy);
      $(".flc-artifact-panel-tags-content").toggleClass("fl-transition-grow-collapsed");
//      yyy.toggleClass("fl-transition-grow-collapsed");
    });
    
    that.locate("artifactPanelCommentTitle").click(function () {
      $(".flc-artifact-panel-comment-content").toggleClass("fl-transition-grow-collapsed");
    });
    
    that.locate("artifactPanelImgTitle").click(function () {
      $(".flc-artifact-panel-img-content").toggleClass("fl-transition-grow-collapsed");
    });
  }
  //stop of function to attach action listener
	
  //start of creator function
  fluid.artifact = function (container, options) {
    var that = fluid.initView("fluid.artifact", container, options);
    // call renderer function
    renderArtifactPage(that);
    
    // calling function to attach action listeners
    attachHandlers(that);
    
    return that; 
  };
  //end of creator function
	
	//start of Fluid defaults
	fluid.defaults("fluid.artifact", {
    selectors: {
        header: ".flc-artifact-header",
        image: ".flc-artifact-image",
        content: ".flc-artifact-content",
        details: ".flc-artifact-details",
        renderScope: ".flc-artifact-renderscope",
        artifactName: ".artifact-name",
        artifactDated: ".artifact-dated",
        artifactSize: ".artifact-size",
        artifactMedium: ".artifact-medium",
        artifactDonor: ".artifact-donor",
        artifactPicture: ".artifact-picture",
        artifactDesc: ".artifact-description",
        artifactPanelTagsTitle: ".flc-artifact-panel-tags-title",
        artifactPanelTagsContent: ".flc-artifact-panel-tags-content",
        artifactPanelCommentTitle: ".flc-artifact-panel-comment-title",
        artifactPanelImgTitle: ".flc-artifact-panel-img-title"
    },
		data: {
			artifactName: "my name"
		},
    lookup: {
      artName: "artName",
      artDated: "artDated",
      artSize: "artSize",
      artMedium: "artMedium",
      artDonor: "artDonor",
      artPicture: "artPicture",
      artDesc: "artDesc" 
    }
  });
	//end of Fluid defaults

}(jQuery, fluid_1_2));
