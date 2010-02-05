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
     * Creates a model node.
     * 
     * @param {Object} id, the ID used by the component tree
     * @param {Object} key, a key representing an entry in a renderer component
     * @param {Object} value, the value assigned to the key
     * @param artifactId, the artifact CouchDB id.
     * @param museum, the museum for the artifact.
     */
    var treeNode = function (artifactId, museum) {
        var obj = {};
        
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
        return fluid.transform(that.options.model.data, function (object) {
            var tree = treeNode(object.id, object.museum);
            return tree;
        });
    };
    
    /**
     * Assigns the href attribute to the back button to document.referrer.
     * 
     * @param {Object} that, the component.
     */
    var initBackLink = function (that) { 	
        var backUrl = document.referrer;
        
        if (backUrl === "") {
        	return "#";
        }
        
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
    // TODO: use splice
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
        
        var toSend = fluid.stringTemplate("uuid=%uuid&orderData=%orderData", 
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
     * Make a model for the navigation list subcomponent
     * 
     * @param model, the My Collection model
     */
    var mapToNavListModel = function (model) {
    	if (model.length == 0) {
    		return [];
    	}
        return fluid.transform(model, function (artifact) {
            return {
                target: artifact.target,
                image: artifact.image,
                title: artifact.title,
                description: artifact.dated
            };
        });
    };

    /**
     * Isolate the initialization of the navigation list here
     * @param that, the component
     */
    var initNavigationList = function (that) {
    	var navListModel = mapToNavListModel(that.options.model.data);
        fluid.merge("merge", that.options.navigationList.options, {model: navListModel});
        
        that.navigationList = fluid.initSubcomponent(that, "navigationList",
        		[that.locate("navListContainer"),
        		 that.options.navigationList.options]);
    	
        that.navigationList.events.afterRender.addListener(that.removeLoadingStyling);
        that.navigationList.events.afterRender.addListener(that.refreshReorderer);
        
        that.locate("toggler").click(function () {
        	that.navigationList.toggleLayout();
        });
    };

    /**
     * Isolate the initialization of the image reorderer here
     * @param that, the component
     */
    var initImageReorderer = function (that) {
    	if (that.options.useReorderer) {
	        that.imageReorderer = fluid.initSubcomponent(that, "imageReorderer",
	                [that.locate("myCollectionContainer"),
	                 that.options.imageReorderer.options]);
	        
	        that.imageReorderer.events.afterMove.addListener(that.afterMoveListener);
	        that.imageReorderer.events.onBeginMove.addListener(that.onBeginMoveListener);
	        that.imageReorderer.options.avatarCreator = that.avatarCreator;
    	}        
    };
    
    /**
     * Initializes all elements of the collection view that have not been initialized.
     * 
     * @param {Object} that, the component
     */
    var setup = function (that) {
    	// Create the model
    	// TODO: get the model directly from the service
    	that.model = generateTree(that);

    	// Fetch navigation list template as resources
    	var navListLink = that.locate("navListLink");
    	var navListContainer = that.locate("navListContainer");
    	var resourceSpec = {};

    	fluid.fetchResources({
    		navlist: {
    			href: navListLink.attr("href"),
    			async: false
    		},
    	}, function (resourceSpecs) {
    		var navListGroup = $(resourceSpecs.navlist.resourceText).find(".flc-navigationList-groupContainer");
    		navListContainer.html(navListGroup.html());
    		
    		// After we have fetched the template we can initialize the navigation
    		// list subcomponent and the image reorderer subcomponent.
    		// An side effect is that the component is not fully constructed after
    		// it returns from its initialization function.
        	initNavigationList(that);
        	initImageReorderer(that);
    	});

    	// User
    	that.user = fluid.initSubcomponent(that, "user");
        that.uuid = that.user.getUuid();
    	
        // Set the status message        
        var collectionSize = that.getCollectionSize();
        var status = "";
        
    	if (collectionSize > 0) {
    		status = fluid.stringTemplate(
	            that.options.strings.statusMessageTemplate, {
	                artifactsNumber: collectionSize,
	                artifactsPlural: collectionSize === 1 ? "" : "s"
	            }
            );
    	} else {
    		status = that.options.strings.emptyCollectionMessage;
    	}
  
        that.locate("collectionStatus").text(status);
        
        that.currentView = that.options.defaultView;
        
        // Set a link target for the back button
        initBackLink(that);
    };

    /**
     * The component's creator function. 
     * 
     * @param {Object} container, the container which will hold the component
     * @param {Object} options, options passed into the component
     */
    fluid.engage.myCollection = function (container, options) {
        var that = fluid.initView("fluid.engage.myCollection", container, options);

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
        
        // TODO: see if we need that
        that.avatarCreator = function (item) {
            var image = {};
            
            fluid.dom.iterateDom(item, function (node) {
                image = node;
                if ($(node).hasClass(".flc-navigationList-image")) {
                    return "stop";
                }
            }, false);
            
            return $(image).clone();
        };
        
        that.getCollectionSize = function () {
        	return that.options.model.data.length;
        };
        
        that.removeLoadingStyling = function () {
            that.container.removeClass(that.options.styles.load);
        };

        /**
         * Refreshes the reorderer.
         * 
         * @param {Object} that, the component.
         */
        that.refreshReorderer = function () {
            if (that.imageReorderer) {
                that.imageReorderer.refresh();
            }
        };
        
        setup(that);
        
        return that;
    };
    
    fluid.defaults("fluid.engage.myCollection",
        {
    		navigationList: {
        		type: "fluid.navigationList",
                options: {
                    useDefaultImage: true,
                    defaultToGrid: true
                }
    		},
    		
            user: {
                type: "fluid.user"
            },
            
            imageReorderer: {
                type: "fluid.reorderImages",
                options: {
                    selectors: {
                        movables: ".flc-navigationList-items"
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
                navListContainer: ".flc-navigationList",
                navListLink: ".flc-navigationList-link",
                backButton: ".flc-myCollection-back",
                collectionStatus: ".flc-myCollection-status",
                toggler: ".flc-myCollection-toggler"
            },

            styles: {
                load: "fl-myCollection-loading"
            },

            strings: {
            	header: "My Collection",
                statusMessageTemplate:
                    "Your collection contains %artifactsNumber artifact" +
                    "%artifactsPlural. Touch and drag the thumbnails to reorganize.",
                emptyCollectionMessage:
                	"Your collection is empty. Start adding artifacts to your " +
                	"collection by using the \"Collect\" button you find on artifact screens."
            },
            
            updateDatabaseOrder: true,
            
            useReorderer: false           
        }
    );
})(jQuery);