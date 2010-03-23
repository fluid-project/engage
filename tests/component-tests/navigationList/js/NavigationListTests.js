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
    var CONTAINER = ".flc-navigationList";
    
    var setup = function (options) {
        return fluid.navigationList(CONTAINER, options);
    };
    
    var hasClasses = function (selector, classes) {
        var sel = $(selector);
        var cls = classes.split(" ");
        var has = true;
        
        $.each(cls, function (idx, clsName) {
            if (!sel.hasClass(clsName)) {
                has = false;
                return false;
            }
        });
        
        return has;
    };
    
    var countKeyObjArray = function (objArray, key) {
        var count = 0;
        for (var i = 0; i < objArray.length; i++) {
            if (objArray[i][key]) {
                count++;
            }
        }
        
        return count;
    };
    
    //test functions

    var renderingTest = function (component) {
        var model = component.model;
        var modelSize = model.length;
        
        jqUnit.assertEquals("All list items rendered", modelSize, component.locate("listItems").length);
        jqUnit.assertEquals("All links rendered", modelSize, component.locate("link").length);
        jqUnit.assertEquals("All titles rendered", modelSize, component.locate("titleText").length);
        jqUnit.assertEquals("All descriptions rendered", countKeyObjArray(model, "description"), component.locate("descriptionText").length);
        jqUnit.assertEquals("All images rendered", modelSize, component.locate("image").length);
    };
    
    var renderedValuesTest = function (component) {
        var img = component.locate("image");
        var link = component.locate("link");
        var title = component.locate("titleText");
        var desc = component.locate("descriptionText");
        
        $.each(component.model, function (idx, listItem) {
            jqUnit.assertEquals("Item number " + idx + "'s image src", listItem.image, img.eq(idx).attr("src"));
            jqUnit.assertEquals("Item number " + idx + "'s target url", listItem.target, link.eq(idx).attr("href"));
            jqUnit.assertEquals("Item number " + idx + "'s title", listItem.title, title.eq(idx).text());
            jqUnit.assertEquals("Item number " + idx + "'s description", listItem.description, desc.eq(idx).text());
        });
    };
    
    var assertGridStyling = function (listGroup, styles) {
        jqUnit.assertTrue("Grid styling applied", hasClasses(listGroup, styles.grid));
        jqUnit.assertFalse("List styling not applied", hasClasses(listGroup, styles.list));
    };
    
    var assertListStyling = function (listGroup, styles) {
        jqUnit.assertTrue("List styling applied", hasClasses(listGroup, styles.list));
        jqUnit.assertFalse("Grid styling not applied", hasClasses(listGroup, styles.grid));
    };
    
    //test data
    
    var generalData = [
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
    ];
    
    var unMappedData = [
        {
            url: "../../../integration_demo/images/Artifacts-.jpg",
            src: "../../../integration_demo/images/Artifacts-.jpg",
            name: "Pic 1",
            info: "Info 1"
        },
        {
            url: "../../../integration_demo/images/Snuffbox.jpg",
            src: "../../../integration_demo/images/Snuffbox.jpg",
            name: "Pic 2",
            info: "Info 2"
        },
        {
            url: "../../../integration_demo/images/Snuffbox.jpg",
            src: "../../../integration_demo/images/Snuffbox.jpg",
            name: "Pic 3",
            info: "Info 3"
        }
    ];
    
    var dataMap = {
        target: "url",
        image: "src",
        title: "name",
        description: "info"
    };
    
    //tests
    
    $(document).ready(function () {
        var navList;
        var  afterRenderEventFired;
        
        var cleanup = function () {
            afterRenderEventFired = false;
        };
        
        var listTests = jqUnit.testCase("NavList Tests - list view", function () {
            navList = setup({
                listeners: {
                    afterRender: function () {
                        afterRenderEventFired = true;
                    }
                },
                model: generalData
            });
        }, cleanup);
        
        listTests.test("Rendering of elements", function () {
            renderingTest(navList);
            jqUnit.assertTrue("afterRender event fired", afterRenderEventFired);
        });
        
        listTests.test("List styling applied", function () {
            assertListStyling(navList.locate("listGroup"), navList.options.styles);
        });
        
        listTests.test("Grid styling applied after switching from List", function () {
            navList.toggleLayout();
            assertGridStyling(navList.locate("listGroup"), navList.options.styles);
        });
        
        listTests.test("Rendered Values", function () {
            renderedValuesTest(navList);
        });
        
        var gridTests = jqUnit.testCase("NavList Tests - grid view", function () {
            navList = setup({
                defaultToGrid: true,
                model: generalData
            });
        });
        
        gridTests.test("Grid styling applied", function () {
            assertGridStyling(navList.locate("listGroup"), navList.options.styles);
        });
        
        gridTests.test("List styling applied after switching from Grid", function () {
            navList.toggleLayout();
            assertListStyling(navList.locate("listGroup"), navList.options.styles);
        });
        
        gridTests.test("Rendered Values", function () {
            renderedValuesTest(navList);
        });
        
        var mapTests = jqUnit.testCase("NavList Tests - mapped data", function () {
            navList = setup({
                listeners: {
                    afterRender: function () {
                        afterRenderEventFired = true;
                    }
                },
                model: unMappedData,
                modelMap: dataMap
                
            });
        }, cleanup);
        
        mapTests.test("Rendering of elements", function () {
            renderingTest(navList);
            jqUnit.assertTrue("afterRender event fired", afterRenderEventFired);
        });
        
        mapTests.test("Rendered Values", function () {
            renderedValuesTest(navList);
        });
    });
})(jQuery);
