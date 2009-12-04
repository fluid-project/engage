/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid*/

(function ($, fluid) {
	
	fluid.engage = fluid.engage || {};
    
    /*******************************
     * Cookies                     *
     * --------------------------- *
     * depends on jquery.cookie.js *
     *******************************/
    
    fluid.engage.setCookie = function (name, value, options) {
        value = JSON.stringify(value);
        $.cookie(name, value, options);
    };
    
    fluid.engage.getCookie = function (name) {
        return JSON.parse($.cookie(name));
    };
	
})(jQuery, fluid);