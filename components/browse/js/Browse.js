/*
 Copyright 2009-2010 University of Toronto
 
 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.
 
 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt
 
 */
/*global jQuery, fluid*/
"use strict";

fluid = fluid || {};

(function ($) {
    
    /**
     * Removes the loading style from the component, so that the rendered page is displayed
     * 
     * @param {Object} that, the component
     */
    var removeLoadStyling = function (that) {
        that.container.removeClass(that.options.styles.load);
    };
    
    /**
     * Binds the after render event to a lister that calls the removeLoadStyling function
     * 
     * @param {Object} that, the component
     */
    var bindEvents = function (that) {
        that.events.afterRender.addListener(removeLoadStyling);
    };
    
    /**
     * Initializes the Cabinet component which is used as a subcomponent
     * 
     * @param {Object} that, the component
     */
    var initCabinet = function (that) {
        that.cabinet = fluid.initSubcomponent(that, "cabinet", [that.locate("browseContents"), fluid.COMPONENT_OPTIONS]);
    };
    
    function mapToNavListModel(items) {
        return fluid.transform(items, function (item) {
            return {
                target: item.url,
                image: item.imageUrl,
                title: item.title,
                description: item.description
            };
        });
    }
    
    function makeProtoComponents(that, navLists) {
        return { 
            title: that.model.title ? {messagekey: "title", args: {title: "%title"}} : "",
            lists: { 
                children: fluid.transform(that.model.categories || [], function (category, index) {
                    var description = category.description;
                    navLists[index] = {
                        type: "fluid",
                        func: "fluid.navigationList",
                        options: fluid.merge("merge", fluid.copy(that.options.navigationList.options), {model: mapToNavListModel(category.items)})
                    };
                    var child = {
                        listContents: {
                            decorators: navLists[index]
                        }
                    };
                    
                    // TODO: This whole issue of whether or not to render headers speaks to the fact that we actually
                    // need to do some refactoring to Cabinet and Browse. In the meantime, this is ugly.
                    if (index > 0 || that.options.showHeaderForFirstCategory) {
                        var headerValues = {
                            category: category.name === "viewAll" ? that.options.strings.allObjects : category.name, 
                            size: category.items.length
                        };
                        var localizedName = fluid.stringTemplate(that.options.strings.categoryHeader, headerValues);
                        child.cabinetHandle = description ? {
                            decorators: [{
                                type: "addClass",
                                classes: that.options.styles.listHeaderDescription
                            }]
                        } : {};
                        child.listHeader = localizedName;
                        if (description) {
                            child.listHeaderDescription = description;
                        }
                    }
                    return child;
                })
            }
        };
    }
    
    function assembleTree(that, expander, navLists) {
        var protoTree = makeProtoComponents(that, navLists);
        var fullTree = expander(protoTree);
        return fullTree;
    }
    
    /**
     * Executes the various functions required to properly setup the component
     * 
     * @param {Object} that, the component
     */
    var setup = function (that) {
        bindEvents(that);
        var messageLocator = fluid.messageLocator(that.options.strings, fluid.stringTemplate);
        that.render = fluid.engage.renderUtils.createRendererFunction(that.container, that.options.selectors, {
            selectorsToIgnore: ["browseDescription", "toggle", "browseContents"],
            repeatingSelectors: ["lists"],
            rendererOptions: {
                messageLocator: messageLocator,
                model: that.model
            }
        });
        that.refreshView();
        that.events.afterRender.fire(that);
    };
    
    var activateToggler = function (that, navLists) {
        that.locate("toggle").click(function () {
            fluid.transform(navLists || [], function (navList) {
                navList.that.toggleLayout();
            });
            return false;
        });
    };
    
    /**
     * The component's creator function 
     * 
     * @param {Object} container, the container which will hold the component
     * @param {Object} options, options passed into the component
     */
    fluid.browse = function (container, options) {
        var that = fluid.initView("fluid.browse", container, options);
        that.model = that.options.model;
        
        var expander = fluid.renderer.makeProtoExpander({ELstyle: "%"});
        
        that.refreshView = function () {
            var navLists = [];
            var tree = assembleTree(that, expander, navLists);
            that.render(tree);
            activateToggler(that, navLists);
            if (that.options.useCabinet) {
                initCabinet(that);
            }
        };
        
        setup(that);
        return that;
    };
    
    fluid.defaults("fluid.browse", {
        cabinet: {
            type: "fluid.cabinet",
            options: {}
        },
        
        description: {
            type: "fluid.description",
            options: {
                model: "",
                selectors: {
                    content: ".flc-browse-description"
                }
            }
        },
        
        navigationList: {
            type: "fluid.navigationList",
            options: {
                styles: {
                    titleText: "fl-browse-shortenText"
                },
                useDefaultImage: true
            }
        },
        
        selectors: {
            title: ".flc-browse-title",
            browseDescription: ".flc-browse-description",
            browseDescriptionContainer: ".flc-browse-descriptionContainer",
            browseContents: ".flc-browse-contents",
            cabinetHandle: ".flc-cabinet-handle",
            listHeader: ".flc-cabinet-header",
            listHeaderDescription: ".flc-cabinet-headerDescription",
            listContents: ".flc-cabinet-contents",
            lists: ".flc-cabinet-drawer",
            toggle: ".flc-browse-navlist-toggle"
        },
        
        styles: {
            load: "fl-browse-loading",
            browseContents: "fl-browse-contents",
            browseDescription: "fl-browse-description",
            listHeaderDescription: "fl-cabinet-headerWithDescription"
        },
        
        strings: {
            categoryHeader: "Viewing %category (%size total)",
            allObjects: "all objects",
            title: "%title"
        },
        
        events: {
            afterRender: null
        },
        
        useCabinet: false,
        
        showHeaderForFirstCategory: true,
        
        model: {
            title: "",
            categories: [
                {
                    name: "",
                    items: [{
                        description: ""
                    }]
                }
            ]
        }
    });
    
})(jQuery);