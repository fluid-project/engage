/*
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery, fluid*/

var fluid = fluid || {};

(function ($, fluid) {
    
    fluid.engage = fluid.engage || {};
    
    var noImageURL = "../../../../engage/components/artifact/images/no_image_64x64.png";
    var noTitle = "No Title";
    
    fluid.engage.collections = {
    	mmi: {
    		dataSpec: {
    		    "category": "Collection category",
    		    "linkTarget": "Accession number",
    			"linkImage": {
    		        "path": "Media file",
    		        "func": "getImageFromMarkupWithDefaultImage"
    		    },
    			"linkTitle": "Object Title",
    			"linkDescription": "Creation date",
    			"artifactTitle": "Object Title",
    			"artifactImage": {
    		        "path": "Media file",
    		        "func": "getImageFromMarkup"
    		    },
    			"artifactDate": "Creation date",
    			"artifactAccessionNumber": "Accession number",
    			"artifactTags": "Tags",
    			"artifactDescription": {
    		    	"path": "Description",
    		    	"func": "getDescription"
    		    }
    		},
    		mappers: {
    			getDescription: function (value) {
    				var getDescr = function (value) {
    					if (isString(value)) {
    						return value;
    					}
    					else {
    						return value[0];
    					}
    				};
    				return tryFunc(getDescr, value);
    			},
    			getImageFromMarkup: function (value) {    			
    				var getImage = function (value) {
    					var img = $(value).each(function (index) {
		    	            if ($(value).eq(index).is("img")) {
		    	                return $(value).eq(index);
		    	            }
		    	        });	    	    	
		                return String(img.eq(0).attr("src"));
    				};
    				
    				return tryFunc(getImage, value);
            	},
                getImageFromMarkupWithDefaultImage: function (value) {    			
    				var getImage = function (value) {
    					var img = $(value).each(function (index) {
		    	            if ($(value).eq(index).is("img")) {
		    	                return $(value).eq(index);
		    	            }
		    	        });	    	    	
		                return String(img.eq(0).attr("src") || noImageURL);
    				};
    				
    				return tryFunc(getImage, value, noImageURL);
            	}
    		}
    	},
    	mccord: {
    		dataSpec: {
    		    "category": "artefacts.artefact.links.type.category.label",
    		    "linkTarget": "artefacts.artefact.accessnumber",
    			"linkImage": {
    		        "path": "artefacts.artefact.images.image.imagesfiles.imagefile",
    		        "func": "getThumbImageFromObjectArray"
    		    },
    			"linkTitle": {
    		    	"path": "artefacts.artefact.title",
    		    	"func": "getTitleFromObject"
    		    },
    			"linkDescription": "artefacts.artefact.dated",
    			"artifactTitle": {
    		    	"path": "artefacts.artefact.title",
    		    	"func": "getTitleFromObject"
    		    },
    			"artifactImage": {
    		        "path": "artefacts.artefact.images.image.imagesfiles.imagefile",
    		        "func": "getImageFromObjectArray"
    		    }, 
    			"artifactAuthor": {
    				"path": "artefacts.artefact.artist",
    				"func": "getArtifactArtist"
    			},
    			"artifactDate": "artefacts.artefact.dated",
    			"artifactAccessionNumber": "artefacts.artefact.accessnumber",
    			"artifactTags": "artefacts.artefact.tags",
    			"artifactDescription": "artefacts.artefact.descriptions.description_museum"
    		},
    		mappers: {
    			getTitleFromObject: function (value) {
	    			var getTitle = function (value) {
		    			if (typeof value === "string") {
		    				return value || noTitle;
		    			}
		    			else {
		    				return value.nodetext || noTitle;
		    			}
					};				
					return tryFunc(getTitle, value, noTitle);
    			},
    			getThumbImageFromObjectArray: function (value) {
    				var getImage = function (value) {
		    			if (typeof value === "string") {
		    				return value;
		    			}
		    			else {
		    				return value[0].nodetext || noImageURL;
		    			}
    				};
    				
    				return tryFunc(getImage, value, noImageURL);
    			},
    			getImageFromObjectArray: function (value) {
    				var getImage = function (value) {
    					if (typeof value === "string") {
    	    				return value;
    	    			}
    	    			else {
    	    				return value[value.length - 2].nodetext;
    	    			}
    				};
    				
    				return tryFunc(getImage, value);	    			
	    		},        
	            getArtifactArtist: function (value) {
	    			var getArtist = function (value) {
		            	if (typeof value === "string") {
		            		return value;
		            	}
		            	else {
		            		return value[0].nodetext; 
		            	}
	    			};
	    			
	    			return tryFunc(getArtist, value);
	            }
    		}
    	}
    };
    
    var tryFunc = function (func, value, defaultValue) {
    	try {
    		return func(value);
    	} catch (e) {return defaultValue;};
    };
    
    var isString = function (value) {
        return typeof value === "string";
    };
    
    fluid.engage.mapModel = function (model, dbName, spec) {
        
    	spec = spec || fluid.engage.collections;
    	
        var normalizedModel = {};
        
        var validatePathFunc = function (path, func) {
            return path && func;
        };
        
        var invokeSpecValueFunction = function (func, value, mappers) {
            if (isString(func)) {
                return mappers ? fluid.model.getBeanValue(mappers, func)(value) : fluid.invokeGlobalFunction(func, [value]);
            } else {
                return func(value);
            }
        };
                
        var dbSpec = spec[dbName].dataSpec; 
        for (key in dbSpec) {
            if (dbSpec.hasOwnProperty(key)) {
                var specValue = dbSpec[key];
                if (isString(specValue)) {
                    normalizedModel[key] = fluid.model.getBeanValue(model, specValue);
                }
                else {
                    var specValueFunc = specValue.func;
                    var specValuePath = specValue.path;
                    if (!validatePathFunc(specValuePath, specValueFunc) || !isString(specValuePath)) {
                        fluid.log("Model Spec Function or Path not found in: " + specValue);
                    } else {
                        normalizedModel[key] = invokeSpecValueFunction(specValueFunc, fluid.model.getBeanValue(model, specValuePath), spec[dbName].mappers);
                    }
                }
            }
        }
        
        return normalizedModel;
    };
    
})(jQuery, fluid);