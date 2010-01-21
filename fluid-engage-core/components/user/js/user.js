/*
 Copyright 2009 University of Toronto

 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.

 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt

 */

/*global jQuery, fluid*/

fluid = fluid || {};

(function ($) {

    var compileUrl = function () {
        var path = location.pathname.substring(0, location.pathname.lastIndexOf("/"));
        var url = "http://" + location.host + "/users/userService.js";
        
        return url;
    };

    var setup = function () {
    	that = {};
    	
        that.generateUuid = function () {
            var uuid;
            
            var successCallback = function (returnedData) {
                uuid = returnedData;
            };
            
            var errorCallback = function (XMLHttpRequest, textStatus, errorThrown) {
                fluid.log("Status: " + textStatus);
                fluid.log("Error: " + errorThrown);
            };
            
            $.ajax({url: compileUrl(), async: false, success: successCallback, error: errorCallback});
            
            fluid.engage.setCookie(that.options.cookieName, uuid, {path: "/"});
            
            return uuid;
        };
        
        that.getUuid = function () {
            return fluid.engage.getCookie(that.options.cookieName, {path: "/"});
        };
        
        return that;
    };
    
    fluid.user = function (container, options) {
    	var that = setup();
    	fluid.mergeComponentOptions(that, "fluid.user");
    	
        return that;
    };
    
    fluid.defaults("fluid.user", {
        cookieName: "engage.uuid"
    });    
})(jQuery);