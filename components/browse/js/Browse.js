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
     * Renderers out the pieces of the component
     * 
     * @param {Object} that,the component
     */
    var renderBrowse = function (that) {

        var utils = fluid.engage.renderUtils;
        var renderOpts = {
            selectorsToIgnore: ["title", "browseDescription", "browseContents", "browseDescriptionContainer"],
            repeatingSelectors: ["lists"]
        };
        
        var renderer = utils.createRendererFunction(that.container, that.options.selectors, renderOpts);
        
        var tree = fluid.transform(that.model.categories, function (category) {
            var children = [];
            var description = category.description;
            var name = category.name;
            if (name) {
                children.push(utils.uiBound("cabinetHandle"));
                children.push(utils.uiBound("listHeader", name));
                if (description) {
                    children.push(utils.decoratedUIBound("listHeaderDescription", [{
                        type: "jQuery",
                        func: "addClass",
                        args: that.options.styles.listHeaderDescription
                    }], description));
                }
            }
            var navListModel = fluid.transform(category.items, function (item) {
                return {
                    target: item.url,
                    image: item.imageUrl,
                    title: item.title,
                    description: item.description
                };
            });
            children.push(utils.decoratedUIBound("listContents", [{
                type: "fluid",
                func: "fluid.navigationList",
                options: fluid.merge("merge", fluid.copy(that.options.navigationList.options), {links: navListModel})
            }]));
            return utils.uiContainer("lists:", children);
        });
        
        renderer(tree);
    };
    
    /**
     * Initializes the Cabinet component which is used as a subcomponent
     * 
     * @param {Object} that, the componet
     */
    var initCabinet = function (that) {
        that.cabinet = fluid.initSubcomponent(that, "cabinet", [that.locate("browseContents"), fluid.COMPONENT_OPTIONS]);
    };
    
    /**
     * Initializes the Description component which is used as a subcomponent
     * 
     * @param {Object} that, the component
     */
    var initDescription = function (that) {
        var descr = that.model.desription;
        if (descr) {
            that.description = fluid.initSubcomponent(that, "description", 
            [that.locate("browseDescriptionContainer"), 
            fluid.merge("merge", fluid.copy(that.options.description.options), {model: descr})]);
        }
        else {
            that.locate("browseDescriptionContainer").remove();
        }
    };
    
    /**
     * Executes the various functions required to properly setup the component
     * 
     * @param {Object} that, the component
     */
    var setup = function (that) {
        bindEvents(that);
        that.locate("title").text(that.title); // Set the page title
        initDescription(that);
        renderBrowse(that);
        that.events.afterRender.fire(that);
        //Initializing the cabinet must come after all of the rendering is complete and the markup is displayed
        if (that.options.useCabinet) {
            initCabinet(that);
        }
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
        that.title = that.options.title || that.model.categories[0].name;
        
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
            lists: ".flc-cabinet-drawer"
        },
        
        styles: {
            load: "fl-browse-loading",
            browseContents: "fl-browse-contents",
            browseDescription: "fl-browse-description",
            listHeaderDescription: "fl-cabinet-headerWithDescription"
        },
        
        events: {
            afterRender: null
        },
        
        useCabinet: false,
        
        title: null,
        
        model: {
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