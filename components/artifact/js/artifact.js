/*
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_1_2 fluid*/

fluid_1_2 = fluid_1_2 || {};
fluid = fluid || fluid_1_2;

(function ($, fluid) {
	
    var buildCutpoints = function (){
    	return [{
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
    	];
    };
    
    var buildComponentTree = function (model) {
    	return {children: [
			{
				ID: "artifactTitle",
				valuebinding: "artifactTitle"
			},
			{
				ID: "artifactImage",
				decorators: [{
					attrs: {
    					src: model.artifactImage
    				}
				}]
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
    	]};
    };
    
    var artifactCleanUp = function (data) {
		if (data instanceof Array) {
			for (var i = 0; i < data.length; i++) {
				if (data[i] instanceof Array || data[i] instanceof Object) {
					data[i] = artifactCleanUp(data[i]);
				}
				if (!data[i]) {
					if (data.length < 2) {
						return undefined;
					}
					else {
						data.splice(i, 1);
						i--;
					}
				}
			}
			if (data.length < 2) {
				data = data[0];
			}
		}
		else if (data instanceof Object) {
			for (var key in data) {
				if (data[key] instanceof Array || data[key] instanceof Object) {
					data[key] = artifactCleanUp(data[key]);
				}
				if (!data[key]) {
					delete data[key];
				}
			}
			//	if (size(data) < 1) return undefined;
		}
		return data;
	}; 
    
	var setupArtifact = function (that) {
		if (!that.options.toRender) {
            var handlers = fluid.engage.artifactHandlers();
            var spec = {};
            
            var getSpec = function (specData, status) {
    			try {
    				specData.charAt;
    				specData = JSON.parse(specData);
    			} catch (e) {
    				
    			} finally {
    				spec = specData;
    			}
    		};
    		
    		$.ajax({
    			url: that.options.specURL, 
    			success: getSpec,
    			dataType: "json",
    			async: false,
                error: function (a, b, e) {
                this;
                }
    		});
            
            var successCallback = function (data, status) {
//                var model = fluid.engage.mapModel(artifactCleanUp(data), spec, handlers.options);
                var model = artifactCleanUp(fluid.engage.mapModel(data, spec, handlers.options));
                that.options.toRender = {
    	    		model: model,
                    cutpoints: buildCutpoints(),
    	    		tree: buildComponentTree(model)
	    	    };
            };
            
            $.ajax({
				url: that.options.modelURL, 
				success: successCallback,
				dataType: "json",
				async: false
			});
        }
	};
	
	var renderArtifactPage = function (that) {		
		fluid.selfRender(that.locate("renderScope"), 
				that.options.toRender.tree, 
				{cutpoints: that.options.toRender.cutpoints, model: that.options.toRender.model, debug: true});
	};

	//start of creator function
	fluid.artifact = function (container, options) {
		var that = fluid.initView("fluid.artifact", container, options);
		
		var navigationListOptions = {
            links: [{
                target: "../../../integration_demo/images/Artifacts-.jpg",
                image: "../../../integration_demo/images/Artifacts-.jpg",
                title: "Title",
                description: "Description"
            }, {
                target: "../../../integration_demo/images/Snuffbox.jpg",
                image: "../../../integration_demo/images/Snuffbox.jpg",
                title: "Title",
                description: "Description"
            }, {
                target: "../../../integration_demo/images/Snuffbox.jpg",
                image: "../../../integration_demo/images/Snuffbox.jpg",
                title: "Title",
                description: "Description"
            }, {
                target: "http://build.fluidproject.org",
                title: "Category",
                size: 100
            }]
        };
		
		setupArtifact(that);
		
		that.description = fluid.initSubcomponent(that, "description", [that.locate("descriptionScope"), 
				{model: that.options.toRender.model.artifactDescription}]);
		that.artifactNavigationList = fluid.initSubcomponent(that, "artifactNavigationList", [that.locate("navigationListScope"), navigationListOptions]);
		that.artifactTags = fluid.initSubcomponent(that, "artifactTags", [that.locate("tagsScope"), 
				{tags: that.options.toRender.model.artifactTags}]);
		that.artifactCabinet = fluid.initSubcomponent(that, "artifactCabinet", that.locate("cabinetScope"));

		renderArtifactPage(that);
		
		return that; 
	};
	
	//start of Fluid defaults
	fluid.defaults("fluid.artifact", {
	    selectors: {
			descriptionScope: ".flc-description",
			tagsScope: ".tags-pane",
	        renderScope: ".flc-artifact-renderscope",
	        cabinetScope: ".cabinet",
	        navigationListScope: ".flc-navigationList"
	    },
	    styles: {
	        hideGroup: "fl-artifact-panel-hidden",
	        artNameHeadingInList: "fl-text-bold"
	    },
	    toRender: null,
	    specURL: "",
	    modelURL: "",
	    description: {
            type: "fluid.description"
        },
	    artifactCabinet: {
            type: "fluid.cabinet"
        },
        artifactNavigationList: {
            type: "fluid.navigationList"
        },
        artifactTags: {
            type: "fluid.tags"
        }
	});
	
	fluid.artifact.handler = function(options) {
    	
    	var that = fluid.initLittleComponent("fluid.artifact.handler", options);
    	
    	that.getDoc = function(data, status) {
    		
    		var getSpec = function (specData, status) {
    			try {
    				specData.charAt;
    				specData = JSON.parse(specData);
    			} catch (e) {
    				
    			} finally {
    				that.options.spec = specData;
    			}
    		};
    		
    		$.ajax({
    			url: that.options.specURL, 
    			success: getSpec,
    			dataType: "json",
    			async: false
    		}); 
    		
    		var mapModel = function (artifactModel, spec) {
    			var model = {};
    			for (key in spec) {
    				if(spec.hasOwnProperty(key)) {
    					model[key] = fluid.model.getBeanValue(artifactModel, spec[key]);
    				}
    			}
    			return model;
    		};
    		
    		that.options.model = mapModel(that.artifactCleanUp(data), that.options.spec);
    	};
    	
    		
        
        
        
    	return that;
    };        
    

	fluid.defaults("fluid.artifact.handler", {   
		model: {},
		spec: {},
		specURL: "",
		modelURL: "",
		styles: null
    });
	
}(jQuery, fluid_1_2));
