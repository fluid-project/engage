/*
Copyright 2009-2010 University of Toronto

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
fluid.exhibitionService = fluid.exhibitionService || {};

(function ($) {

    fluid.engage.exhibitionDataSource = fluid.kettle.makeDataSource({
        source: {
          type: "fluid.kettle.couchDBSource",
          urlBuilder: {
              funcName: "fluid.stringTemplate",
              args: ["{config}.viewURLTemplate", 
                {
                  dbName: "${db}_exhibitions",
                  view: "{config}.views.exhibitions" 
                }]
          }
        },
        outputMapper: "fluid.engage.exhibitionMapper"
    });
    
        
    fluid.kettle.dataSpout({
        url: "exhibitions/browse",
        contentType: "JSON",
        source: {funcName: "fluid.engage.exhibitionDataSource",
            args: [{db: "{params}.db"}]}
        });
        
    fluid.kettle.markupSpout({
        renderHandlerConfig: {
            target: "exhibitions/",
            source: "components/browse/html/",
            sourceMountRelative: "engage",
            baseOptions: {
                renderOptions: {
                    cutpoints: [{selector: "#flc-initBlock", id: "initBlock"}]
                }
            }
        },
        producers: {
            "browse": function (context, renderHandlerConfig) {
                  var params = context.urlState.params;
                  var data = fluid.engage.exhibitionDataSource.get({db: params.db});
                  if (!data.isError) {
                      var strings = fluid.kettle.getBundle(renderHandlerConfig, params);
                      var options = {
                          model: data.data,
                          useCabinet: true
                      };
                      if (strings) {
                          options.strings = strings;
                      }
          
                      return {tree: {
                          ID: "initBlock", 
                          functionname: "fluid.browse", 
                          "arguments": [".flc-browse", options]
                      }};
                  }
                  else return data;
              }
        }
        });
    
    
    var compileTargetURL = function (URLBase, params) {
        return URLBase + "?" + $.param(params);
    };
    
    fluid.engage.exhibitionMapper = function (model, options) {
        var dbName = options.db + "_exhibitions";
        var baseExhibitionURL = "view.html";
        var baseUpcomingExhibitionURL = "about.html";
        var data = fluid.transform(model.rows, function (value) {
            return fluid.engage.mapModel(value, dbName);
        });
        
        var sortExhibitions = function (exhibitions) {
            var current = {
                isCurrent: true,
                exhibitions: []
            };
            
            var upcoming = {
                isCurrent: false,
                exhibitions: []  
            };
            
            $.each(exhibitions, function (i, exhibition) {
                var exhibitionInfo = {
                    image: exhibition.image,
                    isCurrent: exhibition.isCurrent,
                    title: exhibition.title,
                    url: compileTargetURL(exhibition.isCurrent ? baseExhibitionURL : baseUpcomingExhibitionURL, {
                        db: dbName,
                        title: exhibition.title
                    }),
                    displayDate: exhibition.displayDate,
                    endDate: exhibition.endDate
                };
                
                if (exhibition.isCurrent) {
                    current.exhibitions.push(exhibitionInfo);
                } else {
                    upcoming.exhibitions.push(exhibitionInfo);
                }
            });
            
            return [current, upcoming];
        };
        
        var togo = {
            categories: sortExhibitions(data)
        };
        
        togo.categories = fluid.transform(togo.categories, function (category) {
            return {
                name: category.isCurrent ? "currentCategory" : "upcomingCategory",
                items: fluid.transform(category.exhibitions, function (exhibition) {
                    return {
                        isCurrent: exhibition.isCurrent,
                        url: exhibition.url,
                        imageUrl: exhibition.image,
                        title: exhibition.title,
                        description: exhibition.displayDate
                    };
                })
            };
        });
        togo.title = "title";        
        return togo;
    };
    
})(jQuery);