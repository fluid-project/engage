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
            collectionsCaption: {messagekey: "collectionsCaption"},
            myCollectionCaption: {messagekey: "myCollectionCaption"},
            objectCodeCaption: {messagekey: "objectCodeCaption"},
            languageCaption: {messagekey: "languageCaption"}
        };
    }
    
    function bindEvents(that) {
        that.locate("languageLink").click(that.showLanguageSelection);
    }
    
    function setup(that) {
        var messageLocator = fluid.messageLocator(that.options.strings, fluid.stringTemplate);
        var selectorsToIgnore = ["homeContent", "languageSelectionContent", "languageLink"];
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
        
        that.refreshView = function () {
            var protoTree = makeProtoComponents();
            var tree = expander(protoTree);
            that.render(tree);
            bindEvents(that);
        };
        
        setup(that);
        
        return that;
    };
    
    fluid.defaults("fluid.engage.home", {
        selectors: {
            homeContent: ".flc-engage-home",
            languageSelectionContent: ".flc-engage-languageSelection",
            homeTitle: ".flc-engage-homeTitle",
            languageSelectionTitle: ".flc-engage-languageSelectionTitle",
            exhibitionsCaption: ".flc-engage-homeExhibitionsCaption",
            collectionsCaption: ".flc-engage-homeCollectionsCaption",
            myCollectionCaption: ".flc-engage-homeMyCollectionCaption",
            objectCodeCaption: ".flc-engage-homeObjectCodeCaption",
            languageCaption: ".flc-engage-homeLanguageCaption",
            languageLink: ".flc-engage-home-language"
        },
        
        styles: {
            hidden: "fl-hidden"
        },
        
        strings: {
            exhibitionsCaption: "Exhibitions",
            collectionsCaption: "Collections",
            myCollectionCaption: "My collection",
            objectCodeCaption: "Enter object code",
            languageCaption: "Change language",
            homeTitle: "McCord Museum",
            languageSelectionTitle: "Language Selection"
        }
    });
})(jQuery);
