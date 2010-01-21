/*
 Copyright 2009 University of Toronto

 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.

 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt

 */
/*global jQuery, fluid, window*/

fluid = fluid || {};

(function ($) {
    /**
     * Creates a render component for the component tree. The key can be any key that a component tree would take and the value is what would be assigned to it.
     * For example if you wanted to have node that just prints out "Hello World" you could set the key to "value" and the value to "Hello World"
     * 
     * @param {Object} id, the ID used by the component tree
     * @param {Object} key, a key representing an entry in a renderer component
     * @param {Object} value, the value assigned to the key
     * @param {Object} classes, (optional) can add classes without having to specify the decorator key.
     * @param index, (optional - only for top level nodes) the index of this tree node that is used to map
     * the feed data with the current order.
     * @param artifactId, (optional - only for top level nodes) the artifact CouchDB id. 
     */
    var treeNode = function (id, key, value, classes, index, artifactId, museum) {
        var obj = {ID: id};
        obj[key] = value;
        if (classes) {
            obj.decorators = {
                    type: "addClass",
                    classes: classes
                };
        }
        
        if (index === 0 || index) {
            obj.index = index;
        }
        
        if (artifactId && museum) {
            obj.artifactId = artifactId;
            obj.museum = museum;
        }

        return obj; 
    };

    /**
     * Generates the component tree used by the renderer
     * 
     * @param {Object} that, the component
     */
    var generateTree = function (that) {
        var styles = that.options.styles;
        
        var componentOptions = {
            useDefaultImage: that.options.useDefaultImages
        };
        
        fluid.merge("merge", componentOptions, that.options.data);

        if (that.model) {
            fluid.transform(that.model, function (object) {
                if (that.currentView === "list") {
                    var index = object.index;
                    
                    object.children.push(treeNode("titleText", "value", that.options.data.links[index].title,
                            styles.titleText));
                    object.children.push(treeNode("periodText", "value", that.options.data.links[index].dated,
                            styles.periodText));
                } else {
                    object.children.pop();
                    object.children.pop();
                }
            });
        } else {
            that.model = fluid.transform(componentOptions.links, function (object, index) {
                var tree = treeNode("listItems:", "children", [
                    treeNode("link", "target", object.target || "", styles.link)
                ], styles.listItems, index, object.id, object.museum);
        
                if (object.image || that.options.useDefaultImage) {
                    tree.children.push({
                        ID: "image",
                        target: object.image,
                        decorators: [{
                            type: "addClass",
                            classes: styles.image
                        }]
                    });
                }

                if (that.currentView === "list") {
                    tree.children.push(treeNode("titleText", "value", object.title, styles.titleText));
                    tree.children.push(treeNode("periodText", "value", object.dated, styles.periodText));
                }
                
                return tree;
            });        
        }
        
        return that.model;
    };

    /**
     * Renders the component based on values passed into the options
     * 
     * @param {Object} that, the component
     */
    var render = function (that) {
        var selectorMap = [ 
            {selector: that.options.selectors.listItems, id: "listItems:"},
            {selector: that.options.selectors.link, id: "link"},
            {selector: that.options.selectors.image, id: "image"},
            {selector: that.options.selectors.titleText, id: "titleText"},
            {selector: that.options.selectors.periodText, id: "periodText"}
        ];

        if (that.templates) {
            var resources = {
                myCollection: {
                    href: "myCollection.html",
                    cutpoints: selectorMap
                }
            };

            fluid.reRender(that.templates, that.locate("collectionGroup"), generateTree(that));
            that.events.afterRender.fire(that);
        } else {
            var options = {
                cutpoints: selectorMap,
                messageSource: {
                    type: "data"
                }           
            };
            
            return fluid.selfRender(that.locate("collectionGroup"), generateTree(that), options);
        }
    };

    /**
     * Changes the style on the group containing the list of links, transition from grid to list to grid.
     * 
     * @param {Object} that, the component
     */
    var addGroupStyle = function (that) {
        if (that.currentView === "grid") {
            that.locate("collectionGroup").addClass(that.options.styles.gridGroup);
        } else {
            that.locate("collectionGroup").addClass(that.options.styles.listGroup);
        }
    };
    
    /**
     * Removes the style on the group containing the list of links.
     */
    var removeGroupStyle = function (that) {     
        if (that.currentView === "grid") {
            that.locate("collectionGroup").removeClass(that.options.styles.gridGroup);
        } else {
            that.locate("collectionGroup").removeClass(that.options.styles.listGroup);
        }
    };

    /**
     * Adds the loading style from the component, so that the loading message is displayed
     * 
     * @param {Object} that, the component
     */
    var addLoadStyling = function (that) {
        that.container.addClass(that.options.styles.load);
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
     * Refreshes the reorderer.
     * 
     * @param {Object} that, the component
     */
    var refreshReorderer = function (that) {
        if (that.imageReorderer) {
            that.imageReorderer.refresh();
        }
    };
    
    /**
     * Binds the after render event to a lister that calls the removeLoadStyling function
     * 
     * @param {Object} that, the component
     */
    var bindEvents = function (that) {
        that.events.afterRender.addListener(removeLoadStyling);
        that.events.afterRender.addListener(refreshReorderer);
    };

    /**
     * Add the event to be triggered when the toggle view link is clicked.
     * 
     * @param {Object} that, the component
     */
    var addClickEvent = function (that) {
        that.locate("toggler").click(that.toggleView);
    };
    
    var addBackEvent = function (that) {
        that.locate("backButton").click(function () {
            window.history.back();
        });
    };
    
    /**
     * Reorders the model by manipulating the array.
     * 
     * @param {Object} model, the underlying data model.
     * @param index, the new index of a moved element.
     * @param oldIndex, the old index of a moved element.
     */
    var reorderModel = function (model, index, oldIndex) {
        var result = [];
        var start = [];
        var middle = [];
        var end = [];

        if (index > oldIndex) {
            start = model.slice(0, oldIndex);
            middle = model.slice(oldIndex + 1, index + 1);
            end = model.slice(index + 1);
            
            result = start.concat(middle);
            result.push(model[oldIndex]);               
            result = result.concat(end);                
        } else {
            start = model.slice(0, index);
            middle = model.slice(index, oldIndex);
            end = model.slice(oldIndex + 1);
            
            result = start;
            result.push(model[oldIndex]);
            result = result.concat(middle).concat(end);
        }
        
        return result;
    };
    
    /**
     * Returns the directory part of a path.
     */
    var parsePath = function (pathname) {
        return pathname.substring(0, pathname.lastIndexOf("/"));
    };
    
    /**
     * Invokes jQuery $.ajax function.
     * 
     * @param url, the url to call
     * @param error, the error callback
     * @param data, the data to pass
     */
    var ajaxCall = function (url, error, data) {
        $.ajax({
            url: url,
            async: false,
            data: data,
            error: error
        });
    };
    
    /**
     * Returns the update URL relative to the current host.
     * 
     * @param path, the path segment of the URL.
     */
    var compileReorderUrl = function (path) {
        return "http://" + location.host + path + "/reorder.js";
    };
    
    /**
     * Invokes an update on CouchDB with the new order of artifacts in the collection.
     * 
     * @param {Object} model, the underlying data model.
     * @param uuid, the id of the user and collection.
     */
    var updateOrder = function (model, uuid) {
        var error = function (XMLHttpRequest, textStatus, errorThrown) {
            fluid.log("Status: " + textStatus);
            fluid.log("Error: " + errorThrown);
        };
        
        var data = {};
        data.collection = {};
        data.collection.artifacts = [];
        
        fluid.transform(model, function (object) {
            data.collection.artifacts.push({museum: object.museum, id: object.artifactId});
        });

        var path = parsePath(location.pathname);
        
        try {
        	ajaxCall(compileReorderUrl(path), error, "uuid=" + uuid + "&orderData=" +
                encodeURIComponent(JSON.stringify(data)));
        } catch (e) {};
    };            
    
    /**
     * Initializes all elements of the collection view that have not been initialized.
     * 
     * @param {Object} that, the component
     */
    var setup = function (that) {
        that.templates = render(that);
        that.locate("artifactsNumber").html(that.options.data.links.length);
        that.locate("artifactsPlural").html(that.options.data.links.length === 1 ? "" : "s");

        that.currentView = that.options.defaultView;
        
        addGroupStyle(that);

        addClickEvent(that);
        addBackEvent(that);

        bindEvents(that);
        that.events.afterRender.fire(that);
        
        that.options.imageReorderer.options.listeners.afterMove = that.afterMoveListener;
        that.options.imageReorderer.options.listeners.onBeginMove = that.onBeginMoveListener;
        that.options.imageReorderer.options.avatarCreator = that.avatarCreator;
        
        that.imageReorderer = fluid.initSubcomponent(that, "imageReorderer", [that.locate("myCollectionContainer"),
                                                                              that.options.imageReorderer.options]);
    };

    /**
     * The component's creator function 
     * 
     * @param {Object} container, the container which will hold the component
     * @param {Object} options, options passed into the component
     */
    fluid.initMyCollection = function (container, options) {
        var that = fluid.initView("fluid.initMyCollection", container, options);

        that.user = fluid.initSubcomponent(that, "user");

        that.uuid = that.user.getUuid();

        that.toggleView = function () {
            addLoadStyling(that);

            removeGroupStyle(that);

            if (that.currentView === "grid") {
                that.currentView = "list";
            } else {
                that.currentView = "grid";
            }

            addGroupStyle(that);

            render(that);
        };
        
        that.afterMoveListener = function (object, requestedPosition, allObjects) {
            var index = allObjects.index(object);
            var oldIndex = that.reordererModel.index(object);

            if (index === oldIndex) {
                return;
            }
            
            that.model = reorderModel(that.model, index, oldIndex);
            
            updateOrder(that.model, that.uuid);
        };
        
        that.onBeginMoveListener = function (item) {
            that.reordererModel = that.imageReorderer.dom.fastLocate("movables");
        };
        
        that.avatarCreator = function (item) {
            var image = {};
            
            fluid.dom.iterateDom(item, function (node) {
                image = node;
                if ($(node).hasClass(".flc-myCollection-image")) {
                    return "stop";
                }
            }, false);
            
            return $(image).clone();
        };
        
        setup(that);
        
        return that;
    };
    
    fluid.defaults("fluid.initMyCollection",
        {
            user: {
                type: "fluid.user"
            },
            imageReorderer: {
                type: "fluid.reorderImages",
                options: {
                    selectors: {
                        movables: ".flc-myCollection-movable",
                        selectables: ".flc-myCollection-movable",
                        dropTargets: ".flc-myCollection-movable"
                    },                    
                    styles: {
                        defaultStyle: null,
                        selected: null,
                        dragging: null,
                        mouseDrag: "fl-invisible",
                        dropMarker: "fl-myCollection-dropMarker",
                    },                            
                    listeners: {
                        afterMove: null,
                        onBeginMove: null
                    },                    
                    avatarCreator: null
                }
            },
                
            selectors: {
                myCollectionContainer: ".flc-myCollection-imageContainer",
                collectionGroup: ".flc-myCollection-listGroup",
                listItems: ".flc-myCollection-items",
                link: ".flc-myCollection-link",
                image: ".flc-myCollection-image",
                titleText: ".flc-myCollection-titleText",
                periodText: ".flc-myCollection-period",         
                toggler: ".flc-myCollection-toggler",
                backButton: ".flc-myCollection-back",
                artifactsNumber: ".flc-myCollection-artifactsNumber",
                artifactsPlural: ".flc-myCollection-artifactsPlural"
            },

            styles: {
                load: "fl-myCollection-loading",
                link: null,         
                listGroup: "fl-list",
                gridGroup: "fl-grid",
                titleText: null,
                periodText: null           
            },

            events: {
                afterRender: null
            },

            data : {},

            useDefaultImage: true,
                 
            defaultView: "grid"
        }
    );

})(jQuery);