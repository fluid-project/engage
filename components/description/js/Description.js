/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
 
*/

/*global jQuery*/
/*global fluid*/

fluid = fluid || {};

(function ($, fluid) {
	
	var addToggler = function (that) {
        var markup = "<span class='fl-description-toggler'>" +
	        "<span class='fl-description-toggler-collapse'><a href='#'><img src=" + that.options.collapseContainerURL + " alt='Collapse Description' title='Collapse Description' style='border:none' /></a></span>" +
	        "<span class='fl-description-toggler-expand'><a href='#'><img src=" + that.options.expandContainerURL + " alt='Expand Description' title='Expand Description' style='border:none' /></a></span>" +
	    "</span>";
        var markupNode = $(markup);
		markupNode.hide();
        that.container.append(markupNode);
        return markupNode;
    };	
	
	var generateTree = function (that) {
		return {
			children: [{
				ID: "content",
				value: that.options.model
			}]
		};
	};	
	
	var createRenderOptions = function (that) {
		var selectorMap = [
			{
				selector: that.options.selectors.content, 
				id: "content"
			}
		];
		return {cutpoints: selectorMap, debug: true};
	};

	var addClickEvent = function (that) {
		that.locate("toggler").click(that.toggleDescription);
	};
	
	var needToggle = function (that) {
		return that.locate("content").height() > 25;
	};
	
	var setUpDescription = function (that) {
		that.options.model = that.options.model.replace(/(<([^>]+)>)/gi, "");
		fluid.selfRender(that.container, generateTree(that), createRenderOptions(that));
		if (needToggle(that)) {
			that.locate("content").addClass(that.options.styles.descriptionCollapsed);
			addToggler(that);
			setUpToggler(that);
		}
	};
	
	var setUpToggler = function (that) {
		that.locate("expandContainer").show();
		that.locate("collapseContainer").hide();
		that.locate("toggler").show();
		addClickEvent(that);
	};
	
	fluid.artifactDescription = function (container, options) {
		
		var that = fluid.initView("artifactDescription", container, options);
		
		that.toggleDescription = function () {
			if (that.locate("collapseContainer").is(":hidden")) {				
				that.locate("content").removeClass(that.options.styles.descriptionCollapsed);
				that.locate("content").addClass(that.options.styles.descriptionExpanded);
			}
			else {
				that.locate("content").addClass(that.options.styles.descriptionCollapsed);
				that.locate("content").removeClass(that.options.styles.descriptionExpanded);
			}
			that.locate("expandContainer").toggle();
			that.locate("collapseContainer").toggle();
		};		
		
		setUpDescription(that);
		
		return that;
	};
	
	fluid.defaults("artifactDescription", {
		styles: {
			descriptionCollapsed: "fl-description-hide",
			descriptionExpanded: "fl-description-show",
		},
		selectors: {
			description: ".fl-artifact-description",
			content: ".fl-artifact-description-content",
			toggler: ".fl-description-toggler",
			collapseContainer: ".fl-description-toggler-collapse",
			expandContainer: ".fl-description-toggler-expand"
		},
		collapseContainerURL: "../images/collapse.png",
		expandContainerURL: "../images/expand.png",
		model: "<i>Marvel Super Special</i>, vol. 1, no. 25, <i>Rock & Rule</i>, 1983. This comic book contains an adaptation of the film <Rock 'n' Rule</i>, along with articles on the making of the film, the music of the film, and production stills. <p> The cover of the book features an illustration of several characters from the film, along with the text \"\" Marvel Super Special / The Official Adaptation / of the Feature-Length Animated Rock 'n' Roll Fantasy from Nelvana! / Plus: Articles, Interviews and Artwork from the Movie.\"\"The book includes a special section on the making of the film."
	});
})(jQuery, fluid);