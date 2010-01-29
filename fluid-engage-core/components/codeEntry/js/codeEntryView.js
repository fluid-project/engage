/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, document, window*/

fluid = fluid || {};

(function ($) {
	
	// TODO: get the relevant museum from the url or cookie
	var museum = "mccord";

	var redirectToArtifactPage = function (link) {
		window.location = link;
		//location.href = link;
		//top.location = link;
		//document.location = link;
	};
	
	var wrongCodeSequence = function (that) {
		alert("Invalid code");
	};
	
	var getCurrentDigitField = function (that) {
		return that.atDigit === 0 ?
				that.locate("firstDigitField") : that.locate("secondDigitField");
	};
	
	var attachDigitHandler = function (that, buttonSelector, number) {
		var button = that.locate(buttonSelector);

		button.click(function () {
			getCurrentDigitField(that).html(number);
			if (that.atDigit === 0) {
				that.code += number;
				that.atDigit++;
			} else {				
				that.code += number;
				var url = location.pathname;
				url = "http://" + location.host + url.substring(0, url.lastIndexOf("/"));
				url += "/codeEntryService.js?code=" + that.code + "&db=" + museum;
				
		        var error = function (XMLHttpRequest, textStatus, errorThrown) {
		            fluid.log("Status: " + textStatus);
		            fluid.log("Error: " + errorThrown);
		        };
				
				var success = function (returnedData) {
					var data = JSON.parse(returnedData);
					if (data.artifactFound) {
						redirectToArtifactPage(data.artifactLink);
					} else {
						wrongCodeSequence(that);
					}
				};
				
				$.ajax({
					url: url,
					async: false,
					error: error,
					success: success
				});
			}
		});
	};
	
	var attachDelHandler = function (that) {
		var button = that.locate("buttonDel");
		
		button.click(function () {
			getCurrentDigitField(that).html("");
			if (that.atDigit === 1) {
				that.atDigit--;
				that.code = "";
			}
		});
	};
	
	
	var setup = function (that) {
		// Init back button
		alert(document.referrer);
		that.locate("backButton").attr("href", document.referrer);
		
		// Init instruction text		
		that.locate("instructionText").text(that.options.strings.instruction);
		
		// Initialize numpad
		that.atDigit = 0;
		that.code = "";
		
		attachDigitHandler(that, "buttonOne", 1);
		attachDigitHandler(that, "buttonTwo", 2);
		attachDigitHandler(that, "buttonThree", 3);
		attachDigitHandler(that, "buttonFour", 4);
		attachDigitHandler(that, "buttonFive", 5);
		attachDigitHandler(that, "buttonSix", 6);
		attachDigitHandler(that, "buttonSeven", 7);
		attachDigitHandler(that, "buttonEight", 8);
		attachDigitHandler(that, "buttonNine", 9);
		attachDigitHandler(that, "buttonZero", 0);
		attachDelHandler(that);
	};
	
	fluid.codeEntry = function (container, options) {
        var that = fluid.initView("fluid.codeEntry", container, options);       
        
        setup(that);
	};
	
    fluid.defaults("fluid.codeEntry", {
    	selectors : {
    		"backButton": "flc-back-button",
    		"instructionText": ".flc-instruction-text",
    		"firstDigitField": ".flc-first-digit",
    		"secondDigitField": ".flc-second-digit",
    		"buttonOne": ".flc-button-one",
    		"buttonTwo": ".flc-button-two",
    		"buttonThree": ".flc-button-three",
    		"buttonFour": ".flc-button-four",
    		"buttonFive": ".flc-button-five",
    		"buttonSix": ".flc-button-six",
    		"buttonSeven": ".flc-button-seven",
    		"buttonEight": ".flc-button-eight",
    		"buttonNine": ".flc-button-nine",
    		"buttonZero": ".flc-button-zero",
    		"buttonDel": ".flc-button-del"
    	},
    	strings : {
    		instruction: "Enter code from the object's label to learn more about the object."
    	}
	});
})(jQuery);
