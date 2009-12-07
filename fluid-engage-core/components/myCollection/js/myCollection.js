/*
 Copyright 2009 University of Toronto

 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.

 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt

 */
/*global jQuery, fluid*/

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
    var treeNode = function (id, key, value, classes, index) {
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

        return obj; 
    };

    var generateTree = function (that) {
        var styles = that.options.styles;
        
        var componentOptions = {
            useDefaultImage: that.options.useDefaultImages
        };
        
        fluid.merge("merge", componentOptions, that.options.data);

        if (that.model) {
            // TODO: manipulate the model in a more jQuery-like way
            for (var i = 0; i < that.model.length; i++) {
                var object = that.model[i];
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
            }
        } else {
            that.model = fluid.transform(componentOptions.links, function (object, index) {
                var tree = treeNode("listItems:", "children", [
                    treeNode("link", "target", object.target || "", styles.link)
                ], styles.listItems, index);
        
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
     * Renders the copmonent based on values passed into the options
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
                    href: "myCollection.html", // find a way to avoid hardcoding this
                    cutpoints: selectorMap
                }
            };

            fluid.fetchResources(resources, function () {
                fluid.reRender(that.templates, that.locate("collectionGroup"), generateTree(that));
                that.events.afterRender.fire(that);
            });
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
     * The styles to be set on the group containing the list of links
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
    
    var removeGroupStyle = function (that) {     
        if (that.currentView === "grid") {
            that.locate("collectionGroup").removeClass(that.options.styles.gridGroup);
        } else {
            that.locate("collectionGroup").removeClass(that.options.styles.listGroup);
        }
    };

    var styleToggler = function (that) {
        that.locate("toggler").addClass(that.options.styles.toggler);
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

    var addClickEvent = function (that) {
        that.locate("toggler").click(that.toggleView);
    };
    
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

    var ajaxCall = function (url, error, data) {
        $.ajax({
            url: url,
            dataType: "text",
            async: false,
            data: data,
            error: error
        });
    };
    
    var parsePath = function(pathname) {
        return pathname.substring(0, pathname.lastIndexOf("/"));
    };
    
    var testCouch = function() {
        var error = function (XMLHttpRequest, textStatus, errorThrown) {
            fluid.log("XMLHttpRequest: " + XMLHttpRequest);
            fluid.log("Status: " + textStatus);
            fluid.log("Error: " + errorThrown);
            fluid.log(errorThrown);
        };
        
        var data = {"_id":"c6cf773089bdf684dcd66981cbd95d81", "userid":"5000"};
        
        var path = parsePath(location.pathname);
        
        ajaxCall("http://" + location.host + path + "/updateDatabase.js",
                error, data);
    }
    
    var setup = function (that) {
        that.templates = render(that);

        that.currentView = that.options.defaultView;
        
        addGroupStyle(that);
        styleToggler(that);

        addClickEvent(that);

        bindEvents(that);
        that.events.afterRender.fire(that);
        
        that.options.imageReorderer.options.listeners.afterMove = that.afterMoveListener;
        that.options.imageReorderer.options.listeners.onBeginMove = that.onBeginMoveListener;
        
        that.imageReorderer = fluid.initSubcomponent(that, "imageReorderer", [that.locate("myCollectionContainer"),
                                                                              that.options.imageReorderer.options]);
        
        testCouch();
        
    };

    fluid.initMyCollection = function (container, options) {
        var that = fluid.initView("fluid.initMyCollection", container, options);

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
        };
        
        that.onBeginMoveListener = function (item) {
            that.reordererModel = that.imageReorderer.dom.fastLocate("movables");
        };

        setup(that);

        return that;
    };
    
    fluid.defaults("fluid.initMyCollection",
        {
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
                        mouseDrag: null,
                        hover: null,
                        dropMarker: null,
                        avatar: null
                    },
                            
                    listeners: {
                        afterMove: null,
                        onBeginMove: null
                    }
                }
            },
                
            selectors: {
                myCollectionContainer: ".flc-myCollection-imageContainer",
                title: ".flc-myCollection-title",
                myCollectionContents: ".flc-myCollection-contents",
                lists: ".flc-myCollection-lists",           
                collectionGroup: ".flc-myCollection-listGroup",
                listItems: ".flc-myCollection-items",
                link: ".flc-myCollection-link",
                image: ".flc-myCollection-image",
                titleText: ".flc-myCollection-titleText",
                periodText: ".flc-myCollection-period",         
                toggler: ".flc-myCollection-toggler"
            },

            styles: {
                load: "fl-browse-loading",
                myCollectionContents: "fl-myCollection-contents",
                link: null,         
                listGroup: "fl-list",
                gridGroup: "fl-grid",
                titleText: null,
                periodText: null,           
                toggler: "fl-clickable"
            },

            events: {
                afterRender: null
            },

            data : {},

            links: [
                {
                    target: "",
                    image: "",
                    title: "",
                    dated: "",
                    category: null,
                    size: null
                }
            ],
            
            useDefaultImage: true,
                 
            defaultView: "grid"
        }
    );

})(jQuery);