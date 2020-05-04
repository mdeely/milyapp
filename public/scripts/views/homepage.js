let homepageViewEl = document.querySelector(`[data-view="homepage"]`);
let homepageDebugMsg = homepageViewEl.querySelector(`.debugMessage`);

export default function setup() {
    homepageDebugMsg.innerHTML = "";

    if (auth.currentUser) {
        homepageViewOnAuthChange(auth.currentUser);
    }
}

export const homepageViewOnAuthChange = (user) => {
    if (user) {
        homepageDebugMsg.textContent = "Authenticated";
    } else {
        homepageDebugMsg.textContent = "Not authenticated";
    }
}