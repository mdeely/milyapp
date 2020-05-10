import * as TreeMenu from '../components/treeMenu.js'
import * as TreeBranch from '../components/treeBranch.js'

let treeViewEl = document.querySelector(`[data-view="tree"]`);
let treeDebugMsg = treeViewEl.querySelector(`.debugMessage`);

export default function setup(treeId) {
    clear();
    variablizeCurrentTreeDoc(treeId)
    .then((response) => {
        if (response) {
            pageTitle.innerHTML = LocalDocs.tree ? LocalDocs.tree.data().name : "Tree not found!";
            treesRef.doc(LocalDocs.tree.id).collection('leaves').get()
            .then((response) => {

                LocalDocs.leaves = response.docs;
                window.currentTreeLeafCollectionRef = treesRef.doc(LocalDocs.tree.id).collection('leaves');

                TreeBranch.initiate();
                console.log("TODO: change the treeBranch abilities based on authentication and permission status");
            })
        }
    })
}

export const treeViewOnAuthChange = (user) => {
    if (user) {
        variablizeMemberTreeDocs()
        .then(() => {
            // TreeMenu.populate();
        })
    } else {
        treeDebugMsg.textContent += "Sign up/in to join this tree";
        console.log("tree auth change!");
        console.log("not authenticated!");
    }
}

const clear = () => {
    TreeBranch.clear();
}

// const generateFamilyTree = (params) => {
//     // get top member > branch from top member > individual leafs
//     // get siblings of top member > branch > 
//     console.log(`Show details: ${params["showDetails"]}`);

//     if (params["message"]) {
//         treeDebugMsg.textContent += ` ${params["message"]}`
//     }
// }

export const variablizeMemberTreeDocs = () => new Promise(
    function(resolve, reject) {
        if (LocalDocs.member.data().trees) {
            LocalDocs.trees = [];
            if ( LocalDocs.member.data().trees && LocalDocs.member.data().trees.length > 0) {
                for (let treeId of LocalDocs.member.data().trees) {
                    treesRef.doc(treeId).get()
                    .then((reqTreeDoc) => {
                        LocalDocs.trees.push(reqTreeDoc);
                        resolve("successfully set tree doc");
                    })
                    .catch(() => {
                        reject(console.log("error getting a tree"));
                    })
                }
            } else {
                reject(console.log("Member has no trees"));
            }
        }
    }
);

const variablizeCurrentTreeDoc = (treeId) => new Promise(
    function(resolve, reject) {
        treesRef.doc(treeId).get()
        .then((reqTreeDoc) => {
            LocalDocs.tree = reqTreeDoc.exists ? reqTreeDoc : null;
            resolve(true);
        })
        .catch(err => {
            reject(err.message);
        })
    }
)

// const variablizeLeafMemberDocs = (memberId) => {
//     membersRef.doc(memberId).get()
//     .then((reqMemberDoc) => {
//         LocalDocs.claimedMembers.push(reqMemberDoc);
//     })
// }

// ///// FUNCTYIONS BLOW ARE BEING SLOWLY REWRITTEN BY THE ONES ABOVE, WHICH AR MEANT TO ME MORE EFFICICENT.

// const setupTreeViewzzz = (treeId) => {
//     treeDebugMsg.innerHTML = '';
//     treeMenuDropdownEl.innerHTML = '';

//     setGlobalActiveTreeDoc(treeId)
//     .then((tree) => {
//         if (tree) {
//             treeDebugMsg.innerHTML += "Tree exists!";

//             if (auth.currentUser) {
//                 membersRef.where('claimed_by', '==', auth.currentUser.uid).limit(1).get()
//                 .then((queryDocs) => {
//                     window.authMemberDoc = queryDocs.docs[0];
//                     window.authMemberTreeDocs = [];

//                     let treeIds = authMemberDoc.data().trees;
//                     for (treeId of treeIds) {
//                         treesRef.doc(treeId).get()
//                         .then((treeDoc) => {
//                             window.authMemberTreeDocs.push(treeDoc);
//                             populateTreeMenu();
//                             setupFamilyTree();
//                         })
//                         .catch(err => {
//                             console.log(err.message);
//                         })
//                     }
//                 })
//                 treeDebugMsg.innerHTML += "Authenticated";
//             //         // Set authMemberDoc
//             //         // User is not authenticated
//             } else {
//                 treeDebugMsg.innerHTML += "Not authenticated";
//             //         // populate treemenu with tree title header (just header, not menu)
//             //         // generate watered down tree
//             //         // message: log in if you are supposed to have permission
//             //         // message: send request to be a part of the tree
//             }

//         } else {
//             treeDebugMsg.innerHTML += "Tree does not exists :(";
//         }

//     });


// }

// const prepTreePermissions = () => {
//     if (activeTreeDoc) {
//         if (activeTreeDoc.data().viewers.length > 0 && activeTreeDoc.data().viewers.includes(authMemberDoc.id)) {
//             treeDebugMsg.innerHTML += "You have permission and you are a VIEWER";
//         }
    
//         if (activeTreeDoc.data().contributors.length > 0 && activeTreeDoc.data().contributors.includes(authMemberDoc.id)) {
//             treeDebugMsg.innerHTML += "You have permission and you are a CONTRIBUTOR";
//         }
    
//         if (activeTreeDoc.data().admins.length > 0 && activeTreeDoc.data().admins.includes(authMemberDoc.id)) {
//             treeDebugMsg.innerHTML += "You have permission and you are an ADMIN";
//         }
//     }
// }

// const setGlobalActiveTreeDoc = (treeId) => new Promise(
//     function(resolve, reject) {
//         fetchTreeDocById(treeId)
//         .then((treeDoc) => {
//             // If tree exists, render tree.
//             if (treeDoc) {
//                 setGlobalActiveLeafDocs(treeId)
//                 .then((leafDocs) => {
//                     if (leafDocs) {
//                         window.activeLeafDocs = [...leafDocs];
//                     }
//                 })
//                 window.activeTreeDoc = treeDoc;
//                 resolve(treeId);
//             // If tree does not exists, let the user know.
//             } else {
//                 window.activeLeafDocs = null;
//                 window.activeTreeDoc = null;
//                 resolve(false);
//             }
//         })
//     }
// );

// const setGlobalActiveLeafDocs = (treeId) => new Promise(
//     function (resolve, reject) {
//         let leafDocs = [];
//         if (treeId) {
//             treesRef.doc(treeId).collection('leaves').get()
//             .then((reqTreeLeafDocs) => {
//                 if (reqTreeLeafDocs.docs.length > 0) {
//                     for (doc of reqTreeLeafDocs.docs) {
//                         leafDocs.push(doc);
//                     }
//                     resolve(leafDocs);
//                 } else {
//                     resolve(false);
//                 }
//             })
//             .catch(err => {
//                 console.log(err.message);
//             })
//         }
//     }
// )

// const fetchTreeDocById = (treeId) => new Promise(
//     function (resolve, reject) {
//         if (treeId) {
//             treesRef.doc(treeId).get()
//             .then((reqTreeDoc) => {
//                 if (reqTreeDoc.exists) {
//                     resolve(reqTreeDoc);
//                 } else {
//                     resolve(false);
//                 }
//             })
//         }
//     }
// )

// const setupFamilyTree = () => {
//     window.topMemberDoc = window.activeLeafDocs.find(doc => doc.data().topMember === true);

//     let siblings = topMemberDoc.data().siblings && topMemberDoc.data().siblings.length > 0 ? topMemberDoc.data().siblings : null;
//     // RENDER FAMILY for each SIBLING
//     // RENDER FAMILY from TOPMEMBER
//     if (siblings) {
//         for (siblingId of siblings) {
//             // let siblingsHtml = renderFamilyFromMember(siblingDoc);
//         }
//     }

//     for (leafDoc of activeLeafDocs) {
//         // Using a promise funciton might allow you to simply make the elements and THEN attache an event handler.
//         createLeafEl(leafDoc)
//         .then((docId) => {
//             let targetLeafEl = document.querySelector(`[data-id="${docId}"]`);
//             targetLeafEl.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 console.log(`You clicked on ${docId}.`);
//                 if (e.target.classList.contains("active")) {
//                     e.target.classList.remove("active");
//                     showDetailPanels(false);
//                 } else {
//                     removeActiveLeafClass();
//                     e.target.classList.add("active");
//                     showDetailPanels(true);
//                     // populateDetailsPanel(doc, leafDoc);
//                 }
//             });

//         // figure.addEventListener('click', (e) => {
//         //     let memberId = e.target.getAttribute("data-member-id");
//         //     let leafId = e.target.getAttribute("data-id");
//         //     let memberDoc = null;
//         //     let leafDoc = getLocalLeafDocFromId(leafId);

//         //     if (memberId) {
//         //         memberDoc = getLocalMemberDocFromId(memberId);
//         //         doc = memberDoc;
//         //     }
//         // });
        
//         })
//     }
// }

// const createLeafEl = (doc) => new Promise(
//         function(resolve, reject) {
//         let leafName;
//         let leafProfilePhoto = doc.data().profile_photo ? doc.data().profile_photo : "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder.svg?alt=media&token=d3b939f1-d46b-4315-bcc6-3167d17a18ed";
        
//         if (doc.data().claimed_by) {
//         //     let claimedBy = doc.data().claimed_by;
//         //     reqMemberDoc = window.currentTreeMemberDocs.find(memberDoc => memberDoc.id === claimedBy);
//         //     figure.setAttribute("data-member-id", reqMemberDoc.id);
//         //     leafName = reqMemberDoc.data().name.firstName ? reqMemberDoc.data().name.firstName : "";
//         } else {
//             leafName = doc.data().name.firstName ? doc.data().name.firstName : "";
//         }

//         // TODO: Make view list version!!
//         // let viewListInfo = getListViewInfo(doc);

//         let leafEl =
//         `<figure class="leaf" data-id="${doc.id}">
//             <img class="leaf__image" src="${leafProfilePhoto}" alt="${leafName}"/>
//             <figcaption class="leaf_caption">${leafName}</figCaption>
//         </figure>`

//         familyTreeEl.insertAdjacentHTML("beforeBegin", leafEl);

//         resolve(doc.id);
// })
// const populateTreeMenu = () => new Promise(
// function(resolve, reject) {
//     let categoryheader = document.createElement("div");
//     let categoryHeaderButton = document.createElement("button");

//     categoryHeaderButton.innerHTML = `<i class="fa fa-plus"></i>`;
//     categoryHeaderButton.setAttribute("class", "iconButton white u-mar-l_auto");
//     categoryHeaderButton.setAttribute('data-modal-trigger', 'create-tree_modal');

//     categoryHeaderButton.addEventListener('click', (e) => {
//         e.preventDefault();
//         showModal(e);   
//     })

//     categoryheader.setAttribute("class", "dropdown__item dropdown__label");
//     categoryheader.textContent = "Families"
//     categoryheader.appendChild(categoryHeaderButton);

//     treeMenuDropdownEl.appendChild(categoryheader);

//     for (let treeDoc of window.authMemberTreeDocs) {
//         let treeAnchor = document.createElement("a");
//         let editButton = document.createElement("button");
//         let className = '';
//         let isAdminOfTree = treeDoc.data().admins.includes(authMemberDoc.id) ? true : false;

//         if (treeDoc.id === window.activeTreeDoc.id) {
//             className = "active";
//             treeMenuCurrentTreeEl.innerHTML += treeDoc.data().name ? treeDoc.data().name : "Unnamed";
//         } else {
//             treeMenuCurrentTreeEl.innerHTML += "Choose a tree";
//         }

//         treeAnchor.setAttribute("href", `#/trees/${treeDoc.id}`);
//         treeAnchor.setAttribute("data-id", treeDoc.id);
//         treeAnchor.setAttribute("class", `dropdown__item ${className}`);
//         treeAnchor.textContent += treeDoc.data().name;

//         editButton.innerHTML = `<i class="fa fa-pencil-alt"></i>`;
//         editButton.setAttribute("class", "iconButton white u-mar-l_auto");
//         editButton.setAttribute('data-modal-trigger', 'edit-tree_modal');

//         editButton.addEventListener('click', (e) => {
//             e.preventDefault();
//             e.stopImmediatePropagation();

//             if (isAdminOfTree) {
//                 editTreeForm.querySelector(".edit-tree_save").classList.remove("u-d_none");
//                 editTreeForm.querySelector(".edit-tree_delete").classList.remove("u-d_none");
//                 editTreeForm["edit-tree_name"].removeAttribute("disabled");
//             } else {
//                 editTreeForm.querySelector(".edit-tree_save").classList.add("u-d_none")
//                 editTreeForm.querySelector(".edit-tree_delete").classList.add("u-d_none");
//                 editTreeForm["edit-tree_name"].setAttribute("disabled", true);
//             }

//             let reqTreeId = e.target.closest("[data-id]").getAttribute('data-id');
//             let reqTreeDoc = window.authMemberTrees.find(doc => doc.id === reqTreeId);

//             editTreeForm["edit-tree_name"].value = reqTreeDoc.data().name;
//             editTreeForm["edit-tree_id"].value = reqTreeDoc.id;

//             console.log(`TODO: If an admin, allow changing of permissions within the tree settings`);

//             permissionsContainer.innerHTML = '';

//             for (leafId of reqTreeDoc.data().viewers) {
//                 makePermissionDetailItem("viewer", leafId);
//             }

//             for (leafId of reqTreeDoc.data().contributors) {
//                 makePermissionDetailItem("contributor", leafId);
//             }

//             for (leafId of reqTreeDoc.data().admins) {
//                 makePermissionDetailItem("admins", leafId);
//             }

//             function makePermissionDetailItem(permType, leafId) {
//                 permType = permType.replace('s', '');
//                 console.log("TODO: Load actual data when showing IMMEDIATE FAMILY section");
//                 console.log("TODO: If not claimed_by, do not show that leaf");
//                 let el = `<div class="detailsPanel__item u-mar-b_4 u-d_flex u-align-items_center">
//                             <div class="detailsPanel__img u-mar-r_2"></div>
//                                 <div class="detailsPanel__text u-mar-r_2">
//                                     <div class="detailsPanel__name u-mar-b_point5 u-bold">${leafId}</div> 
//                                     <div class="detailsPanel__realtiveType">${permType}</div> 
//                                 </div>
//                                 </div>`
//                 permissionsContainer.innerHTML += el;
//             }

//             showModal(e);
//         })

//         if (treeDoc.id === window.primaryTreeId) {
//             treeAnchor.innerHTML += " (Primary) "
//         }

//         treeAnchor.addEventListener('click', (e) => {
//             // e.preventDefault();

//             // let reqTreeId = e.target.getAttribute("data-id");
//             // getAndSetCurrenTreeVars(reqTreeId);
//         })

//         treeAnchor.appendChild(editButton);
//         treeMenuDropdownEl.appendChild(treeAnchor);
//     }

//     let caretIcon = `<i class="fa fa-caret-down u-mar-l_2 u-pe_none u-o_75"></i>`;

//     treeMenuCurrentTreeEl.innerHTML += caretIcon;
// });