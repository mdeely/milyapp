let profileViewEl = document.querySelector(`[data-view="profile"]`);
let profileDebugMsg = profileViewEl.querySelector(`.debugMessage`);

export default function setup() {
    console.log("requested profile!")
}

export const profileViewOnAuthChange = (user) => {
    if (user) {
        profileDebugMsg.textContent = "Authenticated";
        console.log("authenticated. do profile things")
    } else {
        profileDebugMsg.textContent = "Not authenticated";
    }
}

// OnAuthStateChange:
// If user:
// Load member details

const setupProfileView = (authenticated) => {
    // profileDebugMsg.innerHTML = '';
    // if (auth.currentUser) {
    //     profileDebugMsg.innerHTML = "Authenticated. This is your profile"
    // } else {
    //     profileDebugMsg.innerHTML = "Not authenticated. Please log in"
    // }
}