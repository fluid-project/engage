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
     * Will return the result of a function wich is run based on a condition.
     * 
     * @param {Object} condition, the test condition
     * @param {Object} onTrue, the function to run if the condition passes
     * @param {Object} onFalse, the function to run if the condition fails
     */
    var conditionalNode = function (condition, onTrue, onFalse) {
        var func = condition === null || condition === undefined ? onFalse : onTrue;
        
        return func();
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
            {selector: that.options.selectors.descriptionText, id: "descriptionText"}
        ];

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

	var componentOptions = {
	    useDefaultImage: true
	};

        fluid.transform(that.locate("lists"), function (object, index) {
            fluid.merge("merge", componentOptions, extractArray(that.options.lists, "listOptions")[index]);
        });

        var generateTree = function () {
            var styles = that.options.styles;
            return fluid.transform(componentOptions.links, function (object) {
                var title = object.title || "";
                var tree = treeNode("listItems:", "children", [
                    treeNode("link", "target", object.target || "", styles.link),
                    conditionalNode(object.category, function () {
                        return compileMessage("titleText", "linkToMoreMessage", [object.category || "", object.size || ""], styles.category);
                    }, function () {
                        return treeNode("titleText", "value", title, styles.titleText);
                    })
                ], styles.listItems);
                
                if (object.description) {
                    tree.children.push(treeNode("descriptionText", "value", object.description || "", styles.descriptionText));
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
        
        var options = {
            cutpoints: selectorMap,
            messageSource: {
                type: "data"
            }
        };
        
        fluid.selfRender(that.locate("listGroup"), generateTree(), options);
         
    };
    
    /**
     * The styles to be set on the group containing the list of links
     * 
     * @param {Object} that, the component
     */
    var styleGroup = function (that) {
        that.locate("listGroup").addClass(that.options.styles.listGroup);
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

    fluid.initMyCollection = function (container, options) {
        var that = fluid.initView("fluid.initMyCollection", container, options);

	setup(that);

        return that;
    };

    var setup = function (that) {
        bindEvents(that);
        that.events.afterRender.fire(that);

        render(that);
        styleGroup(that);

	initReorderer();      
    }

    var initReorderer = function() {

	fluid.reorderImages("#image-grid",
		{
			selectors: {
				movables: ".movable",
				imageTitle: ".caption"
			},
			layoutHandler: "fluid.gridLayoutHandler",
		}
	);
    }

    fluid.defaults("fluid.initMyCollection", {
        description: {
            type: "fluid.description",
            options: {
                model: "",
                selectors: {
                    content: ".flc-browse-description"
                }
            }
        },

        selectors: {
            title: ".flc-myCollection-title",
            myCollectionContents: ".flc-myCollection-contents",
            listHeader: ".flc-cabinet-header",
            listHeaderDescription: ".flc-cabinet-headerDescription",
            lists: ".flc-cabinet-drawer",

            listGroup: ".flc-myCollection-listGroup",
            listItems: ".flc-myCollection-items",
            link: ".flc-myCollection-link",
            image: ".flc-myCollection-image",
            titleText: ".flc-myCollection-titleText",
            descriptionText: ".flc-myCollection-descriptionText"
        },

 	styles: {
 		load: "fl-browse-loading",
   		myCollectionContents: "fl-myCollection-contents",
 		browseDescription: "fl-browse-description",
 		listHeaderDescription: "fl-cabinet-headerWithDescription",
		link: null
 	},

        strings: {
            title: "My Collection Title"
        },
        
        events: {
            afterRender: null
        },
        
        useCabinet: false,
        
        componentTree: null,
        selectorMap: null,

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
                    description: null,
                    category: null,
                    size: null
                }
            ],
	useDefaultImage: true
    });

})(jQuery);