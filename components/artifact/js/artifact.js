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
		fluid.selfRender(that.locate("renderScope"), 
				that.options.toRender.tree, 
				{cutpoints: that.options.toRender.cutpoints, model: that.options.toRender.model, debug: true});
	};

	//start of function to attach on-click handler
	var attachPanelClickHandler = function (that, artifactPanel) {
		artifactPanel.click(function (event) {
			event.stopPropagation();
			artifactPanel.toggleClass(that.options.styles.hideGroup);
		});
	};
    
	//start of function to flip page on click
	var attachFlipHandler = function (that) {
		that.locate("artifactSideFlip").click(function () {
			$(".fl-artifact-flip-transition").toggleClass("fl-flipped");
		});
	};

	//start of creator function
	fluid.artifact = function (container, options) {
		var that = fluid.initView("fluid.artifact", container, options);
		
		var navigationListOptions = {
            links: [{
                target: "../../../integration_demo/images/Artifacts-.jpg",
                image: "../../../integration_demo/images/Artifacts-.jpg",
                title: "Title",
                description: "Description"
            }, {
                target: "../../../integration_demo/images/Snuffbox.jpg",
                image: "../../../integration_demo/images/Snuffbox.jpg",
                title: "Title",
                description: "Description"
            }, {
                target: "../../../integration_demo/images/Snuffbox.jpg",
                image: "../../../integration_demo/images/Snuffbox.jpg",
                title: "Title",
                description: "Description"
            }, {
                target: "http://build.fluidproject.org",
                title: "Category",
                size: 100
            }]
        };
		
		var myTags = [];
		
		that.artifactNavigationList = fluid.initSubcomponent(that, "artifactNavigationList", [that.locate("navigationListScope"), navigationListOptions]);
		that.artifactTags = fluid.initSubcomponent(that, "artifactTags", [that.locate("tagsScope"), 
				{myTags: myTags || [], allTags: that.options.toRender.model.Tags || []}]);
		that.artifactCabinet = fluid.initSubcomponent(that, "artifactCabinet", that.locate("cabinetScope"));
		// call renderer function
		renderArtifactPage(that);    
//		// start calling function to attach panel action listeners
//		var artifactPanel = that.locate("artifactPanelTags");
//		attachPanelClickHandler(that, artifactPanel);    
//		// call function to attach flip handler
//		attachFlipHandler(that);		
		return that; 
	};
	
	//start of Fluid defaults
	fluid.defaults("fluid.artifact", {
	    selectors: {
			tagsScope: ".tags-pane",
	        renderScope: ".flc-artifact-renderscope",
	        artifactPanelTags: ".flc-artifact-panel-tags",
	        cabinetScope: ".cabinet",
	        navigationListScope: ".flc-navigationList"
	    },
	    styles: {
	        hideGroup: "fl-artifact-panel-hidden",
	        artNameHeadingInList: "fl-text-bold"
	    },
	    toRender: {},
	    artifactCabinet: {
            type: "fluid.cabinet"
        },
        artifactNavigationList: {
            type: "fluid.navigationList"
        },
        artifactTags: {
            type: "fluid.artifactTags"
        }
	});

}(jQuery, fluid_1_2));
