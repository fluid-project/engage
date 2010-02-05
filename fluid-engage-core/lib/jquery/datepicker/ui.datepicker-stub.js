/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt


 * Copyright (c) 2008 AUTHORS.txt (http://ui.jquery.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
*/
// A "stub" file to allow access to localisation files provided for the JQuery UI 
// datepicker without a dependence on either JQuery UI Core or the Datepicker itself.


// Declare dependencies.
/*global jQuery, fluid*/
"use strict";

fluid = fluid || {};

(function ($) {

if (!$.datepicker) { // avoid corrupting the genuine datepicker if it is loaded 
    $.datepicker = {
        regional: {},
        setDefaults: function() {}
    };
}
      
})(jQuery);

 