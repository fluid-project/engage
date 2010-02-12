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
        var tree = buildComponentTree(that.model.artifact);
        fluid.selfRender(that.locate("renderScope"), tree, {
            cutpoints: that.options.cutpoints, 
            model: that.model.artifact
        });
    };

    var setupArtifactView = function (that) {
        renderArtifactPage(that);
        
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
                model: {
                    museum: that.model.museum,
                    artifactId: that.model.artifactId
                },
                strings: that.options.strings
            }
        ]);
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

        setupArtifactView(that);
        return that; 
    };
    
    //start of Fluid defaults
    fluid.defaults("fluid.engage.artifactView", {
        selectors: {
            descriptionScope: ".flc-description",
            renderScope: ".flc-artifact-renderscope",
            cabinetScope: ".cabinet",
            collectArtifact: ".flc-collect-artifact"
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
            }
        ],
        
        // TODO: These should be moved into ArtifactCollectView's defaults.
        strings : {
            collect: "Collect Artifact",
            uncollect: "Uncollect Artifact",
            collectedMessage: "This artifact has been added to your personal collection; tap here to go there now.",
            uncollectedMessage: "This artifact has been removed from your personal collection; tap here to go there now."
        }
    });
}(jQuery));
