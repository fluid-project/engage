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

fluid = fluid || {};

(function ($, fluid) {
    
    // TODO: this can be refactored somewhat to remove the duplication of node creation
    //        also, change the signature, just take that.
    var generateTree = function (that, title, tags, allowEdit) {
        title = fluid.stringTemplate(title, {num: tags.length});
        var tagNodes = fluid.transform(tags, function (tag) {
            var node = {
                ID: "tag:",
                children: [{
                    ID: "tagName",
                    value: tag
                }]
            };
            
            if (allowEdit) {
                node.children.push({
                    ID: "remove",
                    value: "remove",
                    decorators: [
                        {type: "jQuery",
                         func: "hide"}
                    ]
                });
            }
            
            return node;
        });
        
        var tree = {children: tagNodes};
        
        tree.children.push({ID: "title", value: title});
        if (allowEdit) {
            tree.children.push({
                ID: "editField",
                value: "",
                decorators: [{
                    type: "jQuery",
                    func: "hide"
                }]
            });
            tree.children.push({
                ID: "edit",
                value: "Edit",
                decorators: [{
                    type: "jQuery",
                    func: "click",
                    args: [function () {
                        that.locate("editField").show();
                        that.locate("remove").show();
                    }]
                }]
            });
        }
        return tree;
    };
        
    var generateSelectorMap = function (selectors) {
        return  [{selector: selectors.title, id: "title"},
                    {selector: selectors.tag, id: "tag:"},
                    {selector: selectors.tagName, id: "tagName"},
                    {selector: selectors.edit, id: "edit"},
                    {selector: selectors.editField, id: "editField"},
                    {selector: selectors.remove, id: "remove"}];
    };
    
    var renderTags = function (that) {
        var tree = generateTree(that, that.options.strings.title, that.options.tags, that.options.allowEdit);
        var selectorMap = generateSelectorMap(that.options.selectors);
        var templates;

        if (that.options.templateURL) {
            // Data structure needed by fetchResources
            var resources = {
                tags: {
                    href: that.options.templateURL,
                    cutpoints: selectorMap
                }
            };
            
            fluid.fetchResources(resources, function () {
                templates = fluid.parseTemplates(resources, ["tags"], {});
                fluid.reRender(templates, that.container, tree);
            	that.events.afterInit.fire();
            });
        } else {
            var opts = {
                debug: true,
                cutpoints: selectorMap
            };

            fluid.selfRender(that.container, tree, opts);
            that.events.afterInit.fire();
        }
    };
    
    fluid.tags = function (container, options) {
        var that = fluid.initView("tags", container, options);
        that.model = that.options.tags;
          
        renderTags(that);        
        
        return that;        
    };

    fluid.defaults("tags", {
        selectors: {
            title: ".flc-tags-title",
            tag: ".flc-tags-tag",
            tagName: ".flc-tags-tagName",
            edit: ".flc-tags-edit",
            editField: ".flc-tags-editField",
            remove: ".flc-tags-remove"
        },
        strings: {
            title: "Tags"
        },
        events: {
            afterInit: null
        },
        allowEdit: true, 
        tags: [],
        templateURL: null  // if not passed in expect the template in the current page
    });
    
    // TODO: find a better name for this. It is the composition of 'myTags' and 'allTags'
    fluid.artifactTags = function (container, options) {
        var that = fluid.initView("artifactTags", container, options);

        var totalTagsStr = fluid.stringTemplate(that.options.strings.tagsTitle, 
        		{num: that.options.myTags.length + that.options.allTags.length});
        
        //that.container.append($("<h2>" + totalTagsStr + "</h2>"));
        $("#drawer-tags").html(totalTagsStr);
        
        var myTagsDiv = $("<div></div>");
        that.container.append(myTagsDiv);
        fluid.tags(myTagsDiv, {
            strings: {title: that.options.strings.myTags}, 
            tags: that.options.myTags,
            templateURL: that.options.tagsTemplateURL
        });
        
        var allTagsDiv = $("<div></div>");
        that.container.append(allTagsDiv);
        fluid.tags(allTagsDiv, {
            strings: {
                title: that.options.strings.allTags
            },
            allowEdit: false,
            tags: that.options.allTags,
            templateURL: that.options.tagsTemplateURL
        });

        return that; 
    };

    fluid.defaults("artifactTags", {
        // TODO: switch to using message bundle instead of strings?
        strings: {
            tagsTitle: "Tags (%num)",
            myTags: "My Tags (%num)",
            allTags: "All Tags (%num)"
        },
		myTags: [],
		allTags: [],
        tagsTemplateURL: "TagsTemplate.html"
    });

})(jQuery, fluid);
