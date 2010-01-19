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
     * Creates a render component for the component tree. The key can be any key that a componet tree would take and the value is what would be assigned to it.
     * For example if you wanted to have node that just prints out "Hello World" you could set the key to "value" and the value to "Hello World"
     * 
     * @param {Object} id, the ID used by the component tree
     * @param {Object} key, a key representing an entry in a renderer component
     * @param {Object} value, the value assigned to the key
     * @param {Object} classes, (optional) can add classes without having to specify the decorator key. 
     */
    var treeNode = function (id, key, value) {
        var obj = {ID: id};
        obj[key] = value;
        
        return obj;
    };
    
    /**
     * Children that will be attached to the branch. If no description is provided no markup related to it will be rendered
     * 
     * @param {Object} titleID, the ID used by the component tree for the title
     * @param {Object} title, the title to be rendered
     * @param {Object} descriptionID, the ID used by the component tree for the description
     * @param {Object} description, the description to be rendered
     */
    var branchChildren = function (titleID, title, descriptionID, description) {
        title = title || "";
        
        var obj = [
            treeNode(titleID, "value", title)
        ];
        
        if (description && description !== "") {
            obj.push(treeNode(descriptionID, "value", description));
        }
        
        return obj;
    };
    
    /**
     * Traverses through an array of objects returning an array of all the values for a specified key.
     * 
     * @param {Object} array, an array of Objects to search through
     * @param {Object} key, the key for whose value to return from each object. Will return an empty string "",
     * if the key does not exist in the any of the objects.
     */
    var extractArray = function (array, key) {
        return fluid.transform(array, function (object, index) {
            return object[key] || null;
        });
    };
    
    /**
     * Used to initialize multiple navigationList components
     * 
     * @param {Object} container, the set of container elements used by the navigationLists
     * @param {Object} options, an array of options to be used by the navigationLists
     */
    var initComponents = function (that, navListContainers, artifactsByCategory) {
        navListContainers.each(function (idx, container) {          
            // Transform Browse's model of artifacts into NavList's generic model consisting of link objects.
            var navListModel = fluid.transform(artifactsByCategory[idx], function (artifact) {
                return {
                    target: artifact.url,
                    image: artifact.imageUrl,
                    title: artifact.title,
                    description: artifact.description
                };
            });
            
            var componentOptions = fluid.copy(that.options.navigationList.options);  
            fluid.merge("merge", componentOptions, {links: navListModel});
            fluid.initSubcomponent(that, "navigationList", [container, componentOptions]);
        });
    };
    
    /**
     * Adds the style necessary for the cabinet headers that have descriptions
     * 
     * @param {Object} that, the component
     */
    var addDescriptionStyle = function (that) {
        fluid.transform(that.locate("cabinetHandle"), function (object, index) {
            if ($(that.options.selectors.listHeaderDescription, object).length > 0) {
                $(object).addClass(that.options.styles.listHeaderDescription);
            }
        });
    };
    
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
        var selectorMap = [
            {selector: that.options.selectors.lists, id: "lists:"},
            {selector: that.options.selectors.listHeader, id: "listHeader"},
            {selector: that.options.selectors.listHeaderDescription, id: "listHeaderDescription"}
        ];

        var renderTree = function () {
            return fluid.transform(that.model.categories, function (category) {
                return {
                    ID: "lists:",
                    children: branchChildren("listHeader", category.name, "listHeaderDescription", category.description)
                };
            });
        };
        
        fluid.selfRender(that.locate("browseContents"), renderTree(), {cutpoints: selectorMap});
        initComponents(that, that.locate("lists"), extractArray(that.model.categories, "artifacts"));
        addDescriptionStyle(that);
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
        that.description = fluid.initSubcomponent(that, "description", [that.locate("browseDescriptionContainer"), fluid.COMPONENT_OPTIONS]);
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
                    artifacts: [{
                        description: ""
                    }]
                }
            ]
        }
    });
    
})(jQuery);