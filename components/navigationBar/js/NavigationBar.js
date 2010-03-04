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
    
    var setupToggle = function (that) {
        that.defaultIcon = that.locate("toggleDefaultIcon").show();
        that.alternateIcon = that.locate("toggleAlternateIcon").hide();
    };
    
    var localizeButtons = function (that) {
        // Localize the back and home button icon alt text. A bit of DOM fascism here.
        $("img", that.backButton).attr("alt", that.options.strings.goBack);
        $("img", that.homeButton).attr("alt", that.options.strings.goHome);
    
        // Localize the toggle icons.
        that.defaultIcon.attr("alt", that.options.strings.defaultToggle);
        that.alternateIcon.attr("alt", that.options.strings.alternateToggle);
    };
    
    var setupNavigationBar = function (that) {
        that.backButton = that.locate("backButton").click(preventingHandler(that.back));
        that.homeButton = that.locate("homeButton").click(preventingHandler(that.home));
        that.locate("toggleButton").click(preventingHandler(that.toggle));
        
        setupToggle(that);
        localizeButtons(that);
    };
    
    var toggleIcons = function (that) {
        that.defaultIcon.toggle();
        that.alternateIcon.toggle();
    };
    
    fluid.engage.navigationBar = function (container, options) {
        var that = fluid.initView("fluid.engage.navigationBar", container, options);
        if (that.options.disabled) {
            that.locate("bar").hide();
            return null;
        }
        
        that.home = function () {
            // TODO: This is grossly hardcoded and needs to be improved
            fluid.engage.url.location("../home/home.html" +  "?lang=" + fluid.engage.url.params().lang);
        };
        
        that.back = function () {
             fluid.engage.url.history.go(-1);
        };
        
        that.toggle = function () {
            toggleIcons(that);
            that.events.onToggle.fire();
        };
        
        setupNavigationBar(that);
        return that;
    };
    
    fluid.defaults("fluid.engage.navigationBar", {
        selectors: {
            bar: ".flc-navigationBar",
            backButton: ".flc-navigationBar-back",
            homeButton: ".flc-navigationBar-home",
            toggleButton: ".flc-navigationBar-toggle",
            toggleDefaultIcon: ".flc-navigationBar-toggle-grid",
            toggleAlternateIcon: ".flc-navigationBar-toggle-list"
        },
        
        strings: {
            goBack: "Go back",
            goHome: "Go home",
            defaultToggle: "Switch to grid layout",
            alternateToggle: "Switch to list layout"
        },
        disabled: false,
        events: {
            onToggle: null
        }
    });
})(jQuery);
