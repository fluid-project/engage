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
    
    var setTitle = function (that) {
        that.locate("title").text(that.options.strings.title);
    };
    
    var setDescription = function (that) {
        that.locate("browseDescription").text(that.options.strings.description);
    };
    
    var renderBrowse = function (that) {
        var selectorMap = [
            {selector: that.options.selectors.lists, id: "lists:"},
            {selector: that.options.selectors.listHeader, id: "listHeader"},
            {selector: that.options.selectors.listHeaderDescription, id:"listHeaderDescription"}
        ];
        
        var renderTree = function () {
            return ;
        };
        
        fluid.selfRender(that.locate("browseContents"), tree, {cutpoints: selectoMap});
    };
    
    var initCabinet = function (that) {
        that.cabinet = fluid.initSubcomponent(that, "cabinet", [that.locate("browseContents"), fluid.COMPONENT_OPTIONS]);
    };
    
    var setup = function (that) {
        setTitle(that);
        setDescription(that);
//        renderBrowse(that);
        initCabinet(that);
    };
    
    fluid.browse = function (container, options) {
        var that = fluid.initView("fluid.browse", container, options);
        
        setup(that);
        
        return that;
    };
    
    fluid.defaults("fluid.browse", {
        navigationList: {
            type: "fluid.navigationList",
            options: {}
        },
        
        cabinet: {
            type: "fluid.cabinet",
            options: {}
        },
        
        selectors: {
            title: ".flc-browse-title",
            browseDescription: ".flc-browse-description",
            browseDescriptionToggle: ".flc-browse-descriptionToggle",
            browseContents: ".flc-browse-contents",
            listHeader: ".flc-cabinet-header",
            listHeaderDescription: ".flc-cabinet-headerDescription",
            lists: ".flc-cabinet-drawer"
        },
        
        styles: {
            browseDescription: "",
            browseDescriptionToggle: ""
        },
        
        strings: {
            description: "The Browse Description", 
            title: "Browse Title"
        },
        
        events: {},
        
        useCabinet: true,
        
        lists: [
            {
                category: "",
                links: ""
            }
        ]
    });
    
})(jQuery, fluid_1_2);