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
		if (needToggle(that))
			return {
				children: [
				{
					ID: "content:",
					value: that.options.model.substring(0, that.options.visibleCharacters) + "..."
				},
				{
					ID: "content:",
					value: that.options.model,
					decorators: [{
	                    type: "jQuery",
	                    func: "hide"
	                }]
				}]
			};
		else {
			return {
				children: [{
					ID: "content",
					value: that.options.model
				}]
			};
		}
	};	
	
	var createRenderOptions = function (that) {
		var selectorMap = [
			{
				selector: that.options.selectors.content, 
				id: "content" + (needToggle(that) ? ":" : "")
			}
		];
		return {cutpoints: selectorMap, debug: true};
	};

	var addClickEvent = function (that) {
		$(".fl-description-toggler").click(that.toggleDescription);
	};
	
	var needToggle = function (that) {
		return that.options.model.length > that.options.visibleCharacters;
	};
	
	var setUpDescription = function (that) {
		that.options.model = that.options.model.replace(/(<([^>]+)>)/gi, "");
		fluid.selfRender(that.container, generateTree(that), createRenderOptions(that));
		if (needToggle(that)) {
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
		that.template = {};
		that.toggleDescription = function () {
			if (that.locate("collapseContainer").is(":hidden")) {
				that.locate("expandContainer").hide();
				that.locate("collapseContainer").show();
				$(".fl-artifact-description-content:first").hide();
				$(".fl-artifact-description-content:last").show();
			}
			else {
				that.locate("expandContainer").show();
				that.locate("collapseContainer").hide();
				$(".fl-artifact-description-content:last").hide();
				$(".fl-artifact-description-content:first").show();
			}
		};		
		setUpDescription(that);
		return that;
	};
	
	fluid.defaults("artifactDescription", {
		selectors: {
			description: ".fl-artifact-description",
			content: ".fl-artifact-description-content",
			toggler: ".fl-description-toggler",
			collapseContainer: ".fl-description-toggler-collapse",
			expandContainer: ".fl-description-toggler-expand"
		},
		visibleCharacters: 250,
		collapseContainerURL: "../images/collapse.png",
		expandContainerURL: "../images/expand.png",
		model: "<i>Marvel Super Special</i>, vol. 1, no. 25, <i>Rock & Rule</i>, 1983. This comic book contains an adaptation of the film <Rock 'n' Rule</i>, along with articles on the making of the film, the music of the film, and production stills. <p> The cover of the book features an illustration of several characters from the film, along with the text \"\" Marvel Super Special / The Official Adaptation / of the Feature-Length Animated Rock 'n' Roll Fantasy from Nelvana! / Plus: Articles, Interviews and Artwork from the Movie.\"\"The book includes a special section on the making of the film."
	});
})(jQuery, fluid);