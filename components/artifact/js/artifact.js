/*
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/

fluid = fluid || {};

(function ($, fluid) {
	
	var mapModel = function (that) {
		var model = fluid.artifact.getData(that.options.modelURL);
		model = fluid.artifact.artifactCleanUp(fluid.engage.mapModel(model, "mmi"));
        that.options.toRender = {
    		model: model,
            cutpoints: fluid.artifact.buildCutpoints(),
    		tree: fluid.artifact.buildComponentTree(model)
	    };
	};
	
	var setupArtifact = function (that) {
		if (!that.options.toRender) {
			mapModel(that);
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
		
		setupArtifact(that);
		
		that.description = fluid.initSubcomponent(that, "description", [that.locate("descriptionScope"), 
				{model: that.options.toRender.model.artifactDescription}]);
		that.artifactTags = fluid.initSubcomponent(that, "artifactTags", [that.locate("tagsScope"), 
				{tags: that.options.toRender.model.artifactTags,
				 templateURL: "../../../../engage/components/tags/html/TagsTemplate.html"}]);
		that.artifactCabinet = fluid.initSubcomponent(that, "artifactCabinet", that.locate("cabinetScope"));

		renderArtifactPage(that);
		
		return that; 
	};
	
	fluid.artifact.artifactCleanUp = function (data) {
		if (data instanceof Array) {
			for (var i = 0; i < data.length; i++) {
				if (data[i] instanceof Array || data[i] instanceof Object) {
					data[i] = fluid.artifact.artifactCleanUp(data[i]);
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
					data[key] = fluid.artifact.artifactCleanUp(data[key]);
				}
				if (!data[key]) {
					delete data[key];
				}
			}
			//	if (size(data) < 1) return undefined;
		}
		return data;
	};
	
	fluid.artifact.getData = function (modelURL) {
		var model = {}
		var successCallback = function (data, status) {
			try {
				data.charAt;
				data = JSON.parse(data);
			} catch (e) {				
			} finally {
				model = data;
				if (model.total_rows && model.total_rows > 0) {
					model = model.rows[0].doc;
				}
			}       
        };        
        $.ajax({
			url: modelURL, 
			success: successCallback,
			dataType: "json",
			async: false
		});
        return model;
	};
	
	fluid.artifact.buildCutpoints = function (){
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
    
    fluid.artifact.buildComponentTree = function (model) {
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
	
	//start of Fluid defaults
	fluid.defaults("fluid.artifact", {
	    selectors: {
			descriptionScope: ".flc-description",
			tagsScope: ".tags-pane",
	        renderScope: ".flc-artifact-renderscope",
	        cabinetScope: ".cabinet"
	    },
	    styles: {
	        artNameHeadingInList: "fl-text-bold"
	    },
	    toRender: null,
	    modelURL: "",
	    description: {
            type: "fluid.description"
        },
	    artifactCabinet: {
            type: "fluid.cabinet"
        },
        artifactTags: {
            type: "fluid.tags"
        }
	});
	
}(jQuery, fluid));
