const signUpButton = document.querySelector("#sign-up_button");
const logInButton = document.querySelector("#log-in_button");
const accountMenuButton = document.querySelector("#accountMenu");
const searchButton = document.querySelector("#search_button");
const viewPreferencesButton = document.querySelector("#view-preferences_button");

let hideWhenAuthenticated = [signUpButton, logInButton];
let showWhenAuthenticated = [accountMenuButton, searchButton, viewPreferencesButton];

export function update(user) {
    if (user) {
        for (let item of hideWhenAuthenticated) {
            item.style.display = "none";
        }
        for (let item of showWhenAuthenticated) {
            item.style.display = "";
        }
        console.log("change nav for auth user");
    } else {
        for (let item of hideWhenAuthenticated) {
            item.style.display = "";
        }
        for (let item of showWhenAuthenticated) {
            item.style.display = "none";
        }
        console.log("change nav for unauth")
    }
}