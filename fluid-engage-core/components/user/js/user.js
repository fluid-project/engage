/*
 Copyright 2010 University of Toronto

 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.

 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt

 */

/*global jQuery, fluid*/
"use strict";

fluid = fluid || {};
fluid.engage = fluid.engage || {};
fluid.engage.user = fluid.engage.user = {};

(function ($) {

    var buildUserServiceURL = function (id) {
        var idParam = id ? ("?id=" + id) : "";
        return "http://" + location.host + "/users/users.json" + idParam;
    };
    
    // TODO: This should not be synchronous!!
    var ajax = function (id, data, type, success) {
        $.ajax({
            url: buildUserServiceURL(id), 
            async: false,
            data: data ? JSON.stringify(data) : {},
            dataType: "json",
            type: type,
            success: success,
            error: function (xhr, textStatus, errorThrown) {
                fluid.log("XHR: " + xhr);
                fluid.log("Status: " + textStatus);
                fluid.log("Error: " + errorThrown);
            }
        });
    };
    
    fluid.engage.user.fetchUser = function (id) {
        var user;
        ajax(id, null, "GET", function (data) {
            user = data;
        });
        return user;
    };
    
    fluid.engage.user.createNewUser = function () {
        // Create a new user document and send it off to Couch.
        var user = {
            type: "user",
            collection: {
                artifacts: []
            }
        };
        
        ajax("NEW_DOC", user, "PUT", function (data) {
            user._id = data.id;
        });
        
        return user;
    };
    
    fluid.engage.user.currentUser = function () {
        // Check the cookie to see if we've already met the user and grab their model.
        // If not, create a new document for them.
        // TODO: We should harmonize this cookie usage with the home screen. Why have two cookies?        
        var cookieId = fluid.engage.getCookie("engage.uuid");
        if (cookieId) {
           return fluid.engage.user.fetchUser(cookieId);
        } else {
            var user = fluid.engage.user.createNewUser();
            fluid.engage.setCookie("engage.uuid", user.id,  {
                path: "/"
            });
            return user;
        }
    };
    
})(jQuery);
