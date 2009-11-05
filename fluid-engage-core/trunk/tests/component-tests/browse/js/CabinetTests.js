/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/
/*global jqUnit, expect, window*/


(function ($) {
    var CONTAINER = ".cabinet";
    
    var setup = function (container, options) {
        return fluid.cabinet(container, options);
    };
    
    function simulateKeyDown(onElement, withKeycode, modifier) {
        var modifiers = {
            ctrl: (modifier === $.ui.keyCode.CTRL) ? true : false,
            shift: (modifier === $.ui.keyCode.SHIFT) ? true : false,
            alt: (modifier === $.ui.keyCode.ALT) ? true : false
        };

        var keyEvent = document.createEvent("KeyEvents");
        keyEvent.initKeyEvent("keydown", true, true, window, modifiers.ctrl, modifiers.alt, modifiers.shift, false, withKeycode, 0);

        onElement = fluid.unwrap(onElement);

        onElement.dispatchEvent(keyEvent);
    }
    
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
        selector = fluid.wrap(selector);
        selector.each(function (index, element) {
            var attrValue = $(element).attr(attribute);
            if (attrValue !== (value || !null)) {
                return false;
            }
        });
        
        return true;
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
    
    var assertStyling = function (selector, styles, expected, message) {
        selector = fluid.wrap(selector);
        styles = styles.split(" ");
        selector.each(function (index, element) {
            jqUnit[expected ? "assertTrue" : "assertFalse"](message, hasClasses(fluid.wrap(element), styles));
        });
    };
    
    var closeStylingTests = function (drawerSelector, contentSelector, openStyle, closeStyle) {
        
        assertStyling(drawerSelector, closeStyle, true, "All specified drawers have close styling");
        assertStyling(drawerSelector, openStyle, false, "No specified drawer has open styling");
        
        jqUnit.assertTrue("Drawer has aria-expended set to false", hasAttribute(drawerSelector, "aria-expanded", "false"));
        jqUnit.assertTrue("Contents are hidden", hasStyle(contentSelector, "display", "none"));
    };
    
    var openStylingTests = function (drawerSelector, contentSelector, openStyle, closeStyle) {
        assertStyling(drawerSelector, openStyle, true, "All specified drawers have open styling");
        assertStyling(drawerSelector, closeStyle, false, "No specified drawer has close styling");
        
        jqUnit.assertTrue("Drawer has aria-expanded set to true", hasAttribute(drawerSelector, "aria-expanded", "true"));
        jqUnit.assertTrue("Contents are visible", hasStyle(contentSelector, "display", "block"));
    };
        
    var cabinetTests = function () {
        var tests = jqUnit.testCase("Cabinet Tests");
                    
        tests.test("CSS class insertion", function () {
            var cabinet = setup(CONTAINER);
            var selectors = cabinet.options.selectors;
            var styles = cabinet.options.styles;
            var string = selectors.drawer + "," + selectors.handle + "," + selectors.contents;
            expect($(string).length);

            assertStyling(selectors.drawer, styles.drawer, true, "All drawers have CSS styling");
            assertStyling(selectors.handle, styles.handle, true, "All handles have CSS styling");
            assertStyling(selectors.contents, styles.contents, true, "All content has CSS styling");
        });
        
        tests.test("Aria insertion", function () {
            var cabinet = setup(CONTAINER);
            var  selectors = cabinet.options.selectors;
            expect(4);
           
            jqUnit.assertTrue("Cabinet has role of tablist", hasAttribute(cabinet.container, "role", "tablist"));
            jqUnit.assertTrue("Cabinet has attribute aria-multiselectable set to true", hasAttribute(cabinet.container, "aria-multiselectable", "true"));
            jqUnit.assertTrue("Drawer has role of tab", hasAttribute(selectors.drawer, "role", "tab"));
            jqUnit.assertTrue("Drawer has attribute of aria-expanded set", hasAttribute(selectors.drawer));
        });
        
        tests.test("Start Closed", function () {
            var cabinet = setup(CONTAINER, {startOpen: false});
            var selectors = cabinet.options.selectors;
            var styles = cabinet.options.styles;
            expect($(selectors.drawer).length * 2 + 2);

            closeStylingTests(selectors.drawer, selectors.contents, styles.drawerOpened, styles.drawerClosed);
        });
        
        tests.test("Start Open", function () {
            var cabinet = setup(CONTAINER, {startOpen: true});
            var selectors = cabinet.options.selectors;
            var styles = cabinet.options.styles;
            expect($(selectors.drawer).length * 2 + 2);

            openStylingTests(selectors.drawer, selectors.contents, styles.drawerOpened, styles.drawerClosed);
        });
        
        tests.test("Close a Single Drawer", function () {
            var cabinet = setup(CONTAINER, {startOpen: true});
            var selectors = cabinet.options.selectors;
            var styles = cabinet.options.styles;
            var drawer = $(selectors.drawer).eq(0);
            var content = $(selectors.contents).eq(0);
            expect($(selectors.drawer).length * 2 + 4);
            
            cabinet.closeDrawers(drawer);
            
            closeStylingTests(drawer, content, styles.drawerOpened, styles.drawerClosed);
            openStylingTests($(selectors.drawer).not(drawer), $(selectors.contents).not(content), styles.drawerOpened, styles.drawerClosed);
        });
        
        tests.test("Open a Single Drawer", function () {
            var cabinet = setup(CONTAINER, {startOpen: false});
            var selectors = cabinet.options.selectors;
            var styles = cabinet.options.styles;
            var drawer = $(selectors.drawer).eq(0);
            var content = $(selectors.contents).eq(0);
            expect($(selectors.drawer).length * 2 + 4);
            
            cabinet.openDrawers(drawer);
            
            openStylingTests(drawer, content, styles.drawerOpened, styles.drawerClosed);
            closeStylingTests($(selectors.drawer).not(drawer), $(selectors.contents).not(content), styles.drawerOpened, styles.drawerClosed);
        });
        
        tests.test("Toggle Close a Single Drawer", function () {
            var cabinet = setup(CONTAINER, {startOpen: true});
            var selectors = cabinet.options.selectors;
            var styles = cabinet.options.styles;
            var drawer = $(selectors.drawer).eq(0);
            var content = $(selectors.contents).eq(0);
            expect($(selectors.drawer).length * 2 + 4);
            
            cabinet.toggleDrawers(drawer);
            
            closeStylingTests(drawer, content, styles.drawerOpened, styles.drawerClosed);
            openStylingTests($(selectors.drawer).not(drawer), $(selectors.contents).not(content), styles.drawerOpened, styles.drawerClosed);
        });
        
        tests.test("Toggle Open a Single Drawer", function () {
            var cabinet = setup(CONTAINER, {startOpen: false});
            var selectors = cabinet.options.selectors;
            var styles = cabinet.options.styles;
            var drawer = $(selectors.drawer).eq(0);
            var content = $(selectors.contents).eq(0);
            expect($(selectors.drawer).length * 2 + 4);
            
            cabinet.toggleDrawers(drawer);
            
            openStylingTests(drawer, content, styles.drawerOpened, styles.drawerClosed);
            closeStylingTests($(selectors.drawer).not(drawer), $(selectors.contents).not(content), styles.drawerOpened, styles.drawerClosed);
        });
        
        tests.test("Close All Drawers", function () {
            var cabinet = setup(CONTAINER, {startOpen: true});
            var selectors = cabinet.options.selectors;
            var styles = cabinet.options.styles;
            expect($(selectors.drawer).length * 2 + 2);
            
            cabinet.closeDrawers(selectors.drawer);
            
            closeStylingTests(selectors.drawer, selectors.contents, styles.drawerOpened, styles.drawerClosed);
        });
        
        tests.test("Open All Drawers", function () {
            var cabinet = setup(CONTAINER, {startOpen: false});
            var selectors = cabinet.options.selectors;
            var styles = cabinet.options.styles;
            expect($(selectors.drawer).length * 2 + 2);
            
            cabinet.openDrawers(selectors.drawer);
            
            openStylingTests(selectors.drawer, selectors.contents, styles.drawerOpened, styles.drawerClosed);
        });
        
        tests.test("Toggle Closed All Drawers", function () {
            var cabinet = setup(CONTAINER, {startOpen: true});
            var selectors = cabinet.options.selectors;
            var styles = cabinet.options.styles;
            expect($(selectors.drawer).length * 2 + 2);
            
            cabinet.toggleDrawers(selectors.drawer);
            
            closeStylingTests(selectors.drawer, selectors.contents, styles.drawerOpened, styles.drawerClosed);
        });
        
        tests.test("Toggle Open All Drawers", function () {
            var cabinet = setup(CONTAINER, {startOpen: false});
            var selectors = cabinet.options.selectors;
            var styles = cabinet.options.styles;
            expect($(selectors.drawer).length * 2 + 2);
            
            cabinet.toggleDrawers(selectors.drawer);
            
            openStylingTests(selectors.drawer, selectors.contents, styles.drawerOpened, styles.drawerClosed);
        });
        
        tests.test("Prevent Events on Init Closed Drawers", function () {
            var openedEventFired, closedEventFired = false;
            var options = {
                startOpen: false,
                preventEventFireOnInit: true,
                listeners: {
                    afterOpen: function () {
                        openedEventFired = true;
                    },
                    afterClose: function () {
                        closedEventFired = true;
                    }
                }
            };
            setup(CONTAINER, options);
            
            jqUnit.assertFalse("Opened events not fired", openedEventFired);
            jqUnit.assertFalse("Closed events not fired", closedEventFired);
        });
        
        tests.test("Prevent Events on Init Opened Drawers", function () {
            var openedEventFired, closedEventFired = false;
            var options = {
                startOpen: true,
                preventEventFireOnInit: true,
                listeners: {
                    afterOpen: function () {
                        openedEventFired = true;
                    },
                    afterClose: function () {
                        closedEventFired = true;
                    }
                }
            };
            setup(CONTAINER, options);
            
            jqUnit.assertFalse("Opened events not fired", openedEventFired);
            jqUnit.assertFalse("Closed events not fired", closedEventFired);
        });
        
        tests.test("Fire Events on Init Closed Drawers", function () {
            var openedEventFired, closedEventFired = false;
            var options = {
                startOpen: false,
                preventEventFireOnInit: false,
                listeners: {
                    afterOpen: function () {
                        openedEventFired = true;
                    },
                    afterClose: function () {
                        closedEventFired = true;
                    }
                }
            };
            setup(CONTAINER, options);
            
            jqUnit.assertFalse("Opened events not fired", openedEventFired);
            jqUnit.assertTrue("Closed events fired", closedEventFired);
        });
        
        tests.test("Fire Events on Init Opened Drawers", function () {
            var openedEventFired, closedEventFired = false;
            var options = {
                startOpen: true,
                preventEventFireOnInit: false,
                listeners: {
                    afterOpen: function () {
                        openedEventFired = true;
                    },
                    afterClose: function () {
                        closedEventFired = true;
                    }
                }
            };
            setup(CONTAINER, options);
            
            jqUnit.assertTrue("Opened events fired", openedEventFired);
            jqUnit.assertFalse("Closed events not fired", closedEventFired);
        });
        
        tests.test("Fire Events on Drawer Closed", function () {
            var openedEventFired, closedEventFired = false;
            var options = {
                startOpen: true,
                preventEventFireOnInit: true,
                listeners: {
                    afterOpen: function () {
                        openedEventFired = true;
                    },
                    afterClose: function () {
                        closedEventFired = true;
                    }
                }
            };
            var cabinet = setup(CONTAINER, options);
            cabinet.closeDrawers(cabinet.options.selectors.drawer);
            
            jqUnit.assertFalse("Opened events not fired", openedEventFired);
            jqUnit.assertTrue("Closed events fired", closedEventFired);
        });
        
        tests.test("Fire Events on Drawer Opened", function () {
            var openedEventFired, closedEventFired = false;
            var options = {
                startOpen: false,
                preventEventFireOnInit: true,
                listeners: {
                    afterOpen: function () {
                        openedEventFired = true;
                    },
                    afterClose: function () {
                        closedEventFired = true;
                    }
                }
            };
            var cabinet = setup(CONTAINER, options);
            cabinet.openDrawers(cabinet.options.selectors.drawer);
            
            jqUnit.assertTrue("Opened events fired", openedEventFired);
            jqUnit.assertFalse("Closed events not fired", closedEventFired);
        });
        
        tests.test("Fire Events on Toggle Closed", function () {
            var openedEventFired, closedEventFired = false;
            var options = {
                startOpen: true,
                preventEventFireOnInit: true,
                listeners: {
                    afterOpen: function () {
                        openedEventFired = true;
                    },
                    afterClose: function () {
                        closedEventFired = true;
                    }
                }
            };
            var cabinet = setup(CONTAINER, options);
            cabinet.toggleDrawers(cabinet.options.selectors.drawer);
            
            jqUnit.assertFalse("Opened events not fired", openedEventFired);
            jqUnit.assertTrue("Closed events fired", closedEventFired);
        });
        
        tests.test("Fire Events on Toggle Opened", function () {
            var openedEventFired, closedEventFired = false;
            var options = {
                startOpen: false,
                preventEventFireOnInit: true,
                listeners: {
                    afterOpen: function () {
                        openedEventFired = true;
                    },
                    afterClose: function () {
                        closedEventFired = true;
                    }
                }
            };
            var cabinet = setup(CONTAINER, options);
            cabinet.toggleDrawers(cabinet.options.selectors.drawer);
            
            jqUnit.assertTrue("Opened events fired", openedEventFired);
            jqUnit.assertFalse("Closed events not fired", closedEventFired);
        });
        
        tests.test("Close Drawer With a Click", function () {
            var openedEventFired, closedEventFired = false;
            var options = {
                startOpen: true,
                preventEventFireOnInit: true,
                listeners: {
                    afterOpen: function () {
                        openedEventFired = true;
                    },
                    afterClose: function () {
                        closedEventFired = true;
                    }
                }
            };
            var cabinet = setup(CONTAINER, options);
            var selectors = cabinet.options.selectors;
            var styles = cabinet.options.styles;
            var drawer = $(selectors.drawer).eq(0);
            var content = $(selectors.contents).eq(0);
            var handle = $(selectors.handle).eq(0);
            
            handle.click();
            
            closeStylingTests(drawer, content, styles.drawerOpened, styles.drawerClosed);
            openStylingTests($(selectors.drawer).not(drawer), $(selectors.contents).not(content), styles.drawerOpened, styles.drawerClosed);
            jqUnit.assertFalse("Opened events not fired", openedEventFired);
            jqUnit.assertTrue("Closed events fired", closedEventFired);
        });
        
        tests.test("Open Drawer With a Click", function () {
            var openedEventFired, closedEventFired = false;
            var options = {
                startOpen: false,
                preventEventFireOnInit: true,
                listeners: {
                    afterOpen: function () {
                        openedEventFired = true;
                    },
                    afterClose: function () {
                        closedEventFired = true;
                    }
                }
            };
            var cabinet = setup(CONTAINER, options);
            var selectors = cabinet.options.selectors;
            var styles = cabinet.options.styles;
            var drawer = $(selectors.drawer).eq(0);
            var content = $(selectors.contents).eq(0);
            var handle = $(selectors.handle).eq(0);
            
            handle.click();
            
            openStylingTests(drawer, content, styles.drawerOpened, styles.drawerClosed);
            closeStylingTests($(selectors.drawer).not(drawer), $(selectors.contents).not(content), styles.drawerOpened, styles.drawerClosed);
            jqUnit.assertTrue("Opened events fired", openedEventFired);
            jqUnit.assertFalse("Closed events not fired", closedEventFired);
        });
        
        tests.test("Close Drawer With a Space Key", function () {
            // This test can only be run on FF, due to reliance on DOM 2 for synthesizing events.
            if (!$.browser.mozilla) {
                return;
            }
            
            var openedEventFired, closedEventFired = false;
            var options = {
                startOpen: true,
                preventEventFireOnInit: true,
                listeners: {
                    afterOpen: function () {
                        openedEventFired = true;
                    },
                    afterClose: function () {
                        closedEventFired = true;
                    }
                }
            };
            var cabinet = setup(CONTAINER, options);
            var selectors = cabinet.options.selectors;
            var styles = cabinet.options.styles;
            var drawer = $(selectors.drawer).eq(0);
            var content = $(selectors.contents).eq(0);
            var handle = $(selectors.handle).eq(0);
            
            simulateKeyDown(handle, $.ui.keyCode.SPACE);
            
            closeStylingTests(drawer, content, styles.drawerOpened, styles.drawerClosed);
            openStylingTests($(selectors.drawer).not(drawer), $(selectors.contents).not(content), styles.drawerOpened, styles.drawerClosed);
            jqUnit.assertFalse("Opened events not fired", openedEventFired);
            jqUnit.assertTrue("Closed events fired", closedEventFired);
        });
        
        tests.test("Open Drawer With a Space Key", function () {
            // This test can only be run on FF, due to reliance on DOM 2 for synthesizing events.
            if (!$.browser.mozilla) {
                return;
            }
            
            var openedEventFired, closedEventFired = false;
            var options = {
                startOpen: false,
                preventEventFireOnInit: true,
                listeners: {
                    afterOpen: function () {
                        openedEventFired = true;
                    },
                    afterClose: function () {
                        closedEventFired = true;
                    }
                }
            };
            var cabinet = setup(CONTAINER, options);
            var selectors = cabinet.options.selectors;
            var styles = cabinet.options.styles;
            var drawer = $(selectors.drawer).eq(0);
            var content = $(selectors.contents).eq(0);
            var handle = $(selectors.handle).eq(0);
            
            simulateKeyDown(handle, $.ui.keyCode.SPACE);
            
            openStylingTests(drawer, content, styles.drawerOpened, styles.drawerClosed);
            closeStylingTests($(selectors.drawer).not(drawer), $(selectors.contents).not(content), styles.drawerOpened, styles.drawerClosed);
            jqUnit.assertTrue("Opened events fired", openedEventFired);
            jqUnit.assertFalse("Closed events not fired", closedEventFired);
        });
        
        tests.test("Close Drawer With a Enter Key", function () {
            // This test can only be run on FF, due to reliance on DOM 2 for synthesizing events.
            if (!$.browser.mozilla) {
                return;
            }
            
            var openedEventFired, closedEventFired = false;
            var options = {
                startOpen: true,
                preventEventFireOnInit: true,
                listeners: {
                    afterOpen: function () {
                        openedEventFired = true;
                    },
                    afterClose: function () {
                        closedEventFired = true;
                    }
                }
            };
            var cabinet = setup(CONTAINER, options);
            var selectors = cabinet.options.selectors;
            var styles = cabinet.options.styles;
            var drawer = $(selectors.drawer).eq(0);
            var content = $(selectors.contents).eq(0);
            var handle = $(selectors.handle).eq(0);
            
            simulateKeyDown(handle, $.ui.keyCode.ENTER);
            
            closeStylingTests(drawer, content, styles.drawerOpened, styles.drawerClosed);
            openStylingTests($(selectors.drawer).not(drawer), $(selectors.contents).not(content), styles.drawerOpened, styles.drawerClosed);
            jqUnit.assertFalse("Opened events not fired", openedEventFired);
            jqUnit.assertTrue("Closed events fired", closedEventFired);
        });
        
        tests.test("Open Drawer With a Enter Key", function () {
            // This test can only be run on FF, due to reliance on DOM 2 for synthesizing events.
            if (!$.browser.mozilla) {
                return;
            }
            
            var openedEventFired, closedEventFired = false;
            var options = {
                startOpen: false,
                preventEventFireOnInit: true,
                listeners: {
                    afterOpen: function () {
                        openedEventFired = true;
                    },
                    afterClose: function () {
                        closedEventFired = true;
                    }
                }
            };
            var cabinet = setup(CONTAINER, options);
            var selectors = cabinet.options.selectors;
            var styles = cabinet.options.styles;
            var drawer = $(selectors.drawer).eq(0);
            var content = $(selectors.contents).eq(0);
            var handle = $(selectors.handle).eq(0);
            
            simulateKeyDown(handle, $.ui.keyCode.ENTER);
            
            openStylingTests(drawer, content, styles.drawerOpened, styles.drawerClosed);
            closeStylingTests($(selectors.drawer).not(drawer), $(selectors.contents).not(content), styles.drawerOpened, styles.drawerClosed);
            jqUnit.assertTrue("Opened events fired", openedEventFired);
            jqUnit.assertFalse("Closed events not fired", closedEventFired);
        });
    };
    
    $(document).ready(function () {
        cabinetTests();
    });
})(jQuery);
