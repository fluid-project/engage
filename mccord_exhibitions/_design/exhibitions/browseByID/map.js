function (doc) {
    emit(doc.exhibit.lang, {
        'title': doc.exhibit.title,
        'id': doc.exhibit.id,
        'endDate': doc.exhibit.enddate, 
        'isCurrent': doc.exhibit.iscurrent, 
        'displayDate': doc.exhibit.displaydate, 
        'image': doc.exhibit.images.image
    });
}