window.router = function(user) {
    let routes = {
        "my-trees" : {"name": "my-trees", "controller": myTreesSetup, "onAuthController": myTreesViewOnAuthChange},
        "trees" : {"name": "tree", "controller": Tree.setup, "onAuthController": Tree.treeViewOnAuthChange},
        "profile" : {"name": "profile", "controller": profileSetup, "onAuthController": profileViewOnAuthChange},
        "settings" : {"name": "settings", "controller": settingsView, "onAuthController": settingsViewOnAuthChange},
        "/" : {"name": "homepage", "controller": homepageSetup, "onAuthController": homepageViewOnAuthChange},
        "account-verification" : {"name": "account-verification", "controller": accountVerificationView, "onAuthController": accountVerificationViewOnAuthChange},
    }

    let pathnameArray = window.location.hash.split('/');
    let path = pathnameArray[1] || "/";
    let reqRoute = routes[path];

    for (let dataView of dataViews){
        dataView.style.display = "none";
    }

    if (reqRoute) {
        if (reqRoute.name === "tree") {
            let treeId = getTreeIdFromUrl();
            reqRoute.controller(treeId);

        } else {
            reqRoute.controller();
        }
        
        let viewEl = document.querySelector(`[data-view=${reqRoute.name}]`);

        if (viewEl) {
            for (let dataView of dataViews){ 
                if (dataView === viewEl) {
                    dataView.style.display = '';
                }
            };
        }
    } else {
        errorView();
    }

    auth.onAuthStateChanged(function(user) {
        if (user) {
            Nav.update(user);
            if (user.emailVerified) {
                console.log("You're verified!");
                let uid = firebase.auth().currentUser.uid;
                membersRef.where('claimed_by', '==', uid).limit(1).get()
                .then((queryResult) => {
                    if (queryResult.docs[0]) {
                        LocalDocs.member = queryResult.docs[0] ? queryResult.docs[0] : null;
                        if (LocalDocs.member) {
                            if (LocalDocs.member.data().trees && LocalDocs.member.data().trees.length > 0) {
                                if (LocalDocs.member.data().trees) {
                                    LocalDocs.trees = [];
                                    if ( LocalDocs.member.data().trees && LocalDocs.member.data().trees.length > 0) {
                                        for (let treeId of LocalDocs.member.data().trees) {
                                            treesRef.doc(treeId).get()
                                            .then((reqTreeDoc) => {
                                                LocalDocs.trees.push(reqTreeDoc);
                                                reqRoute.onAuthController(user);
                                            })
                                            .catch(() => {
                                                console.log("error getting a tree");
                                            })
                                        }
                                    } else {
                                        console.log("Member has no trees");
                                    }
                                }
                            } else {
                                reqRoute.onAuthController(user);
                            }
                        } else {
                            // User needs to create a member
                            profileViewOnAuthChange(user);
                        }
                    } else {
                        resolve(false)
                    }
                })
                .catch(err => {
                    reject(console.log(err.message));
                })
            } else {
                accountVerificationViewOnAuthChange(user);
                console.log("Go verify yourself");
            }
        } else {
            Nav.update();
            reqRoute.onAuthController();
        }
    });
}

function settingsView() {
    // do something
};
function settingsViewOnAuthChange() {
    // do something
};

function accountVerificationView() {
    // do something
};
function accountVerificationViewOnAuthChange() {
    // do something
};

function errorView() {
    // do something
};

function getTreeIdFromUrl() {
    let treeId;
    let pathnameArray = window.location.hash.split('/');

    if (pathnameArray[2]) {
        let treeIndex = pathnameArray.indexOf("trees");
        treeId = pathnameArray[treeIndex + 1];
    } else {
        treeId = false;
    }

    return treeId;
}

// const variablizeMemberDoc = (uid = firebase.auth().currentUser.uid) => new Promise(
//     function(resolve, reject) {
//         // membersRef.where('claimed_by', '==', uid).limit(1).get()
//         // .then((queryResult) => {
//         //     if (queryResult.docs[0]) {
//         //         LocalDocs.member = queryResult.docs[0] ? queryResult.docs[0] : null;
//         //         resolve(true);
//         //     } else {
//         //         resolve(false)
//         //     }
//         // })
//         // .catch(err => {
//         //     reject(console.log(err.message));
//         // })
//     }
// )

// const variablizeMemberTreeDocs = () => new Promise(
//     function(resolve, reject) {
//         // if (LocalDocs.member.data().trees) {
//         //     LocalDocs.trees = [];
//         //     if ( LocalDocs.member.data().trees && LocalDocs.member.data().trees.length > 0) {
//         //         for (let treeId of LocalDocs.member.data().trees) {
//         //             treesRef.doc(treeId).get()
//         //             .then((reqTreeDoc) => {
//         //                 LocalDocs.trees.push(reqTreeDoc);
//         //                 resolve("successfully set tree doc");
//         //             })
//         //             .catch(() => {
//         //                 reject(console.log("error getting a tree"));
//         //             })
//         //         }
//         //     } else {
//         //         reject(console.log("Member has no trees"));
//         //     }
//         // }
//     }
// );

// getTreeIdFromUrl();
// setUrlFromTree();

// function getTreeIdFromUrl() {
//     let pathnameArray = window.location.hash.split('/');

//     if (pathnameArray[1] === "trees" && pathnameArray[2]) {
//         let treeIndex = pathnameArray.indexOf("trees");
//         treeId = pathnameArray[treeIndex + 1];

//         return treeId;
//     } else {
//         return false;
//     }
// }

// async function getTreeDocFromUrl(reqId) {
//     if (getTreeIdFromUrl()) {
//         let treeDoc = await treesRef.doc(getTreeIdFromUrl()).get();
//         return treeDoc.exists ? treeDoc : false;
//     } else {
//         return false;
//     }
// }

// function setTreeHash(reqHash) {
//     if (reqHash) {
//         window.location.hash = `/trees/${reqHash}`;
//     } else {
//         window.location.hash = '';
//     }
// };

// window.addEventListener('hashchange', function(){
//     console.log("hashchange");
//     setupView(getTreeDocFromUrl());
//     setTreeHash(currentTreeDoc.id);
// })

// // checkForUrl();

// // function checkForUrl() {
// //     if (!getTreeIdFromUrl()) {
// //         console.log("nothing in url so...");
// //         // "trees" and "treedID" are not present in url
// //     } else {
// //         console.log("setting up tree from url");
// //         setupView(getTreeIdFromUrl());
// //         // render tree from url
// //     }
// // };

// // ROUTE has TREE
// // * User is authenticated
// //     * TREE exists:
// //         * User is a member of that tree => Render
// //         * User is not a member: OH NO what do I do here? Request to be part of tree? 
// //     * TREE does not exist => "Sorry this tree does not exist"
// // * User is not authenticated
// //     * Save requested tree in STATE for when they do log in. Or save as params?
    
// // ROUTE does not have TREE
// // * User is authenticated
// //     * Get PRIMARY TREE and render
// //         * If no PRIMARY TREE, look for TREES and choose the first one and make primary
// //             * if no TREES, show "create a tree"
// // * User is not authenticated
// //     * Save requested tree in STATE for when they do log in. Or save as params?

// // handleUrl();



// async function getTreeDocFromUrl() {
//     let pathnameArray = window.location.hash.split('/');
//     let treeId = false;

//     if (pathnameArray.includes("trees")) {
//         let treeIndex = pathnameArray.indexOf("trees");
//         treeId = pathnameArray[treeIndex + 1];
//     }

//     console.log("getTreeIdFromUrl: "+treeId);
//     let treeDoc = await trees.doc(treeId).get();
//     return treeDoc.exists ? treeDoc : false;
// }





// // // HEYO for sending of verification emails!
// // var user = firebase.auth().currentUser;

// // user.sendEmailVerification().then(function() {
// //   // Email sent.
// // }).catch(function(error) {
// //   // An error happened.
// // });
