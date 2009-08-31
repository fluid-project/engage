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
    
    var findChild = function (element, test) {
        element = fluid.unwrap(element);
        var childNodes = element.childNodes;
        
        for (var i = 0; i < childNodes.length; i++) {
            if(test(childNodes[i])) {
                return childNodes[i];
            }
        }
    };
    
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
    
    var addCSS = function (that) {
        that.locate("drawer").addClass(that.options.styles.drawer);
        that.locate("contents").addClass(that.options.styles.contents);
        that.locate("handle").addClass(that.options.styles.handle);
    };
    
    var toggleVisibility = function (that, selector, show) {
        selector.each(function (index, element) {
            var contents = findChild(element, function (element) {
                return $(element).is(that.options.selectors.contents);
            });
            
            if(contents) {
                $(contents).toggle();
            }
        });
    };
    
    var moveDrawers = function (that, openState, selector, stopEvent) {
        selector.addClass(openState ? that.options.styles.drawerOpened : that.options.styles.drawerClosed);
        selector.removeClass(openState ? that.options.styles.drawerClosed : that.options.styles.drawerOpened);
        selector.attr("aria-expanded", openState ? "true" : "false");
        toggleVisibility(that, selector, openState);

        if(!stopEvent) {
            that.events[openState ? "afterOpen" : "afterClose"].fire(selector);
        }
    };
    
    var addClickEvent = function (that) {
        that.locate("handle").click(function () {
            var handle = $(fluid.findAncestor(this, function (element) {
                return $(element).is(that.options.selectors.drawer);
            }));
            
            that.toggleDrawers(handle);
        });
    };
    
    var addKeyNav = function (that) {
        that.container.attr("tabindex", 0);
        that.container.fluid("selectable", {selectableSelector: that.options.selectors.drawer});
        that.locate("drawer").fluid("activatable", function (evt){
            that.toggleDrawers($(evt.target));
        });
    };
    
    var setup = function (that) {
        addAria(that);
        addCSS(that);
        moveDrawers(that, that.options.startOpen, that.locate("drawer"), that.options.fireEventsOnInit);
        addClickEvent(that);
        addKeyNav(that);
    };
    
    fluid.cabinet = function (container, options) {
        var that = fluid.initView("fluid.cabinet", container, options);
        
        that.toggleDrawers = function (handle) {
            handle.each(function (index, element) {
                var elm = $(element);
                
                if(elm.hasClass(that.options.styles.drawerClosed)) {
                    that.openDrawers(elm);
                } else if(elm.hasClass(that.options.styles.drawerOpened)) {
                    that.closeDrawers(elm);
                }
            });
        };
        
        that.openDrawers = function (selector) {
            moveDrawers(that, true, selector);
        };
        
        that.closeDrawers = function (selector) {
            moveDrawers(that, false, selector);
        };
        
        setup(that);
    };
    
    fluid.defaults("fluid.cabinet", {
        selectors: {
            drawer: ".flc-cabinet-drawer",
            handle: ".flc-cabinet-handle", 
            header: ".flc-cabinet-header",
            headerDescription: ".flc-cabinet-headerDescription",
            contents: ".flc-cabinet-contents"
        },
        
        styles: {
            drawerClosed: "fl-cabinet-drawerClosed",
            drawerOpened: "fl-cabinet-drawerOpened",
            
            drawer: "fl-panel fl-panel-autoHeading fl-cabinet-animation fl-panel-collapsable",
            contents: "fl-cabinet-contents",
            handle: "fl-cabinet-handle"
        },
        
        events: {
            afterOpen: null,
            afterClose: null
        },
        
        startOpen: false,
        
        preventEventFireOnInit: true
    });
    
})(jQuery, fluid_1_2);
