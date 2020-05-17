let Nav = {};

Nav.update = function(user) {
    if (user) {
        for (let item of hideWhenAuthenticated) {
            item.style.display = "none";
        }
        for (let item of showWhenAuthenticated) {
            item.style.display = "";
        }
        navLogo.setAttribute("href", "#/my-trees");

        if (LocalDocs.member && LocalDocs.member.data().profile_photo) {
            let profileFileReference = storage.ref(`${LocalDocs.member.data().profile_photo}`);
            profileFileReference.getDownloadURL().then(function(url) {
                accountMenuButton.style.backgroundImage = `url(${url})`;
            })
        } else {
            accountMenuButton.style.backgroundImage = `url(${placeholderImageUrl})`;
        }
    } else {
        for (let item of hideWhenAuthenticated) {
            item.style.display = "";
        }
        for (let item of showWhenAuthenticated) {
            item.style.display = "none";
        }
        navLogo.setAttribute("href", "/");
    }
}