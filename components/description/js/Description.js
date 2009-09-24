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
	
    var cleanseSelector = function (selector) {
        return selector.replace(/\./gi, "");
    };
    
	var addToggler = function (that) {
        var styles = that.options.styles;
        var markup = "<div class='" + cleanseSelector(that.options.selectors.toggler) + " " + styles.descriptionToggle + " " + styles.descriptionToggleCollapse + "' alt='Expand Description' title='Expand Description'>Expand</div>";
        var markupNode = $(markup);
		markupNode.hide();
        that.container.append(markupNode);
        return markupNode;
    };	
    
    var addDescriptionClass = function (that) {
        that.locate("content").addClass(that.options.styles.content);
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
		return that.locate("content").height() > that.options.collapsedHeight;
	};
	
	var setUpDescription = function (that) {
        addDescriptionClass(that);
		that.options.model = that.options.model.replace(/(<([^>]+)>)/gi, "");
		fluid.selfRender(that.container, generateTree(that), createRenderOptions(that));
        
		if (needToggle(that)) {
			that.locate("content").addClass(that.options.styles.descriptionCollapsed);
			addToggler(that);
			setUpToggler(that);
		}
	};
	
	var setUpToggler = function (that) {
		that.locate("toggler").show();
		addClickEvent(that);
	};
	
	fluid.description = function (container, options) {
		
		var that = fluid.initView("fluid.description", container, options);
		
		that.toggleDescription = function () {
			var selector = that.locate("content");
            var toggle = that.locate("toggler");
            var styles = that.options.styles;
            
			if (toggle.hasClass(styles.descriptionToggleCollapse)) {
				selector.removeClass(styles.descriptionCollapsed);
				selector.addClass(styles.descriptionExpanded);
			}
			else {
				selector.addClass(styles.descriptionCollapsed);
				selector.removeClass(styles.descriptionExpanded);
			}
            
            toggle.toggleClass(styles.descriptionToggleCollapse);
            toggle.toggleClass(styles.descriptionToggleExpand);
		};		
		
		setUpDescription(that);
		
		return that;
	};
	
	fluid.defaults("fluid.description", {
		styles: {
			descriptionCollapsed: "fl-description-hide",
			descriptionExpanded: "fl-description-show",
            descriptionToggle: "fl-icon",
            descriptionToggleCollapse: "fl-description-togglerCollapse",
            descriptionToggleExpand: "fl-description-togglerExpand",
            content: "fl-description-content"
		},
		selectors: {
			content: ".flc-description-content",
			toggler: ".flc-description-toggler"
		},
		collapsedHeight: 36,
		model: "<i>Marvel Super Special</i>, vol. 1, no. 25, <i>Rock & Rule</i>, 1983. This comic book contains an adaptation of the film <Rock 'n' Rule</i>, along with articles on the making of the film, the music of the film, and production stills. <p> The cover of the book features an illustration of several characters from the film, along with the text \"\" Marvel Super Special / The Official Adaptation / of the Feature-Length Animated Rock 'n' Roll Fantasy from Nelvana! / Plus: Articles, Interviews and Artwork from the Movie.\"\"The book includes a special section on the making of the film."
	});
})(jQuery, fluid);