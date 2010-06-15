/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/
/*global jqUnit*/


(function ($) {
    fluid.logEnabled = true;
    
    var DateTests = new jqUnit.TestCase("Date Tests");
    
    DateTests.test("Parsing and Rendering", function() {
        var format = "MMMM dd, yyyy";
        var fixedDate = fluid.dateUtils.parseISO8601("2009-07-16T12:15:07Z");
        var engDate = fluid.dateUtils.renderLocalisedDate(fixedDate, format, "en");
        jqUnit.assertEquals("EEENGLEESH DATE", "July 16, 2009", engDate);
        var frDate = fluid.dateUtils.renderLocalisedDate(fixedDate, format, "fr");
        jqUnit.assertEquals("French date", "Juillet 16, 2009", frDate);
    });
})(jQuery);
