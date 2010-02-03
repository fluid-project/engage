/*
 Copyright 2010 University of Toronto
 
 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.
 
 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt
 
 */
/*global jQuery, fluid*/

fluid = fluid || {};

(function ($) {
    
    fluid.engage = fluid.engage || {};
    
    fluid.engage.home = function () {
        $(".flc-engage-home-language").click(function () {
            $(".flc-engage-home").addClass("fl-hidden");
            $(".flc-engage-languageSelection").removeClass("fl-hidden");
        });
    };
})(jQuery);
