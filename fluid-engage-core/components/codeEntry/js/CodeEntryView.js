/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, document, window*/
"use strict";

fluid = fluid || {};
fluid.engage = fluid.engage || {};

(function ($) {
    
    // TODO: get the relevant museum from the url or cookie
    var museum = "mccord";
    
    /**
     * Clears the digit entry fields and allows input.
     * 
     * @param {Object} that, the component.
     */
    var resetEntry = function (that) {
        that.locate("firstDigitField").html("");
        that.locate("secondDigitField").html("");
    };
    
    /**
     * Redirects the browser to the given URL.
     * 
     * @param {Object} that, the component.
     * @param link, the url to redirect to.
     */
    var redirectToArtifactPage = function (that, link) {
        // Do some cleanup before leaving the page
        resetEntry(that);
        that.code = "";
        that.atDigit = 0;
        
        window.location = link;
    };
    
    /**
     * Displays an warning message for invalid code and resets the entry fields.
     * 
     * @param {Object} that, the component. 
     */
    var wrongCodeSequence = function (that) {
        var invalidCodeBlock = that.locate("invalidCode");
        invalidCodeBlock.html(that.options.strings.invalidCode);
        invalidCodeBlock.fadeTo(500, 1, function () {
            invalidCodeBlock.fadeTo(2000, 0, function () {
                resetEntry(that);
                that.code = "";
                that.atDigit = 0;
            });
        });
    };
    
    /**
     * Issues a Ajax call to verify if the entered code corresponds to an
     * artifact and depending on that either redirects to the artifact page
     * or displays a warning.
     * 
     * @param {Object} that, the component.
     */
    var checkCode = function (that) {
        var url = location.pathname;
        url = "http://" + location.host + url.substring(0, url.lastIndexOf("/"));
        url += "/codeEntryService.js?code=" + that.code + "&db=" + museum;
        
        var error = function (XMLHttpRequest, textStatus, errorThrown) {
            fluid.log("Status: " + textStatus);
            fluid.log("Error: " + errorThrown);
        };
        
        var success = function (returnedData) {
            
            var data = JSON.parse(returnedData);
            var redirectFunction = function () {
                redirectToArtifactPage(that, data.artifactLink);
            };
            
            if (data.artifactFound) {
                setTimeout(redirectFunction, that.options.redirectDelay);
            } else {
                wrongCodeSequence(that);
            }
        };
        
        $.ajax({
            url: url,
            async: true,
            error: error,
            success: success
        });
    };
    
    /**
     * Return the current digit dom element - if no digit has been entered
     * this is the first one, otherwise it is the second one.
     */
    var getCurrentDigitField = function (that) {
        return that.atDigit === 0 ?
                that.locate("firstDigitField") : that.locate("secondDigitField");
    };
    
    /**
     * Initialize a handler for a digit or delete entry button.
     * For digit handlers if the second digit is entered the whole code is
     * checked and relevant actions are taken.
     * 
     *  @param {Object} that, the component.
     *  @param button, the DOM element for buttons from 0 to 9 and delete
     *  @param number, the number that will be displayed if the user clicks
     *      on the button, from 1 to 10 for digits and 11 for delete
     */
    var attachButtonHandler = function (that, button, number) {
        if (number < 11) {
            var num = number % 10;
            $(button).click(function () {
                getCurrentDigitField(that).html(num);
                if (that.atDigit === 0) {
                    that.code += num;
                    that.atDigit++;
                } else {                
                    that.code += num;
                    checkCode(that);            
                }
            });
        } else {
            $(button).click(function () {
                getCurrentDigitField(that).html("");
                if (that.atDigit === 1) {
                    that.atDigit--;
                    that.code = "";
                }
            });         
        }
    };
    
    /**
     * Initializes the component view.
     * 
     * @param that, the component.
     */
    var setup = function (that) {
        // Init back button
        that.locate("backButton").attr("href", document.referrer);
        
        // Init instruction text        
        that.locate("instructionText").text(that.options.strings.instruction);
        
        // Initialize numpad
        that.atDigit = 0;
        that.code = "";
        
        // Initialize entry buttons
        var buttons = that.locate("entryButtons");
        
        for (var i = 0; i < buttons.length; i++) {
            attachButtonHandler(that, buttons[i], i + 1);
        }
    };
    
    /**
     * Component's creator function.
     * 
     * @param {Object} container, DOM element that will correspond to the component.
     * @param {Object} options, the component's options.
     */
    fluid.engage.codeEntry = function (container, options) {
        var that = fluid.initView("fluid.codeEntry", container, options);       
        
        setup(that);
    };
    
    fluid.defaults("fluid.codeEntry", {
        selectors : {
            "backButton": ".flc-back-button",
            "invalidCode": ".flc-invalid-code-message",
            "instructionText": ".flc-instruction-text",
            "firstDigitField": ".flc-first-digit",
            "secondDigitField": ".flc-second-digit",
            "entryButtons": ".flc-numpad img[class*=flc-button]"
        },
        strings : {
            instruction: "Enter code from the object's label to learn more about the object.",
            invalidCode: "You've entered an invalid code. Please try again"
        },
        redirectDelay: 1000
    });
})(jQuery);
