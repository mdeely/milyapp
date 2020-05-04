export function create(doc) {
    let data = doc.data;
    let leafName = data.name.firstName ? data.name.firstName : "No name";
    let leafProfilePhoto = data.profile_photo ? data.profile_photo : "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder.svg?alt=media&token=d3b939f1-d46b-4315-bcc6-3167d17a18ed";

    let leafEl =
        `<figure class="leaf" data-id="${doc.id}">
            <img class="leaf__image" src="${leafProfilePhoto}" alt="${leafName}"/>
            <figcaption class="leaf_caption">${leafName}</figCaption>
        </figure>`

    return leafEl;
    // generate leaf
    // generate leaf list items
    // claimed members -> promise to swap that information.
    // return leaf El;

}