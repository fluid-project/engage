function (doc) {
    var artifact = doc.artifact;
    emit({
        'accessNumber': artifact.label.accessnumber,
        'lang': artifact.lang 
    }, {
        'title': artifact.label.title,
        'artist': artifact.label.artist,
        'dated': artifact.label.dated,
        'medium': artifact.label.medium,
        'dimensions': artifact.label.dimensions,
        'mention': artifact.label.mention,
        'accessnumber': artifact.label.accessnumber,
        'description': artifact.description || "",
        'mediaCount': artifact.mediafiles ? artifact.mediafiles.mediafile.length || 0 : 0,
        'media': artifact.mediafiles ? artifact.mediafiles.mediafile || [] : [],
        'commentsCount': artifact.comments ? artifact.comments.cnt || 0 : 0,
        'comments': artifact.comments ? artifact.comments.comment || [] : [],
        'relatedArtifactsCount': artifact.related_artifacts ? artifact.related_artifacts.cnt || 0 : 0,
        'relatedArtifacts': artifact.related_artifacts ? artifact.related_artifacts.artifact || [] : [],
        'image': artifact.images ? artifact.images.image : []
    });
}