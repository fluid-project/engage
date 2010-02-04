/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
 
*/
/*global jQuery*/
/*global fluid*/
/*global jqUnit expect stop start*/

(function ($) {
    
    var selector = ".flc-homeAndLanguage";
    var component;
    
    var homeTests = jqUnit.testCase("Home Screen Tests", function () {
        homeTests.fetchTemplate("../../../../components/home/html/home.html", selector);
        component = fluid.engage.home(selector);
    });
    
    function stylingTests(styled, unStyled, className) {
        jqUnit.assertTrue("Has class: " + className, $(styled).hasClass(className));
        jqUnit.assertFalse("Does not have class: " + className, $(unStyled).hasClass(className));
    }
    
    function testStringApplication(strings, selectors) {
        for (var key in strings) {
            var string = strings[key];
            jqUnit.assertEquals("Ensure correct text applied", string, $(selectors[key]).text());
        }
    }
    
    //TODO: 
    //fix testing to work properly with cookies
    function tests() {
        homeTests.test("Page load styling - no Cookie set", function () {
            var sel = component.options.selectors;
            
            stylingTests(sel.homeContent, sel.languageSelectionContent, component.options.styles.hidden);
        });
        
        homeTests.test("Language Selection page stlying", function () {
            var sel = component.options.selectors;
            
            component.showLanguageSelection();
            stylingTests(sel.homeContent, sel.languageSelectionContent, component.options.styles.hidden);
        });
        
        homeTests.test("Strings applied", function () {
            testStringApplication(component.options.strings, component.options.selectors);
        });
    }
    
    $(document).ready(function () {
        tests();
    });
})(jQuery);
