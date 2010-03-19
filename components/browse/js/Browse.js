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
    
    var initSubcomponents = function (that) {
        if (that.options.useCabinet) {
            if (!that.options.showHeaderForFirstCategory) {
                that.locate("listContents").eq(0).removeClass(that.options.selectors.listContents.substr(1));
                that.locate("lists").eq(0).removeClass(that.options.selectors.lists.substr(1));
            }
            that.cabinet = fluid.initSubcomponent(that, "cabinet", [that.locate("browseContents"), fluid.COMPONENT_OPTIONS]);
        }
        that.navBar = fluid.initSubcomponent(that, "navigationBar", [that.container, fluid.COMPONENT_OPTIONS]);
        that.navBar.events.onToggle.addListener(function () {
            $.each(that.navLists, function (idx, navList) {
                navList.that.toggleLayout();
            });            
        });   
    };
    
    var mapToNavListModel = function (items) {
        return fluid.transform(items, function (item) {
            return {
                target: item.url,
                image: item.imageUrl,
                title: item.title,
                description: item.description,
                showBadge: item.media
            };
        });
    };
    
    var generateHeaderForCategory = function (category, component, strings, styles) {
        var description = category.description;
        var headerValues = {
            category: !category.name ? strings.allObjects : category.name, 
            size: category.items.length
        };
        
        var localizedName = fluid.stringTemplate(strings.categoryHeader, headerValues);
        component.cabinetHandle = description ? {
            decorators: [{
                type: "addClass",
                classes: styles.listHeaderDescription
            }]
        } : {};
        component.listHeader = localizedName;
        if (description) {
            component.listHeaderDescription = description;
        }
    };
    
    var assembleTree = function (that) {
        that.navLists = [];
        var protoTree = { 
            title: that.model.title ? {messagekey: "title", args: {title: "%title"}} : "",
            lists: { 
                children: fluid.transform(that.model.categories || [], function (category, index) {
                    that.navLists[index] = {
                        type: "fluid",
                        func: "fluid.navigationList",
                        options: fluid.merge("merge", fluid.copy(that.options.navigationList.options), {model: mapToNavListModel(category.items)})
                    };
                    var child = {
                        listContents: {
                            decorators: that.navLists[index]
                        }
                    };
                    
                    // TODO: This whole issue of whether or not to render headers speaks to the fact that we actually
                    // need to do some refactoring to Cabinet and Browse. In the meantime, this is ugly.
                    if (index > 0 || that.options.showHeaderForFirstCategory) {
                        generateHeaderForCategory(category, child, that.options.strings, that.options.styles);
                    }
                    return child;
                })
            }
        };
        
        var expander = fluid.renderer.makeProtoExpander({ELstyle: "%"});
        return expander(protoTree);
    };
    
    /**
     * Executes the various functions required to properly setup the component
     * 
     * @param {Object} that, the component
     */
    var setup = function (that) {
        bindEvents(that);
        var messageLocator = fluid.messageLocator(that.options.strings, fluid.stringTemplate);
        var selectorsToIgnore = ["browseDescription", "browseContents"];
        
        //Checks the showToggle option.
        //A selector "toggle" is expressed in the selectors object, and the renderer is only told to ignore it, if we want to display it.
        //This takes advantage of the renderer's feature that will strip out markup that has a selector mapped but no associated node in the component tree.
        //Since the toggle button is just markup, and no component tree node ever added, not ignoring it will trigger the renderer to not display it.
        if (that.options.showToggle) {
            selectorsToIgnore.push("toggle");
        }
        
        that.render = fluid.engage.renderUtils.createRendererFunction(that.container, that.options.selectors, {
            selectorsToIgnore: selectorsToIgnore,
            repeatingSelectors: ["lists"],
            rendererOptions: {
                messageLocator: messageLocator,
                model: that.model
            }
        });
        that.refreshView();
        that.events.afterRender.fire(that);
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
                
        that.refreshView = function () {
            that.render(assembleTree(that));
            initSubcomponents(that);
        };
        
        setup(that);
        return that;
    };
    
    fluid.defaults("fluid.browse", {
        navigationBar: {
            type: "fluid.engage.navigationBar"
        },
        
        cabinet: {
            type: "fluid.cabinet"
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
            categoryHeader: "%category (%size total)",
            allObjects: "all objects",
            title: "%title"
        },
        
        events: {
            afterRender: null
        },
        
        useCabinet: false,
        showToggle: true,
        
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