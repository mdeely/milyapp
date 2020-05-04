let settingsViewEl = document.querySelector(`[data-view="settings"]`);
let settingsDebugMsg = settingsViewEl.querySelector(`.debugMessage`);

export default function setup() {
    pageTitle.innerHTML = "Settings";
}

export const settingsViewOnAuthChange = (user) => {
    if (user) {
        settingsDebugMsg.textContent = "Authenticated";
    } else {
        settingsDebugMsg.textContent = "Not authenticated";
    }
}
// OnAuthStateChange:
// If user:
// Load member details

const setupSettingsView = (authenticated) => {
    settingsDebugMsg.innerHTML = '';
    if (auth.currentUser) {
        settingsDebugMsg.innerHTML = "Authenticated. This is your settings"
    } else {
        settingsDebugMsg.innerHTML = "Not authenticated. Please log in"
    }
}