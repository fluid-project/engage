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

    /**
    * Clears the digit entry fields and allows input.
    * Also resets the code and atDigit values.
    * 
    * @param {Object} that, the component.
    */
    var reset = function (that) {
        that.locate("firstDigitField").text("");
        that.locate("secondDigitField").text("");
        that.code = "";
        that.atDigit = 0;
        that.deleteEnabled = true;
    };

    /**
     * Redirects the browser to the given URL.
     * 
     * @param {Object} that, the component.
     * @param url, the URL to redirect to.
     */
    var redirectToArtifactPage = function (that, url) {
        // Do some cleanup before leaving the page
        reset(that);
        window.location = url;
    };

    /**
     * Display a message and redirect to artifact page after some delay.
     * 
     * @param {Object} that, the component
     * @param url, the URL to redirect to.
     */
    var redirectSequence = function (that, url) {
        var msg = that.locate("headMessage");
        var opts = that.options;
        
        // Replace the invalid code message with something...
        msg.text(opts.strings.redirecting);
        
        msg.removeClass(opts.styles.invalidCode);
        
        setTimeout(function () {
            redirectToArtifactPage(that, url);
        }, opts.redirectDelay);
    };

    /**
     * Displays a warning message for invalid code and resets the entry fields.
     * 
     * @param {Object} that, the component.
     */
    var wrongCodeSequence = function (that) {
        var msg = that.locate("headMessage");
        var opts = that.options;
        
        msg.text(opts.strings.invalidCode);
        msg.addClass(opts.styles.invalidCode);
        
        msg.show(250, function () {
            reset(that);
        });
    };

    /**
     * Issues a Ajax call to verify if the entered code corresponds to an
     * artifact and depending on that either redirects to the artifact page or
     * displays a warning.
     * 
     * @param {Object} that, the component.
     */
    var getArtifactUrl = function (that) {
        var url = fluid.stringTemplate(
            decodeURIComponent(that.options.codeCheckUrlTemplate), {
            objectCode : that.code
        });
        
        var artifactLink;
        var success = function (data) {
            artifactLink = data;
        };
        
        $.ajax({
            url : url,
            success : success,
            async: false
        });
        
        return artifactLink;
    };

    /**
     * Return the current digit dom element - if no digit has been entered this
     * is the first one, otherwise it is the second one.
     */
    var getCurrentDigitField = function (that) {
        return that.atDigit === 0 ? that.locate("firstDigitField") : that.locate("secondDigitField");
    };
    
    var setupDelete = function (that, button) {
        button.attr("alt", that.options.strings.deleteLabel);
        button.click(that.deleteLastDigit);
    };

    /**
     * Initializes the component view.
     * 
     * @param that, the component.
     */
    var setup = function (that) {
        var strings = that.options.strings;
        // Initialize the navigation bar.
        that.navBar = fluid.initSubcomponent(that, "navigationBar", [that.container, fluid.COMPONENT_OPTIONS]);
        
        // Init title
        that.locate("title").text(strings.header);
        
        // Init instruction text
        that.locate("headMessage").text(strings.instruction);
        
        // Initialize numpad
        reset(that);
        
        //Initialize number buttons
        that.locate("numButtons").each(function () {
            var btn = $(this);
            btn.click(function () {
                that.enterDigit(parseInt(btn.attr("alt"), 10));
            });
        });
        
        //Initialize delete button
        setupDelete(that, that.locate("delButton"));
    };

    /**
     * Component's creator function.
     * 
     * @param {Object} container, DOM element that will correspond to the component.
     * @param {Object} options, the component's options.
     */
    fluid.engage.codeEntry = function (container, options) {
        var that = fluid.initView("fluid.engage.codeEntry", container, options);
        
        that.enterDigit = function (digit) {
            getCurrentDigitField(that).text(digit);
            if (that.atDigit === 0) {
                if (digit !== 0) {
                    that.code += digit;
                }
                that.atDigit++;
            } else {
                that.code += digit;
                that.deleteEnabled = false;
                var artifactLink = that.options.getArtifactUrlFn(that);
                if (artifactLink) {
                    redirectSequence(that, artifactLink);
                } else {
                    wrongCodeSequence(that);
                }                        
            }
        };
        
        that.deleteLastDigit = function () {
            if (!that.deleteEnabled) {
                return;
            }
            
            if (that.atDigit === 1) {
                that.atDigit--;
                that.code = "";
                getCurrentDigitField(that).text("");
            }
        };
        
        setup(that);
        
        return that;
    };

    fluid.defaults("fluid.engage.codeEntry", {
        navigationBar : {
            type : "fluid.engage.navigationBar"
        },
        selectors : {
            title : ".flc-codeEntry-title",
            headMessage : ".flc-codeEntry-headMessage",
            firstDigitField : ".flc-codeEntry-firstDigit",
            secondDigitField : ".flc-codeEntry-secondDigit",
            numButtons: ".flc-codeEntry-numButton",
            delButton: ".flc-codeEntry-delButton"
        },
        styles : {
            invalidCode : "fl-codeEntry-invalidCode"
        },
        strings : {
            title : "Enter object code",
            header : "Enter object code",
            instruction : "Enter code from the object's label to learn more about the object.",
            invalidCode : "Invalid code. Please try again",
            redirecting : "Opening artifact page.",
            deleteLabel: "Delete"
        },
        codeCheckUrlTemplate: "",
        redirectDelay : 1000,
        getArtifactUrlFn: getArtifactUrl
    });
})(jQuery);
