function (doc) {
    emit({
        'id': doc.exhibit.id,
        'lang': doc.exhibit.lang
    }, {
        'shortDescription': doc.exhibit.blurb || "",
        'endDate': doc.exhibit.enddate, 
        'isCurrent': doc.exhibit.iscurrent, 
        'displayDate': doc.exhibit.displaydate, 
        'image': doc.exhibit.images.image, 
        'content': doc.exhibit.content, 
        'introduction': doc.exhibit.introduction, 
        'catalogueSize': doc.exhibit.artifacts ? doc.exhibit.artifacts.cnt : "0",
        'cataloguePreview': doc.exhibit.highlights ? doc.exhibit.highlights.artifact : [] 
    });
}