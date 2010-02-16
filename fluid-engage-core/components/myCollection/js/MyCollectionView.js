/*
 Copyright 2009 University of Toronto

 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.

 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt

 */
/*global jQuery, fluid, window*/

fluid = fluid || {};

(function ($) {      

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
        
        that.locate("toggler").click(function () {
            that.navigationList.toggleLayout();
        });
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
            var navListGroup = $(resourceSpecs.navlist.resourceText).find(".flc-navigationList-groupContainer");
            navListContainer.html(navListGroup.html());
            
            // After we have fetched the template we can initialize the navigation
            // list subcomponent and the image reorderer subcomponent.
            // An side effect is that the component is not fully constructed after
            // it returns from its initialization function.
            initNavigationList(that);
        });
    };
    
    var setupStatusMessage = function (statusEl, strings, collectedArtifacts) {
        var collectionSize = collectedArtifacts.length;
        var status = strings.emptyCollectionMessage;
        
        // TODO: This needs to be internationalized.
        if (collectionSize > 0) {
            status = fluid.stringTemplate(
                strings.statusMessageTemplate, {
                    artifactsNumber: collectionSize,
                    artifactsPlural: collectionSize === 1 ? "" : "s"
                }
            );
        }
        statusEl.text(status);
    };
    
    /**
     * Initializes all elements of the collection view that have not been initialized.
     * 
     * @param {Object} that, the component
     */
    var setupMyCollection = function (that) {    	
    	setupNavList(that);
        setupStatusMessage(that.locate("collectionStatus"), 
                           that.options.strings, 
                           that.model);

        // TODO: This should be replaced by the Navigation Bar component.
        that.locate("navbarTitle").text(that.options.strings.header);
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
            navigationList: {
                type: "fluid.navigationList",
                options: {
                    useDefaultImage: true,
                    defaultToGrid: true
                }
    		},
                
            selectors: {
                myCollectionContainer: ".flc-myCollection-imageContainer",
                navbarTitle: ".flc-navbar-title", 
                navListContainer: ".flc-navigationList",
                navListLink: ".flc-navigationList-link",
                backButton: ".flc-myCollection-back",
                collectionStatus: ".flc-myCollection-status",
                toggler: ".flc-myCollection-toggler"
            },

            styles: {
                load: "fl-myCollection-loading"
            },

            strings: {
                header: "My Collection",
                statusMessageTemplate:
                    "Your collection contains %artifactsNumber artifact" +
                    "%artifactsPlural. Touch and drag the thumbnails to reorganize.",
                emptyCollectionMessage:
                    "Your collection is empty. Start adding artifacts to your " +
                    "collection by using the \"Collect\" button you find on artifact screens."
            }
        }
    );
})(jQuery);
