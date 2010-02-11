function (doc) {
    if (doc.exhibit.sections) {
        var sectionArray = doc.exhibit.sections.section;
        for (var index in sectionArray) {
            var section = sectionArray[index];
            emit({
                'exhibitID': doc.exhibit.id, 
                'sectionID': section.id,
                'lang': doc.exhibit.lang
            }, {
                'exhibitTitle': doc.exhibit.title,
                'sectionTitle': section.title,
                'sectionSize': section.artifacts ? section.artifacts.cnt : "0",
                'sectionArtifacts': section.artifacts ? section.artifacts.artifact : []
            });
        }
        emit({
            'exhibitID': doc.exhibit.id, 
            'sectionID': "0",
            'lang': doc.exhibit.lang
        }, {
            'exhibitTitle': doc.exhibit.title,
            'sectionTitle': 'viewAll',
            'sectionSize': doc.exhibit.artifacts ? doc.exhibit.artifacts.cnt : "0",
            'sectionArtifacts': doc.exhibit.artifacts ? doc.exhibit.artifacts.artifact : []
        });
    }
    else {
        emit({
            'exhibitID': doc.exhibit.id, 
            'sectionID': "-1",
            'lang': doc.exhibit.lang
        }, {
            'exhibitTitle': doc.exhibit.title,
            'sectionTitle': '',
            'sectionSize': "0",
            'sectionArtifacts': []
        });
    }
}