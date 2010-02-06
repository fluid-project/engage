/*
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one of these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/
/*global jqUnit*/
/*global expect*/

(function ($) {
    var tests = {};
    var component;

    var setup = function () {
        tests.fetchTemplate(
                "../../../../components/codeEntry/html/codeEntry.html",
                ".flc-codeEntry");
        
        component = fluid.engage.codeEntry(".flc-codeEntry", {testMode: true});
    };
    
    tests = jqUnit.testCase("Code Entry Tests", setup);
    
    // Code taken from www.sean.co.uk
    var pausecomp = function (millis)
    {
    	var date = new Date();
    	var curDate = null;

    	do {
    		curDate = new Date();
    	} while(curDate-date < millis);
    }
    
    var codeEntryTests = function () {
        tests.test("Component construction test", function () {
            expect(2);
            
            jqUnit.assertNotUndefined("Component defined.", component);
            jqUnit.assertNotNull("Component not null.", component);
        });
        
        tests.test("Buttons test", function () {
        	expect(11);
        	
        	var firstDigitField = component.locate("firstDigitField");
        	
        	var buttons = component.locate("entryButtons");
        	var del = $(buttons[10]);
        	
        	$(buttons[0]).click();
        	del.click();
        	
        	jqUnit.assertEquals("Delete button working.", "", firstDigitField.text());
        	
        	for (var i = 0; i < buttons.length - 1; i++) {
        		var buttonNumber = (i + 1) % 10;
        		$(buttons[i]).click();
        		jqUnit.assertEquals("Button number " + buttonNumber + " working.", buttonNumber + "", firstDigitField.text());
        		// Delete
        		del.click();
        	}
        });
        
        tests.test("Code entry test", function () {
        	expect(15);
        	
        	var firstDigitField = component.locate("firstDigitField");
        	var secondDigitField = component.locate("secondDigitField");
            var headBlock = component.locate("headMessage");
            
            // First the two code fields are blank
        	jqUnit.assertEquals("First Digit blank.", "", firstDigitField.text());
        	jqUnit.assertEquals("Second digit blank.", "", secondDigitField.text());
        	
        	// We enter a digit
        	component.enterDigit(3);
        	jqUnit.assertEquals("First digit is 3.", "3", firstDigitField.text());
        	jqUnit.assertEquals("Second digit blank.", "", secondDigitField.text());
        	
        	// Then delete it
        	component.deleteLastDigit();
        	jqUnit.assertEquals("First Digit blank.", "", firstDigitField.text());
        	jqUnit.assertEquals("Second digit blank.", "", secondDigitField.text());
        	
        	// Enter two digits to make a invalid code - the code fields should
        	// be blanked and an error message shown
        	component.enterDigit(3);
        	component.enterDigit(7);
            jqUnit.assertEquals("First digit blank.", "", firstDigitField.text());
            jqUnit.assertEquals("Second digit blank.", "", secondDigitField.text());
            jqUnit.assertEquals("Invalid code message shown.",
            		"<img src=\"../../../../fluid-engage-core/components/codeEntry/images/invalid-code.png\" alt=\"Invalid code.\">",
            		headBlock.html());
            

            // Enter one digit - the error message persists
            component.enterDigit(2);
            jqUnit.assertEquals("First digit is 2.", "2", firstDigitField.text());
            jqUnit.assertEquals("Second digit blank.", "", secondDigitField.text());
            jqUnit.assertEquals("Invalid code message shown.",
            		"<img src=\"../../../../fluid-engage-core/components/codeEntry/images/invalid-code.png\" alt=\"Invalid code.\">",
            		headBlock.html());
            
            // Enter second digit - the code fields are shown until redirection
            // happens
            component.enterDigit(0);
            jqUnit.assertEquals("First digit is 2.", "2", firstDigitField.text());
            jqUnit.assertEquals("Second digit is 0.", "0", secondDigitField.text());            
            jqUnit.assertEquals("Redirecting message shown.", component.options.strings.redirecting, headBlock.text());
        });
    };
    
    codeEntryTests();
})(jQuery);
