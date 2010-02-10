function (doc) {
    if (doc.exhibit.sections) {
        var sectionArray = doc.exhibit.sections.section;
        for (var index in sectionArray) {
            var section = sectionArray[index];
            emit({
                'exhibitTitle': doc.exhibit.title, 
                'sectionTitle': section.title,
                'lang': doc.exhibit.lang
            }, {
                'sectionSize': section.artifacts ? section.artifacts.cnt : "0",
                'sectionArtifacts': section.artifacts ? section.artifacts.artifact : []
            });
        }
        emit({
            'exhibitTitle': doc.exhibit.title, 
            'sectionTitle': 'viewAll',
            'lang': doc.exhibit.lang
        }, {
            'sectionSize': doc.exhibit.artifacts ? doc.exhibit.artifacts.cnt : "0",
            'sectionArtifacts': doc.exhibit.artifacts ? doc.exhibit.artifacts.artifact : []
        });
    }
    else {
        emit({
            'exhibitTitle': doc.exhibit.title, 
            'sectionTitle': '',
            'lang': doc.exhibit.lang
        }, {
            'sectionSize': "0",
            'sectionIntroduction': '',
            'sectionArtifacts': []
        });
    }
}