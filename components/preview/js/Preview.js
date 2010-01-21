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
	
	var renderPreview = function (container, options) {
		var tree = {children: []};
		$.each(options.model, function (index, value) {
			tree.children.push(fluid.engage.renderUtils.uiContainer("previewItems:", [
				fluid.engage.renderUtils.uiBound("previewItemCaption", value.title),
				fluid.engage.renderUtils.decoratedUIBound("previewItemLink", [{
					attrs: {
						href: value.target
					}
				}, {
					type: "addClass",
					classes: value.media ? options.styles.mediaIncluded : ""
				}]),
                fluid.engage.renderUtils.attrDecoratedUIBound("previewItemImage", "src", value.thumbnail)
			]));
		});
		fluid.engage.renderUtils.createRendererFunction(container,
			options.selectors, {
				repeatingSelectors: ["previewItems"]
			})(tree);
	};
	
	var setup = function (that) {
		if (that.options.model.length && that.options.model.length > 0) {
			renderPreview(that.container, that.options);
		}
		else {
			that.container.parent().remove();
		}
	}; 
	
	fluid.engage.preview = function (container, options) {
		var that = fluid.initView("fluid.engage.preview", container, options);
		setup(that);
		return that;
	};

    fluid.defaults("fluid.engage.preview", {
		selectors: {
			previewItems: ".flc-preview-items",
            previewItemLink: ".flc-preview-item-link",
            previewItemImage: ".flc-preview-item-image",
            previewItemCaption: ".flc-preview-item-caption"
		},
		styles: {
			mediaIncluded: "fl-preview-media-included"
		}
	});
}(jQuery));