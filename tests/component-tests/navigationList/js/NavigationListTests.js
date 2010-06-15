/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery fluid jqUnit expect*/
"use strict";

(function ($) {
    var CONTAINER = ".navigationList";
    
    var setup = function (container, options) {
        return fluid.navigationList(container, options);
    };
    
    var hasClasses = function (selector, classes) {
        if (typeof classes === "string") {
            classes = [classes];
        }
        
        for (var i = 0; i < classes.length; i++) {
            if (!selector.hasClass(classes[i])) {
                return false;
            }
        }
        
        return true;
    };
        
    var assertStyling = function (selector, styles, expected, message) {
        selector = fluid.wrap(selector);
        styles = styles.split(" ");
        selector.each(function (index, element) {
            jqUnit[expected ? "assertTrue" : "assertFalse"](message, hasClasses(fluid.wrap(element), styles));
        });
    };
    
    var conditionalAssert = function (condition, test) {
        if (condition) {
            test();
        }
    };
    
    var isValidString = function (string) {
        return string && string !== "";
    };
    
    var numKeys = function (set, key) {
        var count = 0;
        for (var i = 0; i < set.length; i++) {
            if (set[i][key]) {
                count++;
            }
        }
        
        return count;
    };
    
    var arrayFromKey = function (objects, key) {
        var vals = [];
        for (var i = 0; i < objects.length; i++) {
            var value = objects[i][key];
            if (value) {
                vals.push(value);
            }
        }
        return vals;
    };
    
    var renderingTests = function (component, selectors, links) {
        jqUnit.assertEquals("All list items rendered", links.length, $(selectors.listItems).length);
        jqUnit.assertEquals("All links rendered", links.length, $(selectors.link).length);
        jqUnit.assertEquals("All titles rendered", numKeys(links, "title"), $(selectors.titleText).length || 0);
        jqUnit.assertEquals("All descriptions rendered", numKeys(links, "description"), $(selectors.descriptionText).length);
        jqUnit.assertEquals("All images rendered", numKeys(links, "image"), $(selectors.image).length);
    };
    
    var valueTests = function (links, key, selector, message, funcName, property, overRideExpected) {
        var expected = overRideExpected ? overRideExpected : arrayFromKey(links, key);
        var actual = fluid.wrap(selector);
        
        actual.each(function (index) {
            jqUnit.assertEquals(message, expected[index], actual.eq(index)[funcName](property));
        });
    };
    
    var generalData = {model: [
        {
            target: "../../../integration_demo/images/Artifacts-.jpg",
            image: "../../../integration_demo/images/Artifacts-.jpg",
            title: "Title 1",
            description: "Description 1"
        },
        {
            target: "../../../integration_demo/images/Snuffbox.jpg",
            image: "../../../integration_demo/images/Snuffbox.jpg",
            title: "Title 2",
            description: "Description 2"
        },
        {
            target: "../../../integration_demo/images/Snuffbox.jpg",
            image: "../../../integration_demo/images/Snuffbox.jpg",
            title: "Title 3",
            description: "Description 3"
        }
    ]};
    
    var navigationListTests = function () {
        var tests = jqUnit.testCase("NavigationList Tests");
            
        tests.test("Rendering of elements", function () {
            var navList = setup(CONTAINER, generalData);
            var selectors = navList.options.selectors;
            var links = navList.options.model;
            expect(5);
            
            renderingTests(navList, selectors, links);
        });
                
        tests.test("CSS class insertion", function () {
            var navList = setup(CONTAINER, generalData);
            var selectors = navList.options.selectors;
            var styles = navList.options.styles;
            
            conditionalAssert(isValidString(styles.listGroup), function () {
                assertStyling(selectors.listGroup, styles.listGroup, true, "The list group has the specified CSS class(es)");
            });
            conditionalAssert(isValidString(styles.listItems), function () {
                assertStyling(selectors.listItems, styles.listItems, true, "All list items have the specified CSS class(es)");
            });
            conditionalAssert(isValidString(styles.link), function () {
                assertStyling(selectors.link, styles.link, true, "All links have the specified CSS class(es)");
            });
            conditionalAssert(isValidString(styles.titleText), function () {
                assertStyling($(selectors.titleText), styles.titleText, true, "All titles have the specified CSS class(es)");
            });
            conditionalAssert(isValidString(styles.descriptionText), function () {
                assertStyling(selectors.descriptionText, styles.descriptionText, true, "All descriptions have the specified CSS class(es)");
            });
            conditionalAssert(isValidString(styles.image), function () {
                assertStyling(selectors.image, styles.image, true, "All images have the specified CSS class(es)");
            });
        });
        
        tests.test("Rendered values", function () {
            var navList = setup(CONTAINER, generalData);
            var selectors = navList.options.selectors;
            var links = navList.options.model;
            
            valueTests(links, "image", selectors.image, "Image has correct source", "attr", "src");
            valueTests(links, "description", selectors.descriptionText, "Description text is correct", "text");
            valueTests(links, "title", $(selectors.titleText), "Title text is correct", "text");
            valueTests(links, "target", selectors.link, "Links have the correct href", "attr", "href");
        });
    };
    
    $(document).ready(function () {
        navigationListTests();
    });
})(jQuery);
