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
     * Creates a model child node.
     *  
     * @param {Object} id, the ID used by the component tree
     * @param {Object} key, a key representing an entry in a renderer component
     * @param {Object} value, the value assigned to the key
     * @param {Object} classes, can add classes without having to specify the
     *      decorator key.
     */
    var treeNode = function (id, key, value, classes) {
        var obj = {ID: id};
        obj[key] = value;
        if (classes) {
            obj.decorators = {
                type: "addClass",
                classes: classes
            };
        }
        
        return obj; 
    };
    
    /**
     * Creates a model top node.
     * 
     * @param {Object} id, the ID used by the component tree
     * @param {Object} key, a key representing an entry in a renderer component
     * @param {Object} value, the value assigned to the key
     * @param {Object} classes, can add classes without having to specify the 
     *      decorator key.
     * @param index, the index of this tree node that is used to map the feed
     *      data with the current order.
     * @param artifactId, the artifact CouchDB id.
     * @param museum, the museum for the artifact.
     */
    var topTreeNode = function (id, key, value, classes, index, artifactId, museum) {
        var obj = treeNode(id, key, value, classes);
        
        obj.index = index;
        obj.artifactId = artifactId;
        obj.museum = museum;
        
        return obj;
    };

    /**
     * Generates the component tree used by the renderer.
     * 
     * @param {Object} that, the component.
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
                    
                    object.children.push(
                            treeNode("titleText", "value",
                                    that.options.data.links[index].title,
                                    styles.titleText));
                    object.children.push(
                            treeNode("periodText", "value",
                                    that.options.data.links[index].dated,
                                    styles.periodText));
                } else {
                    object.children.pop();
                    object.children.pop();
                }
            });
        } else {
            that.model = fluid.transform(componentOptions.links, function (object, index) {
                var tree = topTreeNode("listItems:", "children", [
                    treeNode("link", "target", object.target || "", styles.link)
                ], styles.listItems, index, object.id, object.museum);
        
                if (object.image || that.options.useDefaultImage) {
                    tree.children.push({
                        ID: "image",
                        target: object.image || that.options.defaultImage
                    });
                }

                if (that.currentView === "list") {
                    tree.children.push(
                            treeNode("titleText", "value", object.title,
                                    styles.titleText));
                    tree.children.push(
                            treeNode("periodText", "value", object.dated,
                                    styles.periodText));
                }
                
                return tree;
            });        
        }
        
        return that.model;
    };

    /**
     * Renders the component based on values passed into the options.
     * 
     * @param {Object} that, the component.
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
            fluid.reRender(that.templates, that.locate("collectionGroup"),
                generateTree(that));
            that.events.afterRender.fire(that);
        } else {
            var options = {
                cutpoints: selectorMap
            };
            
            return fluid.selfRender(that.locate("collectionGroup"),
                generateTree(that), options);
        }
    };

    /**
     * Changes the style on the group containing the list of links, transition
     * from grid to list to grid.
     * 
     * @param {Object} that, the component.
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
     * 
     * @param {Object} that, the component.
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
     * @param {Object} that, the component.
     */
    var addLoadingStyling = function (that) {
        that.container.addClass(that.options.styles.load);
    };

    /**
     * Removes the loading style from the component, so that the rendered page is displayed
     * 
     * @param {Object} that, the component.
     */
    var removeLoadingStyling = function (that) {
        that.container.removeClass(that.options.styles.load);
    };

    /**
     * Refreshes the reorderer.
     * 
     * @param {Object} that, the component.
     */
    var refreshReorderer = function (that) {
        if (that.imageReorderer) {
            that.imageReorderer.refresh();
        }
    };
    
    /**
     * Assigns the href attribute to the back button to document.referrer.
     * 
     * @param {Object} that, the component.
     */
    var initBackLink = function (that) {
        var backUrl = document.referrer;
        if (backUrl.indexOf("uuid") < 0) { // Workaround for the case when
                                           // we come from the artifact page
                                           // for the first time.
            backUrl += "&" + $.param({uuid: that.uuid});
        }
        that.locate("backButton").attr("href", backUrl);
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
     * Invokes an update on CouchDB with the new order of artifacts in the collection.
     * 
     * @param {Object} model, the underlying data model.
     * @param uuid, the id of the user and collection.
     */
    var updateDatabaseOrder = function (that) {
        var error = function (XMLHttpRequest, textStatus, errorThrown) {
            fluid.log("Status: " + textStatus);
            fluid.log("Error: " + errorThrown);
        };
        
        var data = {};
        data.collection = {};
        data.collection.artifacts = [];
        
        fluid.transform(that.model, function (object) {
            data.collection.artifacts.push({museum: object.museum, id: object.artifactId});
        });

        var pathname = location.pathname;
        var path = pathname.substring(0, pathname.lastIndexOf("/"));
        var url = "http://" + location.host + path + "/reorder.js";
        
        var toSend = fluid.stringTemplate(that.options.updateDatabaseOrderDataTemplate, 
            {
                uuid: that.uuid,
                orderData: encodeURIComponent(JSON.stringify(data))
            });
        
        $.ajax({
            url: url,
            async: false,
            data: toSend,
            error: error
        });
    };            
    
    /**
     * Initializes all elements of the collection view that have not been initialized.
     * 
     * @param {Object} that, the component
     */
    var setup = function (that) {
        that.templates = render(that);

        // Set the status message
        var status = fluid.stringTemplate(
            that.options.strings.statusMessageTemplate, {
                artifactsNumber: that.options.data.links.length,
                artifactsPlural: that.options.data.links.length === 1 ? "" : "s"
            }
        );
        that.locate("collectionStatus").html(status);
        
        that.currentView = that.options.defaultView;
        
        // Set the style for artifact group
        addGroupStyle(that);

        // Attach a handler to the toggle view button
        that.locate("toggler").click(that.toggleView);
        
        // Set a link target for the back button
        initBackLink(that);

        // Bind events
        that.events.afterRender.addListener(removeLoadingStyling);
        that.events.afterRender.addListener(refreshReorderer);        
        that.events.afterRender.fire(that);
        
        that.options.imageReorderer.options.listeners.afterMove = that.afterMoveListener;
        that.options.imageReorderer.options.listeners.onBeginMove = that.onBeginMoveListener;
        that.options.imageReorderer.options.avatarCreator = that.avatarCreator;
        
        // Init subcomponents
        
        that.imageReorderer = fluid.initSubcomponent(that, "imageReorderer",
                [that.locate("myCollectionContainer"),
                 that.options.imageReorderer.options]);
        
        that.user = fluid.initSubcomponent(that, "user");
        that.uuid = that.user.getUuid();
    };

    /**
     * The component's creator function. 
     * 
     * @param {Object} container, the container which will hold the component
     * @param {Object} options, options passed into the component
     */
    fluid.initMyCollection = function (container, options) {
        var that = fluid.initView("fluid.initMyCollection", container, options);

        that.toggleView = function () {
            addLoadingStyling(that);

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
            
            if (that.options.updateDatabaseOrder) {
                updateDatabaseOrder(that);
            }
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
                        movables: ".flc-myCollection-movable"
                    },                    
                    styles: {
                        defaultStyle: null,
                        selected: null,
                        dragging: null,
                        mouseDrag: "fl-invisible",
                        dropMarker: "fl-myCollection-dropMarker"
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
                collectionStatus: ".flc-myCollection-status"
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

            data: {},

            useDefaultImage: true,
            
            defaultImage: "../../../../fluid-engage-core/components/myCollection/images/no_image_64x64.png",
                 
            defaultView: "grid",
            
            strings: {
                statusMessageTemplate:
                    "Your collection contains %artifactsNumber artifact" +
                    "%artifactsPlural. Touch and drag the thumbnails to reorganize."
            },
            
            updateDatabaseOrder: true,
            
            updateDatabaseOrderDataTemplate: "uuid=%uuid&orderData=%orderData"
        }
    );
})(jQuery);