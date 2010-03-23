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
     * Generates the component tree
     * 
     * @param {object} model, the components model
     * @param {object} options, the components options
     */
    var generateTree = function (model, options) {
        return {
            children: fluid.transform(model, function (navListItem) {
                var itemSubtree = {
                    ID: "listItems:", 
                    children: [
                        {
                            ID: "link",
                            target: navListItem.target || ""
                        },
                        {
                            ID: "titleText",
                            value: navListItem.title || ""
                        }
                    ]
                };
                
                if (navListItem.description) {
                    itemSubtree.children.push({
                        ID: "descriptionText", 
                        value: navListItem.description
                    });
                }
                
                if (navListItem.image || options.useDefaultImage) {
                    itemSubtree.children.push({
                        ID: "image",
                        target: navListItem.image,
                        decorators: {
                            type: "attrs",
                            attributes: {
                                alt: navListItem.title || ""
                            }
                        }
                    });
                }
                
                if (navListItem.showBadge) {
                    itemSubtree.children.push({
                        ID: "badgeIcon",
                        target: options.badgeIconUrl
                    });
                }

                return itemSubtree;
            })
        };
    }; 
    
    /**
     * Will transform the model based on a provided model map.
     * If no modelMap provided, the model itself will be returned, unchanged.
     * 
     * @param {object} model, the model data to be mapped
     * @param {object} modelMap, the optional map for which transformation of the model will be based on.
     */
    var mapModel = function (model, modelMap) {
        var map = function () {
            return fluid.transform(model, function (listItem) {
                var obj = {};
                for (var key in modelMap) {
                    obj[key] = fluid.model.getBeanValue(listItem, modelMap[key]);
                }
                return obj;
            });
        };
        
        return modelMap ? map() : model;
    };
    
    /**
     * The general setup function that calls the functions that need to be run on init
     * 
     * @param {Object} that, the component
     */
    var setup = function (that) {
        var sel = that.options.selectors;
         
        var cutpoints = [
            {id: "listItems:", selector: sel.listItems},
            {id: "link", selector: sel.link},
            {id: "image", selector: sel.image},
            {id: "titleText", selector: sel.titleText},
            {id: "descriptionText", selector: sel.descriptionText},
            {id: "badgeIcon", selector: sel.badgeIcon}
        ];
        
        var renderOpts = {cutpoints: cutpoints};
    
        that.render = function (tree) {
            if (that.template) {
                fluid.reRender(that.template, that.container, tree, renderOpts);
            } else {
                that.template = fluid.selfRender(that.container, tree, renderOpts);
            }
        };

        that.refreshView();
        that.locate("gridToggle").click(that.toggleLayout);
        if (that.isGrid) {
            that.gridLayout();
        } else {
            that.listLayout();
        }
    };
    
    var styleAsGrid = function (listGroup, styles) {
        listGroup.addClass(styles.grid).removeClass(styles.list);
    };
    
    var styleAsList = function (listGroup, styles) {
        listGroup.addClass(styles.list).removeClass(styles.grid);
    };
    
    /**
     * The creator function
     * 
     * @param {Object} container, the components container
     * @param {Object} options, the options passed into the component
     */
    fluid.navigationList = function (container, options) {
        var that = fluid.initView("fluid.navigationList", container, options);
        that.isGrid = that.options.defaultToGrid;
        
        that.toggleLayout = function () {
            if (that.isGrid) {
                that.listLayout();
            } else {
                that.gridLayout();
            }
        };
        
        that.gridLayout = function () {
            styleAsGrid(that.locate("listGroup"), that.options.styles);
            that.isGrid = true;
        };
        
        that.listLayout = function () {
            styleAsList(that.locate("listGroup"), that.options.styles);
            that.isGrid = false;
        };
        
        that.refreshView = function () {
            var opts = that.options;
            that.model = mapModel(opts.model, opts.modelMap);
            that.render(generateTree(that.model, opts));
            that.events.afterRender.fire();
        };
        
        setup(that);
        
        return that;
    };
    
    /**
     * The components defaults
     */
    fluid.defaults("fluid.navigationList", {
        selectors: {
            listGroup: ".flc-navigationList-listGroup",
            listItems: ".flc-navigationList-items",
            linkContainer: ".flc-navigationList-linkContainer",
            link: ".flc-navigationList-link",
            image: ".flc-navigationList-image",
            titleText: ".flc-navigationList-titleText",
            descriptionText: ".flc-navigationList-descriptionText",
            gridToggle: ".flc-navigationList-gridToggle",
            badgeIcon: ".flc-navigationList-badge-icon"
        },
        
        styles: {
            grid: "fl-thumbnails-expanded fl-grid",
            list: "fl-list"
        },
        
        defaultToGrid: false,
        
        strings: {},
        
        events: {
            afterRender: null
        },
        
        useDefaultImage: false,
                
        badgeIconUrl: undefined,
        
        modelMap: undefined,
        
        model: [
            {
                target: "",
                image: "",
                title: "",
                description: null
            }
        ]
    });
    
})(jQuery);
