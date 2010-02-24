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
    
    function testExpectedClasses(component, styled, unStyled, className) {        
        var sel = component.options.selectors;
        var cName = component.options.styles[className];
        
        jqUnit.assertTrue(styled + " has class: " + cName, $(sel[styled]).hasClass(cName));
        jqUnit.assertFalse(unStyled + " does not have class: " + cName, $(sel[unStyled]).hasClass(cName));
    }
    
    var testHomeIsVisible = function (component) {
        var styles = component.options.styles;
        var sels = component.options.selectors;
        
        jqUnit.assertTrue("Home content is not hidden", $(sels.homeContent).hasClass(styles.hidden));
        jqUnit.assertFalse("Langugage selection is hidden", $(sels.languageSelectionContent).hasClass(styles.hidden));
    };
    
    $(document).ready(function () {
        
        //Tests for page load without cookie
        var homeTests = jqUnit.testCase("Home Screen Tests", function () {
            homeTests.fetchTemplate("../../../../components/home/html/home.html", selector);
            component = fluid.engage.home(selector, {
                cookieName: cookieName,
                strings: {
                    exhibitionsCaption: "Localized Exhibitions",
                    myCollectionCaption: "Localized My collection",
                    objectCodeCaption: "Localized Enter object code",
                    languageCaption: "Localized Change language",
                    homeTitle: "Localized McCord Museum",
                    languageSelectionTitle: "Localized Language Selection",
                    iconAltText: "Localized %iconName icon"
                }
            });
        }, deleteCookie);
        
        homeTests.test("Page load styling", function () {
            testHomeIsVisible(component);
        });
        
        var testLocalization = function (component, i18NMap) {
            var strings = component.options.strings;
            var selectors = component.options.selectors;
            
            for (var selectorName in i18NMap) {
                var stringName = i18NMap[selectorName];
                var localizedText = strings[stringName];

                // Can't test strings that are used more than once, nor ones that are templates.
                // TODO: Are we sure?
                if (stringName.indexOf("%") === -1) {
                    jqUnit.assertEquals("Ensure the element named " + stringName + " was correctly localized.", 
                                        localizedText, 
                                        $(selectors[selectorName]).text());
                }
            }
        };
        
        homeTests.test("Localization", function () {            
            // Test that all icon labels have been localized.
            testLocalization(component, component.options.labelI18N);
            
            // TODO: Test that alt text has been localized.
            jqUnit.assertTrue("The alt text unit tests have not been correctly implemented", false);
        });
        
        homeTests.test("Adding the cookie", function () {
            component.addCookie();
            jqUnit.assertTrue("Cookie added properly", fluid.engage.getCookie(cookieName));
        });
        
        homeTests.test("Language Selection page stlying", function () {
            component.showLanguageSelection();
            testHomeIsVisible(component);
        });
    });
})(jQuery);
