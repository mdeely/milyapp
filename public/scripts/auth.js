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

const membersRef = db.collection('members');
const treesRef = db.collection('trees');
// const notifications = db.collection('notifications');

// signup form
// const signInForm = document.querySelector("#signup-form");
const signOutButton = document.querySelector("#sign-out_button");
const signInForm = document.querySelector("#sign-in_form");

signOutButton.addEventListener('click', (e) => {
    e.preventDefault();
    // sign out the user
    auth.signOut();
})

auth.onAuthStateChanged(user => {
    if (user) {
        setupAuthUser(user);
    } else {
        authenticatedView();
        clearAuthMemberVar();
        clearView();
    }
})

const clearView = () => {
    familyTreeEl.innerHTML = '';
    treeMenu.innerHTML = '';
}

const setupAuthUser = (user) => {
    authenticatedView(true);
    getAndSetAuthMemberVars(user);
};

const getAndSetTreeDocs = async () => {
    window.authMemberTrees = [];
    for await (let treeId of window.authMemberDoc.data().trees) {
        let treeDoc = await treesRef.doc(treeId).get();
        window.authMemberTrees.push(treeDoc);
    }
}

const getAndSetAuthMemberVars = async (user) => {
    let authMember = await membersRef.where('claimed_by', '==', user.uid).limit(1).get();
    for (const doc of authMember.docs) {
        window.authMemberDoc = await doc ? doc : null;
        window.primaryTreeId = authMemberDoc.data().primary_tree;
    };

    getAndSetCurrenTreeVars();
}

const getAndSetCurrenTreeVars = async (reqTreeId) => {
    let treeId = reqTreeId ? reqTreeId : window.primaryTreeId;

    window.currentTreeDoc = await treesRef.doc(treeId).get();
    
    window.currentTreeLeaves = new Array;

    let leaves = await treesRef.doc(window.currentTreeDoc.id).collection("leaves").get();

    for await (const leafDoc of leaves.docs) {
        window.currentTreeLeaves.push(leafDoc);
    }

    await getAndSetTreeDocs();
    setupView();
}

const clearAuthMemberVar = () => {
    delete window.authMemberDoc;
}

const authenticatedView = (isAuthenticated) => {
    let ifAuthShow = document.querySelectorAll(".ifAuth--show");
    let ifAuthHide = document.querySelectorAll(".ifAuth--hide");

    if (isAuthenticated) {
        for (const element of ifAuthShow) {
            element.style.display = "";
        }
        for (const element of ifAuthHide) {
            element.style.display = "none";
        }
    } else {
        for (const element of ifAuthShow) {
            element.style.display = "none";
        }
        for (const element of ifAuthHide) {
            element.style.display = "";
        }
    }
}

signInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = signInForm['sign-in_email'].value;
    const password = signInForm['sign-in_password'].value;

    auth.signInWithEmailAndPassword(email, password)
    .then(cred => {
        signInForm.reset();
        signInForm.querySelector(".message").innerHTML = '';
    }).catch(err => {
        signInForm.querySelector(".message").innerHTML = err.message;
    })
})

// signInForm.addEventListener('submit', (e) => {
//     e.preventDefault();

//     const email = signInForm['signup-email'].value;
//     const password = signInForm['signup-password'].value;

//     auth.createUserWithEmailAndPassword(email, password)
//     .then(cred => {
//         members.add({
//             "claimed_by": cred.user.uid,
//             "created_by": cred.user.uid,
//             "name": {
//                 firstName: email,
//                 lastName: null,
//                 surname: null
//             },
//             "email": email,
//             "trees": [],
//             "primary_tree": null
//         }).then(() => {
//             signInForm.reset();
//             signInForm.querySelector(".error").innerHTML = '';
//         }).catch(err => {
//             signInForm.querySelector(".error").innerHTML = err.message;
//         })
//     }).catch(err => {
//         signInForm.querySelector(".error").innerHTML = err.message;
//     })
// })