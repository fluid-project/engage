/*
 Copyright 2009 University of Toronto
 
 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.
 
 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt
 
 */
/*global jQuery, fluid*/

fluid = fluid || {};

(function ($) {
    
    /**
     * Wrapper for jQuery's ajax function, including parameters for limit and skip which are added as parameters to the url
     * 
     * @param {Object} url, the url for the ajax call
     * @param {Object} success, the function to run on success, it will be passed the data
     * @param {Object} error, the function to run on error, it will be passed the following args XMLHttpRequest, textStatus, errorThrown.
     * @param {Object} limit, the number of items to return from the query
     * @param {Object} skip, the number of items to skip over before searching
     */
    function ajaxCall(url, success, error, limit, skip) {
        $.ajax({
            url: url,
            success: success,
            error: error,
            dataType: "json",
            async: false,
            data: {
                limit: limit,
                skip: skip
            }
        });
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
        var obj = {};
        
        function assembleDataInfo(data) {
            data = JSON.parse(String(data));
            obj.setSize = data.total_rows;
            obj.numSets = Math.ceil(obj.setSize / that.options.numberOfItems);
            obj.cachedData = that.options.useCaching ? [data] : null;
        }
        
        ajaxCall(that.options.url, assembleDataInfo, null, that.options.numberOfItems);
        
        return obj;
    }
    
    /**
     * Fetches the data and updates the component's state as needed.
     * If caching is on and there is cached data available, 
     * it will pull from the cache instead of making an ajax call
     * 
     * @param {Object} that, the component
     * @param {Object} goToNext, a boolean specifying whether it goes to next (true) or previous (false)
     */
    function fetchData(that, goToNext) {
        var data;
        var newSetNumber;
        var skipAmount;
        var dInfo = that.dataInfo;
        var opts = that.options;
        var cachedData = dInfo.cachedData[newSetNumber];
        
        function setInfo() {
            if (goToNext) {
                newSetNumber = that.setNumber < dInfo.numSets - 1 ? ++that.setNumber : dInfo.numSets - 1;
            } else {
                newSetNumber = that.setNumber > 0 ? --that.setNumber : 0;
            }
            
            skipAmount = newSetNumber * opts.numberOfItems;
        }
        
        function updateData(d) {
            data = opts.dataMapFunction ? opts.dataMapFunction(d) : d;
        }
        
        function setData(d) {
            d = JSON.parse(String(d));
            updateData(d);
            
            if (opts.useCaching) {
                dInfo.cachedData[newSetNumber] = d;
            }
        }
        
        setInfo();
        
        if (opts.useCaching && cachedData) {
            updateData(cachedData);
        } else {
            ajaxCall(opts.url, setData, null, opts.numberOfItems, skipAmount);
        }
        
        if (newSetNumber === 0 || newSetNumber === (dInfo.numSets - 1)) {
            that.events[newSetNumber === 0 ? "onFirstSet" : "onLastSet"].fire(that);
        }
        return data;
    }
    
    /**
     * Runs the setup functions needed by the component
     * 
     * @param {Object} that, the component
     */
    function setup(that) {
        that.dataInfo = getSetupData(that);
        that.setNumber = -1;
    }
    
    /**
     * The creator function
     * 
     * @param {Object} container, the components container
     * @param {Object} options, the options passed into the component
     */
    fluid.paging = function (container, options) {
        var that = fluid.initView("fluid.paging", container, options);
        
        setup(that);
        
        /**
         * Returns the next set of paged data. 
         * If caching is on, and there is cached data it will return from the cache.
         * 
         * If the end of the set is reached it will fire an onLastSet event, and 
         * any subsequent calls to it will just return the last set.
         */
        that.next = function () {
            return fetchData(that, true);
        };
        
        /**
         * Returns the previous set of paged data. 
         * If caching is on, and there is cached data it will return from the cache.
         * 
         * If the beginning of the set is reached it will fire an onFirstSet event, and 
         * any subsequent calls to it will just return the first set.
         */
        that.previous = function () {
            return fetchData(that);
        };
        
        return that;
    };
    
    /**
     * The components defaults
     */
    fluid.defaults("fluid.paging", {
        events: {
            onFirstSet: null,
            onLastSet: null
        },
        
        url: "",
        numberOfItems: 20,
        dataMapFunction: null,
        useCaching: true
    });
    
})(jQuery);