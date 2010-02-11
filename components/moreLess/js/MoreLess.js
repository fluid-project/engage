/*
Copyright 2009 - 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
 
*/

/*global jQuery, fluid*/
"use strict";

fluid = fluid || {};
fluid.engage = fluid.engage || {};

(function ($) {
    
    /**
     * Determines if the toggler needs to be added to the page, 
     * by testing the height of the content against the collpasedHeight specified in the defaults
     * 
     * @param {Object} that, the component
     */
    var needToggle = function (that) {
        return that.locate("content").height() > that.options.collapsedHeight;
    };
    
    var hideText = function (that) {
        that.locate("toggler").html(that.options.strings.more);
        that.locate("content").css("max-height", that.options.collapsedHeight);
    };
    
    var showText = function (that) {
        that.locate("toggler").html(that.options.strings.less);
        that.locate("content").css("max-height", "");
    };
    
    var toggleText = function (that, isExpanded) {
        if (isExpanded) {
            hideText(that);
        }
        else {
            showText(that);
        }
    };
    
    var setupToggler = function (that) {
        if (needToggle(that)) {
            var toggler = that.locate("toggler");
            toggleText(that, !that.options.expandByDefault);
            toggler.addClass(that.options.styles.toggler);
            toggler.click(function (evt) {
                that.toggleText();
                evt.preventDefault();
            });
        }
    };
    
    /**
     * The component's creator function 
     * 
     * @param {Object} container, the container which will hold the component
     * @param {Object} options, options passed into the component
     */
    fluid.engage.moreLess = function (container, options) {
        var that = fluid.initView("fluid.engage.moreLess", container, options);

        that.isExpanded = that.options.expandByDefault;
        
        /**
         * Toggles the expansion/collapse of the text. 
         * Also changes the appearance of the toggler to indicate if
         * clicking will result in an expansion or a collapse.
         */
        that.toggleText = function () {           
            toggleText(that, that.isExpanded);
            that.isExpanded = !that.isExpanded;
        };        
        
        setupToggler(that);
        return that;
    };
    
    fluid.defaults("fluid.engage.moreLess", {
        styles: {
            content: "fl-moreLess-content",
            toggler: "fl-moreLes-toggler"
        },
        selectors: {
            content: ".flc-moreLess-content",
            toggler: ".flc-moreLess-toggler"
        },
        strings: {
            more: "MORE...",
            less: "LESS..."
        },
        collapsedHeight: 60, //this also has to be specified in the css file in the .fl-moreLess-hide class
        expandByDefault: false
    });
})(jQuery);
