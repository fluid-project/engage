/*
Copyright 2008-2009 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, java*/

fluid = fluid || {};

(function ($, fluid) {
    fluid.kettle = fluid.kettle || {};
    
    /** Three utilities that might well go into the framework **/

    /** Version of jQuery.makeArray that handles the case where the argument is undefined **/
    
    fluid.makeArray = function (array) {
        return $.makeArray(array === undefined ? null: array);
    };
    
    fluid.generate = function (n, generator) {
        var togo = [];
        for (var i = 0; i < n; ++ i) {
            togo[i] = typeof(generator) === "function" ?
                generator.call(null, i) : generator;
        }
        return togo;       
    };
    
    fluid.identity = function() {
        if (arguments.length < 2) {
            return arguments[0];
        }
        else return $.makeArray(arguments);
    }
  
    // From URLUtil.java
    function push(hash, key, value) {
        var exist = hash[key];
        if (!exist) {
            hash[key] = value;
        }
        else if (typeof(exist) === "string") {
            hash[key] = [exist, value];
        }
        else if (typeof(exist).length === "number") {
            exist[exist.length] = value;
        }
    }
    
    fluid.kettle.decodeURIComponent = function(comp) {
       comp = comp.replace(/\+/g, " ");
       return decodeURIComponent(comp);
    };
    
    fluid.kettle.paramsToMap = function (queryString) {
        var togo = {};
        queryString = queryString || "";
        if (queryString.charAt(0) === "?") {
            queryString = queryString.substring(1);
        }
        var segs = queryString.split("&");
        for (var i = 0; i < segs.length; ++ i) {
            var seg = segs[i];
            var eqpos = seg.indexOf("=");
            var key = seg.substring(0, eqpos);
            var value = seg.substring(eqpos + 1);
            push(togo, fluid.kettle.decodeURIComponent(key), fluid.kettle.decodeURIComponent(value));
        }
        return togo;
    };
    
    fluid.kettle.parsePathInfo = function (pathInfo) {
        var togo = {};
        var segs = pathInfo.split("/");
        if (segs.length > 0) {
            var top = segs.length - 1;
            var dotpos = segs[top].indexOf(".");
            if (dotpos !== -1) {
                togo.extension = segs[top].substring(dotpos + 1);
                segs[top] = segs[top].substring(0, dotpos);
            }
        }
        togo.pathInfo = segs;
        return togo;
    };
        
    /** Collapse the array of segments into a URL path, starting at the specified
     * segment index - this will not terminate with a slash, unless the final segment
     * is the empty string
     */
    fluid.kettle.collapseSegs = function(segs, from) {
        var togo = "";
        if (from === undefined) { 
            from = 0;
        }
        for (var i = from; i < segs.length - 1; ++ i) {
            togo += segs[i] + "/";
        }
        togo += segs[segs.length - 1];
        return togo;   
    };

    fluid.kettle.makeRelPath = function(parsed, index) {
        var togo = fluid.kettle.collapseSegs(parsed.pathInfo, index);
        if (parsed.extension) {
            togo += "." + parsed.extension;
        }
        return togo;
    };
    
    fluid.kettle.operateUrl = function(url, responseParser, writeDispose, callback) {
        var togo = {};
        responseParser = responseParser || fluid.identity;
        function success(responseText, textStatus) {
            togo.data = responseParser(responseText); 
            togo.textStatus = textStatus;
            if (callback) {
                callback(togo);
            }
        }
        function error(xhr, textStatus, errorThrown) {
            fluid.log("Data fetch error - textStatus: " + textStatus);
            fluid.log("ErrorThrown: " + errorThrown);
            togo.textStatus = textStatus;
            togo.errorThrown = errorThrown;
            togo.isError = true;
            if (callback) {
                callback(togo);
            }
        }
        var ajaxOpts = {
            type: "GET",
            url: url,
            success: success,
            error: error
        };
        if (writeDispose) {
          $.extend(ajaxOpts, writeDispose);
        }
        fluid.log("Issuing request for " + ajaxOpts.type + " of URL " + ajaxOpts.url);
        $.ajax(ajaxOpts);
        fluid.log("Request returned");
        return togo;
    };
    
    // Temporary definitions to quickly extract template segment from file
    // will be replaced by more mature system which will also deal with head matter
    // collection and rewriting
    var BEGIN_KEY = "<!--DISREPUTABLE TEMPLATE BOUNDARY-->";
    
    fluid.kettle.stripTemplateQuickly = function(text) {
        var bl = BEGIN_KEY.length;
        var i1 = text.indexOf(BEGIN_KEY);
        var i2 = text.indexOf(BEGIN_KEY, i1 + bl);
        if (i1 === -1 || i2 === -1) {
            fluid.fail("Template boundary not found within file");
        } 
        return text.substring(i1 + bl, i2);
    };
    
    fluid.kettle.fetchTemplateSection = function(url) {
        return fluid.kettle.operateUrl(url, fluid.kettle.stripTemplateQuickly, {async: false});
    };
  
})(jQuery, fluid);
    