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

fluid = fluid || {};

(function ($) {

    function hydratedTree(themeData) {
        return fluid.transform(themeData || [], function (theme) {
            return {
                ID: "catalogueThemes:", 
                children: [
                    {
                        ID: "catalogueTheme",
                        value: theme.title
                    },
                    {
                        ID: "linkToThemeArtifacts",
                        target: theme.artifactsURL
                    },
                    {
                        ID: "linkToThemeArtifactsText",
                        messagekey: "linkToThemeArtifacts", 
                        args: {
                            category: theme.title, 
                            size: theme.numberOfArtifacts
                        }
                    }
                ],
                decorators: {
                    type: "fluid",
                    func: "fluid.navigationList",
                    options: {links: theme.artifacts}
                }
            };
        });
    }
    
    function makeMiniProtoTree(model) {
        return {
            exhibitionTitle: "%title",
            linkToArtifacts: {target: "%artifactsURL"},
            linkToArtifactsText: {messagekey: "linkToArtifacts", args: {size: "%numberOfArtifacts"}}
        };
    }
    
    function assembleTree(model, expander) {
        var protoTree = makeMiniProtoTree(model);
        var miniTree = expander(protoTree);
        miniTree.children = miniTree.children.concat(hydratedTree(model.themeData));
        
        return miniTree;
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
            artifactsURL: "",
            numberOfArtifacts: "",
            themeData: [
                {
                    title: "",
                    artifactsURL: "",
                    numberOfArtifacts: "",
                    artifacts: [
                        {
                            target: "",
                            image: "",
                            title: "",
                            description: null
                        }
                    ]
                }
            ]
        }
    });
}(jQuery));