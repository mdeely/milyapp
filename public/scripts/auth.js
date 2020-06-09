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





// window.currentTreeMemberDocs = new Array;


// signup form
const signUpForm = document.querySelector("#sign-up_form");
// const signOutButton = document.querySelector("#sign-out_button");

// signOutButton.addEventListener('click', (e) => {
//     e.preventDefault();
//     auth.signOut();
//     window.location.hash = "/"
// })

// const checkForAuthentication = () => new Promise(
//     function (resolve, reject) {
//         if (firebase.auth().currentUser !== null) {
//             console.log("something");
//             // membersRef.where('claimed_by', '==', user.uid).limit(1).get()

//             resolve(true);
//         } else {
//             resolve(false);
//         }
//     }
// );



// const clearView = () => {
//     treeMenuCurrentTreeEl.textContent = '';
//     showDetailPanels(false);
//     clearAuthMemberVar();
//     notificationMenu.innerHTML = '';
// }

// const setupAuthUser = (user) => {
//     authenticatedView(true);
//     setAuthMemberDoc(user);
//     // getAndSetAuthMemberVars(user);
// };

// const getAndSetTreeDocs = async () => {
//     window.authMemberTrees = [];
//     for await (let treeId of window.authMemberDoc.data().trees) {
//         let treeDoc = await treesRef.doc(treeId).get();
//         if (treeDoc.exists) {
//             window.authMemberTrees.push(treeDoc);
//         }
//     }
// }

//////
//////
// LEFT OFF TRYING TO GET THE AUTHMEMBERDOC TO SET SO THE TREES VIEW CAN DEFAULT TO PRIMARY TREE IF NEEDED
//////
/////

auth.onAuthStateChanged(user => {
    getAndSetAuthMemberVars(user)
    .then(() => {
        getAndSetCurrentTreeMemberDocs();
    })

    // if (user) {

    //     console.log(user);
    //     // setAuthMemberDoc(user);
    // }

    // if (user && user.emailVerified) {
    //     // router();
    //     // setupAuthUser(user);
    // } else if (user && !user.emailVerified) {
    //     // setupEmailVerificationView(user);
    //     // authenticatedView(true);
    // } else {
    //     // authenticatedView(false);
    //     // clearView();
    //     // familyTreeEl.innerHTML = '';
    //     // setTreeHash();
    //     // initiateSetupPage(false);
    // }
})

const getAndSetAuthMemberVars = async (user) => {
    membersRef.where('claimed_by', '==', user.uid).limit(1).get()
    .then((resDoc) => {
        for (const doc of resDoc.docs) {
            window.authMemberDoc = await doc ? doc : null;
            // window.currentTreeMemberDocs.push(doc);
            window.primaryTreeId = authMemberDoc.data().primary_tree ? authMemberDoc.data().primary_tree : null;
        };
    
        let reqTreeIdFromUrl = getTreeIdFromUrl();
    
        if (reqTreeIdFromUrl) {
            getAndSetCurrenTreeVars(reqTreeIdFromUrl);
        } else {
            if (!primaryTreeId) {
                initiateSetupPage();
                // Render "Create your first tree!" page
            } else {
                getAndSetCurrenTreeVars();
            }
        }
    })

}

const getAndSetCurrentTreeMemberDocs = async () => {

    // go through leavesdocs. find which are claimed and get them memberDOOOCS
    for await (leafDoc of window.currentTreeLeaves) {
        if (leafDoc.data().claimed_by) {
            let memberDoc = await membersRef.doc(leafDoc.data().claimed_by).get();
            if (memberDoc.exists) {
                window.currentTreeMemberDocs.push(memberDoc);
            }
        }
    }
    // let memberDoc = await membersRef.doc(doc.data().claimed_by).get();
    // window.currentTreeMemberDocs.push(memberDoc);
    // // Add these to currentMemberTreeDocs
    // for (doc of currentTreeMemberDocs) {
    //     console.log(doc.id);
    // }
}

const getAndSetCurrenTreeVars = async (reqTreeId) => {
    let treeId = reqTreeId ? reqTreeId : window.primaryTreeId;

    // LocalDocs.tree = await treesRef.doc(treeId).get();
    // window.currentTreeLeafCollectionRef = treesRef.doc(currentTreeDoc.id).collection('leaves');
    // window.currentTreeLeaves = new Array;

    let leaves = await treesRef.doc(LocalDocs.tree.id).collection("leaves").get();

    for await (const leafDoc of leaves.docs) {
        window.currentTreeLeaves.push(leafDoc);
    }

    await getAndSetTreeDocs();
    await getAndSetCurrentTreeMemberDocs();


    let idFromUrl = getTreeIdFromUrl();
    let docFromId = idFromUrl ? await getTreeDocFromUrl(idFromUrl) : null;
    
    if (docFromId) {
        setupView(docFromId.id);
    } else {
        setupView();
    }
}

const clearAuthMemberVar = () => {
    delete window.authMemberDoc;
}

const authenticatedView = (isAuthenticated) => {
    let ifAuthShow = document.querySelectorAll(".ifAuth--show");
    let ifAuthHide = document.querySelectorAll(".ifAuth--hide");

    if (isAuthenticated) {
        for (const element of ifAuthShow) {
            element.classList.remove("u-visibility_hidden");
        }
        for (const element of ifAuthHide) {
            element.classList.add("u-visibility_hidden");
        }
    } else {
        for (const element of ifAuthShow) {
            element.classList.add("u-visibility_hidden");
        }
        for (const element of ifAuthHide) {
            element.classList.remove("u-visibility_hidden");
        }
    }
}

signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = signUpForm['sign-up_email'].value;
    const password = signUpForm['sign-up_password'].value;

    auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
        membersRef.add({
            "claimed_by": cred.user.uid,
            "created_by": cred.user.uid,
            "name": {
                firstName: null,
                surnameCurrent: null,
                surnameBirth: null
            },
            "email": email,
            "trees": [],
            "primary_tree": null
        }).then(() => {
            var user = firebase.auth().currentUser;

            sendVerificationEmail(user);

            signUpForm.reset();
            signUpForm.querySelector(".error").innerHTML = '';
        }).catch(err => {
            signUpForm.querySelector(".error").innerHTML = err.message;
        })
    }).catch(err => {
        signUpForm.querySelector(".error").innerHTML = err.message;
    })
})

const sendVerificationEmail = (user) => {
    user.sendEmailVerification()
    .then(() => {
        console.log("Verification email sent!");
    })
    .catch(err => {
        console.log("Error sendign verification email.");
    })
}