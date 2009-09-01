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
    var CONTAINER = ".cabinet";
    
    var setup = function (container, options) {
        return fluid.cabinet(container, options);
    };
    
    var hasClasses = function (selector, classes) {
        if (typeof classes === "string") {classes = [classes];}
        
        for(var i = 0; i < classes.length; i++) {
            if (!selector.hasClass(classes[i])) {return false;}
        }
        
        return true;
    };
    
    var hasAttribute = function (selector, attribute, value) {
        selector = fluid.wrap(selector);
        selector.each(function (index, element) {
            var attrValue = $(element).attr(attribute);
            if (attrValue !== (value || !null)) {return false;}
        });
        
        return true;
    };
    
    var hasStyle = function (selector, style, value) {
        selector = fluid.wrap(selector);
        selector.each(function (index, element) {
            var styleValue = $(element).css(style);
            if (styleValue !== value) {return false;}
        });
        
        return true;
    };
    
    var assertStyling = function (selector, styles, expected, message) {
        selector = fluid.wrap(selector);
        styles = styles.split(" ");
        
        selector.each(function (index, element) {
            jqUnit[expected ? "assertTrue" : "assertFalse"](message, hasClasses(fluid.wrap(element), styles));
        });
    };
        
    var cabinetTests = function () {
        var tests = jqUnit.testCase("Cabinet General Tests");
                    
        tests.test("CSS class insertion", function () {
            var cabinet = setup(CONTAINER);
            var selectors = cabinet.options.selectors;
            var styles = cabinet.options.styles;
            var string = selectors.drawer + "," + selectors.handle + "," + selectors.contents;
            expect($(string).length);

            assertStyling(selectors.drawer, styles.drawer, true, "All drawers have CSS styling");
            assertStyling(selectors.handle, styles.handle, true, "All handles have CSS styling");
            assertStyling(selectors.contents, styles.contents, true, "All content has CSS styling");
        });
        
        tests.test("Aria insertion", function () {
           var cabinet = setup(CONTAINER);
           var  selectors = cabinet.options.selectors;
           expect(4);
           
           jqUnit.assertTrue("Cabinet has role of tablist", hasAttribute(cabinet.container, "role", "tablist"));
           jqUnit.assertTrue("Cabinet has attribute aria-multiselectable set to true", hasAttribute(cabinet.container, "aria-multiselectable", "true"));
           jqUnit.assertTrue("Drawer has role of tab", hasAttribute(selectors.drawer, "role", "tab"));
           jqUnit.assertTrue("Drawer has attribute of aria-expanded set", hasAttribute(selectors.drawer));
        });
        
        tests.test("Has Closed Styling", function () {
            var cabinet = setup(CONTAINER, {startOpen: false});
            var selectors = cabinet.options.selectors;
            var styles = cabinet.options.styles;
            expect($(selectors.drawer).length * 2 + 2);

            assertStyling(selectors.drawer, styles.drawerClosed, true, "All drawers have close styling");
            assertStyling(selectors.drawer, styles.drawerOpened, false, "No drawers have open styling");
            
            jqUnit.assertTrue("Drawer has aria-expended set to false", hasAttribute(selectors.drawer, "aria-expanded","false"));
            jqUnit.assertTrue("Contents are hidden", hasStyle(selectors.contents, "display", "none"));
        });
        
        tests.test("Has Opened Styling", function () {
            var cabinet = setup(CONTAINER, {startOpen: true});
            var selectors = cabinet.options.selectors;
            var styles = cabinet.options.styles;
            expect($(selectors.drawer).length * 2 + 2);

            assertStyling(selectors.drawer, styles.drawerOpened, true, "All drawers have open styling");
            assertStyling(selectors.drawer, styles.drawerClosed, false, "No drawers have close styling");
            
            jqUnit.assertTrue("Drawer has aria-expended set to false", hasAttribute(selectors.drawer, "aria-expanded", "true"));
            jqUnit.assertTrue("Contents are visible", hasStyle(selectors.contents, "display", "block"));
        });
    };
    
    $(document).ready(function () {
        cabinetTests();
    });
})(jQuery);
