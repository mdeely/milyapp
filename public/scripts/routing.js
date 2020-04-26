// getTreeIdFromUrl();
// setUrlFromTree();

function getTreeIdFromUrl() {
    let pathnameArray = window.location.hash.split('/');

    if (pathnameArray[1] === "trees" && pathnameArray[2]) {
        let treeIndex = pathnameArray.indexOf("trees");
        treeId = pathnameArray[treeIndex + 1];
        console.log(treeId);

        return treeId;

    } else {
        return false;
    }
}

async function getTreeDocFromUrl(reqId) {
    if (getTreeIdFromUrl()) {
        let treeDoc = await treesRef.doc(getTreeIdFromUrl()).get();
        return treeDoc.exists ? treeDoc : false;
    } else {
        return false;
    }
}

function setTreeHash(reqHash) {
    if (reqHash) {
        window.location.hash = `/trees/${reqHash}`;
    } else {
        window.location.hash = '';
    }
};

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

// // window.onpopstate = function(event) {
// //     console.log("onopopstate fired");
// // }



// // // HEYO for sending of verification emails!
// // var user = firebase.auth().currentUser;

// // user.sendEmailVerification().then(function() {
// //   // Email sent.
// // }).catch(function(error) {
// //   // An error happened.
// // });






// // firebase.auth().onAuthStateChanged(function(user) {
// //     if (user) {
// //         user.providerData.forEach(function (profile) {
// //             console.log("Sign-in provider: " + profile.providerId);
// //             console.log("  Provider-specific UID: " + profile.uid);
// //             console.log("  Name: " + profile.displayName);
// //             console.log("  Email: " + profile.email);
// //             console.log("  Photo URL: " + profile.photoURL);
// //           });
// //       // User is signed in.
// //     } else {
// //       // No user is signed in.
// //     }
// //   });