let homepageViewEl = document.querySelector(`[data-view="homepage"]`);
let homepageDebugMsg = homepageViewEl.querySelector(`.debugMessage`);

const homepageSetup = () => {
    let auth = firebase.auth();
    homepageDebugMsg.innerHTML = "";

    if (firebase.auth().currentUser) {
        homepageViewOnAuthChange(auth.currentUser);
    }
}

const homepageViewOnAuthChange = (user) => {
    if (user) {
        window.location.hash= '/my-trees';
     }
    // if (user) {
    //     homepageDebugMsg.textContent = "Authenticated";
    // } else {
    //     homepageDebugMsg.textContent = "Not authenticated";
    // }
}