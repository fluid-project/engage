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
    
    var parseParams = function (url) {
        var search = url.substr(url.indexOf("?") + 1);
        var params = search.split("&");
        
        var parsedParams = []
        $.each(params, function (idx, param) {
            var paramTokens = param.split("=");
            parsedParams.push({
                name: paramTokens[0],
                value: paramTokens[1]
            });
        });
        
        return parsedParams;
    };
    
    var isParamSetOnce = function (array, paramObj) {
        var count = 0;
        var matched = false;
        $.each(array, function (idx, item) {
            if (jqUnit.deepEq(item, paramObj)) {
                count++;
                matched = true;
            }
        });
        
        return matched && (count === 1);
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
        
        var testAllLinksForLangParam = function (dom, lang) {
            dom.locate("links").each(function (idx, link) {
                link = $(link);
                var url = link.attr("href");
                var params = parseParams(url);
                var isLangSet = isParamSetOnce(params, {
                    name: "lang", 
                    value: lang
                });
                
                jqUnit.assertTrue("The lang parameter and value is present in the URL only once.", isLangSet);
            });
        };
        
        var setAndTestLanguage = function (component, lang) {
            component.setLanguage(lang);
            testAllLinksForLangParam(component.dom, lang)
        };
        
        homeTests.test("URL rewriting with language parameter", function () {
            setAndTestLanguage(component, "fr");
            setAndTestLanguage(component, "fr"); // Again, same language.
            setAndTestLanguage(component, "en"); // New language
        });
        
        
        // Parameter parsing tests
        
        var url = "http://localhost:8080/test/url.html";
        
        var langParam = {
            name: "lang",
            value: "fr"
        };
        
        var addParamAndParse = function (url, paramName, paramValue) {
            var result = fluid.engage.addParamToURL(url, langParam.name, langParam.value);
            return parseParams(result);
        };
        
        homeTests.test("addParamToURL() with an existing query parameter already present", function () {
            var existingParam = {
                name: "param1",
                value: "value1"
            };

            var testURL = url + "?" + existingParam.name + "=" + existingParam.value;
            var resultParams = addParamAndParse(testURL, langParam.name, langParam.value);
            
            jqUnit.assertEquals("There should only be 2 parameters in the URL", 2, resultParams.length);
            jqUnit.assertTrue("The existing param is still in the URL", isParamSetOnce(resultParams, existingParam));
            jqUnit.assertTrue("The lang param has been added to the URL once", isParamSetOnce(resultParams, langParam));
        });
        
        homeTests.test("addParamToURL() with no existing query parameters", function () {
            var resultParams = addParamAndParse(url, langParam.name, langParam.value);
            jqUnit.assertEquals("There should only be 1 parameter in the URL", 1, resultParams.length);
            jqUnit.assertTrue("The lang param should be added to the URL once", isParamSetOnce(resultParams, langParam));
        });
        
    });
})(jQuery);
