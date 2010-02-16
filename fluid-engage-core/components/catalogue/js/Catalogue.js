/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/
"use strict";

fluid = fluid || {};

(function ($) {
    
    var assembleTree = function (that) {
        that.navLists = [];
        var protoTree = { 
            exhibitionTitle: "%title",
            linkToArtifacts: {target: "%allArtifactsViewURL"},
            linkToArtifactsText: {messagekey: "linkToArtifacts", args: {size: "%numArtifacts"}},
            catalogueThemes: { 
                children: fluid.transform(that.model.themes || [], function (theme, index) {
                    var thisTheme = "%themes." + index + ".";
                    that.navLists[index] = {
                        type: "fluid",
                        func: "fluid.navigationList",
                        options: {model: theme.artifacts}
                    };
                    return {
                        catalogueTheme: thisTheme + "title",
                        linkToThemeArtifacts: {target: thisTheme + "allArtifactsViewURL"},
                        linkToThemeArtifactsText: {
                            messagekey: "linkToThemeArtifacts",
                            args: {
                                category: thisTheme + "title", 
                                size: thisTheme + "numArtifacts"
                            }
                        },
                        decorators: that.navLists[index]
                    };
                })
            }
        };
        
        var expander = fluid.renderer.makeProtoExpander({ELstyle: "%"});
        return expander(protoTree);
    };
    
    var setup = function (that) {
        var messageLocator = fluid.messageLocator(that.options.strings, fluid.stringTemplate);
        
        that.render = fluid.engage.renderUtils.createRendererFunction(that.container, that.options.selectors, {
            selectorsToIgnore: ["catalogueThemeToggle"],
            repeatingSelectors: ["catalogueThemes"],
            rendererOptions: {
                messageLocator: messageLocator,
                model: that.model
            }
        });

        that.refreshView();
    };
    
    var setupNavBar = function (that) {
        that.navBar = fluid.initSubcomponent(that, "navigationBar", [that.container, fluid.COMPONENT_OPTIONS]);
        that.navBar.events.onToggle.addListener(function () {
            $.each(that.navLists, function (idx, navList) {
                navList.that.toggleLayout();
            });            
        });   
    };
    
    fluid.catalogue = function (container, options) {
        var that = fluid.initView("fluid.catalogue", container, options);        
        that.model = that.options.model;
        
        that.refreshView = function () {
            that.render(assembleTree(that));
            setupNavBar(that);
        };
        
        setup(that);
        return that;
    };
    
    fluid.defaults("fluid.catalogue", {
        navigationBar: {
            type: "fluid.engage.navigationBar"
        },
        
        navigationList: {
            type: "fluid.navigationList"
        },
        
        selectors: {
            exhibitionTitle: ".flc-catalogue-title",
            linkToArtifacts: ".flc-catalogue-linkToArtifacts",
            linkToArtifactsText: ".flc-catalogue-linkToArtifactsText",
            catalogueThemes: ".flc-catalogue-themes",
            catalogueTheme: ".flc-catalogue-theme",
            linkToThemeArtifacts: ".flc-catalogue-linkToThemeArtifacts",
            linkToThemeArtifactsText: ".flc-catalogue-linkToThemeArtifactsText"
        },
        
        strings: {
            linkToArtifacts: "View all objects (%size)",
            linkToThemeArtifacts: "View all in %category (%size)"
        },
        
        model: {
            title: "",
            allArtifactsViewURL: "",
            numArtifacts: "",
            themes: [
                {
                    title: "",
                    allArtifactsViewURL: "",
                    numArtifacts: "",
                    artifacts: [
                        {
                            artifactViewURL: "",
                            imageURL: "",
                            title: "",
                            description: null
                        }
                    ]
                }
            ]
        }
    });
}(jQuery));
