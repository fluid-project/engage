function (doc) {
    emit({
        'title': doc.exhibit.title,
        'lang': doc.exhibit.lang
    }, {
        'endDate': doc.exhibit.enddate, 
        'isCurrent': doc.exhibit.iscurrent, 
        'displayDate': doc.exhibit.displaydate, 
        'image': doc.exhibit.images.image, 
        'content': doc.exhibit.content, 
        'introduction': doc.exhibit.introduction, 
        'catalogueSize': doc.exhibit.artifacts ? doc.exhibit.artifacts.cnt : 0
    });
}