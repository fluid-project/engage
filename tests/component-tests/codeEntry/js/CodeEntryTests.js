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


    /**
     * For test purposes - only even numbers are valid codes.
     */
    var simulateCheck = function () {
        if (component.code[1] % 2 === 0) {
            return "#";
        }
    };
    
    var setup = function () {
        tests.fetchTemplate(
                "../../../../components/codeEntry/html/codeEntry.html",
                ".flc-codeEntry");
        
        component = fluid.engage.codeEntry(".flc-codeEntry",
            {getArtifactUrlFn: simulateCheck});
    };
    
    tests = jqUnit.testCase("Code Entry Tests", setup);
    
    var codeEntryTests = function () {
        tests.test("Component construction test", function () {
            expect(2);
            
            jqUnit.assertNotUndefined("Component defined.", component);
            jqUnit.assertNotNull("Component not null.", component);
        });
        
        tests.test("Buttons test", function () {
            expect(11);
            
            var firstDigitField = component.locate("firstDigitField");
            
            var buttons = component.locate("numButtons");
            var del = component.locate("delButton");
            
            $(buttons[0]).click();
            del.click();
            
            jqUnit.assertEquals("Delete button working.", "", firstDigitField.text());
            
            for (var i = 0; i < buttons.length; i++) {
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
                    component.options.strings.invalidCode, headBlock.text());
            

            // Enter one digit - the error message persists
            component.enterDigit(2);
            jqUnit.assertEquals("First digit is 2.", "2", firstDigitField.text());
            jqUnit.assertEquals("Second digit blank.", "", secondDigitField.text());
            jqUnit.assertEquals("Invalid code message shown.",
                    component.options.strings.invalidCode, headBlock.text());
            
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
