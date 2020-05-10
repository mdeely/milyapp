export function create(doc) {
    let data = doc.data();

    let leafName = data.name.firstName ? data.name.firstName : "No name";
    let leafProfilePhoto = data.profile_photo ? data.profile_photo : "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder.svg?alt=media&token=d3b939f1-d46b-4315-bcc6-3167d17a18ed";

    let figure = document.createElement("figure");
    let image = document.createElement("img");
    let figCaption = document.createElement("figcaption");

    figure.setAttribute("class", "leaf");
    figure.setAttribute("data-id", doc.id);

    image.setAttribute("src", leafProfilePhoto);
    image.setAttribute("alt", leafName);
    image.setAttribute("class", "leaf__image");

    figCaption.setAttribute("class", "leaf_caption");
    figCaption.textContent = leafName;

    figure.appendChild(figCaption);
    figure.appendChild(image);

    figure.addEventListener("click", (e) => {
        e.preventDefault();

        let leafTarget = e.target;

        DetailsPanel.show(doc.id);
        Leaf.setActive(leafTarget);
        DetailsPanel.populate(doc);
    })

    return figure;
    // generate leaf
    // generate leaf list items
    // claimed members -> promise to swap that information.
    // return leaf El;

}