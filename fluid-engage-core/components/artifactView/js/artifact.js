/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/

fluid = fluid || {};

(function ($) {

    /**
     * Renderers out the pieces of the component
     * 
     * @param {Object} that,the component
     */ 
    var renderArtifactPage = function (that) {
        fluid.selfRender(that.locate("renderScope"), 
                that.options.toRender.tree, 
                {cutpoints: that.options.toRender.cutpoints, model: that.options.toRender.model, debug: true});
    };
    
    var addCollectArtifactDecorator = function (that, options) {
        var i = 0;
        for (; i < that.options.toRender.tree.children.length; i++) {
            if (that.options.toRender.tree.children[i].ID === "artifactCollectLink") {
                break;
            }
        }
        
        that.options.toRender.tree.children[i].decorators = 
            [{
                type: "jQuery",
                func: "click",
                args: that.collectionOperations.collectHandler
            }];
    };

    /**
     * The component's creator function 
     * 
     * @param {Object} container, the container which will hold the component
     * @param {Object} options, options passed into the component
     */
    fluid.artifact = function (container, options) {
        
        var that = fluid.initView("fluid.artifact", container, options);

        that.description = fluid.initSubcomponent(that, "description", [that.locate("descriptionScope"), 
                {model: that.options.toRender.model.artifactDescription}]);
        that.artifactTags = fluid.initSubcomponent(that, "artifactTags", [that.locate("tagsScope"), 
                {tags: that.options.toRender.model.artifactTags}]);
        that.artifactCabinet = fluid.initSubcomponent(that, "artifactCabinet", that.locate("cabinetScope"));
        
        that.relatedArtifacts = fluid.initSubcomponent(that, "artifactsLink", [that.locate("realtedArtifacts"),
                {messageBundle: {linkToMoreMessage: "Go to Related artifacts"}, links: [{category: "", target: that.options.toRender.relatedArtifacts}]}]);

        that.collectionOperations = fluid.initSubcomponent(that, "collectionOperations", [that.locate("collectArtifact"),
                {artifactCollected: options.artifactCollected, museum: options.museum, artifactId: options.toRender.model.id}]);
        // Sveto: As the collect link is in the render scope of this component, we need to add the
        // event handler as a decorator, so it is attached after rendering.
        addCollectArtifactDecorator(that, options);

        renderArtifactPage(that);

        return that; 
    };
    
    //start of Fluid defaults
    fluid.defaults("fluid.artifact", {
        selectors: {
            descriptionScope: ".flc-description",
            tagsScope: ".fl-tags",
            renderScope: ".flc-artifact-renderscope",
            cabinetScope: ".cabinet",
            relatedArtifacts: ".relatedArtifacts",
            collectArtifact: ".flc-collect-artifact"
        },
        toRender: null,
        description: {
            type: "fluid.description"
        },
        artifactCabinet: {
            type: "fluid.cabinet"
        },
        artifactTags: {
            type: "fluid.tags"
        },
        artifactsLink: {
            type: "fluid.navigationList"
        },
        collectionOperations : {
            type: "fluid.collectionOperations"
        }
    });
    
}(jQuery));
