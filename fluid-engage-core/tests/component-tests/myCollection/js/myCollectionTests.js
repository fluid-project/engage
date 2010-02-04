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

(function ($) {
    $(document).ready(function () {
        var tests = {};
        var model = {};
        var component;

        var setup = function () {
            tests.fetchTemplate(
                    "../../../../components/myCollection/html/myCollection.html",
                    ".flc-myCollection");
            
            var url = "../../../../components/myCollection/data/demoData.json";
            
            $.ajax({
                url: url,
                success: function (returnedData) {
                        model = JSON.parse(returnedData);
                    },
                async: false
            });
            
            component = fluid.engage.myCollection(".flc-myCollection",
                    {model: model, updateDatabaseOrder: false, useReorderer: true});
        };

        tests = jqUnit.testCase("My Collection Tests", setup);
        
        var myCollectionTests = function () {
            tests.test("Component construction test", function () {
                expect(8);
                
                jqUnit.assertNotUndefined("Component defined.", component);
                jqUnit.assertNotNull("Component not null.", component);
                
                jqUnit.assertNotUndefined("Image subcomponent defined.",
                        component.imageReorderer);
                jqUnit.assertNotNull("Image subcomponent not null.",
                        component.imageReorderer);
                
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
                        model.data.length, component.model.length);
                
                jqUnit.assertEquals("Model node artifact ID matches passed ID.",
                        model.data[0].id, component.model[0].artifactId);
                jqUnit.assertEquals("Model node museum matches passed museum.",
                        model.data[0].museum, component.model[0].museum);
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
            
            tests.test("Reorderer", function () {
                expect(9);

                var movables =
                    component.imageReorderer.dom.fastLocate("movables");

                // Move element 0 after element 3
                
                component.imageReorderer.events.onBeginMove.fire($(movables[0]));

                component.imageReorderer.requestMovement(
                    {
                        element: $(movables[0]),
                        position: fluid.position.BEFORE
                    },
                    movables[3]
                );
                
                // Now the order should be 1 2 3 0 4
                
                jqUnit.assertEquals("Shifted element 1 should have index 0.",
                        0, component.model[1].index);
                jqUnit.assertEquals("Shifted element 2 should have index 1.",
                        1, component.model[2].index);
                jqUnit.assertEquals("Shifted element 3 should have index 2.",
                        2, component.model[3].index);               
                jqUnit.assertEquals("Moved element 0 should have index 3.",
                        3, component.model[0].index);
                jqUnit.assertEquals("Static element 4 should have index 4.",
                        4, component.model[4].index);

                
                movables =
                    component.imageReorderer.dom.fastLocate("movables");
                
                // Move element 3 before element 2
                
                component.imageReorderer.events.onBeginMove.fire($(movables[3]));

                component.imageReorderer.requestMovement(
                    {
                        element: $(movables[3]),
                        position: fluid.position.AFTER
                    },
                    movables[2]
                );       

                // Now the order should be 1 3 2 0 4
                
                jqUnit.assertEquals("Static element 1 should have index 0.",
                        0, component.model[1].index);
                jqUnit.assertEquals("Shifted element 3 should have index 1.",
                        1, component.model[3].index);
                jqUnit.assertEquals("Moved element 2 should have index 2.",
                        2, component.model[2].index);               
                jqUnit.assertEquals("Static element 0 should have index 3.",
                        3, component.model[0].index);
            });     
        };

        myCollectionTests();
    });
})(jQuery);