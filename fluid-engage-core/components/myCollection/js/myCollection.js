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
     * Will return the result of a function wich is run based on a condition.
     * 
     * @param {Object} condition, the test condition
     * @param {Object} onTrue, the function to run if the condition passes
     * @param {Object} onFalse, the function to run if the condition fails
     */
    var conditionalNode = function (condition, onTrue, onFalse) {
        var func = condition ? onTrue : onFalse;

        return func();
    };

    var generateTree = function (that, componentOptions) {
        var styles = that.options.styles;
        return fluid.transform(componentOptions.links, function (object) {
            var title = object.title || "";
            var tree = treeNode("listItems:", "children", [
                                                           	treeNode("link", "target", object.target || "", styles.link),
                                                           	], styles.listItems);

            if (that.currentView === "list") {
                tree.children.push(treeNode("titleText", "value", title, styles.titleText));
                tree.children.push(treeNode("periodText", "value", object.dated, styles.periodText));
            }

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
            
            return tree;
        });
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

        var componentOptions = {
                useDefaultImage: true
        };
        
        that.locate("lists").each(function (index) {
            fluid.merge("merge", componentOptions, extractArray(that.options.lists, "listOptions")[index]);
        });

        if (that.templates) {
            var resources = {
                myCollection: {
        			href: "myCollection.html", // find a way to avoid hardcoding this
        			cutpoints: selectorMap
        		}
            };

	        fluid.fetchResources(resources, function () {
	            fluid.reRender(that.templates, that.locate("listGroup"), generateTree(that, componentOptions));
	            that.events.afterRender.fire(that);
	        });
        } else {
            var options = {
                    cutpoints: selectorMap,
                    messageSource: {
            			type: "data"
            		}    		
            };
        	
        	return fluid.selfRender(that.locate("listGroup"), generateTree(that, componentOptions), options);         
        }
    };

    /**
     * The styles to be set on the group containing the list of links
     * 
     * @param {Object} that, the component
     */
    var addGroupStyle = function (that) {
    	if (that.currentView === "grid") {
    		that.locate("listGroup").addClass(that.options.styles.gridGroup);
    	} else {
    		that.locate("listGroup").addClass(that.options.styles.listGroup);
    	}
    };
    
    var removeGroupStyle = function(that) {    	
    	if (that.currentView === "grid") {
    		that.locate("listGroup").removeClass(that.options.styles.gridGroup);
    	} else {
    		that.locate("listGroup").removeClass(that.options.styles.listGroup);
    	}
    }

    var styleToggler = function (that) {
        that.locate("toggler").addClass(that.options.styles.toggler);
    }

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
     * Binds the after render event to a lister that calls the removeLoadStyling function
     * 
     * @param {Object} that, the component
     */
    var bindEvents = function (that) {
        that.events.afterRender.addListener(removeLoadStyling);
    };

    var addClickEvent = function (that) {
        that.locate("toggler").click(that.toggleView);
    };

    var setup = function (that) {
        that.templates = render(that);

        that.currentView = that.options.defaultView;
        
        addGroupStyle(that);
        styleToggler(that);

        addClickEvent(that);

        bindEvents(that);
        that.events.afterRender.fire(that);
        
        that.imageReorderer = fluid.initSubcomponent(that, "imageReorderer", [that.locate("myCollectionContainer"),
                                                                              that.options.imageReorderer.options]);
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

        setup(that);

        return that;
    };
    
    var imageReordererOptions = {
		selectors: {
			movables: ".flc-myCollection-movable"
		},
	
		styles: {
			defaultStyle: null,
	        selected: null,
	        dragging: null,
	        mouseDrag: null,
	        hover: null,
	        dropMarker: null,
	        avatar: null
		}
	} 
    
    fluid.defaults("fluid.initMyCollection",
    		{
    			imageReorderer: {
    				type: "fluid.reorderImages",
    				options: imageReordererOptions
    			},    			
    		
    			decorators: {
        			type: "fluid",
        			func: "fluid.reorderImages",
        			container: ".flc-myCollection-imageContainer",
        			options: imageReordererOptions
        		},
    			
		        selectors: {
    				myCollectionContainer: ".flc-myCollection-imageContainer",
    				title: ".flc-myCollection-title",
    				myCollectionContents: ".flc-myCollection-contents",
			        lists: ".flc-myCollection-lists",			
			        listGroup: ".flc-myCollection-listGroup",
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

			    lists: [
			            {
			                category: "",
			                description: "",
			                listOptions: {}
			            }
			    ],

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