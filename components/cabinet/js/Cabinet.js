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
    
    /**
     * Checks if the header is wrapped in an anchor and adds one if it isn't.
     * 
     * @param {Object} headers, a jquery representing the set of headers
     * @param {Object} selectorString, a string representing the class for the headers.
     */
    var addAnchors = function (headers, headerClass) {
        var anchor = "<a href='#_' class='" + headerClass + "' tabindex='-1' />";
        
        headers.each(function () {
            var header = $(this);
            if (!header.is("a")) {
                header.wrapInner(anchor);
                header.removeClass(headerClass);
            } else {
                header.attr("tabindex", -1);
            }
        });
    };

    /**
     * Adds the tablist aria role and aria-multiselectable property to the container
     * 
     * @param {Object} container, the cabinet's container
     */
    var addContainerAria = function (container) {
        container.attr({
            role: "tablist",
            "aria-multiselectable": "true"
        });
    };
    
    /**
     * Adds the various aria properties to the necessary parts of the drawers
     * 
     * @param {Object} handles, a jquery representing the handles
     * @param {Object} contents, a jquery representing the contents
     */
    var addDrawerAria = function (handles, contents) {
        var ids = [];

        handles.each(function () {
            var handle = $(this);
            ids.push(fluid.allocateSimpleId(handle));
            handle.attr("role", "tab");
        });
        
        contents.each(function (idx) {
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
    var addCSS = function (drawers, contents, handles, styles) {
        drawers.addClass(styles.drawer);
        contents.addClass(styles.contents);
        handles.addClass(styles.handle);
    };

    /**
     * A general function to adjust the position of the drawer (open or closed)
     * 
     * @param {Object} that, the component
     * @param {Object} drawers, a selector representing the set of drawers
     * @param {Object} addedStyleName, the style to be added
     * @param {Object} removedStyleName, the style to be removed
     * @param {Object} ariaString, the string to be added to the "aria-expanded" attribute
     * @param {Object} eventName, the name of the event to fire.
     */
    var drawerAdjustImpl = function (that, drawers, state, addedStyleName, removedStyleName, ariaValue, stopEvent) {
        drawers = $(drawers).filter(that.options.selectors.drawer);
        drawers.addClass(that.options.styles[addedStyleName]);
        drawers.removeClass(that.options.styles[removedStyleName]);
        that.locate("handle", drawers).attr("aria-expanded", ariaValue);
        drawers.each(function () {
            that.model[fluid.allocateSimpleId(this)] = state;
        });
        
        if (!stopEvent) {
            that.events.afterModelChanged.fire(that.model);
        }
    };
    
    /**
     * Adjusts the specified drawers to be in the specified state
     * 
     * @param {Object} that, the component
     * @param {Object} drawers, the drawers whose state will be set
     * @param {Object} state, the state to place the drawers in e.g. "open", "closed"
     */
    var drawerAdjust = function (that, drawers, state, stopEvent) {
        var newStyle;
        var oldStyle;
        var ariaValue;
        
        switch (state) {
        case "open":
            newStyle = "drawerOpened";
            oldStyle = "drawerClosed";
            ariaValue = "true";
            break;
        case "closed":
            newStyle = "drawerClosed";
            oldStyle = "drawerOpened";
            ariaValue = "false";
            break;
        default:
            return;
        }
        
        drawerAdjustImpl(that, drawers, state, newStyle, oldStyle, ariaValue, stopEvent);
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
     * Adds the click handlers to the handles and headers
     * 
     * @param {Object} that, the component
     */
    var addClickHandlers = function (that, handles, headers) {
        handles.unbind("click.cabinet");
        handles.bind("click.cabinet", function () {
            var drawer = findHandleBase(that, this);
            var curState = that.getDrawerState(drawer);
            that.setDrawers(drawer, curState === "open" ? "closed" : "open");
        });
        
        headers.click(function (evt) {
            evt.preventDefault();
        });
    };

    /**
     * Adds keyboard a11y to the container
     * 
     * @param {Object} that, the component
     */
    var addContainerKeyNav = function (that) {        
        that.container.attr("tabindex", 0);
        that.container.fluid("selectable", {
            selectableSelector: that.options.selectors.handle
        });
    };
    
    /**
     * Adds keyboard a11y to the handles
     * 
     * @param {Object} that, the component
     * @param {Object} handles, a jquery representing the handles
     */
    var addDrawerKeyNav = function (that, handles, headers) {   
        headers.attr("tabindex", -1);
        handles.fluid("activatable", function (evt) {
            var drawer = findHandleBase(that, evt.target);
            var curState = that.getDrawerState(drawer);
            that.setDrawers(drawer, curState === "open" ? "closed" : "open");
        });
    };
    
    var init = function (that, drawers) {
        drawers = fluid.wrap(drawers);
        var openDrawers = that.locate("openByDefault");
        var opts = that.options;
        var headers = that.locate("header", drawers);
        var handles = that.locate("handle", drawers);
        var contents = that.locate("contents", drawers);
        
        addAnchors(headers, opts.selectors.header.substr(1));
        addDrawerAria(handles, contents);
        addCSS(drawers, contents, handles, opts.styles);

        drawerAdjust(that, openDrawers, "open", true);
        drawerAdjust(that, drawers.not(openDrawers), "closed", true);

        addClickHandlers(that, handles, headers);
        
        // Only add keyboard navigation if we've got the keyboard-a11y available to us.
        if (fluid.a11y) {
            addDrawerKeyNav(that, handles, headers);
        }
    };
    
    /**
     * Calls any functions necessary for the setup of the component on init
     * 
     * @param {Object} that, the component
     */
    var setup = function (that) {
        that.model = {};
        addContainerAria(that.container);
        
        if (fluid.a11y) {
            addContainerKeyNav(that);
        }
        
        init(that, that.locate("drawer"));
    };
    
    /**
     * The creator function for the component
     * 
     * @param {Object} container, the components container
     * @param {Object} options, the integrator specified options.
     */
    fluid.cabinet = function (container, options) {
        var that = fluid.initView("fluid.cabinet", container, options);
        
        /**
         * Returns the state of the specified drawer, or null if the drawer isn't found
         * 
         * @param {Object} drawer, a selector representing a single drawer
         */
        that.getDrawerState = function (drawer) {
            return that.model[$(drawer).attr("id")] || null;
        };
        
        /**
         * Adjusts the position (open/closed) of the drawers, specified by a desired position
         * 
         * @param {Object} drawers, a selector representing the drawers to be moved
         * @param {Object} position, a constant specified in the component "OPEN" or "CLOSED", 
         * representing want the final state of the drawers should be.
         */
        that.setDrawers = function (drawers, state) {
            drawerAdjust(that, drawers, state);
        };
        
        /**
         * Refreshes the cabinet.
         * 
         * This is usefull for when drawers are added/removed after instatiating the cabinet.
         */
        that.refreshView = function () {
            that.locate("drawer").each(function () {
                if (!that.getDrawerState(this)) {
                    init(that, this);
                }
            });
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
            afterModelChanged: null
        }
    });
    
})(jQuery);
