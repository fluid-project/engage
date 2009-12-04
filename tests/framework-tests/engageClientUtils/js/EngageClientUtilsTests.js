/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, jqUnit*/

(function ($) {  

    function hasSameValues (obj1, obj2) {
        var result;
        
        if (obj1.length === obj2.length){
            for (var key in obj1) {
                if (obj1.hasOwnProperty(key)) {
                    if(obj1[key] !== obj2[key]) {
                        return false;
                    }
                    result = true;
                }
            }
        }
        
        return result;
    }

    function testCookies (name, value, message) {
        fluid.engage.setCookie(name, value);
        
        if (typeof value === "object") {
            jqUnit.assertTrue(message, hasSameValues(value, fluid.engage.getCookie(name)));
        } else {
            jqUnit.assertEquals(message, value, fluid.engage.getCookie(name));
        }
    }
    
    function engageClientUtilsTests () {
        var tests = jqUnit.testCase("EngageClientUtils Tests");
        
        tests.test("Cookies Test:", function () {
            testCookies("test", "value1", "Cookie set and retrieved");
            testCookies("test", "value2", "Cookie reset and retrieved");
            testCookies("test2", "value3", "New Cookie saved and retrieved");
            testCookies("test3", {test3: "value4"}, "Cookie Value is an object");
        });
    }
    
    $(document).ready(function () {
        engageClientUtilsTests();
    });
})(jQuery);
