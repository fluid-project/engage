/*global window, jQuery, fluid*/
"use strict";

fluid = fluid || {};
fluid.engage = fluid.engage || {};

(function ($) {
    var tagURLMap = {
        link: "href",
        script: "src"
    };
    
    var parseURL = function (tag) {
        var urlAtt = tagURLMap[tag.nodeName.toLowerCase()];
        return urlAtt? tag.getAttribute(urlAtt) : null;
    };
    
    registerDependency = function (that, url, ancestral) {
        that[ancestral? "ancestral" : "dependencies"][url] = true;
        };
        
    registerVolatile = function (that, el, url) {
        var id, oldEl = that.dependencies[url];
        if (typeof(oldEl) === "string") {
            id = oldEl; 
        }
        else {
            id = fluid.allocateSimpleId(el);
            that.dependencies[url] = id;
        }
        that.volatileSources[id] = id;
    };
    
    var injectUniqueTag = function (that, injectFn, tag, type) {
        var tagURL = parseURL(tag);
        var isLoaded = that.dependencies[tagURL];
        var isAncestral = that.ancestral[tagURL];
        var isVolatile = $.nodeName(tag, "link");
        if (isVolatile || !isLoaded) {
            if (!isLoaded) {
                registerDependency(that, tagURL);
                injectFn(tag);
            }
            if (isVolatile && !isAncestral) {
                registerVolatile(that, tag, tagURL);
            }

        }
    };
    
    var createSafariInjectFn = function (container, type) {
        return function (tag) {
            var existing = $(type, container);
            if (existing.length === 0) {
                container.append(tag);
            } else {
                var lastEl = $(type + ":last", container);
                lastEl.after(tag);
            }
        };
    };
    
    var createCleanInjectFn = function (container) {
        return function (tag) {
            container[0].appendChild(tag);
        };
    };
    
    var injectUniqueTags = function (that, container, type, tags) {
        var injectFn = $.browser.safari ? createSafariInjectFn(container, type) : createCleanInjectFn(container);        
        $.each(tags, function (idx, tag) {
            var cleaned = $.clean([tag])[0];
            injectUniqueTag(that, injectFn, cleaned, type);
        });
    };
    
    function clearVolatiles(that, newVols, oldVols) {
        fluid.transform(oldVols, function(id) {
            if (!newVols[id]) {
                var node = fluid.byId(id);
                var url = parseURL(node);
                $(node).remove();
                delete that.dependencies[url];
            }
        });
    }
    
    var inject = function (that, doc) {
        var head = $("head");
        var oldVols = fluid.copy(that.volatileSources);
        that.volatileSources = {};
        injectUniqueTags(that, head, "link", doc.linkTags);
        injectUniqueTags(that, head, "script", doc.scriptTags);
        clearVolatiles(that, that.volatileSources, oldVols);
        that.container.html(doc.body);
    };
    
    var registerDependencies = function (that, elements, type, ancestral) {
        elements.each(function (idx, el) {
            el = fluid.wrap(el);
            var urlAttr = tagURLMap[type];
            var url = el.attr(urlAttr);
            if (url) {
                registerDependency(that, url);
                if (ancestral) {
                    registerDependency(that, url, true);
                }
            }
        });
    };
    
    var registerHeadDependencies = function (that) {
        registerDependencies(that, $("head link"), "link", true);
        registerDependencies(that, $("head script"), "script");
    };
    
    var getFragmentLocation = function () {
        var href = window.location.href;
        var hashIdx = href.indexOf("#");
        
        return hashIdx > -1 ? href.substring(hashIdx + 1, href.length) : null;
    };
    
    var setFragmentLocation = function (url) {
        var loc = window.location.href;
        var fragIdx = loc.indexOf("#");
        var newFrag = "#" + url;
        window.location = fragIdx > -1 ? loc.substring(0, fragIdx) + newFrag : loc + newFrag;
    };
    
    var updateHistoryNew = function (that, newUrl) {
        if (that.historyPos !== that.pageStack.length - 1) {
            that.pageStack = that.pageStack.slice(0, that.historyPos + 1);
        }
        that.pageStack.push(newUrl);
        ++that.historyPos;
    };
    
    var accreteFunction = function (func1, func2) {
        return function () {
            func1.apply(null, arguments);
            func2.apply(null, arguments);
        };
    };
    
    var setupNavigator = function (that) {
        registerHeadDependencies(that);
        // Bind a live click event that will override all natural page transitions and do them via Ajax instead.
        $("a:not([href^=#])").live("click", function (evt) {
            var url = $(this).attr("href");
            if (url.indexOf("http://") === -1) {
                that.setRelativeLocation(url);
            } else {
                // This is an external, absolute URL, and should be loaded without Ajax, but without showing chrome.
                window.location = url;
            }
            evt.preventDefault();
        });
        
        fluid.engage.screenNavigator.that = that; // Expose this screenNavigator instance as a singleton.
        var fragLoc = getFragmentLocation();
        that.setLocation(fragLoc || that.options.initialUrl);
    };
    
    fluid.engage.screenNavigator = function (container, options) {
        var that = fluid.initView("fluid.engage.screenNavigator", container, options);
        that.dependencies = {};
        that.ancestral = {};
        that.pageStack = [""];
        that.historyPos = 0;
        that.volatileSources = {};
        
        var setFrag = function (that, newUrl) {
            setFragmentLocation(newUrl);
        };
        
        that.setRelativeLocation = function (url, historyUpdater) {
            var current = that.currentURL || "mobileHome/mobileHome.html"; // TODO: no idea what to do here
            var parsedCurrent = fluid.kettle.parseUrl(current);
            var prefix = fluid.kettle.collapseSegs(parsedCurrent.pathInfo, 0, parsedCurrent.pathInfo.length - 1) + "/"; 
            var splitUrl = fluid.kettle.splitUrl(url);
            splitUrl.path = fluid.kettle.makeCanon(prefix + splitUrl.path);
            var newUrl = splitUrl.path;
            newUrl = splitUrl.query ? newUrl + "?" + splitUrl.query : newUrl;
            that.setLocation(newUrl, historyUpdater);   
        };
        
        that.setLocation = function (url, historyUpdater) {
            historyUpdater = accreteFunction(setFrag, historyUpdater || updateHistoryNew);
            that.injectPage(url, historyUpdater); 
        };
            
        that.injectPage = function (newUrl, success) {
            $.ajax({
                url: fluid.kettle.addParamsToUrl(options.condenser, {targetUrl: newUrl}),
                dataType: "json",
                success: function (doc) {
                    window.setTimeout(function() {
                        success(that, newUrl);
                        that.currentURL = that.pageStack[that.historyPos];
                        inject(that, doc);}, 1);
                },
                error: function (xhr, textstatus, errthrown) {
                    fluid.log("An error occurred while trying to fetch a page: " + textstatus);
                }
            });
        };
        
        that.goHistory = function (num) {
            var newPos = that.historyPos + num;
            newPos = newPos < 0 ? 0 : newPos >= that.pageStack.length ? that.pageStack.length - 1 : newPos;
            if (newPos !== that.historyPos) {
                that.setLocation(that.pageStack[newPos], function () {
                    that.historyPos = newPos;
                });
            }
        };
        
        setupNavigator(that);
        return that;
    };
    
    fluid.engage.screenNavigator.get = function () {
        return fluid.engage.screenNavigator.that;
    };
    
    fluid.defaults("fluid.engage.screenNavigator", {
        initialURL: "home/home.html"
    });
    
})(jQuery);
