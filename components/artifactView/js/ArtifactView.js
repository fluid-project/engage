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

    var COMMENT_SECTION = {};

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
            image: {
                target: "%artifactImage",
                decorators: {
                    type: "attrs",
                    attributes: {
                        alt: that.model.artifactTitle
                    }
                }
            },
            commentButton: {messagekey: "comment"},
            sections: {
                children: fluid.transform(that.sections, function (section) {
                    var decorator = section.sectionContents === COMMENT_SECTION ? {
                        type: "identify",
                        key: "comments"
                    } : {
                        type: "fluid",
                        func: "fluid.navigationList",
                        options: $.extend(fluid.copy(that.options.section.options), {model: section.sectionContents})
                    };
                    return {
                        sectionContents: {
                            decorators: decorator
                        },
                        sectionHeader: {messagekey: section.sectionTitleKey, args: {size: section.sectionSize}}
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
    
    var makeSection = function (titleKey, count, sectionContents) {
        return {
            sectionTitleKey: titleKey,
            sectionSize: count,
            sectionContents: sectionContents 
        };
    };
    
    var artifactMediaToSection = function (model, options, mediaIconURLs) {
        var sectionContents = fluid.transform($.makeArray(model.artifactMedia), function (mediaItem) {
            return {
                image: mediaIconURLs[mediaItem.type],
                target: mediaItem.uri,
                title: mediaItem.title
            };
        });
        return makeSection("artifactMedia", model.artifactMediaCount, sectionContents);
    };
    
    var commentsToSection = function (model, options) {
        var sectionContents = COMMENT_SECTION;
        
 //       fluid.transform($.makeArray(model.artifactComments), function (val) {
 //           return {
 //               image: val.author ? val.author.avatar : "",
 //               title: val.author ? val.author.username : "",
 //               description: val.text
 //           };
 //       });
        var commentCount = options.comments.options.model.comments.length;
        return makeSection("artifactComments", commentCount, sectionContents);              
    };
    
    var relatedArtifactsToSection = function (model, options) {
        var sectionContents = fluid.transform($.makeArray(model.artifactRelated), function (val) {
            return {
                image: val.thumbnail ? val.thumbnail[0].nodetext : "",  
                title: val.title,
                description: val.subtitle,
                target: fluid.engage.url.location().replace(model.artifactAccessionNumber, val.accessnumber),
                showBadge: val.hasMedia === "yes"
            };
        });
        return makeSection("artifactRelated", model.artifactRelatedCount, sectionContents);
    };
    
    var makeCabinetSections = function (model, options, mediaIconURLs) {
        var sections = [];
        
        if (model.artifactMediaCount > 0) {
            sections.push(artifactMediaToSection(model, options, mediaIconURLs));
        }        
        sections.push(commentsToSection(model, options));
        if (model.artifactRelatedCount > 0) {
            sections.push(relatedArtifactsToSection(model, model));                
        }
        
        return sections;
    };

    var rendererIdMap = {};

    var getMediaIconURLsFromDOM = function (dom) {
        return {
            audio: dom.locate("audioIcon").attr("src"),
            video: dom.locate("videoIcon").attr("src")
        };
    };
    
    var setup = function (that) {
        var mediaIconURLs = getMediaIconURLsFromDOM(that.dom);
        that.sections = makeCabinetSections(that.model, that.options, mediaIconURLs);
        var messageLocator = fluid.messageLocator(that.options.strings, fluid.stringTemplate);
        that.render = fluid.engage.renderUtils.createRendererFunction(that.container, that.options.selectors, {
            selectorsToIgnore: ["artifactPanel", "sectionContainer", "audioIcon", "videoIcon"],
            repeatingSelectors: ["sections"],
            rendererOptions: {
                messageLocator: messageLocator,
                model: that.model,
                idMap: rendererIdMap
            }
        });        
        that.refreshView();
    };
    
    var setupSubcomponents = function (that) {
        var museumID = fluid.engage.url.params().db;
    
        that.navBar = fluid.initSubcomponent(that, "navigationBar", [that.container, fluid.COMPONENT_OPTIONS]);
                
        that.collectView = fluid.initSubcomponent(that, "collectView", [
            that.locate("artifactPanel"),
            {
                model: {
                    museumID: museumID,
                    artifact: that.model
                },
                strings: that.options.strings
            }
        ]);
        
        if (that.sections.length > 0 && that.options.useCabinet) {
            that.cabinet = fluid.initSubcomponent(that, "cabinet", [that.locate("sectionContainer"), fluid.COMPONENT_OPTIONS]);
        }
        // Note current deficient, time-dependent and awkward strategy based on rebuilding components on re-render, awaiting
        // RENDEROUR ANTIGENS
        that.comments = fluid.initSubcomponent(that, "comments", [fluid.jById(rendererIdMap.comments), fluid.COMPONENT_OPTIONS]);
        that.locate("commentButton").attr("href", that.comments.options.addNoteTarget);
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
        
        comments: {
            type: "fluid.engage.guestbook",
            options: {
                navigationBar: {
                    options: {
                        disabled: true
                    }
                }
            }
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
        
        collectView : {
            type: "fluid.engage.artifactCollectView"
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
            sectionHeader: ".flc-cabinet-header",
            audioIcon: ".flc-artifactView-audio-icon",
            videoIcon: ".flc-artifactView-video-icon",
            artifactPanel: ".flc-artifact-actionPanel",
            commentButton: ".flc-artifact-comment-link"
        },
        
        useCabinet: true,
        
        strings: {
            artifactMedia: "Show Audio and Video (%size)",
            artifactComments: "Show Comments (%size)",
            artifactRelated: "Show Related Artifacts (%size)",            
            comment: "Comment",
            
            // TODO: These strings should be correctly scoped to the ArtifactCollectView.
            collect: "Collect",
            uncollect: "Uncollect",
            collectedMessage: "Added to your \"My Collection\". Tap here to go there now.",
            uncollectedMessage: "Removed from your \"My Collection\". Tap here to go there now."
        }
    });
    
}(jQuery));
