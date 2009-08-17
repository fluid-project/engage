/*
 Copyright 2008-2009 University of Toronto
 Copyright 2008-2009 University of Cambridge
 
 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.
 
 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt
 
 */
/*global jQuery, fluid_1_2*/

fluid_1_2 = fluid_1_2 || {};

(function ($, fluid) {
    
    var treeNode = function (id, key, value) {
        var obj = {ID: id};
        obj[key] = value;
        
        return obj; 
    };
    
    var addId = function (id, object) {
        object.ID = id;
        
        return object;
    };
    
    var addCount = function (string, count) {
        return string + " (" + count + ")";
    };
    
    var renderPanels = function (that) {
        var selectorMap = [
            {selector: that.options.selectors.drawer, id: "drawer:"},
            {selector: that.options.selectors.handle, id: "handle"},
            {selector: that.options.selectors.header, id: "header"},
            {selector: that.options.selectors.headerDescription, id: "headerDescription"},
            {selector: that.options.selectors.contents, id: "contents"}
        ];
        
        var generateTree = function (that) {
            
            return fluid.transform(that.options.drawers, function (object) {
                var headerText = object.header || "";
                return treeNode("drawer:", "children", [
                    treeNode("header", "value", object.size ? addCount(headerText, object.size) : headerText),
                    treeNode("headerDescription", "value", object.headerDescription || ""),
                    treeNode("handle", "decorators", [{
                        type: "jQuery",
                        func: "click",
                        args: function () {
                            var handle = $(fluid.findAncestor(this, function (element) {
                                return $(element).is(that.options.selectors.drawer);
                            }));
                            
                            handle.toggleClass(that.options.styles.drawerClosed);
                            handle.attr({"expanded": handle.attr("expanded") === "true" ? "false" : "true"});
                        }
                    },
                    {
                        type: "addClass",
                        classes: object.headerDescription && object.headerDescription !== "" ? "fl-cabinet-headerWithDescription" : ""
                    }]),
                    
                    addId("contents", object.contents || {value: ""})
                ]);
            });
        };
        
        fluid.selfRender(that.locate("drawers"), generateTree(that), {cutpoints: selectorMap});
    };
    
    var setup = function (that) {
        renderPanels(that);
    };
    
    fluid.cabinet = function (container, options) {
        var that = fluid.initView("fluid.cabinet", container, options);
        
        setup(that);
    };
    
    fluid.defaults("fluid.cabinet", {
        selectors: {
            drawers: ".flc-cabinet-drawers",
            drawer: ".flc-cabinet-drawer",
            handle: ".flc-cabinet-handle",
            header: ".flc-cabinet-header",
            headerDescription: ".flc-cabinet-headerDescription",
            contents: ".flc-cabinet-contents"
        },
        
        styles: {
            drawerClosed: "fl-cabinet-drawerClosed"
        },
        
        strings: {},
        
        events: {},
        
        drawers: [
            {
                header: "",
                headerDescription: "",
                size: "",
                contents: {}
            }
        ]
    });
    
})(jQuery, fluid_1_2);