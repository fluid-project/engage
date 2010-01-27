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

    function mapToNavListModel(artifacts) {
        return fluid.transform(artifacts, function (artifact) {
            return {
                target: artifact.artifactViewURL,
                image: artifact.imageURL,
                title: artifact.title,
                description: artifact.description
            };
        });
    }
    
    function makeProtoComponents(model) {
        return { 
            exhibitionTitle: "%title",
            linkToArtifacts: {target: "%allArtifactsViewURL"},
            linkToArtifactsText: {messagekey: "linkToArtifacts", args: {size: "%numArtifacts"}},
            catalogueThemes: { 
                children: fluid.transform(model.themes || [], function (theme, index) {
                    var thisTheme = "%themes." + index + ".";
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
                        decorators: {
                            type: "fluid",
                            func: "fluid.navigationList",
                            options: {model: mapToNavListModel(theme.artifacts)}
                        }
                    };
                })
            }
        };
    }

    
    function assembleTree(model, expander) {
        var protoTree = makeProtoComponents(model);
        var fullTree = expander(protoTree);
        return fullTree;
    }
    
    var setup = function (that) {
        var messageLocator = fluid.messageLocator(that.options.strings, fluid.stringTemplate);
        
        that.render = fluid.engage.renderUtils.createRendererFunction(that.container, that.options.selectors, {
            repeatingSelectors: ["catalogueThemes"],
            rendererOptions: {
                messageLocator: messageLocator,
                model: that.model
            }
        });

        that.refreshView();
    };
    
    fluid.catalogue = function (container, options) {
        var that = fluid.initView("fluid.catalogue", container, options);        
        that.model = that.options.model;
        
        var expander = fluid.renderer.makeProtoExpander({ELstyle: "%"});
        
        that.refreshView = function () {
            that.render(assembleTree(that.model, expander));
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
            linkToThemeArtifactsText: ".flc-catalogue-linkToThemeArtifactsText"
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