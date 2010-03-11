/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt 
*/

/*global jQuery, fluid, jqUnit*/
"use strict";

(function ($) {

    var container = ".flc-artifact";
    var artifactViewComponent;
    
    var compareSectionHeaders = function (component, postfix) {
        var headers = ["artifactMedia", "artifactComments", "artifactRelated"];
        var sections = component.locate("sections");
        var options = component.options;
        $.each(headers, function (index, header) {
            var sectionSize = header === "artifactComments" ? 
                options.comments.options.model.comments.length : component.model[header + "Count"];
            header += postfix || "";
            jqUnit.assertEquals("Ensure that the header for section header is correct when " + 
                (postfix ? postfix.toLowerCase() : "closed"),
                fluid.stringTemplate(options.strings[header], {size: sectionSize}), 
                $(options.selectors.sectionHeader, sections[index]).text());
        });
    };
    
    var testSectionHeadersUpdated = function (component) {
        compareSectionHeaders(component);
        $.each(component.cabinet.locate("handle"), function (index, handle) {
            $(handle).click();
        });
        compareSectionHeaders(component, "Opened");    
    };
    
    var artifactViewTests = function () {
        
        var tests = jqUnit.testCase("Artifact View Tests",  function () {
            tests.fetchTemplate("../../../../components/artifactView/html/view.html", container);
            artifactViewComponent = fluid.engage.artifactView(container, {
                model: {
                    artifactMediaCount: 1,
                    artifactRelatedCount: 2
                },
                "comments": {
                    "options": {
                        "model": {
                            "comments": [
                                {
                                    "_id": "892ab6669da75f1d9354755e7b706389",
                                    "_rev": "2-0d359d238454389a5a873e603645f6c3",
                                    "text": "Dhdjskjdh",
                                    "date": "2010-02-19T14:04:10.000Z",
                                    "authorId": "9bd16015e7edfe7ab743ca6c684f279e",
                                    "userName": "Anonymous",
                                    "type": "fluid.guestbook.comment",
                                    "authorName": "Anonymous CATT",
                                    "targetType": "artifact",
                                    "targetId": "M976.188.1",
                                    "abuseReported": {
                                        "07ca7651e7d7baf63d6d43d4bf23a5cc": true
                                    }
                                }
                            ],
                            "totalComments": 1
                        },
                        "strings": {
                            "addNote": "Add Note",
                            "delete": "Delete",
                            "reportAbuse": "Report Abuse",
                            "abuseReported": "Abuse reported. Pending moderator review",
                            "cancel": "Cancel",
                            "submit": "Submit",
                            "commentEntry": "Comment Entry",
                            "title": "Guestbook for This Exhibition"
                        },
                        "addNoteTarget": "../guestbook/comment.html?type=artifact&id=M976.188.1&db=mccord&lang=en",
                        "postURL": "../guestbook/comment.json?db=mccord",
                        "locale": "en",
                        "templateSource": "\r\n        <div class=\"flc-guestbook-container fl-guestbook\" >\r\n                        <!-- Navigation Bar and Header -->\r\n            <div class=\"flc-navigationBar fl-navbar fl-col-mixed\">\r\n                <!-- Back button -->\r\n                <div class=\"fl-col-fixed fl-force-left\">\r\n                    <a class=\"flc-navigationBar-back fl-button fl-backButton\" href=\"#\">\r\n                        <img class=\"fl-button-inner fl-button-icon\" src=\"../../../../fluid-engage-core/shared/images/back.png\" alt=\"Go back\"/>\r\n                    </a>\r\n                </div>\r\n                <!-- Home button -->\r\n                <div class=\"fl-col-fixed fl-force-left\">\r\n                    <a class=\"flc-navigationBar-home fl-button\" href=\"#\">\r\n                        <img class=\"fl-button-inner fl-button-icon\" src=\"../../../../fluid-engage-core/shared/images/home.png\" alt=\"Go home\"/>\r\n                    </a>\r\n                </div>\r\n                <!-- Page header -->\r\n                <h1 class=\"flc-guestbook-title fl-navbar-title fl-col-flex\">Guestbook for This Exhibition</h1>\r\n            </div>\r\n            \r\n            <div class=\"flc-guestbook-addnote fl-guestbook-addnote\">\r\n               <div class=\"fl-centered\">\r\n                   <a class=\"flc-guestbook-addnote-control\" href=\"comment.html\">\r\n                       <label for=\"fl-addnote\" class=\"flc-guestbook-addnote-text fl-guestbook-title\">Add a note</label>\r\n                       <span id=\"fl-addnote\" class=\"fl-guestbook-addnote-control\"></span>\r\n                   </a>\r\n               </div>\r\n            </div>\r\n            <div class=\"flc-guestbook-comment-cell fl-guestbook-comment-cell\">\r\n              <div class=\"fl-guestbook-header fl-push\">\r\n                <span class=\"flc-guestbook-author fl-guestbook-author fl-guestbook-slash-after\">Robert Brown</span>\r\n                <span class=\"flc-guestbook-location fl-guestbook-location fl-guestbook-slash-after\">Washington, DC</span>\r\n                <span class=\"flc-guestbook-date fl-guestbook-date\">July 16, 2009</span>\r\n              </div>\r\n                <span class=\"flc-guestbook-text fl-guestbook-text fl-push\">I had such an amazing time at this\r\n                exhibit! Really loved the red sleigh especially. I had one just like it growing up</span>\r\n              <div class=\"fl-push\"> </div>\r\n              <div class=\"fl-guestbook-actions fl-force-right\">\r\n                <a class=\"flc-guestbook-action fl-guestbook-action\">REPORT ABUSE</a>\r\n              </div>\r\n              <div class=\"fl-push\"> </div>\r\n            </div>\r\n        </div>\r\n        "
                    }
                }
            });
        });
        
        tests.test("Artifact sections' headers updated", function () {
            testSectionHeadersUpdated(artifactViewComponent);            
        });
        
    };
    
    $(document).ready(function () {
        artifactViewTests();
    });
        
}(jQuery));