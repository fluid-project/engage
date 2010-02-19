/*
 Copyright 2009 University of Toronto

 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.

 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt

 */
/*global jQuery, fluid, window*/
"use strict";

fluid = fluid || {};
fluid.engage = fluid.engage || {};

(function ($) {
    
    var openSendEmailDialog = function (that) {
        that.sendEmailDialog.dialog("open");
        window.scroll(0, 0);
    };

    // TODO: This should be replaced with paramsToMap() rather than custom code.
    var getLanguage = function () {
        var query = window.location.search;

        var idx = query.indexOf("lang=");
        if (idx < 0) {
            return;
        }
        idx += "lang=".length;

        var endIdx = query.indexOf("&", idx);

        endIdx = endIdx > idx ? endIdx : query.length;

        return query.substring(idx, endIdx);
    };      

    var buildSendCollectionParams = function (that) {
        var artifacts = fluid.transform(that.model, function (artifact) {
            return artifact.artifactId;
        });

        return {
            language: getLanguage(),
            action: "add",
            email: that.locate("sendEmailInput").attr("value"),
            artifacts: artifacts.join()
        };
    };

    var sendEmail = function (that) {
        $.ajax({
            url: "../myCollection/sendEmail.json" + "?" + $.param(buildSendCollectionParams(that)),
            type: "GET"        
        });
    };

    /**
     * Isolate the initialization of the navigation list here
     * @param that, the component
     */
    var initNavigationList = function (that) {
        fluid.merge("merge", that.options.navigationList.options, {
            model: that.model
        });
        
        that.navigationList = fluid.initSubcomponent(that, "navigationList", [
            that.locate("navListContainer"),
            that.options.navigationList.options
        ]);

        that.navigationList.events.afterRender.addListener(function () {
            that.container.removeClass(that.options.styles.load);
        });
        
        that.navBar.events.onToggle.addListener(function () {
            that.navigationList.toggleLayout();
        });
    };
    
    var setupNavBar = function (that) {
        that.navBar = fluid.initSubcomponent(that, "navigationBar", [that.container, fluid.COMPONENT_OPTIONS]);
        
        if (that.model.length === 0) {
            that.navBar.locate("toggleButton").remove();
        }
    };
    
    var setupNavList = function (that) {
        // Don't bother fetching or rendering the nav list if we have no artifacts collected.
        if (that.model.length === 0) {
            return;
        }

        var navListLink = that.locate("navListLink");
        var navListContainer = that.locate("navListContainer");

        fluid.fetchResources({
            navlist: {
                href: navListLink.attr("href"),
                options: {
                    async: false
                }
            }
        }, function (resourceSpecs) {
            // TODO: Need to fix DOM-specific selectors here.
            var navList = $(resourceSpecs.navlist.resourceText).find(".flc-navigationList-listGroup");
            navListContainer.append(navList);
            
            // After we have fetched the template we can initialize the navigation
            // list subcomponent and the image reorderer subcomponent.
            // An side effect is that the component is not fully constructed after
            // it returns from its initialization function.
            initNavigationList(that);
        });
    };
    
    var setupStatusMessage = function (statusEl, myCollectionContainerEl, strings, styles) {
        var status = strings.emptyCollectionMessage;
        
        statusEl.text(status);
        statusEl.addClass(styles.emptyStatus);
        myCollectionContainerEl.addClass(styles.collectionEmpty);
    };
    
    var setupSendEmailDialog = function (that) {
        var strings = that.options.strings;

        var sendEmailMessage = that.locate("sendEmailMessage");
        sendEmailMessage.text(strings.sendEmailDialogMessage);

        var submit = strings.submitEmailButton;
        var cancel = strings.cancelEmailButton;
        var options = {
            autoOpen: false,
            modal: false,
            position: ["center", "top"],
            width: 320,
            minHeight: 200,
            dialogClass: that.options.styles.dialogClass,
            buttons: {},
            closeText: "",
            title: " "
        };
        options.buttons[submit] = function () {
            sendEmail(that);
            $(this).dialog("close");
        };
        options.buttons[cancel] = function () {
            $(this).dialog("close");
        };

        that.sendEmailDialog = that.locate("sendEmailDialog");
        that.sendEmailDialog.dialog(options);
    };

    var setupSendEmailButton = function (that) {
        var sendEmailButton  = that.locate("sendEmailButton");
        if (that.model.length === 0) {
            sendEmailButton.hide();
        }
        sendEmailButton.click(function (evt) {
            openSendEmailDialog(that);
            evt.preventDefault();
        });
    };
    
    /**
     * Initializes all elements of the collection view that have not been initialized.
     * 
     * @param {Object} that, the component
     */
    var setupMyCollection = function (that) {
        setupNavBar(that);
        setupNavList(that);
        if (that.model.length === 0) {
            setupStatusMessage(that.locate("collectionEmptyStatus"),
                               that.locate("myCollectionContainer"),
                               that.options.strings, 
                               that.options.styles);
        }
        // This needs to be done through the renderer.        
        // Init title
        that.locate("title").text(that.options.strings.header);
        // Init send button
        that.locate("sendEmailButton").text(that.options.strings.sendEmailButton);
        setupSendEmailDialog(that);
        setupSendEmailButton(that);
    };

    /**
     * The component's creator function. 
     * 
     * @param {Object} container, the container which will hold the component
     * @param {Object} options, options passed into the component
     */
    fluid.engage.myCollection = function (container, options) {
        var that = fluid.initView("fluid.engage.myCollection", container, options);
        that.model = that.options.model;        
        setupMyCollection(that);
        return that;
    };
    
    fluid.defaults("fluid.engage.myCollection",
        {
            navigationBar : {
                type : "fluid.engage.navigationBar",
                options: {
                    selectors: {
                        toggleDefaultIcon: ".flc-navigationBar-toggle-list",
                        toggleAlternateIcon: ".flc-navigationBar-toggle-grid"
                    }
                }
            },
            
            navigationList: {
                type: "fluid.navigationList",
                options: {
                    useDefaultImage: true,
                    defaultToGrid: true
                }
            },
                
            selectors: {
                myCollectionContainer: ".flc-myCollection-container",
                navListContainer: ".flc-navigationList",
                navListLink: ".flc-myCollection-navigationList-link",
                collectionEmptyStatus: ".flc-myCollection-emptyStatus",
                title: ".flc-myCollection-title",
                sendEmailButton: ".flc-myCollection-sendEmailButton",
                sendEmailDialog: ".flc-myCollection-sendMailDialog",
                sendEmailMessage: ".flc-myCollection-sendMailMessage",
                sendEmailInput: ".flc-myCollection-sendEmailInput"
            },

            styles: {
                load: "fl-myCollection-loading",
                collectionEmpty: "fl-myCollection-empty",
                emptyStatus: "fl-myCollection-emptyStatus",
                dialogClass: "fl-myCollection-dialogContainer"
            },

            strings: {
                header: "My Collection",
                emptyCollectionMessage: "Your collection is empty. Start adding artifacts to your " +
                    "collection by using the \"Collect\" button you find on artifact screens.",
                sendEmailButton: "Send",
                sendEmailDialogMessage: "We'll send your collection to the email address below.",
                submitEmailButton: "Submit",
                cancelEmailButton: "Cancel"
            }        
        }
    );
})(jQuery);
