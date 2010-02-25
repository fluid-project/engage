function (doc) {
    var artifact = doc.artifact;
    var calculateMediaCount = function (mediafiles) {
        if (!mediafiles || !mediafiles.mediafile) {
            return "0";
        }
        var mediafile = mediafiles.mediafile;        
        return mediafile.length ? mediafile.length.toString() : "1";                
    };
    emit({
        'objectCode': artifact.objectcode,
        'lang': artifact.lang 
    }, {
        'title': artifact.label.title || artifact.label.object,
        'artist': artifact.label.artist,
        'dated': artifact.label.dated,
        'medium': artifact.label.medium,
        'dimensions': artifact.label.dimensions,
        'mention': artifact.label.mention,
        'accessnumber': artifact.label.accessnumber,
        'description': artifact.description || "",
        'mediaCount': calculateMediaCount(artifact.mediafiles),
        'media': artifact.mediafiles ? artifact.mediafiles.mediafile || [] : [],
        'commentsCount': artifact.comments ? artifact.comments.cnt || "0" : "0",
        'comments': artifact.comments ? artifact.comments.comment || [] : [],
        'relatedArtifactsCount': artifact.related_artifacts ? artifact.related_artifacts.cnt || "0" : "0",
        'relatedArtifacts': artifact.related_artifacts ? artifact.related_artifacts.artifact || [] : [],
        'image': artifact.images ? artifact.images.image : []
    });
}