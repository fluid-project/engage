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
/*global jqUnit*/
"use strict";

(function ($) {
    var CONTAINER = "#main";
    
    var setup = function (container, options) {
        return fluid.browse(container, options);
    };

    var testBrowseInitialized = function (component) {
        var selectors = component.options.selectors;
        
        if (component.options.useCabinet) {
            jqUnit.assertTrue("Cabinet Initialized", component.cabinet);
        } else {
            jqUnit.assertFalse("Cabinet not Initialized", component.cabinet);
        }
        
        jqUnit.assertEquals("Correct Title text", component.title, $(selectors.title).text());
        jqUnit.assertEquals("Correct Number of NavigationLists Rendered", component.model.categories.length, $(".flc-nagivationList-listGroup").length);
    };
        
    var browseTests = function () {
        var tests = jqUnit.testCase("Browse Tests");
        
        tests.test("Initialize with a cabinet", function () {
            var browse = setup(CONTAINER, {useCabinet: true});
            
            testBrowseInitialized(browse);
        });
        
        tests.test("Initialize without a cabinet", function () {
            var browse = setup(CONTAINER, {useCabinet: false});
            
            testBrowseInitialized(browse);
        });
        
        tests.test("Description on cabinet header", function () {
            var options = {
                model: {
	                categories: [
	                    {
	                        name: "category",
	                        description: "description",
	                        artifacts: [
	                        ]
	                    }
	                ]
                }
            };
            
            var browse = setup(CONTAINER, options);
            var selectors = browse.options.selectors;
            
            jqUnit.assertEquals("The description is rendered", 1, $(selectors.listHeaderDescription).length);
            jqUnit.assertTrue("Header Description styling applied", $(selectors.cabinetHandle).hasClass(browse.options.styles.listHeaderDescription));
            
        });
        
        tests.test("No Description on cabinet header", function () {
            var options = {
                model: {
                    categories: [
                        {
                            name: "category"
	                    }
	                ]
                }
            };
            var browse = setup(CONTAINER, options);
            var selectors = browse.options.selectors;
            
            jqUnit.assertEquals("The description is not rendered", 0, $(selectors.listHeaderDescription).length);
            jqUnit.assertFalse("Header Description styling is not applied", $(selectors.cabinetHandle).hasClass(browse.options.styles.listHeaderDescription));
        });
        
        tests.test("Browse description", function () {
            var descriptionText = "Description";
            var options = {
                description: {
                    options: {
                        model: descriptionText
                    }
                }
            };
            
            var browse = setup(CONTAINER, options);
            
            jqUnit.assertTrue("The description subcomponent has been initialized", browse.description);
            jqUnit.assertTrue("The correct description was added", descriptionText, browse.locate("browseDescription"));
        });
    };
    
    $(document).ready(function () {
        browseTests();
    });
})(jQuery);
