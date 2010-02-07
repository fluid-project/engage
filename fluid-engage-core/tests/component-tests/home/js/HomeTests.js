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
    var cookieName = "fluid.engage.home-unitTest";
    var component;
    
    function deleteCookie() {
        fluid.engage.deleteCookie(cookieName);
    }   
    
    function stylingTests(component, styled, unStyled, className, funcName) {
        var sel = component.options.selectors;
        var cName = component.options.styles[className];
        
        if (funcName) {
            component[funcName]();
        }
        
        jqUnit.assertTrue(styled + " has class: " + cName, $(sel[styled]).hasClass(cName));
        jqUnit.assertFalse(unStyled + " does not have class: " + cName, $(sel[unStyled]).hasClass(cName));
    }
    
    function testStringApplication(strings, selectors) {
        for (var key in strings) {
            var string = strings[key];
            
            //Can't test strings that are used more than once, nor ones that are templates.
            if (string.indexOf("%") === -1) {
                jqUnit.assertEquals("Ensure correct text applied", string, $(selectors[key]).text());
            }
        }
    }
    
    function testAltTextApplication(strings, selectors) {
        for (var key in selectors) {
            if (key.indexOf("Icon") >= 0) {
                var strEL = key.replace("Icon", "Caption");
                var expected = fluid.stringTemplate(strings.iconAltText, {iconName: strings[strEL]});
                jqUnit.assertEquals("Alt text for " + key + " applied", expected, $(selectors[key]).attr("alt"));
            }
        }
    }
    
    $(document).ready(function () {
        
        //Tests for page load without cookie
        var homeTests = jqUnit.testCase("Home Screen Tests", function () {
            homeTests.fetchTemplate("../../../../components/home/html/home.html", selector);
            component = fluid.engage.home(selector, {cookieName: cookieName});
        }, deleteCookie);
        
        homeTests.test("Page load styling", function () {
            stylingTests(component, "homeContent", "languageSelectionContent", "hidden");
        });
        
        homeTests.test("Strings applied", function () {
            testStringApplication(component.options.strings, component.options.selectors);
        });
        
        homeTests.test("Alt Text applied", function () {
            testAltTextApplication(component.options.strings, component.options.selectors);
        });
        
        homeTests.test("Adding the cookie", function () {
            component.addCookie();
            jqUnit.assertTrue("Cookie added properly", fluid.engage.getCookie(cookieName));
        });
        
        homeTests.test("Language Selection page stlying", function () {
            stylingTests(component, "homeContent", "languageSelectionContent", "hidden", "showLanguageSelection");
        });
    });
})(jQuery);
