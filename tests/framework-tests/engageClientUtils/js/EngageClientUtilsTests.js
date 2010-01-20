/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, jqUnit*/

(function ($) {  
    
    function testPaging(initTestFunc, otherTests, options) {
        function testAccessor(url, callback, data) {
            return initTestFunc ? initTestFunc(url, callback, data) : {};
        }
        var p = fluid.engage.paging(fluid.merge("merge", {dataAccessor: testAccessor}, options));
        
        if (otherTests) {
            otherTests(p);
        }
    }
    
    function pagingAjaxAsserts(url, expectedData, actualData) {
        jqUnit.assertTrue("URL is a string", typeof url === "string");
        jqUnit.assertTrue("Data is an object", typeof actualData === "object");
        jqUnit.assertEquals("Data value is correct", JSON.stringify(expectedData), JSON.stringify(actualData));
    }
    
    function pagingNextTests(pager) {
        pager.options.dataAccessor = function (url, callback, data) {
            pagingAjaxAsserts(url, {limit: 20, skip: 0}, data);
        };
        
        jqUnit.assertTrue("Has next", pager.hasNext());
        jqUnit.assertFalse("Doesn't have previous", pager.hasPrevious());
        
        pager.next();
    }
    
    function testCookies(name, value, message) {
        fluid.engage.setCookie(name, value);
        
        if (typeof value === "object") {
            jqUnit.assertDeepEq(message, value, fluid.engage.getCookie(name));
        } else {
            jqUnit.assertEquals(message, value, fluid.engage.getCookie(name));
        }
    }
    
    function engageClientUtilsTests() {
        var tests = jqUnit.testCase("EngageClientUtils Tests");
        
        tests.test("Cookies Test:", function () {
            testCookies("test", "value1", "Cookie set and retrieved");
            testCookies("test", "value2", "Cookie reset and retrieved");
            testCookies("test2", "value3", "New Cookie saved and retrieved");
            testCookies("test3", {test3: "value4"}, "Cookie Value is an object");
        });
        
        tests.test("Paging Test: Initial ajax call (caching on)", function () {
            testPaging(function (url, callback, data) {
                pagingAjaxAsserts(url, {limit: 20}, data);
            });
        });
        
        tests.test("Paging Test: Initial ajax call (caching off)", function () {
            testPaging(function (url, callback, data) {
                pagingAjaxAsserts(url, {limit: 1}, data);
            }, null, {useCaching: false});
        });
        
        tests.test("Paging Test: Changed maxPageSize", function () {
            testPaging(function (url, callback, data) {
                pagingAjaxAsserts(url, {limit: 6}, data);
            }, null, {maxPageSize: 6});
        });
        
        tests.test("Paging Test: Next with fixed data size", function () {
            testPaging(function (url, callback) {
                callback({});
            }, pagingNextTests, {dataSetSize: 5, useCaching: false});
        });
        
        tests.test("Paging Test: Next with el path to datasize", function () {
            testPaging(function (url, callback) {
                callback({size: 10});
            }, pagingNextTests, {dataSetSize: "size", useCaching: false});
        });
        
        tests.test("Renderer Utilities Test: Componet Tree Building Functions", function () {
            var id = "id";
            var value = "value";
            var attrName = "src";
            var attrValue = "http://fluidproject.org";
            var decoratorArray = [
                {type: "jQuery",
                    func: "click",
                    args: function() { $(this).hide(); }
                },
                {
                    type: "attrs",
                    attributes: ""
                }
            ];
            var attrObj = {};
            attrObj[attrName] = attrValue;
            
            jqUnit.assertDeepEq("Proper uiBound node object created", {ID: id, markup: value},fluid.engage.renderUtils.uiBound(id, value));
            jqUnit.assertDeepEq("Proper uiBound node object created, no value passed", {ID: id},fluid.engage.renderUtils.uiBound(id));
            
            jqUnit.assertDeepEq("Proper uiBound node with a decorator created", {ID: id, decorators: decoratorArray, markup: value}, fluid.engage.renderUtils.decoratedUIBound(id, decoratorArray,value));
            jqUnit.assertDeepEq("Proper uiBound node with a decorator created, no value passed", {ID: id, decorators: decoratorArray}, fluid.engage.renderUtils.decoratedUIBound(id, decoratorArray));
            
            jqUnit.assertDeepEq("Proper uiBound with an attr decorator created", {ID: id, markup: value, decorators: [{attrs: attrObj}]}, fluid.engage.renderUtils.attrDecoratedUIBound(id, attrName, attrValue, value));
            jqUnit.assertDeepEq("Proper uiBound with an attr decorator created, no value passed", {ID: id, decorators: [{attrs: attrObj}]}, fluid.engage.renderUtils.attrDecoratedUIBound(id, attrName, attrValue));
        });
        
        tests.test("Renderer Utilities Test: selector mapper", function () {
            jqUnit.assertDeepEq("Selector Map generation", [{id: "selector", selector: ".className"}], fluid.engage.renderUtils.selectorMapper({selector: ".className"}));
            jqUnit.assertDeepEq("Selector Map generation, with repeating items", [{id: "selector1", selector: ".class1"},{id: "selector2:", selector: ".class2"}], fluid.engage.renderUtils.selectorMapper({selector1: ".class1", selector2: ".class2"}, {repeatingSelectors: ["selector2"]}));
            jqUnit.assertDeepEq("Selector Map generation, with ignored selectors", [{id: "selector1", selector: ".class1"}], fluid.engage.renderUtils.selectorMapper({selector1: ".class1", selector2: ".class2"}, {selectorsToIgnore: ["selector2"]}));
            jqUnit.assertDeepEq("Selector Map generation, with repeating items and ignored selectors", [{id: "selector1:", selector: ".class1"}], fluid.engage.renderUtils.selectorMapper({selector1: ".class1", selector2: ".class2"}, {repeatingSelectors: ["selector1"], selectorsToIgnore: ["selector2"]}));
        });
        
        tests.test("Renderer Utilities Test: Renderer Init Helper", function () {
            var selectors = {node: ".flc-renderUtils-test"};
            var componentTree = function (id, value) {
                return {
                    children: [fluid.engage.renderUtils.uiBound(id, value)]
                };
            };
            
            var renderHelper = fluid.engage.renderUtils.createRendererFunction(".flc-renderUtils-container", selectors);
            
            jqUnit.assertEquals("Render function returned", "function", typeof renderHelper);
            
            renderHelper(componentTree("node", "selfRender"));
            jqUnit.assertEquals("Initial Rendering", "selfRender", $(".flc-renderUtils-test").text());
            
            renderHelper(componentTree("node", "reRender"));
            jqUnit.assertEquals("Rerendering", "reRender", $(".flc-renderUtils-test").text());
        });
    }
    
    $(document).ready(function () {
        engageClientUtilsTests();
    });
})(jQuery);
