// add admin cloud function
const adminForm = document.querySelector("#admin-form");
adminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const adminEmail = adminForm["admin-email"].value;
    const addAdminRole = functions.httpsCallable('addAdminRole');
    addAdminRole({ email: adminEmail }).then(result => {
        console.log(result);
    })
})

const members = db.collection('members');
const trees = db.collection('trees');
const users = db.collection('users');
const families = db.collection('families');

// listen for auth status changes
auth.onAuthStateChanged(user => {
    if (user) {
        user.getIdTokenResult().then(idTokenResult => {
            user.admin = idTokenResult.claims.admin
            setupAuthUi(user);
        })

        // get member where claimed by UID
        members.where('claimed_by', '==', user.uid).limit(1).get().then((data) => {
            data.docs.forEach(doc => {
                setupView(doc);
            })
        });
        
    } else {
        setupAuthUi(user);
        setupView();
    }
})

// signup form
const signInForm = document.querySelector("#signup-form");
const signOutButton = document.querySelector("#signout-button");
const logInForm = document.querySelector("#login-form");

signInForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //get user info
    const email = signInForm['signup-email'].value;
    const password = signInForm['signup-password'].value;

    // sign up the user
    auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
        members.add({
            claimed_by: cred.user.uid,
            created_by: cred.user.uid,
            name: {
                firstName: "You (Member)",
                lastName: null,
                surname: null
            },
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

signOutButton.addEventListener('click', (e) => {
    e.preventDefault();
    // sign out the user
    auth.signOut();
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