/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one of these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global document, jQuery, fluid, jqUnit, expect, stop, start*/
"use strict";

(function ($) {
    $(document).ready(function () {
        var tests = {};
        var model = {};
        var component;

        var setup = function () {
            tests.fetchTemplate(
                    "../../../../components/myCollection/html/myCollection.html",
                    ".flc-myCollection-container");
            
            // Workaround to the different relative path when running tests.
            // We retrieve the navigation list link and rewrite it with a
            // correct value.
            $(".flc-navigationList-link").attr("href",
                "../../../../components/navigationList/html/NavigationList.html");
            
            var url = "../../../../components/myCollection/data/demoData.json";
            
            $.ajax({
                url: url,
                success: function (returnedData) {
                        model = JSON.parse(returnedData);
                    },
                async: false
            });
            
            component = fluid.engage.myCollection(".flc-myCollection-container", {
                navigationList: {
                    type: "fluid.navigationList",
                    options: {
                        listeners: {
                            afterRender: function () {
                                start();
                            }
                        }
                    }
                },
                model: model
            });

            // Here we delay the running of the tests to allow the My Collection component
            // to be initialized. This is necessary because its initialization is delayed.
            stop();
        };
        
        tests = jqUnit.testCase("My Collection Tests", setup);
        
        var myCollectionTests = function () {
            tests.test("Component construction test", function () {
                expect(6);
                
                jqUnit.assertNotUndefined("Component defined.", component);
                jqUnit.assertNotNull("Component not null.", component);
                
                jqUnit.assertNotUndefined("Navigation bar subcomponent defined.",
                        component.navBar);
                jqUnit.assertNotNull("Navigation bar subcomponent not null.",
                        component.navBar);
                
                jqUnit.assertNotUndefined("Navigation List subcomponent defined.",
                        component.navigationList);
                jqUnit.assertNotNull("Navigation List subcomponent not null.",
                        component.navigationList);
            });


            
            tests.test("Component model test", function () {
                expect(3);
                
                jqUnit.assertEquals("Model length matches data length.",
                        model.data.length, component.model.data.length);
                jqUnit.assertEquals("Model node artifact ID matches passed ID.",
                        model.data[0].id, component.model.data[0].id);
                jqUnit.assertEquals("Model node museum matches passed museum.",
                        model.data[0].museum, component.model.data[0].museum);
            });
        };

        myCollectionTests();
    });
})(jQuery);
