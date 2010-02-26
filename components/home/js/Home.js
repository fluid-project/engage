/*
 Copyright 2010 University of Toronto
 
 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.
 
 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt
 
 */
/*global window, jQuery, fluid*/

fluid = fluid || {};
fluid.engage = fluid.engage || {};

(function ($) {
    //TODO:
    //Render out language options. Currently this is hardcoded to only English and Frech.
    //This has led to several spots in the code where it is assumed to only be either or.
    //In the future it would make more sense to render the languages out.
    
    function addCookie(that, value) {
        fluid.engage.setCookie(that.options.cookieName, value || {}, {path: "/"});
    }
    
    function cookieCheck(that) {
        var cookie = fluid.engage.getCookie(that.options.cookieName, {path: "/"});
        
        if (!cookie || !cookie.lang) {
            that.showLanguageSelection();
        } else {
            var params = window.location.search;
            if (params.indexOf("lang=" + cookie.lang) < 0) {
                // TODO: Need to use a SN-specific API instead of randomly changing window.location
                window.location = that.locate(cookie.lang === "en" ? "englishLink" : "frenchLink").attr("href");
            }
        }
    }
    
    function bindEvents(that) {
        that.locate("languageSelectionLink").click(function (evt) {
            that.showLanguageSelection();
            evt.preventDefault();
        });
        that.locate("englishLink").click(function () {
            that.addCookie("en");
        });
        that.locate("frenchLink").click(function () {
            that.addCookie("fr");
        });
    }
    
    fluid.engage.quickI18N = function(dom, strings, map, op) {
        fluid.transform(map, function(key, value) {
            dom.locate(key).text(strings[value]);
        });
    };
    
    var localizeAltText = function (dom, strings, map) {
        fluid.transform(map, function(key, value) {
            dom.locate(key).attr("alt", strings[value]);
        });
    };
    
    // TODO: This is a stub until we have a real API for determining the language.
    function getLanguage(that) {
        if (that.model && that.model.lang) {
            return that.model.lang;
        }
        
        return fluid.kettle.paramsToMap(window.location.search).lang;
    }
    
    function addLanguageToLinks(links, lang) {            
        links.each(function (idx, link) {
            link = $(link);
            var url = link.attr("href");
            link.attr("href", fluid.engage.addParamToURL(url, "lang", lang));
        });    
    }
    
    function setup(that) {
        fluid.engage.quickI18N(that.dom, that.options.strings, that.options.labelI18N, "text");
        localizeAltText(that.dom, that.options.strings, that.options.iconI18N);
        
        bindEvents(that);
        cookieCheck(that); // TODO: Rename and refactor this function. It has side effects!
        
        // Set the user ID for the My Collection Link.
        var myCollectionLink = that.locate("myCollectionLink");
        var myCollectionURL = myCollectionLink.attr("href");
        myCollectionLink.attr("href", fluid.engage.addParamToURL(myCollectionURL, "user", fluid.engage.user.currentUser()._id));
        
        // Set the component's language, rewriting all URLs in the process.
        var lang = getLanguage(that);
        if (lang) {
            that.setLanguage(lang);
        }
    }
    
    fluid.engage.home = function (container, options) {
        var that = fluid.initView("fluid.engage.home", container, options);
        
        that.setLanguage = function (lang) {
            addLanguageToLinks(that.locate("links"), lang);
        };
        
        /**
         * Swaps the classes, which will show the language selection and hide the regular home screen
         */
        that.showLanguageSelection = function () {
            var hidden = that.options.styles.hidden;
            that.locate("homeContent").addClass(hidden);
            that.locate("languageSelectionContent").removeClass(hidden);
        };
        
        /**
         * Adds a cookie, or sets the value if the cookie already exists
         * 
         * @param {Object} lang, sets the cookie with an object containg the value of lang
         */
        that.addCookie = function (lang) {
            addCookie(that, {lang: lang});
        };
        
        setup(that);
        return that;
    };
    
    // TODO: This function is probably not sufficiently robust and should be replaced by a new URL utility when we have one.
    fluid.engage.addParamToURL = function (url, param, value) {
        var urlBase = url;
        var trimURL = function (idx) {
            var trimmed;
            if (idx != -1) {
                trimmed = url.substring(idx);
                urlBase = urlBase.substring(0, idx);            
            };
            
            return trimmed;
        };
        
        var hash = trimURL(url.indexOf("#")) || "";
        var q = trimURL(url.indexOf("?")) || "";
        var params = q ? fluid.kettle.paramsToMap(q) : {};
        params[param] = value;
        return urlBase + "?" + $.param(params) + hash;
    };
    
    fluid.defaults("fluid.engage.home", {
        selectors: {
            homeContent: ".flc-home",
            languageSelectionContent: ".flc-languageSelection",
            homeTitle: ".flc-home-title",
            languageSelectionTitle: ".flc-languageSelection-title",
            exhibitionsIcon: ".flc-home-exhibitionsIcon",
            myCollectionIcon: ".flc-home-myCollectionIcon",
            objectCodeIcon: ".flc-home-objectCodeIcon",
            languageIcon: ".flc-home-languageIcon",
            exhibitionsCaption: ".flc-home-exhibitionsCaption",
            myCollectionLink: ".flc-home-links-myCollection",
            myCollectionCaption: ".flc-home-myCollectionCaption",
            objectCodeCaption: ".flc-home-objectCodeCaption",
            languageCaption: ".flc-home-languageCaption",
            languageSelectionLink: ".flc-home-language",
            englishLink: ".flc-languageSelection-englishLink",
            frenchLink: ".flc-languageSelection-frenchLink",
            links: ".flc-home-links"
        },
        
        styles: {
            hidden: "fl-hidden"
        },
        
        strings: {
            exhibitionsCaption: "Exhibitions",
            myCollectionCaption: "My collection",
            objectCodeCaption: "Enter object code",
            languageCaption: "Change language",
            homeTitle: "McCord Museum",
            languageSelectionTitle: "Language Selection",
            iconAltText: "%iconName icon"
        },
        
        labelI18N: {
            homeTitle: "homeTitle",
            languageSelectionTitle: "languageSelectionTitle",
            exhibitionsCaption: "exhibitionsCaption",
            myCollectionCaption: "myCollectionCaption",
            objectCodeCaption: "objectCodeCaption",
            languageCaption: "languageCaption",
        },
        
        iconI18N: {
            exhibitionsIcon: "exhibitionsCaption",
            myCollectionIcon: "myCollectionCaption",
            objectCodeIcon: "objectCodeCaption",
            languageIcon: "languageCodeCaption"
        },
        
        cookieName: "fluid-engage"
    });
})(jQuery);
