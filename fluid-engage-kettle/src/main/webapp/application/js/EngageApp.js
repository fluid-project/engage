/*
Copyright 2009-2010 University of Toronto
Copyright 2009 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery, fluid*/
"use strict";

fluid = fluid || {};
fluid.engage = fluid.engage || {};

(function () {
    // TODO: This fragile utility must be deprecated
    fluid.engage.makeAcceptorForResource = function (atSegment, extension, handler) {
        return {
            accept: function (segment, relPath, pathInfo) {
                if (segment === atSegment && pathInfo.extension === extension) {
                    return {
                        handle: handler
                    };
                }
                return null;
            }
        };
    };
    
    fluid.engage.mountHandler = function (onApp, atSegment, handler) {
        fluid.engage.mountAcceptor(onApp, atSegment, {
            accept: function (segment, relPath, pathInfo) {
                return {
                    handle: handler
                };
            }
        });
    };
    
    var mergeAcceptorAtSegment = function (onApp, segment, acceptor) {
        // TODO: compensate for segment POSSIBLY ending in / , but this should
        // properly be handled at top level with mountAcceptor and generic acceptor scheme
        if (segment.charAt(segment.length - 1) === "/") {
            segment = segment.substring(0, segment.length - 1);
        }
        onApp.root[segment] = onApp.root[segment] || {};
        var urlTable = onApp.root[segment];
        urlTable["*"] = urlTable["*"] || [];
        urlTable["*"].push(acceptor);
    };
    
    fluid.engage.mountAcceptor = function (onApp, atSegment, acceptor) {
        var acceptorMap = atSegment;
        if (typeof atSegment === "string") {
            acceptorMap = {};
            acceptorMap[atSegment] = acceptor;
        }

        for (var segment in acceptorMap) {
            mergeAcceptorAtSegment(onApp, segment, acceptorMap[segment]);
        }
    };
    // temporary function required whilst we use Rhino
    fluid.engage.endeaden = function (undead) {
        var togo = undead;
        var clazz = String(undead.getClass().getName());
        if (clazz.charAt(0) === "[") {
            togo = [];
            for (var i = 0; i < undead.length; ++ i) {
                togo[i] = fluid.engage.endeaden(undead[i]);
            }
        }
        else if (clazz === "java.util.HashMap") {
            togo = {};
            for (var j = undead.keySet().iterator(); j.hasNext();) {
                var key = j.next();
                var value = undead.get(key);
                togo[key] = fluid.engage.endeaden(value);
            }
        }
        else {
            togo = String(undead);
        }
        return togo;
    };
    
    fluid.engage.applyMountConfig = function (app, mounts, baseDir) {
        for (var key in mounts) {
            var mount = mounts[key];
            fluid.engage.mountAcceptor(app, mount.target, 
            fluid.kettle.mountDirectory(baseDir, mount.source));
        }
    };
    
    fluid.engage.mountRenderHandler = function (options) {
        var handlerOptions = fluid.kettle.renderHandlerConfig(options);
        var handler = fluid.kettle.renderHandler(handlerOptions);
        fluid.engage.mountAcceptor(options.app, options.target, handler);
        return handler;
    };
    
    fluid.engage.initEngageApp = function (config) {
        config = fluid.engage.endeaden(config);
        var app = fluid.kettle.makeKettleApp(config);
        config.baseDir = fluid.kettle.slashiseUrl(config.baseDir);
        var baseDir = config.baseDir;
        var mounts = config.mount;
        fluid.kettle.computeAbsMounts(mounts, baseDir);

        var serviceInits = fluid.makeArray(config.initServices);        
        // Initialize each of the Engage app services registered in the config file.
        fluid.setLogging(true);
        for (var i = 0; i < serviceInits.length; i++) {
            var initFn = serviceInits[i];
            fluid.log("Initializing service " + initFn);
            fluid.invokeGlobalFunction(initFn, [config, app]);
        }
        fluid.kettle.dequeueInvocations("fluid.engage.initEngageApp", {
          config: config, app: app});  
        
        // Mount shared directory points.
        fluid.engage.applyMountConfig(app, mounts, baseDir);
        
        return app.app;
    };
})();
