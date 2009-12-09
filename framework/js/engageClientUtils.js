/*
Copyright 2009 University of Toronto

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
        var obj = {};
        
        function assembleDataInfo(data) {
            var size = that.options.dataSetSize;
            data = cleanseData(data);
            obj.setSize = typeof size === "string" ? fluid.model.getBeanValue(data, size) : size;
            obj.numSets = Math.ceil(obj.setSize / that.options.maxPageSize);
            obj.cachedData = that.options.useCaching ? [data] : [];
        }
        
        that.options.dataAccessor(that.options.url, assembleDataInfo, {limit: that.options.useCaching ? that.options.maxPageSize : 1});
        
        return obj;
    }

    /**
     * Increments that.setNumber by 1, as long as numSets is smaller than the number of sets - 1
     * 
     * @param {Object} that, the component
     */
    function incrementSetNumber(that) {
        var lastSet = that.dataInfo.numSets - 1;
        return that.setNumber < lastSet ? ++that.setNumber : lastSet;
    }
    
    /**
     * Decrements that.setNumber by 1, as long as it is already larger than 0
     * 
     * @param {Object} that, the component
     */
    function decrementSetNumber(that) {
        return that.setNumber > 0 ? --that.setNumber : 0;
    }
    
    /**
     * Fetches the data and updates the component's state as needed.
     * If caching is on and there is cached data available, 
     * it will pull from the cache instead of making an ajax call
     * 
     * @param {Object} that, the component
     * @param {Object} goToNext, a boolean specifying whether it goes to next (true) or previous (false)
     */
    function fetchData(that, func) {
        var data;
        var skipAmount;
        var dInfo = that.dataInfo;
        var opts = that.options;
        
        function updateData(d) {
            data = opts.dataMapFunction ? opts.dataMapFunction(d) : d;
        }
        
        function setData(d) {
            d = cleanseData(d);
            updateData(d);
            
            if (opts.useCaching) {
                dInfo.cachedData[that.setNumber] = d;
            }
        }
        
        func(that, dInfo.numSets);
        skipAmount = that.setNumber * opts.maxPageSize;

        var cachedData = dInfo.cachedData ? dInfo.cachedData[that.setNumber] : null;
        if (cachedData) {
            updateData(cachedData);
        } else {
            that.options.dataAccessor(opts.url, setData, {limit: opts.maxPageSize, skip: skipAmount >= 0 ? skipAmount : 0});
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
    fluid.engage.paging = function (options) {
        var that = fluid.initLittleComponent("fluid.engage.paging", options);
        
        setup(that);
        
        /**
         * Returns the next set of paged data. 
         * If caching is on, and there is cached data it will return from the cache.
         * 
         * If the end of the set is reached it will fire an onLastSet event, and 
         * any subsequent calls to it will just return the last set.
         */
        that.next = function () {
            return fetchData(that, incrementSetNumber);
        };
        
        /**
         * Returns the previous set of paged data. 
         * If caching is on, and there is cached data it will return from the cache.
         * 
         * If the beginning of the set is reached it will fire an onFirstSet event, and 
         * any subsequent calls to it will just return the first set.
         */
        that.previous = function () {
            return fetchData(that, decrementSetNumber);
        };
        
        /**
         * Returns true if there is another set of data availble,
         * false otherwise.
         * 
         * This is useful for determining when you are at the end of the data.
         */
        that.hasNext = function () {
            return that.setNumber < that.dataInfo.numSets - 1;
        };
        
        /**
         * Returns true if there is a previous set of data available,
         * false otherwise.
         * 
         * This is useful for determining when you are at the beginning of the data.
         */
        that.hasPrevious = function () {
            return that.setNumber > 0;
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
            async: false,
            data: data
        });
    };
    
    /**
     * The components defaults
     */
    fluid.defaults("fluid.engage.paging", {
        url: "",
        maxPageSize: 20,
        dataMapFunction: null,
        useCaching: true,
        dataSetSize: "total_rows",
        dataAccessor: fluid.engage.paging.dataAccessor
    });
	
})(jQuery, fluid);