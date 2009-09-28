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
	
	var setupArtifact = function (that) {
		if (!that.options.toRender) {
			var handler = fluid.artifact.handler({
	    		modelURL: that.options.modelURL,
	    		specURL: that.options.specURL,
	    		getImageURL: function(imageString) {
		    		return {
		    			attrs: {
		    				src: imageString.substring(imageString.indexOf("src='") + 5, 
		    						imageString.indexOf(".jpg'") + 4) 
		    			}
		    		};
				},
				styles: {
					artNameHeadingInList: "fl-text-bold"
				}
	    	});
	    				
			$.ajax({
				url: handler.options.modelURL, 
				success: handler.getDoc,
				dataType: "json",
				async: false
			});
			
	    	that.options.toRender = handler.options.toRender;			
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
				{model: that.options.toRender.descriptionModel}]);
		that.artifactNavigationList = fluid.initSubcomponent(that, "artifactNavigationList", [that.locate("navigationListScope"), navigationListOptions]);
		that.artifactTags = fluid.initSubcomponent(that, "artifactTags", [that.locate("tagsScope"), 
				{
                    tags: that.options.toRender.model.Tags 
                }
            ]);
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
    		
			that.options.model = fluid.artifact.handler.artifactCleanUp(data);
    		
    		var getSpec = function (specData, status) {
    			try {
    				specData.charAt;
    				specData = JSON.parse(specData);
    			} catch (e) {
    				
    			} finally {
    				that.options.spec = specData.spec;
    			}
    		};
    		
    		$.ajax({
    			url: that.options.specURL, 
    			success: getSpec,
    			dataType: "json",
    			async: false
    		}); 
    		
    		that.options.toRender = {
    			tree: fluid.csRenderer.buildComponentTree(that.options),
    			cutpoints: fluid.csRenderer.createCutpoints(that.options.spec),
    			model: that.options.model
    		};
    	};
    	return that;
    };
    
    fluid.artifact.handler.artifactCleanUp = function (data) {
		if (data instanceof Array) {
			for (var i = 0; i < data.length; i++) {
				if (data[i] instanceof Array || data[i] instanceof Object) {
					data[i] = fluid.artifact.handler.artifactCleanUp(data[i]);
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
					data[key] = fluid.artifact.handler.artifactCleanUp(data[key]);
				}
				if (!data[key]) {
					delete data[key];
				}
			}
			//	if (size(data) < 1) return undefined;
		}
		return data;
	};

	fluid.defaults("fluid.artifact.handler", {   
		model: {},
		spec: {},
		specURL: "",
		modelURL: "",
		styles: null
    });
	
}(jQuery, fluid_1_2));
