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
            verificationMessage()
            .then(() => {
                const resendVerificationButton = document.querySelector("#resend-verification_button");
                resendVerificationButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    auth.currentUser.sendEmailVerification();
                })
            })
        }
    } else {
        ageVerificationView.innerHTML = "Create an account to get started";
    }
    console.log("auth change verificaiton")
}

const verificationMessage = () => new Promise(
    function(resolve, reject) {
        let html = `
        <h1 class="u-ta_center">Please verify your email</h1>
        <p class="u-ta_center u-mar-b_4">Check your email to verify your account. Can't find the email? <a href="#" id="resend-verification_button">Resend verification email</a></p>
        <button onclick="location.reload();" class="u-mar-lr_auto secondary">Refresh page</button>`

        ageVerificationView.innerHTML = html;

        resolve(html);
    }
)