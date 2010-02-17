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
    };
    
    var setupNavBar = function (that) {
        that.navBar = fluid.initSubcomponent(that, "navigationBar", [that.container, fluid.COMPONENT_OPTIONS]);
        that.navBar.events.onToggle.addListener(function () {
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
        // Init title
        that.locate("title").text(that.options.strings.header);
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
                type : "fluid.engage.navigationBar"
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
                title: "flc-myCollection-title"
            },

            styles: {
                load: "fl-myCollection-loading",
                collectionEmpty: "fl-myCollection-empty",
                emptyStatus: "fl-myCollection-emptyStatus"
            },

            strings: {
                header: "My Collection",
                emptyCollectionMessage:
                    "Your collection is empty. Start adding artifacts to your " +
                    "collection by using the \"Collect\" button you find on artifact screens."
            }
        }
    );
})(jQuery);
