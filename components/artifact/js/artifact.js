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
        selector: that.options.selectors.artifactInfoList,
        id: "artInfoList:"
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
		
    //start of function to create component tree
    var createTree = function (that) {
      var tree = [
        {
					ID: "artName",
					valuebinding: that.options.lookup.artName
				},
        {
					ID: "artPicture",
					decorators: {
            attrs: {src: that.options.lookup.artPicture}
          }
				},
        {
					ID: "artDesc",
          valuebinding: that.options.lookup.artDesc     
				}
      ];
      
      for (var key in that.options.lookup) {
        if(key !== "artPicture" && key !== "artDesc") {          
          if (key === "artName") {
            tree.push ({
              ID: "artInfoList:",
              valuebinding: that.options.lookup[key],
              decorators: {
                type: "addClass",
                classes: that.options.styles.artNameHeadingInList
              }
            });
          }
          else {
            tree.push ({
              ID: "artInfoList:",
              valuebinding: that.options.lookup[key]
            });  
          }
        }
      }
      
      return tree;
    };
    //stop of function to create component tree
    
		// calling the self renderer function (with model: we define the data to use for rendering and with valuebinding
    // in the selector map we define the path to the actual data to be rendered)
		fluid.selfRender(that.locate("renderScope"), createTree (that), {cutpoints: selMap, model: that.options.data, debug: true});
	};
	//end of Renderer function that changes the template

  //start of function to attach on-click handler
  var attachPanelClickHandler = function (that, artifactPanel) {
    artifactPanel.click(function (event) {
	    event.stopPropagation();
      artifactPanel.toggleClass(that.options.styles.hideGroup);
    });
  };
  //stop of function to attach on-click handler
    
  //start of function to flip page on click
  var attachFlipHandler = function (that) {
    that.locate("artifactSideFlip").click(function () {
      $(".fl-artifact-flip-transition").toggleClass("fl-flipped");
    });
  };
  //stop of function to flip page on click
	
  //start of creator function
  fluid.artifact = function (container, options) {
    var that = fluid.initView("fluid.artifact", container, options);
    // call renderer function
    renderArtifactPage(that);
    
    // start calling function to attach panel action listeners
    var artifactPanel = that.locate("artifactPanelTags");
    attachPanelClickHandler(that, artifactPanel);
    // stop calling function to attach panel action listeners
    
    //call function to attach flip handler
    attachFlipHandler(that);
    
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
        artifactInfoList: ".artifact-info-list",
        artifactName: ".artifact-name",
        artifactPicture: ".artifact-picture",
        artifactDesc: ".artifact-description",
        artifactPanelTags: ".flc-artifact-panel-tags",
        artifactSideFlip: ".fl-artifact-side"
    },
    styles: {
        hideGroup: "fl-artifact-panel-hidden",
        artNameHeadingInList: "fl-text-bold"
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
