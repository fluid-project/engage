/*global jQuery*/
/*global fluid*/

fluid = fluid || {};

(function ($, fluid) {
    
    // TODO: this can be refactored somewhat to remove the duplication of node creation
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
                decorators: [
                    {type: "jQuery",
                     func: "hide"}
                ]
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
            
            // Get the template, create the tree and render the table of contents
            fluid.fetchResources(resources, function () {
                templates = fluid.parseTemplates(resources, ["tags"], {});
                fluid.reRender(templates, that.container, tree);
            //                afterRender.fire(node);
            });
        } else {
            var opts = {
                debug: true,
                cutpoints: selectorMap
            };

            fluid.selfRender(that.container, tree, opts);
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
        allowEdit: true, 
        tags: [],
        templateURL: null  // if not passed expect the template in the current page
    });
    
    // TODO: find a better name for this. It is the composition of 'myTags' and 'allTags'
    fluid.artifactTags = function (container, options) {
        var that = fluid.initView("artifactTags", container, options);
        
        // TODO: retrieve these tags from the server for a particular artifact
        var tags = {
            myTags: ["lorem", "ipsum", "dolor"],
            allTags: ["sit", "amet", "consectetur", "adipiscing", "elit", "Mauris", "iaculis", "scelerisque", "Cras", "nunc", "libero"]
        };

        var totalTagsStr = fluid.stringTemplate(that.options.strings.tagsTitle, {num: tags.myTags.length + tags.allTags.length});
        that.container.append($("<h1>" + totalTagsStr + "</h1>"));
        
        var myTagsDiv = $("<div></div>");
        that.container.append(myTagsDiv);
        fluid.tags(myTagsDiv, {
            strings: {title: that.options.strings.myTags}, 
            tags: tags.myTags,
            templateURL: "TagsTemplate.html"
        });
        
        var allTagsDiv = $("<div></div>");
        that.container.append(allTagsDiv);
        fluid.tags(allTagsDiv, {
            strings: {
                title: that.options.strings.allTags
            },
            allowEdit: false,
            tags: tags.allTags,
            templateURL: "TagsTemplate.html"
        });

        return that; 
    };

    fluid.defaults("artifactTags", {
        // TODO: switch to using message bundle instead of strings?
        strings: {
            tagsTitle: "Tags (%num)",
            myTags: "My Tags (%num)",
            allTags: "All Tags (%num)"
        }
    });

})(jQuery, fluid);
