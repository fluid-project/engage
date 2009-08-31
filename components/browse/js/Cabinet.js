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
    
    var addAria = function (that) {
        that.container.attr({
            role: "tablist",
            "aria-multiselectable": "true"
        });
        
        that.locate("drawer").attr({
            role: "tab",
            "aria-expanded": "false"
        });
    };
    
    var addClickEvent = function (that) {
        that.locate("handle").click(function () {
            var handle = $(fluid.findAncestor(this, function (element) {
                return $(element).is(that.options.selectors.drawer);
            }));
            
            that.toggleHandle(handle);
        });
    };
    
    var addKeyNav = function (that) {
        that.container.attr("tabindex", 0);
        that.container.fluid("selectable", {selectableSelector: that.options.selectors.drawer});
        that.container.fluid("activatable", function (evt){
            that.toggleHandle(evt.target);
        });
    };
    
    var setup = function (that) {
        addAria(that);
        addClickEvent(that);
        addKeyNav(that);
    };
    
    fluid.cabinet = function (container, options) {
        var that = fluid.initView("fluid.cabinet", container, options);
        
        that.toggleHandle = function (handle) {
            var expAttr = "aria-expanded";
            
            handle.toggleClass(that.options.styles.drawerClosed);
            handle.attr(expAttr, handle.attr(expAttr) === "true" ? "false" : "true");
            
            that.events.afterToggle.fire(handle, handle[0]);
        };
        
        setup(that);
    };
    
    fluid.defaults("fluid.cabinet", {
        selectors: {
            drawer: ".flc-cabinet-drawer",
            handle: ".flc-cabinet-handle", 
            header: ".flc-cabinet-header",
            headerDescription: ".flc-cabinet-headerDescription"
        },
        
        styles: {
            drawerClosed: "fl-cabinet-drawerClosed"
        },
        
        events: {
            afterToggle: null
        },
        
        startOpen: false
    });
    
})(jQuery, fluid_1_2);
