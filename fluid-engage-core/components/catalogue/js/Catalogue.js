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
    
    function makeProtoComponents(model, navLists) {
        return { 
            exhibitionTitle: "%title",
            linkToArtifacts: {target: "%allArtifactsViewURL"},
            linkToArtifactsText: {messagekey: "linkToArtifacts", args: {size: "%numArtifacts"}},
            catalogueThemes: { 
                children: fluid.transform(model.themes || [], function (theme, index) {
                    var thisTheme = "%themes." + index + ".";
                    navLists[index] = {
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
                        decorators: navLists[index]
                    };
                })
            }
        };
    }

    
    function assembleTree(model, expander, navLists) {
        var protoTree = makeProtoComponents(model, navLists);
        var fullTree = expander(protoTree);
        return fullTree;
    }
    
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
    
    var activateToggler = function (that, navLists) {
        that.locate("catalogueThemeToggle").click(function () {
            fluid.transform(navLists || [], function (navList) {
                navList.that.toggleLayout();
            });
            return false;
        });
    };
    
    fluid.catalogue = function (container, options) {
        var that = fluid.initView("fluid.catalogue", container, options);        
        that.model = that.options.model;
        
        var expander = fluid.renderer.makeProtoExpander({ELstyle: "%"});
        
        that.refreshView = function () {
            var navLists = [];
            var tree = assembleTree(that.model, expander, navLists);
            that.render(tree);
            activateToggler(that, navLists);
        };
        
        setup(that);
        return that;
    };
    
    fluid.defaults("fluid.catalogue", {
        selectors: {
            exhibitionTitle: ".flc-catalogue-title",
            linkToArtifacts: ".flc-catalogue-linkToArtifacts",
            linkToArtifactsText: ".flc-catalogue-linkToArtifactsText",
            catalogueThemes: ".flc-catalogue-themes",
            catalogueTheme: ".flc-catalogue-theme",
            linkToThemeArtifacts: ".flc-catalogue-linkToThemeArtifacts",
            linkToThemeArtifactsText: ".flc-catalogue-linkToThemeArtifactsText",
            catalogueThemeToggle: ".flc-catalogue-navlist-toggle"
        },
        
        navigationList: {
            type: "fluid.navigationList"
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