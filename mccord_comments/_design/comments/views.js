var views = // Paste into Futon starting on line following 
{ 
    "comments": {
        "map": "function(doc) {
            if (doc.type === 'fluid.guestbook.comment') {
                emit({type: doc.targetType, id: doc.targetId, date: doc.date}, doc);
            }
        }"
    }
}