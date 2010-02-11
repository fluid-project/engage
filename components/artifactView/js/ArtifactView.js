/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global window, jQuery, fluid*/
"use strict";

fluid = fluid || {};

(function ($) {
    
    var removeEmptyComponents = function (proto, model) {
        for (var selector in proto) {
            var elPath = proto[selector];
            if (typeof(elPath) !== "string") {
                continue;
            }
            var modelValue = fluid.model.getBeanValue(model, elPath.substring(1));
            if (modelValue === null || modelValue === undefined) {
                delete proto[selector];
            }
        }
    };

    var makeProtoComponents = function (that) {
        var proto = {
            navBarTitle: "%artifactTitle",
            accessionNumber: "%artifactAccessionNumber",
            title: "%artifactTitle",
            author: "%artifactAuthor",
            dated: "%artifactDate",
            medium: "%artifactMedium",
            dimensions: "%artifactDimensions",
            mention: "%artifactMention",
            image: {target: "%artifactImage"},
            sections: {
                children: fluid.transform(that.sections, function (section) {
                    var navList = {
                        type: "fluid",
                        func: "fluid.navigationList",
                        options: fluid.merge("merge", fluid.copy(that.options.section.options), {model: section.sectionContents})
                    };
                    return {
                        sectionContents: {
                            decorators: navList
                        },
                        sectionHeader: {messagekey: section.sectionTitle, args: {size: section.sectionSize}}
                    };
                })
            }
        };
        
        if (that.model.artifactDescription) {
            proto.descriptionContent = {markup: "%artifactDescription"};
            proto.description = {
                decorators: {
                    type: "fluid",
                    func: "fluid.engage.moreLess",
                    options: that.options.descriptionMoreLess.options
                }
            };
        }
        
        // Trim out any components for model values that are not present, so that the renderer will remove associated template markup.
        removeEmptyComponents(proto, that.model);
        return proto;
    };
    
    var makeSection = function (title, count, sectionContents) {
        return {
            sectionTitle: title,
            sectionSize: count,
            sectionContents: sectionContents 
        };
    };
    
    var transformMediaModelForNavList = function (model, options) {
        var sectionContents = fluid.transform($.makeArray(model.artifactMedia), function (mediaItem) {
            return {
                image: mediaItem.type === "video" ? options.defaultVideoThumbnail : options.defaultAudioThumbnail,
                target: mediaItem.uri,
                title: mediaItem.title
            };
        });
        return makeSection("artifactMedia", model.artifactMediaCount, sectionContents);
    };
    
    var transformCommentsModelForNavList = function (model, options) {
        var sectionContents = fluid.transform($.makeArray(model.artifactComments), function (val) {
            return {
                image: val.author ? val.author.avatar : "",
                title: val.author ? val.author.username : "",
                description: val.text
            };
        });
        return makeSection("artifactComments", model.artifactCommentsCount, sectionContents);              
    };
    
    var transformRelatedModelForNavList = function (model, options) {
        var sectionContents = fluid.transform($.makeArray(model.artifactRelated), function (val) {
            return {
                image: val.thumbnail ? val.thumbnail[0].nodetext : "",  
                title: val.title,
                description: val.subtitle,
                target: window.location.href.replace(model.artifactAccessionNumber, val.accessnumber),
                showBadge: val.hasMedia === "yes"
            };
        });
        return makeSection("artifactRelated", model.artifactRelatedCount, sectionContents);
    };
    
    var makeNavListModels = function (model, options) {
        var sections = [];
        
        if (model.artifactMediaCount > 0) {
            sections.push(transformMediaModelForNavList(model, options));
        }        
        if (model.artifactCommentsCount > 0) {
            sections.push(transformCommentsModelForNavList(model, options));
        }
        if (model.artifactRelatedCount > 0) {
            sections.push(transformRelatedModelForNavList(model, model));                
        }
        
        return sections;
    };

    var setup = function (that) {
        that.sections = makeNavListModels(that.model, that.options);
        var messageLocator = fluid.messageLocator(that.options.strings, fluid.stringTemplate);
        that.render = fluid.engage.renderUtils.createRendererFunction(that.container, that.options.selectors, {
            selectorsToIgnore: ["sectionContainer"],
            repeatingSelectors: ["sections"],
            rendererOptions: {
                messageLocator: messageLocator,
                model: that.model
            }
        });        
        that.refreshView();
    };
    
    var setupSubcomponents = function (that) {
        that.navBar = fluid.initSubcomponent(that, "navigationBar", [that.container, fluid.COMPONENT_OPTIONS]);;
        if (that.sections.length > 0 && that.options.useCabinet) {
            that.cabinet = fluid.initSubcomponent(that, "cabinet", [that.locate("sectionContainer"), fluid.COMPONENT_OPTIONS]);
        }
    };

    fluid.engage.artifactView = function (container, options) {
        var that = fluid.initView("fluid.engage.artifactView", container, options);
        that.model = that.options.model;
        
        that.refreshView = function () {
            var expander = fluid.renderer.makeProtoExpander({ELstyle: "%"});            
            var tree = expander(makeProtoComponents(that));
            that.render(tree);
            setupSubcomponents(that);
        };
        
        setup(that);        
        return that;
    };
    
    fluid.defaults("fluid.engage.artifactView", {
        
        descriptionMoreLess: {
            type: "fluid.engage.moreLess",
            options: {}
        },
        
        section: {
            type: "fluid.navigationList",
            options: {
                model: null,
                useDefaultImage: true
            }
        },
        
        cabinet: {
            type: "fluid.cabinet"
        },
        
        navigationBar: {
            type: "fluid.engage.navigationBar"
        },
        
        selectors: {
            navBarTitle: ".flc-artifact-navBarTitle",
            accessionNumber: ".flc-artifact-accessionNumber",
            title: ".flc-artifact-title",
            author: ".flc-artifact-author",
            dated: ".flc-artifact-dated",
            medium: ".flc-artifact-medium",
            dimensions: ".flc-artifact-dimensions",
            mention: ".flc-artifact-mention",
            description: ".flc-artifact-description",
            descriptionContent: ".flc-moreLess-content",
            image: ".flc-artifact-image",
            sectionContainer: ".flc-artifact-sections",
            sections: ".flc-cabinet-drawer",
            sectionContents: ".flc-cabinet-contents",
            sectionHeader: ".flc-cabinet-header"
        },
        
        useCabinet: true,
        
        strings: {
            artifactMedia: "Show Audio and Video (%size)",
            artifactComments: "Show Comments (%size)",
            artifactRelated: "Show Related Artifacts (%size)"
            
        },
        
        defaultVideoThumbnail: "../images/fe_mobile_icon_video.png",
        defaultAudioThumbnail: "../images/fe_mobile_icon_audio.png"
    });
    
}(jQuery));
