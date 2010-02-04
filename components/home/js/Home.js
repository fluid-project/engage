/*
 Copyright 2010 University of Toronto
 
 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.
 
 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt
 
 */
/*global jQuery, fluid*/

fluid = fluid || {};

(function ($) {
    
    fluid.engage = fluid.engage || {};
    
    function makeProtoComponents() {
        return {
            homeTitle: {messagekey: "homeTitle"},
            languageSelectionTitle: {messagekey: "languageSelectionTitle"},
            exhibitionsCaption: {messagekey: "exhibitionsCaption"},
            myCollectionCaption: {messagekey: "myCollectionCaption"},
            objectCodeCaption: {messagekey: "objectCodeCaption"},
            languageCaption: {messagekey: "languageCaption"}
        };
    }
    
    function setCookie(that) {
        fluid.engage.setCookie(that.options.cookieName, {});
    }
    
    function cookieCheck(that) {
        var cookie = fluid.engage.getCookie(that.options.cookieName);
        
        if (!cookie) {
            that.showLanguageSelection();
        }
    }
    
    function bindEvents(that) {
        that.locate("languageSelectionLink").click(that.showLanguageSelection);
        that.locate("languageLinks").click(that.setCookie);
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
    }
    
    fluid.engage.home = function (container, options) {
        var that = fluid.initView("fluid.engage.home", container, options);
        var expander = fluid.renderer.makeProtoExpander({ELstyle: "%"});
        
        that.showLanguageSelection = function () {
            var hidden = that.options.styles.hidden;
            that.locate("homeContent").addClass(hidden);
            that.locate("languageSelectionContent").removeClass(hidden);
        };
        
        that.setCookie = function () {
            setCookie(that);
        };
        
        that.refreshView = function () {
            var protoTree = makeProtoComponents();
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
            exhibitionsCaption: ".flc-home-exhibitionsCaption",
            myCollectionCaption: ".flc-home-myCollectionCaption",
            objectCodeCaption: ".flc-home-objectCodeCaption",
            languageCaption: ".flc-home-languageCaption",
            languageSelectionLink: ".flc-home-language",
            languageLinks: ".flc-languageSelection-links"
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
            languageSelectionTitle: "Language Selection"
        },
        
        cookieName: "fluid-engage"
    });
})(jQuery);
