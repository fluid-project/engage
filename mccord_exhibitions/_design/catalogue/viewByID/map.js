function(doc) {    
    var buildSections = function (value) {
        var sections = [];
        for (var index in value) {
            var section = value[index];
            sections.push({
                'sectionSize': section.artifacts ? section.artifacts.cnt : "0",
                'sectionTitle': section.title,
                'sectionID': section.id,
                'sectionHighlights': section.highlights ? (section.highlights.artifact || []) : [] 
            });
        }
        return sections;
    };
    emit({
        'id': doc.exhibit.id,
        'lang': doc.exhibit.lang
    }, {
        'title': doc.exhibit.title,
        'catalogueSize': doc.exhibit.artifacts ? doc.exhibit.artifacts.cnt : "0", 
        'sections': doc.exhibit.sections ? buildSections(doc.exhibit.sections.section) : []
    });
}