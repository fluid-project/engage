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

    /**
     * Creates a URL for the user server side service.
     */
    var compileUrl = function () {
        var url = "http://" + location.host + "/users/userService.js";
        
        return url;
    };

    /**
     * Creates an empty object to use in the creator function and attaches two functions to it - 
     * for UUID generation and retrieval. 
     */
    var setup = function () {
        var that = {};
        
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
    
    /**
     * The component's creator function 
     * 
     * @param {Object} container, the container which will hold the component
     * @param {Object} options, options passed into the component
     */
    fluid.user = function (container, options) {
        var that = setup();
        fluid.mergeComponentOptions(that, "fluid.user");
        
        return that;
    };
    
    fluid.defaults("fluid.user", {
        cookieName: "engage.uuid"
    });    
})(jQuery);
