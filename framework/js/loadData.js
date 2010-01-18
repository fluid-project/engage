/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, window*/
"use strict";

(function ($, fluid) {
    
    fluid.engage = fluid.engage || {};

    // The default, last-ditch place to go look for testing data.
    var localTestDataURL = "../data/demoData.json";

    var getFeedURL = function (currentUrl) {
        return String(currentUrl).replace(".html", ".json");
    };
        
    // This function is now deprecated in favour of fluid.engage.initComponentWithDataURL()
    fluid.engage.initComponentWithDataFeed = function (currentUrl, componentName, container) {

        var initEngageComponent = function (options) {
            fluid.invokeGlobalFunction(componentName, [container || "body", options]);
        };
        
        var isFile = currentUrl.protocol === "file:";        
        
        $.ajax({
            url: isFile ? localTestDataURL : getFeedURL(currentUrl),
            success: initEngageComponent,
            dataType: "json",
            async: true
        });
    };
    
    /**
     * Initializes the named component, automatically fetching data from an associated data feed. 
     * This function runs asynchronously and does not directly return the component.
     * 
     * @param componentName the name of the component to instantiate
     * @param container the container for the component
     * @param options options for the component; note that the model option will be replaced with data if any is returned from the feed
     * @param feedURL an optional URL to a data feed; this will be automatically calculated from window.location if not specified
     */
    fluid.engage.initComponentWithDataURL = function (componentName, container, options, feedURL) {
        options = options || {};
        if (!feedURL) {
            var loc = window.location;
            feedURL = loc.protocol === "file:" ? localTestDataURL : getFeedURL(loc);
        }
        
        $.ajax({
            url: feedURL,
            dataType: "json",
            success: function (data) {
                if (data) {
                    options.model = data;
                }
                fluid.invokeGlobalFunction(componentName, [container, options]);
            }
        });
    };
    
})(jQuery, fluid);
