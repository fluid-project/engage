/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/

fluid = fluid || {};
fluid.engage = fluid.engage || {};
fluid.engage.importer = fluid.engage.importer || {};

(function ($) {
    
    var renderExhibition = function (that, buildTree) {
        fluid.engage.renderUtils.createRendererFunction(that.container,
            that.options.selectors, {
                selectorsToIgnore: ["exhibitionPreview"]
            })(buildTree(that));
    };
    
    function init(that) {
        var renderer = fluid.engage.renderUtils.createRendererFunction(that.container,
            that.options.selectors, {rendererOptions: {model: that.model, debugMode: true}});
            
        var tree = fluid.renderer.makeProtoExpander({ELstyle: "ALL"})(that.options.protoComponents);
        tree.children.push({ID: "submit", decorators: {"jQuery": ["click", function() {
            $.ajax({type: "POST",
            url: that.options.appServerUrl,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(that.model)}
            );
            return false;
        }]}});
        renderer(tree);
    }
    
    fluid.engage.importer.view = function (container, options) {
        var that = fluid.initView("fluid.engage.importer.view", container, options);        
        that.model = that.options.model;
        init(that);
        return that;
    };
    
    fluid.defaults("fluid.engage.importer.view", {
        selectors: {
            databaseUrl: "#databaseUrl",
            databaseName: "#databaseName",
            typeField: "#typeField",
            deleteExisting: "#deleteExisting",
            idPath: "#idPath",
            dataSource: "#dataSource",
            submit: ".flc-import-submit"
        },
        protoComponents: {
            databaseUrl: "databaseUrl",
            databaseName: "databaseName",
            typeField: "typeField",
            deleteExisting: "deleteExisting",
            idPath: "idPath",
            dataSource: "dataSource"
        },
        appServerUrl: "http://localhost:8080/import/import",
        model: {
            databaseUrl: "http://titan.atrc.utoronto.ca:5984",
            databaseName: "testDatabase",
            typeField: "",
            deleteExisting: false,
            idPath: "",
            dataSource: ""  
        }
    });
}(jQuery));