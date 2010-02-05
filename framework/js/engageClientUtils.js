/*
Copyright 2009 - 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid*/

(function ($, fluid) {
    
    fluid.engage = fluid.engage || {};
    
    /*******************************
     * Cookies                     *
     * --------------------------- *
     * depends on jquery.cookie.js *
     *******************************/
    
    /**
     * Used to set a cookie
     * 
     * @param {Object} name, the name of the cookie
     * @param {Object} value, the value to be stored in the cookie (expects an object)
     * @param {Object} options, optional options to pass in (i.e. for setting experation date and etc.) See jQuery.cookie.js for more details
     */
    fluid.engage.setCookie = function (name, value, options) {
        value = JSON.stringify(value);
        $.cookie(name, value, options);
    };
    
    /**
     * Used to delete a cookie
     * 
     * @param {Object} name, the name of the cookie
     */
    fluid.engage.deleteCookie = function (name) {
        $.cookie(name, null);
    };
    
    /**
     * Returns the value of a cookie as an object
     * 
     * @param {Object} name, the name of the 
     */
    fluid.engage.getCookie = function (name) {
        return JSON.parse($.cookie(name));
    };
    
    /**********
     * Paging *
     * ------ *
     **********/
    
    /**
     * Used to ensure that the data is returned as an object, 
     * when it is unclear if it is an object or a string representing an object
     * 
     * @param {Object} data
     */
    function cleanseData(data) {
        return typeof data === "object" ? data : JSON.parse(String(data));
    }
    
    /**
     * retrieves a set of data from the database to setup the component with.
     * For example it will get the total number of items in the data set.
     * 
     * Additionally it will calculate the number of subsets, based on the total number of
     * items and the number of items per paged set. If caching is on, it will cache the first page.
     * 
     * @param {Object} that, the component
     */
    function getSetupData(that) {
        that.model = {
            pageSize: that.options.maxPageSize
        };
        function assembleDataInfo(data) {
            var size = that.options.dataSetSize;
            
            data = cleanseData(data);
            that.cachedData = that.options.useCahcing ? [data] : [];
            
            that.model.totalRange = typeof size === "string" ? fluid.model.getBeanValue(data, size) || 1 : size;
            that.model.pageCount = Math.ceil(that.model.totalRange / that.options.maxPageSize);
            that.model.pageIndex = -1;
            
            
            that.events.afterInit.fire(that);
        }
        
        that.options.dataAccessor(that.options.url, assembleDataInfo, {limit: that.options.useCaching ? that.options.maxPageSize : 1});
    }

    /**
     * Increments that.model.pageIndex by 1, as long as pageCount is smaller than the pageCount - 1
     * 
     * @param {Object} that, the component
     */
    function incrementPageIndex(that) {
        var lastSet = that.model.pageCount - 1;
        return that.model.pageIndex < lastSet ? ++that.model.pageIndex : lastSet;
    }
    
    /**
     * Decrements that.model.pageIndex by 1, as long as it is already larger than 0
     * 
     * @param {Object} that, the component
     */
    function decrementPageIndex(that) {
        return that.model.pageIndex > 0 ? --that.model.pageIndex : 0;
    }
    
    /**
     * Generates a function to update that.model.pageIndex to the requested page, and returns the page index.
     * If the index is out of range, it will return the closest valid page index.
     * 
     * @param {Object} that, the component
     * @param {Object} index, the requested page index
     */
    function generatePageIndex(that, index) {
        var newPageIndex;
        if (index >= that.model.totalRange) {
            newPageIndex = (that.model.totalRange - 1);
        } else if (index < 0) {
            newPageIndex = 0;
        } else {
            newPageIndex = index;
        }
        return function () {
            that.model.pageIndex = newPageIndex;
            return that.model.pageIndex;
        };
    }
    
    /**
     * Fetches the data and updates the component's state as needed.
     * If caching is on and there is cached data available, 
     * it will pull from the cache instead of making an ajax call
     * 
     * @param {Object} that, the component
     * @param {Object} func, a function which sets the pageIndex. It takes the arguements (that,  pageCount)
     */
    function fetchData(that, func) {
        var skipAmount;
        var opts = that.options;
        
        function setData(d) {
            d = cleanseData(d);
            
            if (opts.useCaching) {
                that.cachedData[that.model.pageIndex] = d;
            }
            
            that.events.modelChanged.fire(d);
        }
        
        func(that, that.model.pageCount);
        skipAmount = that.model.pageIndex * opts.maxPageSize;

        var cachedData = that.cachedData ? that.cachedData[that.model.pageIndex] : null;
        if (cachedData) {
            that.events.modelChanged.fire(cachedData);
        } else {
            that.options.dataAccessor(opts.url, setData, {limit: opts.maxPageSize, skip: skipAmount >= 0 ? skipAmount : 0});
        }
    }
    
    /**
     * Runs the setup functions needed by the component
     * 
     * @param {Object} that, the component
     */
    function setup(that) {
        getSetupData(that);
    }
    
    /**
     * The creator function
     * 
     * @param {Object} container, the components container
     * @param {Object} options, the options passed into the component
     */
    fluid.engage.paging = function (options) {
        var that = fluid.initLittleComponent("fluid.engage.paging", options);
        
        fluid.instantiateFirers(that, that.options);
        setup(that);
        
        /**
         * Returns the requested page of data.
         * If index is out of range, the closest valid page will be returned.
         * 
         * @param {Object} index, the index of the page to be returned.
         */
        that.goToPage = function (index) {
            fetchData(that, generatePageIndex(that, index));
        };
        
        /**
         * Returns the next set of paged data. 
         * If caching is on, and there is cached data it will return from the cache.
         * 
         * If the end of the set is reached it will fire an onLastSet event, and 
         * any subsequent calls to it will just return the last set.
         */
        that.next = function () {
            fetchData(that, incrementPageIndex);
        };
        
        /**
         * Returns the previous set of paged data. 
         * If caching is on, and there is cached data it will return from the cache.
         * 
         * If the beginning of the set is reached it will fire an onFirstSet event, and 
         * any subsequent calls to it will just return the first set.
         */
        that.previous = function () {
            fetchData(that, decrementPageIndex);
        };
        
        /**
         * Returns the current page of data.
         * 
         * If this is the first call made after init, and a starting page has been specified, this page will be returned.
         * Otherwise the first page will be given.
         */
        that.current = function () {
            that.goToPage(that.model.pageIndex < 0 && that.options.initialPage ? that.options.initialPage : that.model.pageIndex);
        };
        
        /**
         * Returns true if there is another set of data availble,
         * false otherwise.
         * 
         * This is useful for determining when you are at the end of the data.
         */
        that.hasNext = function () {
            return that.model.pageIndex < that.model.pageCount - 1;
        };
        
        /**
         * Returns true if there is a previous set of data available,
         * false otherwise.
         * 
         * This is useful for determining when you are at the beginning of the data.
         */
        that.hasPrevious = function () {
            return that.model.pageIndex > 0;
        };
        
        return that;
    };
    
    /**
     * An error callback function to be used with the dataAccessor ajax call. 
     * It will report the errors via the fluid.log function
     * 
     * @param {Object} request, XMLHttpRequest object 
     * @param {Object} status, A string describing the type of error
     * @param {Object} error, exception object
     */
    fluid.engage.paging.errorCallback = function (request, status, error) {
        fluid.setLogging(true);
        fluid.log("XMLHttpRequest: " + request);
        fluid.log("textStatus: " + status);
        fluid.log("error: " + error);
    };
    
    /**
     * Wrapper for jQuery's ajax function.
     * Internally fluid.engage.paging will pass an object with keys "skip" and "limit" as the data to the server.
     * 
     * @param {Object} url, the url for the ajax call
     * @param {Object} success, the function to run on success, it will be passed the returned data
     * @param {Object} data, optional data to be sent to the server.
     */
    fluid.engage.paging.dataAccessor = function (url, success, data) {
        $.ajax({
            url: url,
            success: success,
            error: fluid.engage.paging.errorCallback,
            dataType: "json",
            data: data
        });
    };
    
    /**
     * The components defaults
     */
    fluid.defaults("fluid.engage.paging", {
        events: {
            modelChanged: null,
            afterInit: null
        },
        
        url: "",
        maxPageSize: 20,
        useCaching: true,
        initialPage: undefined,
        dataSetSize: "total_rows",
        dataAccessor: fluid.engage.paging.dataAccessor
    });
    
    /*******************************
     * Renderer Utilities          *
     * --------------------------- *
     * depends on fluidRenderer.js *
     *******************************/
    
    fluid.engage.renderUtils = fluid.engage.renderUtils || {};
    
    fluid.engage.renderUtils.createRendererFunction = function (container, selectors, options) {
        options = options || {};
        container = $(container);
        var rendererOptions = options.rendererOptions || {};
        var templates = null;
        
        return function (tree) {
            var cutpointFn = options.cutpointGenerator || "fluid.engage.renderUtils.selectorsToCutpoints";
            rendererOptions.cutpoints = rendererOptions.cutpoints || fluid.invokeGlobalFunction(cutpointFn, [selectors, options]);
            
            if (templates) {
                fluid.reRender(templates, container, tree, rendererOptions);
            } else {
                templates = fluid.selfRender(container, tree, rendererOptions);
            }
        };
    };
    
    fluid.engage.renderUtils.removeSelectors = function (selectors, selectorsToIgnore) {
        if (selectorsToIgnore) {
            $.each(selectorsToIgnore, function (index, selectorToIgnore) {
                delete selectors[selectorToIgnore];
            });
        }
        return selectors;
    };
    
    fluid.engage.renderUtils.markRepeated = function (selector, repeatingSelectors) {
        if (repeatingSelectors) {
            $.each(repeatingSelectors, function (index, repeatingSelector) {
                if (selector === repeatingSelector) {
                    selector = selector + ":";
                }
            });
        }
        return selector;
    };
    
    fluid.engage.renderUtils.selectorsToCutpoints = function (selectors, options) {
        var cutpoints = [];
        options = options || {};
        selectors = fluid.copy(selectors); // Make a copy before potentially destructively changing someone's selectors.
        
        if (options.selectorsToIgnore) {
            selectors = fluid.engage.renderUtils.removeSelectors(selectors, options.selectorsToIgnore);
        }
        
        for (var selector in selectors) {
            cutpoints.push({
                id: fluid.engage.renderUtils.markRepeated(selector, options.repeatingSelectors),
                selector: selectors[selector]
            });
        }
        
        return cutpoints;
    };
    
    /** A special "shallow copy" operation suitable for nondestructively
     * merging trees of components. jQuery.extend in shallow mode will 
     * neglect null valued properties.
     */
    fluid.renderer.mergeComponents = function(target, source) {
        for (var key in source) {
            target[key] = source[key];
        }
        return target;
    };
    
    /** Create a "protoComponent expander" with the supplied set of options.
     * The returned value will be a function which accepts a "protoComponent tree"
     * as argument, and returns a "fully expanded" tree suitable for supplying
     * directly to the renderer.
     * A "protoComponent tree" is similar to the "dehydrated form" accepted by
     * the historical renderer - only
     * i) The input format is unambiguous - this expander will NOT accept hydrated
     * components in the {ID: "myId, myfield: "myvalue"} form - but ONLY in
     * the dehydrated {myID: {myfield: myvalue}} form.
     * ii) This expander has considerably greater power to expand condensed trees.
     * In particular, an "EL style" option can be supplied which will expand bare
     * strings found as values in the tree into UIBound components by a configurable
     * strategy. Supported values for "ELstyle" are a) "ALL" - every string will be
     * interpreted as an EL reference and assigned to the "valuebinding" member of
     * the UIBound, or b) any single character, which if it appears as the first
     * character of the string, will mark it out as an EL reference - otherwise it
     * will be considered a literal value, or c) the value "${}" which will be
     * recognised bracketing any other EL expression.
     * 
     * This expander will be upgraded in the future to support even more powerful
     * forms of expansion, including model-directed expansion such as selection and
     * repetition.
     */
    
    fluid.renderer.makeProtoExpander = function (options) {
        var ELstyle = options.ELstyle;
        var IDescape = options.IDescape || "\\";
        function extractEL(string) {
            if (ELstyle === "ALL") {
                return string;
            }
            else if (ELstyle.length === 1) {
                if (string.charAt(0) === ELstyle) {
                    return string.substring(1);
                }
            }
            else if (ELstyle === "${}") {
                var i1 = string.indexOf("${");
                var i2 = string.indexOf("}");
                if (i1 === 0 && i2 !== -1) {
                    return string.substring(2, i2);
                }
            }
        }
        function expandStringEntry(proto, string) {
            var EL = options.ELstyle? extractEL(string): null;
            if (EL) {
                proto.valuebinding = EL;
            }
            else {
                proto.value = string;
            }
        }
        function expandComponent(comp, entry) {
           if (typeof(entry) === "string") {
               expandStringEntry(comp, entry);
           }
           else {
               function memberPusher(component, key) {
               comp[key] = component;
               }
           expandMembers(entry, comp, memberPusher);
           }
        }
        
        var expandMembers = function(proto, container, pusher) {
            for (var key in proto) {
               var entry = proto[key];
               if (key === "decorators") {
                   container.decorators = entry; 
                   continue;
               }
               if (key.charAt(0) === IDescape) {
                   key = key.substring(1);
               }
               if (entry.children) {
                   if (key.indexOf(":" === -1)) {
                       key = key + ":";
                   }
                   var children = entry.children;
                   for (var i = 0; i < children.length; ++ i) {
                       var comp = expandChildren(children[i]);
                       pusher(comp, key);
                   }
               }
               else {
                   var comp = {};
                   expandComponent(comp, entry);
                   pusher(comp, key);
               }
            }
        }
        
        var expandChildren = function(proto) { // proto is a container
            var childlist = [];
            var togo = {children: childlist}
            var childPusher = function(comp, key) {
                comp.ID = key;
                childlist.push(comp);
            }
            expandMembers(proto, togo, childPusher);
            return togo;  
        };
        return expandChildren;
    };
    
        
    
    fluid.engage.renderUtils.uiContainer = function (id, children) {
        return {
            ID: id, 
            children: children
        };
    };
    
    fluid.engage.renderUtils.uiBound = function (id, value) {
        var uiBound = {ID: id};
        if (value) {
            uiBound.markup = value;
        }
        return uiBound;
    };
    
    fluid.engage.renderUtils.decoratedUIBound = function (id, decorators, value) {
        return fluid.merge("merge", fluid.engage.renderUtils.uiBound(id, value), {decorators: decorators});
    };
    
    fluid.engage.renderUtils.attrDecoratedUIBound  = function (id, attrName, attrValue, nodeValue) {
        var decObj = {attrs: {}};
        decObj.attrs[attrName] = attrValue;
        
        return fluid.engage.renderUtils.decoratedUIBound(id, [decObj], nodeValue);
    };
})(jQuery, fluid);