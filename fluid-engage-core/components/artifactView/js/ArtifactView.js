/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid*/
"use strict";

fluid = fluid || {};

(function ($) {
    
    var buildComponentTree = function (artifact) {
        var tree = {
            children: [
                {
                    ID: "artifactTitle",
                    valuebinding: "artifactTitle"
                },
                {
                    ID: "artifactTitle2",
                    valuebinding: "artifactTitle",
                    decorators: [{
                        type: "addClass",
                        classes: "fl-text-bold"
                    }]
                },
                {
                    ID: "artifactAuthor",
                    valuebinding: "artifactAuthor"
                },
                {
                    ID: "artifactDate",
                    valuebinding: "artifactDate"
                },
                {
                    ID: "artifactAccessionNumber",
                    valuebinding: "artifactAccessionNumber"
                }
            ]
        };
        
        if (artifact.artifactImage) {
            tree.children.push({
                ID: "artifactImage",
                target: artifact.artifactImage
            });
        }
        return tree;
    };
    
    /**
     * Renderers out the pieces of the component
     * 
     * @param {Object} that,the component
     */    
    var renderArtifactPage = function (that) {
        var artifact = that.model.artifact;
        
        var tree = buildComponentTree(artifact);
        
        // Attach collect handler
        tree.children.push({
        	ID: "artifactCollectLink",
        	decorators: [{
                type: "jQuery",
                func: "click",
                args: that.collectView.collectHandler
            }]
        });

        fluid.selfRender(that.locate("renderScope"), tree, {
            cutpoints: that.options.cutpoints, 
            model: artifact, 
            debug: true
        });
    };

    /**
     * The component's creator function 
     * 
     * @param {Object} container, the container which will hold the component
     * @param {Object} options, options passed into the component
     */
    fluid.engage.artifactView = function (container, options) {
        var that = fluid.initView("fluid.engage.artifactView", container, options);
        that.model = that.options.model; 
        
        that.description = fluid.initSubcomponent(that, "description", [
            that.locate("descriptionScope"), 
            {
                model: that.model.artifact.artifactDescription
            }
        ]);
                
        that.artifactCabinet = fluid.initSubcomponent(that, "artifactCabinet", that.locate("cabinetScope"));
        
        that.collectView = fluid.initSubcomponent(that, "collectView", [
            that.locate("collectArtifact"),
        	{
            	artifactCollected: that.options.artifactCollected,
        		museum: that.options.museum,
        		artifactId: that.options.model.id
        	}
        ]);

        renderArtifactPage(that);
        return that; 
    };
    
    //start of Fluid defaults
    fluid.defaults("fluid.engage.artifactView", {
        selectors: {
            descriptionScope: ".flc-description",
            renderScope: ".flc-artifact-renderscope",
            cabinetScope: ".cabinet"  
        },
        description: {
            type: "fluid.description"
        },
        artifactCabinet: {
            type: "fluid.cabinet"
        },
        collectView : {
            type: "fluid.engage.artifactCollectView"
        },
        cutpoints: [
            {
                id: "artifactTitle",
                selector: ".artifact-name"
            },
            {
                id: "artifactImage",
                selector: ".artifact-picture"
            },
            {
                id: "artifactTitle2",
                selector: ".artifact-descr-name"
            },
            {
                id: "artifactAuthor",
                selector: ".artifact-provenance"
            },
            {
                id: "artifactDate",
                selector: ".artifact-date"
            },
            {
                id: "artifactAccessionNumber",
                selector: ".artifact-accession-number"
            },
            {
            	id: "artifactCollectLink",
            	selector: ".flc-collect-link"
            }
        ]
    });
    
}(jQuery));
