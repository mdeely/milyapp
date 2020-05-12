const signUpButton = document.querySelector("#sign-up_button");
const logInButton = document.querySelector("#log-in_button");
const accountMenuButton = document.querySelector("#accountMenu");
const searchButton = document.querySelector("#search_button");
const viewPreferencesButton = document.querySelector("#view-preferences_button");
const navLogo = document.querySelector("#mainNav_logo");

let hideWhenAuthenticated = [signUpButton, logInButton];
let showWhenAuthenticated = [accountMenuButton, searchButton, viewPreferencesButton];

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