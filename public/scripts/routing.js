
// checkForUrl();

// function checkForUrl() {
//     if (!getTreeIdFromUrl()) {
//         console.log("nothing in url so...");
//         // "trees" and "treedID" are not present in url
//     } else {
//         console.log("setting up tree from url");
//         setupView(getTreeIdFromUrl());
//         // render tree from url
//     }
// };

// ROUTE has TREE
// * User is authenticated
//     * TREE exists:
//         * User is a member of that tree => Render
//         * User is not a member: OH NO what do I do here? Request to be part of tree? 
//     * TREE does not exist => "Sorry this tree does not exist"
// * User is not authenticated
//     * Save requested tree in STATE for when they do log in. Or save as params?
    
// ROUTE does not have TREE
// * User is authenticated
//     * Get PRIMARY TREE and render
//         * If no PRIMARY TREE, look for TREES and choose the first one and make primary
//             * if no TREES, show "create a tree"
// * User is not authenticated
//     * Save requested tree in STATE for when they do log in. Or save as params?

// handleUrl();

window.addEventListener('hashchange', function(){
    setupView(getTreeIdFromUrl());
        // IF TREE EXISTS in the pathname,
        /// then get that index and move to the next index to grab the tree ID
        // Render the view from that ID
        // IF NO TREE exists, see if user has a primary tree

        // updateDocument(state, title, url);
})

function getTreeIdFromUrl() {
    let pathnameArray = window.location.hash.split('/');
    let treeId = false;

    if (pathnameArray.includes("trees")) {
        let treeIndex = pathnameArray.indexOf("trees");
        treeId = pathnameArray[treeIndex + 1];
    }

    return treeId;
}

// function handleUrl() {
//     var pathnameArray = window.location.hash.split('/');

//     // // TREE IN URL
//     // if (pathnameArray.includes("trees")) {
//     //     let treeIndex = pathnameArray.indexOf("trees");
//     //     let treeId = pathnameArray[treeIndex + 1];

//     //     if (treeId) {
//     //         trees.doc(treeId).get()
//     //         .then((doc) => {
//     //             if (doc.exists) {
//     //                 console.log(doc.id);
//     //                 console.log("Tree exists!")
//     //                 // render tree from tree params
//     //                 // 
//     //             } else {
//     //                 console.log("Tree does not exist!")
//     //             }
//     //         })
//     //         .catch(err => {
//     //             console.log("Error retreiving tree: "+err.message);
//     //         })
//     //     } else  {
//     //         // Check for active member
//     //         // Does active member have a primary tree?
//     //         // Then see if that have any "trees", pick the first one, make that the new primary.
//     //         // If no "trees, show "you have no trees!" and maybe a button.
//     //         console.log("Tree ID is not present");
//     //     }

//     // // NO TREE IN URL
//     // } else {
//     //     console.log("Not seeing 'tree' in the url. Checking for primary tree...")
//     // }
// }

// window.onpopstate = function(event) {
//     console.log("onopopstate fired");
// }



// // HEYO for sending of verification emails!
// var user = firebase.auth().currentUser;

// user.sendEmailVerification().then(function() {
//   // Email sent.
// }).catch(function(error) {
//   // An error happened.
// });






// firebase.auth().onAuthStateChanged(function(user) {
//     if (user) {
//         user.providerData.forEach(function (profile) {
//             console.log("Sign-in provider: " + profile.providerId);
//             console.log("  Provider-specific UID: " + profile.uid);
//             console.log("  Name: " + profile.displayName);
//             console.log("  Email: " + profile.email);
//             console.log("  Photo URL: " + profile.photoURL);
//           });
//       // User is signed in.
//     } else {
//       // No user is signed in.
//     }
//   });