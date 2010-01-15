/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/

fluid = fluid || {};

(function ($) {
	
	var buildCutpoints = function (selectors) {
		return [
            {id: "title", selector: selectors.title},
	        {id: "image", selector: selectors.image},
	        {id: "displayDate", selector: selectors.displayDate},
	        {id: "description", selector: selectors.description},
            {id: "catalogueSize", selector: selectors.catalogueSize},
		    {id: "catalogueLink", selector: selectors.catalogueLink}
        ];
	};
	
	var buildComponentTree = function (that) {
        return {
            children: [{
                ID: "title",
                value: that.model.title
            }, {
                ID: "image",
                decorators: [{
                    attrs: {
                        src: that.model.image
                    }
                }]
            }, {
                ID: "displayDate",
                value: that.model.displayDate
            }, {
                ID: "description",
                markup: that.model.introduction ? that.model.introduction : that.model.content
            }, {
                ID: "catalogueSize",
                value: fluid.stringTemplate(that.options.strings.catalogueSize, {
                    size: that.model.catalogueSize
                })
            }, {
                ID: "catalogueLink",
                decorators: [{
                    attrs: {
                        href: that.model.catalogueLink
                    }
                }]
            }]
        };
    };
    
	var setupResources = function (options, isCurrent) {
		return {
            view: {
	            href: isCurrent ? options.templateCurrentURL : options.templateUpcomingURL,
	            cutpoints: buildCutpoints(options.selectors)
	        }
	    };
	};
	
	var extractArray = function (array, key) {
        return fluid.transform(array, function (object, index) {
            return object[key] || null;
        });
    };
	
	var initSubComponents = function (that, container, options) {
        fluid.transform(container, function (object, index) {
            var componentOptions = fluid.copy(that.options.navigationList.options);
            fluid.merge("merge", componentOptions, options[index]);
            fluid.initSubcomponent(that, "navigationList", [object, componentOptions]);
        });
    };
    
    var initSubComponentsHeaders = function (container, options) {
        fluid.transform(container, function (object, index) {
            $(object).html(options[index]);
        });
    };
	
	var setupSubcomponents = function (that) {
		initSubComponents(that, that.locate("lists"), extractArray(that.options.exhibitionCabinet.lists, "listOptions"));
		initSubComponentsHeaders(that.locate("currentCabinetHeaders"), extractArray(that.options.exhibitionCabinet.lists, "category"));
		that.exhibitionCabinet = fluid.initSubcomponent(that, "exhibitionCabinet", [that.locate("currentCabinet")]);		
	};
	
	var renderExhibition = function (that, resources, buildTree, isCurrent) {
		fluid.fetchResources(resources, function () {
            var templates = fluid.parseTemplates(resources, ["view"], {});
            fluid.reRender(templates, that.container, buildTree(that), {model: that.model});
            if (isCurrent) {
                setupSubcomponents(that);
            }
        });
	};
	
	var setup = function (that, isCurrent) {
		var resources = setupResources(that.options, isCurrent);
		renderExhibition(that, resources, buildComponentTree, isCurrent);
	};
	
	fluid.exhibition = function (container, options) {
		var that = fluid.initView("fluid.exhibition", container, options);		
		that.model = that.options.model;
		setup(that, that.model.isCurrent === "yes");		
		return that;
	};
	
	fluid.defaults("fluid.exhibition", {
		selectors: {
			title: ".flc-exhibition-title",
			image: ".flc-exhibition-image",
			description: ".flc-exhibition-description",
			displayDate: ".flc-exhibition-displayDate",
			catalogueSize: ".flc-exhibition-catalogue-size",
			catalogueLink: ".flc-exhibition-catalogueLink",
			currentCabinet: ".flc-exhibition-cabinet",
			currentCabinetHeaders: ".flc-cabinet-header",
			lists: ".flc-cabinet-drawer"
		},
		exhibitionCabinet: {
            type: "fluid.cabinet"
        },
        navigationList: {
            type: "fluid.navigationList",
            options: {
                styles: {
                    titleTextnavigationList: "fl-browse-shortenText"
                },
                useDefaultImage: false
            }
        },
		strings: {
			catalogueSize: "%size objects"
		},
		templateCurrentURL: "../../../../fluid-engage-core/components/exhibition/html/templateCurrent.html",
		templateUpcomingURL: "../../../../fluid-engage-core/components/exhibition/html/templateUpcoming.html"
	});
}(jQuery));