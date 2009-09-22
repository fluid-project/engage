/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2007-2009 University of California, Berkeley

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/
/*global jqUnit*/


(function ($) {
    var CONTAINER = "#main";
    
    var setup = function (container, options) {
        return fluid.browse(container, options);
    };
    
//    var hasClasses = function (selector, classes) {
//        if (typeof classes === "string") {classes = [classes];}
//        
//        for(var i = 0; i < classes.length; i++) {
//            if (!selector.hasClass(classes[i])) {return false;}
//        }
//        
//        return true;
//    };
//    
//    var hasAttribute = function (selector, attribute, value) {
//        selector = fluid.wrap(selector);
//        selector.each(function (index, element) {
//            var attrValue = $(element).attr(attribute);
//            if (attrValue !== (value || !null)) {return false;}
//        });
//        
//        return true;
//    };
//    
//    var hasStyle = function (selector, style, value) {
//        selector = fluid.wrap(selector);
//        selector.each(function (index, element) {
//            var styleValue = $(element).css(style);
//            if (styleValue !== value) {return false;}
//        });
//        
//        return true;
//    };
//    
//    var assertStyling = function (selector, styles, expected, message) {
//        selector = fluid.wrap(selector);
//        styles = styles.split(" ");
//        selector.each(function (index, element) {
//            jqUnit[expected ? "assertTrue" : "assertFalse"](message, hasClasses(fluid.wrap(element), styles));
//        });
//    };
//    
//    var closeStylingTests = function (drawerSelector, contentSelector, openStyle, closeStyle) {
//        
//        assertStyling(drawerSelector, closeStyle, true, "All specified drawers have close styling");
//        assertStyling(drawerSelector, openStyle, false, "No specified drawer has open styling");
//        
//        jqUnit.assertTrue("Drawer has aria-expended set to false", hasAttribute(drawerSelector, "aria-expanded","false"));
//        jqUnit.assertTrue("Contents are hidden", hasStyle(contentSelector, "display", "none"));
//    };
//    
//    var openStylingTests = function (drawerSelector, contentSelector, openStyle, closeStyle) {
//        assertStyling(drawerSelector, openStyle, true, "All specified drawers have open styling");
//        assertStyling(drawerSelector, closeStyle, false, "No specified drawer has close styling");
//        
//        jqUnit.assertTrue("Drawer has aria-expanded set to true", hasAttribute(drawerSelector, "aria-expanded", "true"));
//        jqUnit.assertTrue("Contents are visible", hasStyle(contentSelector, "display", "block"));
//    };

    var initTests = function (component) {
        var selectors = component.options.selectors;
        var styles = component.options.styles;
        var strings = component.options.strings;
        var description = $(selectors.browseDescription, CONTAINER);
        var descriptionToggle = $(selectors.browseDescriptionToggle);
        
        if (component.options.useCabinet) {
            jqUnit.assertTrue("Cabinet Initialized", component.cabinet);
        } else {
            jqUnit.assertFalse("Cabinet not Initializede", component.cabinet);
        }
        
        jqUnit.assertEquals("Correct Description Text", strings.description, description.text());
        jqUnit.assertEquals("Correct Title text", strings.title, $(selectors.title).text());
        jqUnit.assertEquals("Correct Number of NavigationLists Rendered", component.options.lists.length, $(".flc-nagivationList-listGroup").length);
    };
        
    var browseTests = function () {
        var tests = jqUnit.testCase("Cabinet Tests");
        
        //TODO: Test the toggle button is working
        //TODO: Test that toggle is not rendered if description isn't present or not large enough to need one
        
        tests.test("Initialize with a cabinet", function () {
            var browse = setup(CONTAINER);
            var selectors = browse.options.selectors;
            var styles = browse.options.styles;
            
            initTests(browse);
        });
        
        tests.test("Initialize without a cabinet", function () {
            var browse = setup(CONTAINER, {useCabinet: false});
            var selectors = browse.options.selectors;
            var styles = browse.options.styles;
            
            initTests(browse);
        });
    };
    
    $(document).ready(function () {
        browseTests();
    });
})(jQuery);
