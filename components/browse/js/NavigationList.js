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
    
    var addCount = function (string, count) {
        return string + " (" + count + ")";
    };
    
    var render = function (that) {
         var selectorMap = [
            {selector: that.options.selectors.header, id: "header"},
            {selector: that.options.selectors.listItems, id: "listItems:"},
            {selector: that.options.selectors.link, id: "link"},
            {selector: that.options.selectors.image, id: "image"},
            {selector: that.options.selectors.titleText, id: "titleText"},
            {selector: that.options.selectors.descriptionText, id: "descriptionText"}
        ];
        
        generateTree = function () {
            var tree = [];
            
            tree.push(treeNode("header", "value", that.model.showNumberInHeader ? addCount(that.model.header, that.model.links.length) : that.model.header));
            
            tree.push({
                ID: "header",
                value: that.model.showNumberInHeader ? addCount(that.model.header, that.model.links.length) : that.model.header,
                decorators: 
                    {
                        type: "jQuery",
                        func: "click",
                        args: function () {
                            that.locate("listGroup").toggleClass(that.options.styles.hideGroup);
                        }
                    }
            });
            
            tree = tree.concat(fluid.transform(that.model.links, function (object) {
                return treeNode("listItems:", "children", [
                    treeNode("link", "target", object.target || ""),
                    treeNode("image", "decorators", {
                        attrs: {
                            src: object.image || ""
                        }
                    }),
                    treeNode("titleText", "value", object.title || ""),
                    treeNode("descriptionText", "value", object.description || "")
                ]);
            }));
            
            return tree;
        };
        
        var options = {
            cutpoints: selectorMap,
            debug: true
        };
        
        fluid.selfRender(that.locate("listGroup"), generateTree(), options);
         
    };
    
    var setup = function (that) {
        that.model = that.options.model;
        render(that);
    };
    
    fluid.navigationList = function (container, options) {
        var that = fluid.initView("fluid.navigationList", container, options);
        
        setup(that);
    };
    
    fluid.defaults("fluid.navigationList", {
        selectors: {
            listGroup: ".flc-nagivationList-listGroup",
            header: ".flc-navigationList-header",
            listItems: ".flc-navigationList-items",
            link: ".flc-navigationList-link",
            image: ".flc-navigationList-image",
            titleText: ".flc-navigationList-titleText",
            descriptionText: ".flc-navigationList-descriptionText"
        },
        
        styles: {
            hideGroup: "fl-navigationList-hidden"
        },
        
        strings: {},
        
        events: {},
        
        model: {
            header: "",
            showNumberInHeader: false,
            links: [
                {
                    target: "",
                    image: "",
                    title: "",
                    description: ""
                }
            ]
        }
    });
    
})(jQuery, fluid_1_2);