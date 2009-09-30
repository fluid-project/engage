/*
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery*/

var fluid_1_2 = fluid_1_2 || {};
var fluid = fluid || fluid_1_2;

(function ($, fluid) {
    
    fluid.engage = fluid.engage || {};
    
    var isString = function (value) {
        return typeof value === "string";
    };
    
    fluid.defaults("fluid.engage.artifactHandlers", {   
		getImageFromMarkup: function (value) {
            return $(value).filter("img").eq(0).attr("src");
        },
        
        getImageFromObjectArray: function (value) {
            
        },
        
        getTargetURL: function () {
            
        }
        
        
    });
    
    fluid.engage.artifactHandlers = function (options) {
        var that = fluid.initLittleComponent("fluid.engage.artifactHandlers", options);
        return that;
    };
    
    fluid.engage.mapModel = function (model, modelSpec, handlers) {
        
        var normalizedModel = {};
        
        var validatePathFunc = function (path, func) {
            return path && func;
        };
        
        var invokeSpecValueFunction = function (func, value, handlers) {
            if (isString(func)) {
                return handlers ? fluid.model.getBeanValue(handlers, func)(value) : fluid.invokeGlobalFunction(func, [value]);
            } else {
                return func(value);
            }
        };
        
        for (key in modelSpec) {
            if (modelSpec.hasOwnProperty(key)) {
                var specValue = modelSpec[key];
                if (isString(specValue)) {
                    normalizedModel[key] = fluid.model.getBeanValue(model, specValue);
                }
                else {
                    var specValueFunc = specValue.func;
                    var specValuePath = specValue.path;
                    if (!validatePathFunc(specValuePath, specValueFunc) || !isString(specValuePath)) {
                        fluid.log("Model Spec Function or Path not found in: " + specValue);
                    } else {
                        normalizedModel[key] = invokeSpecValueFunction(specValueFunc, fluid.model.getBeanValue(model, specValuePath), handlers);
                    }
                }
            }
        }
        
        return normalizedModel;
    };
    
})(jQuery, fluid_1_2);