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

(function ($) {
    //TODO:
    //Render out language options. Currently this is hardcoded to only English and Frech.
    //This has led to several spots in the code where it is assumed to only be either or.
    //In the future it would make more sense to render the languages out.
    fluid.engage = fluid.engage || {};
    
    function makeProtoComponents(str) {
        function altTextNode(text) {
            return {
                decorators: [{
                    type: "attrs",
                    attributes: {
                        alt: fluid.stringTemplate(str.iconAltText, {iconName: text})
                    }
                }]
            };
        }
        
        return {
            homeTitle: {messagekey: "homeTitle"},
            languageSelectionTitle: {messagekey: "languageSelectionTitle"},
            exhibitionsCaption: {messagekey: "exhibitionsCaption"},
            myCollectionCaption: {messagekey: "myCollectionCaption"},
            objectCodeCaption: {messagekey: "objectCodeCaption"},
            languageCaption: {messagekey: "languageCaption"},
            exhibitionsIcon: altTextNode(str.exhibitionsCaption),
            myCollectionIcon: altTextNode(str.myCollectionCaption),
            objectCodeIcon: altTextNode(str.objectCodeCaption),
            languageIcon: altTextNode(str.languageCaption)
        };
    }
    
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
                window.location = that.locate(cookie.lang === "en" ? "englishLink" : "frenchLink").attr("href");
            }
        }
    }
    
    function bindEvents(that) {
        
        //appends the lang param to the url of the clicked item.
        function setLanguage() {
            var node = $(this);
            var currentHREF = node.attr("href");
            var param = window.location.search;
            var idxQ = currentHREF.indexOf("?");
            
            node.attr("href", currentHREF + (idxQ < 0 ? param : "&" + param.substr(1)));
        }
        
        that.locate("languageSelectionLink").click(function (evt) {
            that.showLanguageSelection();
            evt.preventDefault();
        });
        that.locate("links").click(setLanguage);
        that.locate("englishLink").click(function () {
            that.addCookie("en");
        });
        that.locate("frenchLink").click(function () {
            that.addCookie("fr");
        });
    }
    
    function setup(that) {
        var messageLocator = fluid.messageLocator(that.options.strings, fluid.stringTemplate);
        var selectorsToIgnore = ["homeContent", "languageSelectionContent", "languageSelectionLink", "languageLinks"];
        that.render = fluid.engage.renderUtils.createRendererFunction(that.container, that.options.selectors, {
            selectorsToIgnore: selectorsToIgnore,
            rendererOptions: {
                messageLocator: messageLocator
            }
        });
        that.refreshView();
        
        // TODO: Nasty hard-baked hack to get user IDs into My Collection until we can think through this better. Get rid of it!
        var myCollectionLink = that.locate("myCollectionLink");
        var myCollectionURL = myCollectionLink.attr("href");
        myCollectionLink.attr("href", myCollectionURL + "?user=" + fluid.engage.user.currentUser()._id);
    }
    
    fluid.engage.home = function (container, options) {
        var that = fluid.initView("fluid.engage.home", container, options);
        var expander = fluid.renderer.makeProtoExpander({ELstyle: "%"});
        
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
        
        /**
         * Loads/refreshes the view
         */
        that.refreshView = function () {
            var protoTree = makeProtoComponents(that.options.strings);
            var tree = expander(protoTree);
            that.render(tree);
            bindEvents(that);
            cookieCheck(that);
        };
        
        setup(that);
        
        return that;
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
        
        cookieName: "fluid-engage"
    });
})(jQuery);
