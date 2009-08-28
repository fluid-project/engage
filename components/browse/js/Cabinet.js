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
    
    var addClickEvent = function (that) {
        that.locate("handle").click(function () {
            var handle = $(fluid.findAncestor(this, function (element) {
                return $(element).is(that.options.selectors.drawer);
            }));
            
            handle.toggleClass(that.options.styles.drawerClosed);
            handle.attr({"expanded": handle.attr("expanded") === "true" ? "false" : "true"});
            that.events.afterToggle.fire(handle, handle[0]);
        });
    };
    
    fluid.cabinet = function (container, options) {
        var that = fluid.initView("fluid.cabinet", container, options);
        
        addClickEvent(that);
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
        }
    });
    
})(jQuery, fluid_1_2);
