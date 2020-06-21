const ageVerificationView = document.querySelector(`[data-view="account-verification"]`);

function accountVerificationSetup() {
    ageVerificationView.style.display = "";

    accountVerificationViewOnAuthChange();
}

function accountVerificationViewOnAuthChange(user) {
    window.location.hash = "/account-verification";

    if (auth.currentUser) {
        if (auth.currentUser.emailVerified) {
            ageVerificationView.innerHTML = "You're all verified!";
        } else {
            Nav.showViewPreferencesButton(false);
            verificationMessage()
            .then(() => {
                const resendVerificationButton = document.querySelector("#resend-verification_button");
                resendVerificationButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    auth.currentUser.sendEmailVerification();
                })
            })
        }
    }
}

const verificationMessage = () => new Promise(
    function(resolve, reject) {
        let email = auth.currentUser.email;
        let html = `
        <h1 class="u-ta_center">Check your email inbox</h1>
        <p class="u-ta_center u-mar-b_4 u-font-size_18">You'll need to verify <span class="u-bold">${email}</span> to continue.</p> 
        <button onclick="location.reload();" class="u-mar-lr_auto secondary u-mar-b_4">Refresh page</button>
        <p class="u-ta_center u-text_low u-mar-b_4 u-font-size_14">Not seeing the email? <a href="#" id="resend-verification_button">Resend verification email</a></p>`

        ageVerificationView.innerHTML = html;
        

        resolve(html);
    }
)