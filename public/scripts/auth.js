// // add admin cloud function
// const adminForm = document.querySelector("#admin-form");
// adminForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const adminEmail = adminForm["admin-email"].value;
//     const addAdminRole = functions.httpsCallable('addAdminRole');
//     addAdminRole({ email: adminEmail }).then(result => {
//         console.log(result);
//     })
// })

const productionEnv = location.host.includes("milyapp") ? true : false;

const members = db.collection('members');
const trees = db.collection('trees');
const notifications = db.collection('notifications');

// signup form
const signInForm = document.querySelector("#signup-form");
const signOutButton = document.querySelector("#signout-button");
const logInForm = document.querySelector("#login-form");

setupEnvironment();

signOutButton.addEventListener('click', (e) => {
    e.preventDefault();
    // sign out the user
    auth.signOut();
})

function setupEnvironment() {
    if (productionEnv) {
        signInForm.remove();
    }
}

// listen for auth status changes
auth.onAuthStateChanged(async user => {
    if (user) {
        user.getIdTokenResult().then(idTokenResult => {
            user.admin = idTokenResult.claims.admin
            setupAuthUi(user);
        })
        // get member where claimed by UID
        let authMember = await members.where('claimed_by', '==', user.uid).limit(1).get();
        for (const doc of authMember.docs) {
            window.authMemberDoc = await doc ? doc : null;
            setupView();
        }
    } else {
        history.replaceState(null, null, null);
        window.authMemberDoc = null;
        setupAuthUi(user);
        setupView();
    }
})

signInForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //get user info
    const email = signInForm['signup-email'].value;
    const password = signInForm['signup-password'].value;

    // sign up the user
    auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
        // Associate a member to the user
        members.add({
            "claimed_by": cred.user.uid,
            "created_by": cred.user.uid,
            "name": {
                firstName: email,
                lastName: null,
                surname: null
            },
            "email": email,
            "trees": [],
            "primary_tree": null
        }).then(() => {
            signInForm.reset();
            signInForm.querySelector(".error").innerHTML = '';
        }).catch(err => {
            signInForm.querySelector(".error").innerHTML = err.message;
        })
    }).catch(err => {
        signInForm.querySelector(".error").innerHTML = err.message;
    })
})

logInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //get user info
    const email = logInForm['login-email'].value;
    const password = logInForm['login-password'].value;

    auth.signInWithEmailAndPassword(email, password)
    .then(cred => {
        logInForm.reset();
        logInForm.querySelector(".error").innerHTML = '';
    }).catch(err => {
        logInForm.querySelector(".error").innerHTML = err.message;
    })
})