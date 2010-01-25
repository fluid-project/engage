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
    
    function render(that) {
        var map =  [
            {id: "exhibitionTitle", selector: that.options.selectors.exhibitionTitle},
            {id: "linkToArtifacts", selector: that.options.selectors.linkToArtifacts},
            {id: "catalogueThemes:", selector: that.options.selectors.catalogueThemes},
            {id: "catalogueTheme", selector: that.options.selectors.catalogueTheme},
            {id: "linkToThemeArtifacts", selector: that.options.selectors.linkToThemeArtifacts}
        ];
        
        function generateTree() {
            var children = [];
            
            children.push({
                ID: "exhibitionTitle",
                value: that.model.title
            });
            
            children.push({
                ID: "linkToArtifacts",
                target: that.model.artifactsURL,
                linktext: {
                    messagekey: "linkToArtifacts",
                    args: [that.model.numberOfArtifacts]
                }
            });
            
            children = children.concat(fluid.transform(that.model.themeData, function (theme) {
                return {
                    ID: "catalogueThemes:", 
                    children: [
                        {
                            ID: "catalogueTheme",
                            value: theme.title
                        },
                        {
                            ID: "linkToThemeArtifacts",
                            target: theme.artifactsURL, 
                            linktext: {
                                messagekey: "linkToThemeArtifacts", 
                                args: [theme.title, theme.numberOfArtifacts]
                            }
                        }
                    ],
                    decorators: {
                        type: "fluid",
                        func: "fluid.navigationList",
                        options: {links: theme.artifacts}
                    }
                };
            }));
            
            return {
                children: children
            };
        }
        
        var options = {
            cutpoints: map,
            messageSource: {
                type: "data",
                messages: that.options.messageBundle
            }
        };
        
        fluid.selfRender(that.container, generateTree(), options);
    }
    
    var setup = function (that) {
        render(that);
    };
    
    fluid.catalogue = function (container, options) {
        var that = fluid.initView("fluid.catalogue", container, options);        
        that.model = that.options.model;
        setup(that);
        return that;
    };
    
    fluid.defaults("fluid.catalogue", {
        selectors: {
            exhibitionTitle: ".flc-catalogue-title",
            linkToArtifacts: ".flc-catalogue-linkToArtifacts",
            catalogueThemes: ".flc-catalogue-themes",
            catalogueTheme: ".flc-catalogue-theme",
            linkToThemeArtifacts: ".flc-catalogue-linkToThemeArtifacts"
        },
        
        navigationList: {
            type: "fluid.navigationList"
        },
        
        messageBundle: {
            linkToArtifacts: "View all objects ({0})",
            linkToThemeArtifacts: "View all in {0} ({1})"
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