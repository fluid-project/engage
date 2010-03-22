/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, jqUnit, expect, window*/


(function ($) {
    //constants
    var CONTAINER = ".cabinet";
    var ENTER = 13;
    var SPACE = 32;
    
    var DRAWER = '<div class="flc-cabinet-drawer">' +
        '<h2 class="flc-cabinet-handle flc-cabinet-header">Header</h2>' +
        '<div class="flc-cabinet-contents">' +
        '<p>Some other contents</p>' +
        '</div>' +
        '</div>';
    
    //setup function
    
    var setup = function (options) {
        return fluid.cabinet(CONTAINER, options);
    };
    
    //helper functions 
    
    var simulateKeyDown = function (onElement, withKeycode, modifier) {
        var modifiers = {
            ctrl: (modifier === $.ui.keyCode.CTRL) ? true : false,
            shift: (modifier === $.ui.keyCode.SHIFT) ? true : false,
            alt: (modifier === $.ui.keyCode.ALT) ? true : false
        };

        var keyEvent = document.createEvent("KeyEvents");
        keyEvent.initKeyEvent("keydown", true, true, window, modifiers.ctrl, modifiers.alt, modifiers.shift, false, withKeycode, 0);

        onElement = fluid.unwrap(onElement);

        onElement.dispatchEvent(keyEvent);
    };
    
    var hasClasses = function (selector, classes) {
        if (typeof classes === "string") {
            classes = [classes];
        }
        
        for (var i = 0; i < classes.length; i++) {
            if (!selector.hasClass(classes[i])) {
                return false;
            }
        }
        
        return true;
    };
    
    var hasAttribute = function (selector, attribute, value) {
        var hasAttr = true;
        selector = fluid.wrap(selector);
        selector.each(function (index, element) {
            var attrValue = $(element).attr(attribute);
            if (value === undefined) {
                if (attrValue === undefined) {
                    hasAttr = false;
                    return false;
                }
            } else if (attrValue !== value) {
                hasAttr = false;
                return false;
            }
        });
        
        return hasAttr;
    };
    
    var hasStyle = function (selector, style, value) {
        selector = fluid.wrap(selector);
        selector.each(function (index, element) {
            var styleValue = $(element).css(style);
            if (styleValue !== value) {
                return false;
            }
        });
        
        return true;
    };
    
    //test functions
    
    var assertStyling = function (selector, styles, expected, message) {
        selector = fluid.wrap(selector);
        styles = styles.split(" ");
        selector.each(function (index, element) {
            jqUnit[expected ? "assertTrue" : "assertFalse"](message, hasClasses(fluid.wrap(element), styles));
        });
    };
    
    var verifyClose = function (component, drawerSelector, contentSelector, openStyle, closeStyle) {
        assertStyling(drawerSelector, closeStyle, true, "All specified drawers have close styling");
        assertStyling(drawerSelector, openStyle, false, "No specified drawer has open styling");
        
        jqUnit.assertTrue("Handle has aria-expanded set to false", hasAttribute(component.locate("handle", drawerSelector), "aria-expanded", "false"));
        jqUnit.assertTrue("Contents are hidden", hasStyle(contentSelector, "display", "none"));
    };
    
    var verifyOpen = function (component, drawerSelector, contentSelector, openStyle, closeStyle) {
        assertStyling(drawerSelector, openStyle, true, "All specified drawers have open styling");
        assertStyling(drawerSelector, closeStyle, false, "No specified drawer has close styling");
        
        jqUnit.assertTrue("Handle has aria-expanded set to true", hasAttribute(component.locate("handle", drawerSelector), "aria-expanded", "true"));
        jqUnit.assertTrue("Contents are visible", hasStyle(contentSelector, "display", "block"));
    };
    
    var mixedStateTests = function (component, openDrawers) {
        var openStyle = component.options.styles.drawerOpened;
        var closeStyle = component.options.styles.drawerClosed;
        var closedDrawers = component.locate("drawer").not(openDrawers);
        
        verifyOpen(component, openDrawers, component.locate("contents", openDrawers), openStyle, closeStyle);
        verifyClose(component, closedDrawers, component.locate("contents", closedDrawers), openStyle, closeStyle);
    };
    
    var openTests = function (component, openDrawers) {
        var openStyle = component.options.styles.drawerOpened;
        var closeStyle = component.options.styles.drawerClosed;
        
        verifyOpen(component, openDrawers, component.locate("contents", openDrawers), openStyle, closeStyle);
    };
    
    var closeTests = function (component, closedDrawers) {
        var openStyle = component.options.styles.drawerOpened;
        var closeStyle = component.options.styles.drawerClosed;
        
        verifyClose(component, closedDrawers, component.locate("contents", closedDrawers), openStyle, closeStyle);
    };
    
    var cssInitTests = function (component) {
        var styles = component.options.styles;
            
        assertStyling(component.locate("drawer"), styles.drawer, true, "All drawers have CSS styling");
        assertStyling(component.locate("handle"), styles.handle, true, "All handles have CSS styling");
        assertStyling(component.locate("contents"), styles.contents, true, "All content has CSS styling");
    };
    
    var ariaAddedTests = function (component) {
        var handles = component.locate("handle");
        var contents = component.locate("contents");
           
        jqUnit.assertTrue("Cabinet has role of tablist", hasAttribute(component.container, "role", "tablist"));
        jqUnit.assertTrue("Cabinet has attribute aria-multiselectable set to true", hasAttribute(component.container, "aria-multiselectable", "true"));
        jqUnit.assertTrue("Handle has role of tab", hasAttribute(handles, "role", "tab"));
        jqUnit.assertTrue("Handle has attribute of aria-expanded set", hasAttribute(handles, "aria-expanded"));
        jqUnit.assertTrue("Contents has roel of tabpanel", hasAttribute(contents, "role", "tabpanel"));
        jqUnit.assertTrue("Contents has attribute of aria-labelledby set", hasAttribute(contents, "aria-labelledby"));
    };
    
    var headerTests = function (component) {
        var headers = component.locate("header");
        
        headers.each(function (idx) {
            jqUnit.assertTrue("Header " + idx + ": is an anchor", $(this).is("a"));
        });
    };
        
    //Tests
    
    $(document).ready(function () {
        var cmpt; //component
        
        //setup tests
        var tests = jqUnit.testCase("Cabinet Tests -  Common setup", function () {
            cmpt = setup();
        });

        tests.test("CSS class insertion", function () {
            cssInitTests(cmpt);
        });
        
        
        tests.test("Aria insertion", function () {
            ariaAddedTests(cmpt);
        });
        
        tests.test("Headers are all anchors", function () {
            headerTests(cmpt);
        });
        
        tests.test("Add new drawer", function () {
            cmpt.container.append(DRAWER);
            cmpt.refreshView();
            
            cssInitTests(cmpt);
            ariaAddedTests(cmpt);
            headerTests(cmpt);
        });
        
        //variables for event tests
        var openEventFired;
        var closeEventFired;
        
        var noEventsFiredTest = function () {
            jqUnit.assertFalse("The open event should not have fired", openEventFired);
            jqUnit.assertFalse("The close event should not have fired", closeEventFired);
        };
        
        var onlyOpenEventsFiredTest = function () {
            jqUnit.assertTrue("The open event should have fired", openEventFired);
            jqUnit.assertFalse("The close event should not have fired", closeEventFired);
        };
        
        var onlyClosedEventsFiredTest = function () {
            jqUnit.assertFalse("The open event should not have fired", openEventFired);
            jqUnit.assertTrue("The close event should have fired", closeEventFired);
        };
        
        var resetEventVariables = function () {
            openEventFired = false;
            closeEventFired = false;
        };
    
        //Tests when drawers started closed
        var startClosedTests = jqUnit.testCase("Cabinet Tests - Drawers started closed", function () {
            cmpt = setup({
                listeners: {
                    afterOpen: function () {
                        openEventFired = true;
                    },
                    afterClose: function () {
                        closeEventFired = true;
                    }
                },
                startOpen: false
            });
        }, resetEventVariables);
        
        startClosedTests.test("Start Closed", function () {
            closeTests(cmpt, cmpt.locate("drawer"));
            noEventsFiredTest();
        });
                
        startClosedTests.test("Open a Single Drawer", function () {
            var drawers = cmpt.locate("drawer");
            var openDrawer = drawers.eq(0);
            
            cmpt.openDrawers(openDrawer);
            mixedStateTests(cmpt, openDrawer);
            onlyOpenEventsFiredTest();
        });
        
        startClosedTests.test("Toggle Open a Single Drawer", function () {
            var drawers = cmpt.locate("drawer");
            var openDrawer = drawers.eq(0);
            
            cmpt.toggleDrawers(openDrawer);
            mixedStateTests(cmpt, openDrawer);
            onlyOpenEventsFiredTest();
        });
        
        startClosedTests.test("Open All Drawers", function () {
            var drawers = cmpt.locate("drawer");
            
            cmpt.openDrawers(drawers);
            openTests(cmpt, drawers);
            onlyOpenEventsFiredTest();
        });
        
        startClosedTests.test("Toggle Open All Drawers", function () {
            var drawers = cmpt.locate("drawer");
            
            cmpt.toggleDrawers(drawers);
            openTests(cmpt, drawers);
            onlyOpenEventsFiredTest();
        });
        
        startClosedTests.test("OpenDrawers function works after refresh", function () {
            cmpt.container.append(DRAWER);
            cmpt.refreshView();
            
            var drawers = cmpt.locate("drawer");
            var openDrawers = drawers.eq(0).add(drawers.eq(drawers.length - 1));
            
            cmpt.openDrawers(openDrawers);
            mixedStateTests(cmpt, openDrawers);
            onlyOpenEventsFiredTest();
        });
        
        startClosedTests.test("Open Drawer With a Click", function () {
            var drawers = cmpt.locate("drawer");
            var openDrawer = drawers.eq(0);
            
            cmpt.locate("handle", openDrawer).click();
            mixedStateTests(cmpt, openDrawer);
            onlyOpenEventsFiredTest();
        });
        
        startClosedTests.test("Open Drawer With a Space Key", function () {
            if ($.browser.mozilla) {
                var drawers = cmpt.locate("drawer");
                var openDrawer = drawers.eq(0);
                
                simulateKeyDown(cmpt.locate("handle", openDrawer), SPACE);
                mixedStateTests(cmpt, openDrawer);
                onlyOpenEventsFiredTest();
            }
        });
        
        startClosedTests.test("Open Drawer With a Enter Key", function () {
            if ($.browser.mozilla) {
                var drawers = cmpt.locate("drawer");
                var openDrawer = drawers.eq(0);
                
                simulateKeyDown(cmpt.locate("handle", openDrawer), ENTER);
                mixedStateTests(cmpt, openDrawer);
                onlyOpenEventsFiredTest();
            }
        });
        
        startClosedTests.test("Click to open works after refresh", function () {
            if ($.browser.mozilla) {
                cmpt.container.append(DRAWER);
                cmpt.refreshView();
                
                var drawers = cmpt.locate("drawer");
                var openDrawers = drawers.eq(0).add(drawers.eq(drawers.length - 1));
                
                cmpt.locate("handle", openDrawers).click();
                mixedStateTests(cmpt, openDrawers);
                onlyOpenEventsFiredTest();
            }
        });
        
        //Tests when drawers started open
        var startOpenTests = jqUnit.testCase("Cabinet Tests - Drawers started open", function () {
            cmpt = setup({
                listeners: {
                    afterOpen: function () {
                        openEventFired = true;
                    },
                    afterClose: function () {
                        closeEventFired = true;
                    }
                },
                startOpen: true
            });
        }, resetEventVariables);
        
        startOpenTests.test("Start Open", function () {
            openTests(cmpt, cmpt.locate("drawer"));
            noEventsFiredTest();
        });
        
        startOpenTests.test("Close a Single Drawer", function () {
            var drawers = cmpt.locate("drawer");
            var closedDrawer = drawers.eq(0);
            
            cmpt.closeDrawers(closedDrawer);
            mixedStateTests(cmpt, drawers.not(closedDrawer));
            onlyClosedEventsFiredTest();
        });
        
        startOpenTests.test("Toggle Close a Single Drawer", function () {
            var drawers = cmpt.locate("drawer");
            var closedDrawer = drawers.eq(0);
            
            cmpt.toggleDrawers(closedDrawer);
            mixedStateTests(cmpt, drawers.not(closedDrawer));
            onlyClosedEventsFiredTest();
        });
        
        startOpenTests.test("Close All Drawers", function () {
            var drawers = cmpt.locate("drawer");
            
            cmpt.closeDrawers(drawers);
            closeTests(cmpt, drawers);
            onlyClosedEventsFiredTest();
        });
        
        startOpenTests.test("Toggle Closed All Drawers", function () {
            var drawers = cmpt.locate("drawer");
            
            cmpt.toggleDrawers(drawers);
            closeTests(cmpt, drawers);
            onlyClosedEventsFiredTest();
        });
        
        startOpenTests.test("CloseDrawers function works after refresh", function () {
            cmpt.container.append(DRAWER);
            cmpt.refreshView();
            
            var drawers = cmpt.locate("drawer");
            var closedDrawers = drawers.eq(0).add(drawers.eq(drawers.length - 1));
            
            cmpt.closeDrawers(closedDrawers);
            mixedStateTests(cmpt, drawers.not(closedDrawers));
            onlyClosedEventsFiredTest();
        });

        startOpenTests.test("Close Drawer With a Click", function () {
            var drawers = cmpt.locate("drawer");
            var closedDrawer = drawers.eq(0);
            
            cmpt.locate("handle", closedDrawer).click();
            mixedStateTests(cmpt, drawers.not(closedDrawer));
            onlyClosedEventsFiredTest();
        });
        
        startOpenTests.test("Close Drawer With a Space Key", function () {
            if ($.browser.mozilla) {
                var drawers = cmpt.locate("drawer");
                var closedDrawer = drawers.eq(0);
                
                simulateKeyDown(cmpt.locate("handle", closedDrawer), SPACE);
                mixedStateTests(cmpt, drawers.not(closedDrawer));
                onlyClosedEventsFiredTest();
            }
        });
        
        startOpenTests.test("Close Drawer With a Enter Key", function () {
            if ($.browser.mozilla) {
                var drawers = cmpt.locate("drawer");
                var closedDrawer = drawers.eq(0);
                
                simulateKeyDown(cmpt.locate("handle", closedDrawer), ENTER);
                mixedStateTests(cmpt, drawers.not(closedDrawer));
                onlyClosedEventsFiredTest();
            }        
        });
        
        startOpenTests.test("Click to close drawers works after refresh", function () {
            if ($.browser.mozilla) {
                cmpt.container.append(DRAWER);
                cmpt.refreshView();
                
                var drawers = cmpt.locate("drawer");
                var closedDrawers = drawers.eq(0).add(drawers.eq(drawers.length - 1));
                
                cmpt.locate("handle", closedDrawers).click();
                mixedStateTests(cmpt, drawers.not(closedDrawers));
                onlyClosedEventsFiredTest();
            }
        });
    });
})(jQuery);
