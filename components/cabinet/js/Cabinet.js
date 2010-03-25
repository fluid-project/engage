/*
 Copyright 2009 - 2010 University of Toronto
 
 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.
 
 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt
 
 */
/*global jQuery, fluid*/

fluid = fluid || {};

(function ($) {
    var addAnchors = function (that) {
        var headers = that.locate("header");
        var headerClass = that.options.selectors.header.substr(1);
        var anchor = "<a href='#_' class='" + headerClass + "' />";
        
        headers.each(function () {
            var header = $(this);
            if (!header.is("a")) {
                header.wrapInner(anchor);
                header.removeClass(headerClass);
            }
        });
    };
    
    var setHeaders = function (that) {
        addAnchors(that);
        that.locate("header").click(function (evt) {
            evt.preventDefault();
        });
    };
    
    /**
     * Ads the various aria properties
     * 
     * @param {Object} that, the component
     */
    var addAria = function (that) {
        var ids = [];
        that.container.attr({
            role: "tablist",
            "aria-multiselectable": "true"
        });

        that.locate("handle").each(function () {
            var handle = $(this);
            ids.push(fluid.allocateSimpleId(handle));
            handle.attr("role", "tab");
        });
        
        that.locate("contents").each(function (idx) {
            $(this).attr({
                role: "tabpanel",
                "aria-labelledby": ids[idx]
            });
        });
    };
    
    /**
     * Adds the various css classes used by the component
     * 
     * @param {Object} that, the component
     */
    var addCSS = function (that) {
        that.locate("drawer").addClass(that.options.styles.drawer);
        that.locate("contents").addClass(that.options.styles.contents);
        that.locate("handle").addClass(that.options.styles.handle);
    };
    
    /**
     * A general function to adjust the position of the drawer (open or closed)
     * 
     * @param {Object} that, the component
     * @param {Object} selector, a selector representing the set of drawers
     * @param {Object} addedStyleName, the style to be added
     * @param {Object} removedStyleName, the style to be removed
     * @param {Object} ariaString, the string to be added to the "aria-expanded" attribute
     * @param {Object} eventName, the name of the event to fire.
     */
    var drawerAdjust = function (that, selector, addedStyleName, removedStyleName, ariaString, eventName) {
        var drawers = $(selector).filter(that.options.selectors.drawer);
        drawers.addClass(that.options.styles[addedStyleName]);
        drawers.removeClass(that.options.styles[removedStyleName]);
        that.locate("handle", drawers).attr("aria-expanded", ariaString);

        if (eventName) {
            that.events[eventName].fire(selector);
        }
    };
    
    /**
     * Causes the drawers to appear open
     * 
     * @param {Object} that, the component
     * @param {Object} selector, a selector representing the set of drawers to open
     * @param {Object} stopEvent, a boolean value indicating if an event should be fired.
     */
    var open = function (that, selector, stopEvent) {
        drawerAdjust(that, selector, "drawerOpened", "drawerClosed", "true", stopEvent ? null : "afterOpen");
    };
    
    /**
     * Causes the drawers to apper closed, won't close a drawer that doesn't have a handle
     * 
     * @param {Object} that, the component
     * @param {Object} selector, a selector representing the set of drawers to close
     * @param {Object} stopEvent, a boolean value indicating if an event should be fired.
     */
    var close = function (that, selector, stopEvent) {
        drawerAdjust(that, selector, "drawerClosed", "drawerOpened", "false", stopEvent ? null : "afterClose");
    };
    
    /**
     * Finds the drawer for a given handle
     * 
     * @param {Object} that, the component
     * @param {Object} element, a handle
     */
    var findHandleBase = function (that, element) {
        return $(fluid.findAncestor(element, function (el) {
            return $(el).is(that.options.selectors.drawer);
        }));
    };
    
    /**
     * Toggles the open state of the drawer. 
     * 
     * @param {Object} drawer, the drawers to open/close
     */
    var toggleDrawers = function (that, drawers) {
        var sty = that.options.styles;
        drawers = fluid.wrap(drawers);
        
        drawers.each(function (index, drawer) {
            var elm = $(drawer);
            
            if (elm.hasClass(sty.drawerClosed)) {
                that.positionDrawers(elm, that.OPEN);
            } else if (elm.hasClass(sty.drawerOpened)) {
                that.positionDrawers(elm, that.CLOSED);
            }
        });
    };
    
    /**
     * Adds a click event to each handle for opening/closing the drawer
     * 
     * @param {Object} that, the component
     */
    var addClickEvent = function (that) {
        var handle = that.locate("handle");
        
        handle.unbind("click.cabinet");
        handle.bind("click.cabinet", function () {
            toggleDrawers(that, findHandleBase(that, this));
        });
    };
    
    /**
     * Adds keyboard a11y to the handles
     * 
     * @param {Object} that, the component
     */
    var addKeyNav = function (that) {        
        that.container.attr("tabindex", 0);
        that.container.fluid("selectable", {
            selectableSelector: that.options.selectors.handle
        });
        that.locate("handle").fluid("activatable", function (evt) {
            toggleDrawers(that, findHandleBase(that, evt.target));
        });
    };
    
    /**
     * Calls any functions necessary for the setup of the component on init
     * 
     * @param {Object} that, the component
     */
    var setup = function (that) {
        that.refreshView();
    };
    
    /**
     * The creator function for the component
     * 
     * @param {Object} container, the components container
     * @param {Object} options, the integrator specified options.
     */
    fluid.cabinet = function (container, options) {
        var that = fluid.initView("fluid.cabinet", container, options);
        
        //Constants
        that.OPEN = open; //Represents the open position
        that.CLOSED = close; //Represents the closed position
        
        /**
         * Adjusts the position (open/closed) of the drawers, specified by a desired position
         * 
         * @param {Object} drawers, a selector representing the drawers to be moved
         * @param {Object} position, a constant specified in the component "OPEN" or "CLOSED", 
         * representing want the final state of the drawers should be.
         */
        that.positionDrawers = function (drawers, position) {
            if (position === that.OPEN || position === that.CLOSED) {
                position(that, drawers);
            }
        };
        
        /**
         * Refreshes the cabinet.
         * 
         * This is usefull for when drawers are added/removed after instatiating the cabinet.
         */
        that.refreshView = function () {
            var openDrawers = that.locate("openByDefault");
            setHeaders(that);
            addAria(that);
            addCSS(that);

            open(that, openDrawers, true);
            close(that, that.locate("drawer").not(openDrawers), true);
    
            addClickEvent(that);
            
            // Only add keyboard navigation if we've got the keyboard-a11y available to us.
            if (fluid.a11y) {
                addKeyNav(that);
            }
        };
        
        setup(that);
        
        return that;
    };
    
    fluid.defaults("fluid.cabinet", {
        selectors: {
            drawer: ".flc-cabinet-drawer",
            handle: ".flc-cabinet-handle", 
            header: ".flc-cabinet-header",
            headerDescription: ".flc-cabinet-headerDescription",
            contents: ".flc-cabinet-contents",
            openByDefault: ""
        },
        
        styles: {
            drawerClosed: "fl-cabinet-drawerClosed",
            drawerOpened: "fl-cabinet-drawerOpened",            
            drawer: "fl-container-autoHeading fl-cabinet-animation fl-container-collapsable",
            contents: "fl-cabinet-contents",
            handle: "fl-cabinet-handle"
        },
        
        events: {
            afterOpen: null,
            afterClose: null
        }
    });
    
})(jQuery);
