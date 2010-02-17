/*
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one of these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/
/*global jqUnit*/
/*global expect*/
/*global document*/
/*global setTimeout*/

(function ($) {
    $(document).ready(function () {
        var tests = {};
        var model = {};
        var component;

        var setup = function () {
            tests.fetchTemplate(
                    "../../../../components/myCollection/html/myCollection.html",
                    ".flc-myCollection");
            
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
            
            component = fluid.engage.myCollection(".flc-myCollection", {model: model});     
        };
        
        tests = jqUnit.testCase("My Collection Tests"/*, setup*/);
        // Setup here is called directly to walk around the delayed initialization of
        // the navigationList subcomponent in Firefox
        setup();
        
        var myCollectionTests = function () {
            tests.test("Component construction test", function () {
                expect(6);
                
                jqUnit.assertNotUndefined("Component defined.", component);
                jqUnit.assertNotNull("Component not null.", component);
                
                jqUnit.assertNotUndefined("User subcomponent defined.",
                        component.user);
                jqUnit.assertNotNull("User subcomponent not null.",
                        component.user);
                
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
            
            tests.test("Strings test", function () {
                expect(1);
                
                var expectedStatus = fluid.stringTemplate(
                    component.options.strings.statusMessageTemplate, {
                        artifactsNumber: model.data.length,
                        artifactsPlural: model.data.length === 1 ? "" : "s"
                    }
                );
                
                var status = component.locate("collectionStatus").html();
                
                jqUnit.assertEquals("Correct status message.",
                        expectedStatus, status);
            });            
        };

        var doTests = function () { 
            myCollectionTests();
        };

        // Again we delay the tests execution to walk around the delayed
        // initialization of the navigationList subcomponent
        setTimeout(doTests, 1);         
    });
})(jQuery);