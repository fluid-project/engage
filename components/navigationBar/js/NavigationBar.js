/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, window, history*/
"use strict";

fluid = fluid || {};
fluid.engage = fluid.engage || {};

(function ($) {
    
    var preventingHandler = function (fn) {
        return function (evt) {
            fn();
            evt.preventDefault();
        };
    };
    
    var setupNavigationBar = function (that) {
        that.locate("backButton").click(preventingHandler(that.back));
        that.locate("homeButton").click(preventingHandler(that.home));
    };
    
    fluid.engage.navigationBar = function (container, options) {
        var that = fluid.initView("fluid.engage.navigationBar", container, options);
        
        that.home = function () {
            // TODO: This is grossly hardcoded and needs to be improved
            window.location = "../home/home.html";
        };
        
        that.back = function () {
            history.go(-1);
        };
        
        that.toggle = function () {
            
        };
        
        setupNavigationBar(that);
        return that;
    };
    
    fluid.defaults("fluid.engage.navigationBar", {
        selectors: {
            backButton: ".flc-navigationBar-back",
            homeButton: ".flc-navigationBar-home",
            toggleDefault: ".flc-navigationBar-toggle-default",
            toggleAlternate: ".flc-navigationBar-toggle-alternate"
        },
        
        events: {
            onToggle: null
        }
    });
})(jQuery);
