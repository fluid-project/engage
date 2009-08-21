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
    
    var treeNode = function (id, key, value) {
        var obj = {ID: id};
        obj[key] = value;
        
        return obj; 
    };
    
    var compileMessage = function (id, messageKey, messageArgs) {
        return {
            ID: id,
            messagekey: messageKey,
            args: messageArgs
        };
    };
    
    var conditionalNode = function (condition, onTrue, onFalse) {
        var value;
        if(condition) {
            value = onTrue;
        } else {
            value = onFalse;
        }
        
        return value;
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
            return fluid.transform(that.options.links, function (object) {
                var title = object.title || "";
                var tree = treeNode("listItems:", "children", [
                    treeNode("link", "target", object.target || ""),
                    conditionalNode(object.category, compileMessage("titleText", "linkToMoreMessage", [addCount(object.category, object.size || "")]), treeNode("titleText", "value", title)),
                    treeNode("descriptionText", "value", object.description || "")
                ]);
                
                if(object.image) {
                    tree.children.push(treeNode("image", "decorators", {
                        attrs: {
                            src: object.image || ""
                        }
                    }));
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
    
    var setup = function (that) {
        render(that);
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
        
        styles: {},
        
        strings: {
            linkToMoreMessage: "See all in"
        },
        
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