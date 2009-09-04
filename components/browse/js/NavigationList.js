/*
 Copyright 2008-2009 University of Toronto
 Copyright 2008-2009 University of Cambridge
 
 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.
 
 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt
 
 */
/*global jQuery, fluid*/

fluid_1_2 = fluid_1_2 || {};

(function ($, fluid) {
    
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
    
    var compileMessage = function (id, messageKey, messageArgs, classes) {
        var obj = treeNode(id, "messagekey", messageKey, classes);
        obj.args = messageArgs;
        return obj;
    };
    
    var conditionalNode = function (condition, onTrue, onFalse) {
        var func = condition ? onTrue : onFalse;
        
        return func();
    };
    
    var addCount = function (string, count) {
        return string + " (" + count + ")";
    };
    
    var render = function (that) {
         var selectorMap = [
            {selector: that.options.selectors.listItems, id: "listItems:"},
            {selector: that.options.selectors.link, id: "link"},
            {selector: that.options.selectors.image, id: "image"},
            {selector: that.options.selectors.titleText, id: "titleText"},
            {selector: that.options.selectors.descriptionText, id: "descriptionText"}
        ];
        
        generateTree = function () {
            var styles = that.options.styles;
            return fluid.transform(that.options.links, function (object) {
                var title = object.title || "";
                var tree = treeNode("listItems:", "children", [
                    treeNode("link", "target", object.target || "", styles.link),
                    conditionalNode(object.category, function () {
                        return compileMessage("titleText", "linkToMoreMessage", [addCount(object.category, object.size || "")], styles.category);
                    }, function () {
                        return treeNode("titleText", "value", title, styles.titleText);
                    }),
                    treeNode("descriptionText", "value", object.description || "", styles.descriptionText)
                ], styles.listItems);
                
                if(object.image) {
                    tree.children.push(treeNode("image", "decorators", [
                        {
                            attrs: {
                                src: object.image || ""
                            }
                        },
                        {
                            type: "addClass",
                            classes: styles.image
                        }
                    ]));
                }
                
                return tree;
            });
        };
        
        var options = {
            cutpoints: selectorMap,
            messageSource: {
                type: "data", 
                messages: that.options.messageBundle
            }
        };
        
        fluid.selfRender(that.locate("listGroup"), generateTree(), options);
         
    };
    
    var styleGroup = function (that) {
        that.locate("listGroup").addClass(that.options.styles.listGroup);
    };
    
    var setup = function (that) {
        render(that);
        styleGroup(that);
    };
    
    fluid.navigationList = function (container, options) {
        var that = fluid.initView("fluid.navigationList", container, options);
        
        setup(that);
    };
    
    fluid.navigationList.calculateListSize = function (that) {
        return that.model.links.length || 0;
    };
    
    fluid.defaults("fluid.navigationList", {
        selectors: {
            listGroup: ".flc-nagivationList-listGroup",
            listItems: ".flc-navigationList-items",
            link: ".flc-navigationList-link",
            image: ".flc-navigationList-image",
            titleText: ".flc-navigationList-titleText",
            descriptionText: ".flc-navigationList-descriptionText"
        },
        
        styles: {
            listGroup: "fl-list fl-list-thumbnails fl-thumbnails-expanded",
            listItems: null,
            link: null,
            image: "fl-icon",
            titleText: null,
            descriptionText: "fl-link-summary",
            category: null
        },
        
        strings: {},
        
        events: {},
        
        messageBundle: {linkToMoreMessage: "See all in {0}"},
        
        links: [
                {
                    target: "",
                    image: "",
                    title: "",
                    description: "",
                    category: null,
                    size: ""
                }
            ]
    });
    
})(jQuery, fluid_1_2);