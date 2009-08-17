/*global jQuery*/
/*global fluid*/

fluid = fluid || {};

(function ($, fluid) {

    var generateTitle = function (titleTemplate, numTags, allowEdit) {
        var title = fluid.stringTemplate(titleTemplate, {num: numTags});
        var edit = allowEdit ? "<a class=\"flc-tags-edit\" href='#'>edit</a>" : "";
        
        return "<h2>" + title + edit + "</h2>";
    }

    // TODO: change this to use the renderer instead of generating the UI by hand
    //       once this is changed to use the renderer the hardcoded html will be gone.
    // TODO: I've put some disply information inline for this early mockup - it must be moved to CSS
    var generateTagsUI = function (container, tags, titleTemplate, allowEdit) {        
        var tagsHtmlStr = "<ul style=\"display:inline\">";
        
        for (var i in tags) {
            tagsHtmlStr += "<li class=\"flc-tags-tag\" style=\"display:inline\">" + tags[i];
            tagsHtmlStr += allowEdit ? "<a class=\"flc-tags-remove\" href=\"#\"> remove</a></li>" : "</li>";
            if (i < tags.length - 1) {
                tagsHtmlStr += ", ";
            }
        }
        
        tagsHtmlStr += allowEdit ? "</ul><br /><input style=\"display:none\" type=\"text\" class=\"flc-tags-editField\"></input>" : "</ul";
        
        container.append($(generateTitle(titleTemplate, tags.length, allowEdit) + tagsHtmlStr));
    };
    
    var editTags = function () {
        
    };
    
    fluid.tags = function (container, options) {
        var that = fluid.initView("tags", container, options);
        that.model = that.options.tags;
          
        generateTagsUI(that.container, that.model, that.options.strings.title, that.options.allowEdit);
        
        if (that.options.allowEdit) {
            that.locate("edit").click(function () {
                that.locate("editField").show();
            });
            
            that.locate("remove").click(function () {
                // TODO: find the ancestor with 'flc-tags-tag' and remove it from the UI also remove it from the model
                console.log("you want to remove something");
            });
        }
        
        return that;        
    };

    fluid.defaults("tags", {
        selectors: {
            edit: ".flc-tags-edit",
            remove: ".flc-tags-remove",
            editField: ".flc-tags-editField",
            tag: "flc-tags-tag"
        },
        strings: {
            title: "Tags"
        },
        allowEdit: true, 
        tags: []
    });
    
    // TODO: find a better name for this. It is the composition of 'myTags' and 'allTags'
    fluid.artifactTags = function (container, options) {
        var that = fluid.initView("artifactTags", container, options);
        
        // TODO: retrieve these tags from the server for a particular artifact
        var tags = {
            myTags: ["lorem", "ipsum", "dolor"],
            allTags: ["sit", "amet", "consectetur", "adipiscing", "elit", "Mauris", "iaculis", "scelerisque", "Cras", "nunc", "libero"]
        };

        // TODO: use Cabinet to create this display
        var totalTagsStr = fluid.stringTemplate(that.options.strings.tagsTitle, {num: tags.myTags.length + tags.allTags.length});
        that.container.append($(generateTitle(totalTagsStr)));
        
        var myTagsDiv = $("<div></div>");
        that.container.append(myTagsDiv);
        fluid.tags(myTagsDiv, {strings: {title: that.options.strings.myTags}, tags: tags.myTags});

        var allTagsDiv = $("<div></div>");
        that.container.append(allTagsDiv);
        fluid.tags(allTagsDiv, {strings: {
                title: that.options.strings.allTags
            },
            allowEdit: false, 
            tags: tags.allTags});


        return that; 
    };

    fluid.defaults("artifactTags", {
        strings: {
            tagsTitle: "Tags (%num)",
            myTags: "My Tags (%num)",
            allTags: "All Tags (%num)"
        }
    });

})(jQuery, fluid);
