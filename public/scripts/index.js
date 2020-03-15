const memberList = document.querySelector(".familyTree");
const loggedOutLinks = document.querySelectorAll(".logged-out");
const loggedInLinks = document.querySelectorAll(".logged-in");
const adminRole = document.querySelectorAll(".admin-role");
const userEmail = document.querySelector(".userEmail");
const createTreeModal = document.querySelector('#create-primary-tree-modal');
const editMemberModal = document.querySelector('#edit-member-modal');
const notificationModal = document.querySelector('#notification-modal');
const notificationAcceptButton = document.querySelector("#notification-accept-button");
const notificationDeclineButton = document.querySelector("#notification-decline-button");
const editMemberForm = document.querySelector('#edit-member-form');
const inviteMemberForm = document.querySelector('#invite-member-form');
const treeNameContainer = document.querySelector(".treeName");
const profileInfoClose = document.querySelector(".profileInfo__close");
const contentContainer = document.querySelector(".contentContainer");
const navigation = document.querySelector(".navigation");

const viewPrefZoomIn = document.querySelector(".viewPref--zoomIn");
const viewPrefZoomOut = document.querySelector(".viewPref--zoomOut");

const profileInfo = document.querySelector(".profileInfo");
const profileInfoName = profileInfo.querySelector(".profileInfo__name");
const profileInfoImage = profileInfo.querySelector(".profileInfo__image");
const profileInfoEmail = profileInfo.querySelector(".profileInfo__email");
const profileInfoBirthday = profileInfo.querySelector(".profileInfo__birthday");
const profileInfoAddress1 = profileInfo.querySelector(".profileInfo__address1");
const profileInfoAddress2 = profileInfo.querySelector(".profileInfo__address2");
const profileInfoCity = profileInfo.querySelector(".profileInfo__city");
const profileInfoZipcode = profileInfo.querySelector(".profileInfo__zipcode");
const profileInfoCountry = profileInfo.querySelector(".profileInfo__country");

const viewPref_list = document.querySelector(".viewPref--list");
const viewPref_tree = document.querySelector(".viewPref--tree");

// const placeholderImageUrl = "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?cs=srgb&dl=face-facial-hair-fine-looking-guy-614810.jpg&fm=jpg";
const placeholderImageUrl = "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder.svg?alt=media&token=d3b939f1-d46b-4315-bcc6-3167d17a18ed";
const placeholderImageUrl2 = "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder_2.svg?alt=media&token=966e665f-5d88-48a9-83d9-eec397b1b823";
const placeholderImageUrl3 = "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder_3.svg?alt=media&token=fde7c2ee-01a0-472d-a8a0-ea78c2d64620";
const placeholderImages = [
    "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder.svg?alt=media&token=d3b939f1-d46b-4315-bcc6-3167d17a18ed",
    // "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder_2.svg?alt=media&token=966e665f-5d88-48a9-83d9-eec397b1b823",
    "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder_3.svg?alt=media&token=fde7c2ee-01a0-472d-a8a0-ea78c2d64620",
    "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder_4.svg?alt=media&token=3e7e95d1-9b65-4085-9442-64d9dab53ec8"
];

let admins = [];
let contributors = [];
let viewers = [];
let activeMemberIsAdmin = false;
let activeMemberIsContributor = false;
let activeMemberIsViewer = false;

viewPref_list.addEventListener('click', () => {
    memberList.classList.add('list');
});

viewPref_tree.addEventListener('click', () => {
    memberList.classList.remove('list');
})

const rendertreeIdFromUrl = (treeIdFromUrl) => {

    // TREE IN URL
    if (treeIdFromUrl) {

        trees.doc(treeIdFromUrl).get().then(doc => {
            window.currenTreeDoc = doc;
            
            treeNameContainer.innerHTML += `${currenTreeDoc.data().name}`;
            setAdminsAndActiveMember();
        })

        let memberTrees = authMemberDoc.data().trees;
        memberTrees.forEach(tree => {
            // let pathName = location.pathname;
    
            let link = document.createElement("a");
            link.setAttribute("href", "#/trees/"+tree);
            link.textContent = tree;
            treeNameContainer.appendChild(link);
        })

        let pathName = location.pathname;

        trees.doc(treeIdFromUrl).collection('leaves').get()
        .then((allLeaves) => {
            window.currentTreeLeavesDocs = allLeaves.docs;
            if (currentTreeLeavesDocs.length > 0) {
                // updateDocument('',"Tree!", pathName+"#/trees/"+treeId);
                currentTreeLeavesDocs.forEach(leafDoc => {
                    if (leafDoc.data().topMember === true) {
                        initiateTree(leafDoc, currentTreeLeavesDocs);
                    } 
                });
                // render tree from tree params
                // 
            } else {
                memberList.innerHTML = '';

                console.log("Tree does not exist!")
            }
        })
        .catch(err => {
            console.log("Error retreiving tree: "+err);
        })
    } else  {
        memberList.innerHTML = '';
        // Check for active member
        // Does active member have a primary tree?
        // Then see if that have any "trees", pick the first one, make that the new primary.
        // If no "trees, show "you have no trees!" and maybe a button.
        console.log("Tree ID is not present");
    }
}

const renderPrimaryTreeFromMember = (reqTreeId) => {
    trees.doc(reqTreeId).get().then(doc => {
        window.currenTreeDoc = doc;
        
        treeNameContainer.innerHTML += `${currenTreeDoc.data().name}`;
        setAdminsAndActiveMember();
    })

    let memberTrees = authMemberDoc.data().trees;
    memberTrees.forEach(tree => {
        // let pathName = location.pathname;

        let link = document.createElement("a");
        link.setAttribute("href", "#/trees/"+tree);
        link.textContent = tree;
        treeNameContainer.appendChild(link);
    })

    let pathName = location.pathname;
    // get tree to see if member is admin
    
    currentTreeLeavesRef.get()
    .then(allLeaves => {
        window.currentTreeLeavesDocs = allLeaves.docs;
        // updateDocument('',"Tree!", pathName+"#/trees/"+reqTreeId);
        currentTreeLeavesDocs.forEach(leafDoc => {
            if (leafDoc.data().topMember === true) {
                initiateTree(leafDoc, currentTreeLeavesDocs);
            } 
        });
    });
    // Reset view
    // Set activeMembe
    // Notificaitons (check and present)

    // Handle tree based data and presentation
    // Get that tree's leaf that is claimed by the current member
    // 

    // Set authMember (id, email, primary_tree, trees)
    // Set authMemberLeaf 
    // Set currentTreeId (name, members, )
    // 
}

function checkForNotifications() {
    notifications
    .where('sent_to', '==', authMemberDoc.data().email)
    .where('status', '==', "pending")
    .get().then((data) => {

        if (data.docs.length > 0) {
            console.log("notifications found");
            data.docs.forEach(doc => {
                console.log("Notification for " +doc.data().sent_to+" to take over leaf member "+doc.data().leaf_to_claim +". Tree: "+doc.data().tree);
                let notificationId = notificationModal.querySelector(".notificationId");
                let message = notificationModal.querySelector(".notification-message");

                notificationId.textContent = doc.id;
                message.textContent += doc.data().sent_from + " has invited you to take over a leaf ("+doc.data().leaf_to_claim+")";

                if (doc.permission_type === "admin") {
                    message.textContent += "ADMIN permissions";
                } else if (doc.permission_type === "contributor") {
                    message.textContent += "CONTRIBUTOR permissions";
                } else if (doc.permission_type === "viewer") {
                    message.textContent += "VIEWER permissions.";
                }

                notificationAcceptButton.addEventListener('click', (e) => {
                    e.preventDefault;

                    let notificationId = notificationModal.querySelector(".notificationId").textContent;
                    let tree = doc.data().tree;
                    let leaf_to_claim = doc.data().leaf_to_claim;
                    let permission_type = doc.data().permission_type;

                    trees.doc(tree).collection('leaves').doc(leaf_to_claim).update({
                        "claimed_by": authMemberDoc.id,
                        "invitation" : null
                    })
                    .then(() => {
                        console.log("Leaf claimed and invitation removed!");

                        notifications.doc(notificationId).delete()
                        .then(() => {
                            console.log("Notification deleted!");
                        })
                        .catch(err => {
                            console.log("error deleting notification: "+err.message);
                        })  

                        trees.doc(tree).update({
                            [permission_type] : firebase.firestore.FieldValue.arrayUnion(doc.data().leaf_to_claim)
                        }).then(() => {
                            console.log("Successfully set permissions");
                            console.log("Member has primary tree : "+authMemberDoc.data().primary_tree);
                            if (!authMemberDoc.data().primary_tree) {
                                console.log('Adding family tree as primary :)');
                                members.doc(authMemberDoc.id).update({
                                    "trees" : firebase.firestore.FieldValue.arrayUnion(tree),
                                    "primary_tree": tree
                                })
                                .then(() => {  
                                    console.log("Tree updated!")
                                    notificationModal.style.display = "none";
                                    setupViewWithActiveMember(authMemberDoc.id);
                                })
                                .catch(err => {
                                    console.log("error updating members: "+err.message)
                                })
                            } else {
                                members.doc(authMemberDoc.id).update({
                                    "trees" : firebase.firestore.FieldValue.arrayUnion(tree),
                                })
                                .then(() => {  
                                    console.log("Tree updated!")
                                    notificationModal.style.display = "none";
                                    setupViewWithActiveMember(authMemberDoc.id);
                                })
                                .catch(err => {
                                    console.log("error updating members: "+err.message)
                                })
                            }
                        }).catch(err => {
                            console.log("error updating tree"+err.message)
                        }) 
                        
                    }).catch(err => {
                        console.log("error updating leaf")
                    }) 
                });

                notificationDeclineButton.addEventListener('click', (e) => {
                    e.preventDefault();

                    let notificationId = notificationModal.querySelector(".notificationId").textContent;
                    let tree = doc.data().tree;
                    let leaf_to_claim = doc.data().leaf_to_claim;

                    trees.doc(tree).collection("leaves").doc(leaf_to_claim).update({
                        invitation: null
                    })
                    .then(() => {
                        notifications.doc(notificationId).update({
                            status: "declined"
                        })
                        .then(() => {
                            notificationModal.style.display = "none";
                            setupViewWithActiveMember(authMemberDoc.id);
                        })
                    });
                })
            })
            notificationModal.style.display = "block";
        } else {
            // console.log("no notifications found");
        }
    });
}

// Render members and actions available 
const setupView = async () => {
    // check to see if parameters exist;

    if (window.authMemberDoc) {
        memberList.innerHTML = "";
        contentContainer.style.display = "";

        checkForNotifications();
        
        if (location.hash) {
            // if tree id comes from url
            treeNameContainer.innerHTML = '';

            console.log("rendering from url");
            let treeIdFromUrl = getTreeIdFromUrl();
            
            window.currentTreeId = treeIdFromUrl;
            window.currentTreeLeavesRef = trees.doc(currentTreeId).collection('leaves');
            window.authMemberTreeLeafDoc = await currentTreeLeavesRef.where("claimed_by", "==", authMemberDoc.id).limit(1).get()
            .then((data) => {
                return data.docs[0];
            })
            window.authMemberTreeLeafId = authMemberTreeLeafDoc.id;

            rendertreeIdFromUrl(treeIdFromUrl);
        }
        else if (authMemberDoc.data().primary_tree && authMemberDoc.data().primary_tree.length > 0) {
            treeNameContainer.innerHTML = '';

            window.currentTreeId = authMemberDoc.data().primary_tree;
            window.currentTreeLeavesRef = trees.doc(currentTreeId).collection('leaves');
            window.authMemberTreeLeafDoc = await currentTreeLeavesRef.where("claimed_by", "==", authMemberDoc.id).limit(1).get()
            .then((data) => {
                return data.docs[0];
            })
            window.authMemberTreeLeafId = authMemberTreeLeafDoc.id;
                    
            console.log("rendering from primary Member");
            renderPrimaryTreeFromMember(currentTreeId);
        }

    } else {
        updateDocument('',"Welcome!", '/');
        contentContainer.style.display = "none";
        console.log("Log in or sign up to begin");
    }

    // panzoom(memberList, {
    //     maxZoom: 1,
    //     minZoom: 0.5,
    //     pinchSpeed: .8 // zoom two times faster than the distance between fingers
    //   });
}

const updateDocument = (state=null, title=null, url) => {
    history.pushState(state, title, url);
    document.title = title;
}

function randomProfileImage() {
    image = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
    return image;
}

viewPrefZoomIn.addEventListener('click', (e) => {
    e.preventDefault();
    
    let zoomAmount = parseInt(memberList.getAttribute("data-zoom"));
    let matrixZoom;

    if (zoomAmount === 1) {
         return
    } else {
        zoomAmount = zoomAmount - 1;
        matrixZoom = 1 / zoomAmount;
    }

    memberList.style.transform = `matrix(${matrixZoom}, 0, 0,${matrixZoom}, 0, 0)`;
    memberList.setAttribute("data-zoom", zoomAmount);
})

viewPrefZoomOut.addEventListener('click', (e) => {
    e.preventDefault();
    
    let zoomAmount = parseInt(memberList.getAttribute("data-zoom"));
    let matrixZoom;

    if (zoomAmount === 4) {
         return
    } else {
        zoomAmount = zoomAmount + 1;
        matrixZoom = 1 / zoomAmount;
    }

    memberList.style.transform = `matrix(${matrixZoom}, 0, 0,${matrixZoom}, 0, 0)`;
    memberList.setAttribute("data-zoom", zoomAmount);
})


async function setAdminsAndActiveMember() {
    admins = currenTreeDoc.data().admins;
    contributors = currenTreeDoc.data().contributors;
    viewers = currenTreeDoc.data().viewers;

    let adminMember = admins.find(adminMember => adminMember === authMemberTreeLeafId);
    let contributorMember = contributors.find(contributorMember => contributorMember === authMemberTreeLeafId);
    let viewerMember = viewers.find(viewerMember => viewerMember === authMemberTreeLeafId);

    if (adminMember) {
        activeMemberIsAdmin = true;
    }

    if (contributorMember) {
        activeMemberIsContributor = true;
    }

    if (viewerMember) {
        activeMemberIsViewer = true;
    }
}

async function initiateBranch(doc) {
    let branch = await buildBranchFromChosenMember(doc);
    memberList.appendChild(branch);
}

async function buildBranchFromChosenMember(doc) {
    let branch = document.createElement("ul");
    let directMemberContainer = document.createElement("ul");
    let descendantsContainer = document.createElement("ul");
    let chosenMember = await getMemberLi({
        "leafDoc": doc 
    });
    
    branch.setAttribute('class', 'branch');
    descendantsContainer.setAttribute('class', 'descendants');
    directMemberContainer.setAttribute('class', 'directMembers');
    directMemberContainer.insertAdjacentHTML('afterbegin', chosenMember);

    if (doc) {
        let spouses = doc.data().spouses ? Object.entries(doc.data().spouses) : "";
        let children = doc.data().children;
    
        if (spouses && spouses.length > 0) {
            // is spouse divorced, separated, or married?

            for (const spouse of spouses) {
                let spouseKey = spouse[0];
                let spouseValue = spouse[1];
                let spouseRelationship = spouseValue !== null ? "spouse "+spouse[1] : "spouse";
                let spouseDoc = currentTreeLeavesDocs.find(spouseReq => spouseReq.id === spouseKey);
                let spouseEl = await getMemberLi({
                    "leafDoc" : spouseDoc,
                    "relationship" : spouseRelationship
                });

                directMemberContainer.insertAdjacentHTML('beforeend', spouseEl);
              }
        }
    
        if (children && children.length > 0) {

            for (const child of children) {
                let childDoc = currentTreeLeavesDocs.find(childReq => childReq.id === child);
                let descendantBranch = await buildBranchFromChosenMember(childDoc);
                descendantsContainer.prepend(descendantBranch);
            }

            branch.prepend(descendantsContainer);
        }
    } else {

    }
    // directMemberContainer.prepend(chosenMember);
    branch.prepend(directMemberContainer);
    
    return branch;
}

const addEventListenerToProfileLeaves = () => {
    let profileLeaves = document.querySelectorAll(".profileLeaf");
    profileLeaves.forEach(profileLeaf => {
        profileLeaf.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.target.querySelector(".actions_dropdown").classList.add("show");
        });

        profileLeaf.addEventListener('click', (e) => {
            editMember(e);
            handleProfileInfo("show", e);
        });
    })
}

async function initiateTree(doc) {
    let chosenMemberSiblings = authMemberTreeLeafDoc.data().siblings;
    let chosenMemberBranch = await buildBranchFromChosenMember(doc);
    
    memberList.appendChild(chosenMemberBranch);

    if (chosenMemberSiblings && chosenMemberSiblings.length > 0) {

        for (const sibling of chosenMemberSiblings) {
            let siblingDoc = currentTreeLeavesDocs.find(siblingReq => siblingReq.id === sibling);
            let siblingsBranch = await buildBranchFromChosenMember(siblingDoc);
            memberList.appendChild(siblingsBranch);
          }
    }

    // treeNameContainer.addEventListener('click', (e) => {
    //     console.log("this will open a menu of trees");
    // })

    profileInfoClose.addEventListener("click", (e) => {
        handleProfileInfo();
    });

    addEventListenerToProfileLeaves();

    let cancelInviteMemberAction = document.querySelectorAll(".cancel_invite_member_action");
    cancelInviteMemberAction.forEach(action => {
        action.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            let targetEl = e.target.closest(".profileLeaf");
            let targetLeafId = targetEl.getAttribute('data-id');

            currentTreeLeavesRef.doc(targetLeafId).get()
            .then((leafDoc) => {
                let invitationId = leafDoc.data().invitation;
                console.log(invitationId);
                notifications.doc(invitationId).delete()
                .then(()=> {
                    currentTreeLeavesRef.doc(targetLeafId).update({
                        "invitation": null
                    }).catch(err => {
                        console.log("Error upating leaf invitation: "+err.message);
                    });
                    setupViewWithActiveMember(authMemberDoc.id);
                })
                .catch(err => {
                    console.log("Error deleting notification: "+err.message);
                })
            });
        })
    });

    let inviteMemberAction = document.querySelectorAll(".invite_member_action");
    inviteMemberAction.forEach(action => {
        action.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            let targetEl = e.target.closest(".profileLeaf");
            let targetMemberId = targetEl.getAttribute('data-id');

            inviteMemberForm["invite-leaf-id"].value = targetMemberId;

            inviteMemberForm.style.display = "block";
        })
    })

    inviteMemberForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        inviteMemberForm.setAttribute("onsubmit", "return false;")

        let leafId = inviteMemberForm["invite-leaf-id"].value;
        let invitationTo = inviteMemberForm["invite-email"].value;
        let permission = inviteMemberForm.querySelector('[name="permission-type"]:checked').value;

        notifications.add({
            "type": "invite",
            "sent_to": invitationTo,
            "sent_from" : authMemberDoc.id,
            "leaf_to_claim": leafId,
            "tree" : currentTreeId,
            "status": "pending",
            "permission_type": permission
        })
        .then((notificationReq) => {
            currentTreeLeavesRef.doc(leafId).update({
                "invitation": notificationReq.id
            })
            .then(() => {
                console.log("notification made!");
                inviteMemberForm.style.display = "none";
                inviteMemberForm.setAttribute("onsubmit", null)
            })
            .catch(err => {
                console.log(err.message);
            })
        })
        .catch(err => {
            console.log(err.message);
        })

    });

    let deleteLeafActions = document.querySelectorAll(".delete_leaf_action");
    deleteLeafActions.forEach(action => {
        action.addEventListener('click', (e) => {
            deleteLeaf(e);
        })
    })

    let deleteMemberActions = document.querySelectorAll(".delete_member_action");
    deleteMemberActions.forEach(action => {
        action.addEventListener('click', (e) => {
            deleteMember(e);
        })
    })

    let childButtons = document.querySelectorAll(".add_child_option");
    childButtons.forEach(childButton => {
        childButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // get target member
            let targetEl = e.target.closest(".profileLeaf");
            let targetMemberId = targetEl.getAttribute('data-id');
            let parents = [];
    
            parents.push(targetMemberId);
    
            // create child member, update parent members
            currentTreeLeavesRef.doc(targetMemberId).get()
            .then((targetMemberRef) => {
                if (targetMemberRef.data().spouses && targetMemberRef.data().spouses.length > 0) {
                    targetMemberRef.data().spouses.forEach(spouseId => {
                        parents.push(spouseId);
                    })
                }
    
                currentTreeLeavesRef.add({
                    name: {
                        firstName: null,
                        lastName: null,
                        surname: null
                    },
                    parents: firebase.firestore.FieldValue.arrayUnion(...parents),
                    children: [],
                    spouses: null,
                    siblings: [],
                    topMember: false,
                    created_by: authMemberDoc.id
                }).then(childRef => {
                    trees.doc(currentTreeId).update({
                        viewers: firebase.firestore.FieldValue.arrayUnion(childRef.id)
                    }).catch(err => {
                        console.log("Error adding new member to tree: "+err.message);
                    });
                    if (parents && parents.length > 0) {
                        parents.forEach(parentId => {    
                            currentTreeLeavesRef.doc(parentId).update({
                                children: firebase.firestore.FieldValue.arrayUnion(childRef.id)
                            })
                            .then(() => {
                                // Do something
                            })
                            .catch((err) => {
                                console.log(err.message);
                            }) 
                        })
                    };
                    setupViewWithActiveMember(authMemberDoc.id);
                    // renderChildToDom(childRef, targetEl);
    
                }).catch((err) => {
                    console.log(err.message)
                })
            })
        })
    })

    let sibilngButtons = document.querySelectorAll(".add_sibling_option");
    sibilngButtons.forEach(siblingButton => {
        siblingButton.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
    
            // get target member
            let targetEl = e.target.closest(".profileLeaf");
            let targetMemberId = targetEl.getAttribute('data-id');
    
            console.log(currentTreeLeavesRef);
            console.log("targetMemberId: "+targetMemberId);

            currentTreeLeavesRef.doc(targetMemberId).get()
            .then((targetMemberRefDoc) => {
                let siblings = [];
                let parents = [];

                // console.log("doc id: "+targetMemberRefDoc.id);
                // console.log(targetMemberRefDoc);
                // console.log(targetMemberRefDoc.data().siblings.length > 0);

                console.log("doc siblings: "+targetMemberRefDoc.data().siblings);
    
                if ( targetMemberRefDoc.data().siblings && targetMemberRefDoc.data().siblings.length > 0) {
                    targetMemberRefDoc.data().siblings.forEach(sibling => {
                        siblings.push(sibling);
                    })
                }
                if ( targetMemberRefDoc.data().parents && targetMemberRefDoc.data().parents.length > 0) {
                    targetMemberRefDoc.data().parents.forEach(parent => {
                        parents.push(parent);
                    })
                }
    
                siblings.push(targetMemberId);
    
                currentTreeLeavesRef.add({
                    name: {
                        firstName: null,
                        lastName: null,
                        surname: null
                    },
                    siblings: firebase.firestore.FieldValue.arrayUnion(...siblings),
                    parents: [],
                    spouses: null,
                    children: [],
                    topMember: false,
                    created_by: authMemberDoc.id
                }).then(newSiblingRef => {
                    trees.doc(currentTreeId).update({
                        viewers: firebase.firestore.FieldValue.arrayUnion(newSiblingRef.id)
                    }).catch(err => {
                        console.log("Error adding new member to tree: "+err.message);
                    });
                    siblings.forEach(siblingId => {
                        currentTreeLeavesRef.doc(siblingId).update({
                            siblings: firebase.firestore.FieldValue.arrayUnion(newSiblingRef.id)
                        })
                    });
                    if ( targetMemberRefDoc.data().parents && targetMemberRefDoc.data().parents.length > 0 ) {
                        currentTreeLeavesRef.doc(newSiblingRef.id).update({
                            parents: firebase.firestore.FieldValue.arrayUnion(...parents)
                        });
    
                        parents.forEach(parentId => {
                            currentTreeLeavesRef.doc(parentId).update({
                                children: firebase.firestore.FieldValue.arrayUnion(newSiblingRef.id)
                            })
                        });
                    }
                    setupViewWithActiveMember(authMemberDoc.id);
                })
            });
        })
    })


    let spouseButtons = document.querySelectorAll(".add_spouse_option");
    spouseButtons.forEach(spouseButton => {
        spouseButton.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
    
            let targetEl = e.target.closest(".profileLeaf");
            let targetMemberId = targetEl.getAttribute('data-id');
    
            currentTreeLeavesRef.doc(targetMemberId).get()
            .then((targetMemberDoc) => {
                // add these to new spouse
                let children = [];
                let spouses = {};
                spouses[targetMemberId] = null;
    
                if ( targetMemberDoc.data().children && targetMemberDoc.data().children.length > 0 ) {
                    targetMemberDoc.data().children.forEach(child => {
                        children.push(child);
                    })
                }

                currentTreeLeavesRef.add({
                    name: {
                        firstName: null,
                        lastName: null,
                        surname: null
                    },
                    spouses: spouses,
                    siblings: [],
                    children: [],
                    parents: [],
                    topMember: false,
                    created_by: authMemberDoc.id
                }).then(spouseRef => {
                    trees.doc(currentTreeId).update({
                        viewers: firebase.firestore.FieldValue.arrayUnion(spouseRef.id)
                    }).catch(err => {
                        console.log("Error adding new member to tree: "+err.message);
                    });
                    if ( targetMemberDoc.data().children && targetMemberDoc.data().children.length > 0 ) {
                        children.forEach(childId => {
                            currentTreeLeavesRef.doc(childId).update({
                                parents: firebase.firestore.FieldValue.arrayUnion(spouseRef.id)
                            })
                            .then(() => {
                                console.log("Children updated to include new spouse");
                            })
                        })
                        currentTreeLeavesRef.doc(spouseRef.id).update({
                            children: firebase.firestore.FieldValue.arrayUnion(...children)
                        });
                    }

                    let spouseObj = {};
                    spouseObj[spouseRef.id] = null;

                    currentTreeLeavesRef.doc(targetMemberId).set({
                        spouses: spouseObj
                    }, {merge: true})
                    .then(() => {
                        setupViewWithActiveMember(authMemberDoc.id);
                    }).catch((err) => {
                        console.log(err.message);
                    })
                });
            })
        })
    })

    let parentButtons = document.querySelectorAll(".add_parent_option");
    parentButtons.forEach(parentButton => {
        parentButton.addEventListener('click', (e) => {
            e.stopPropagation();

            // get target member
            let targetEl = e.target.closest(".profileLeaf");
            let targetMemberId = targetEl.getAttribute('data-id');
    
            currentTreeLeavesRef.doc(targetMemberId).get()
            .then(targetMemberRefDoc => {
                let childrenOfParent = [];
    
                if ( targetMemberRefDoc.data().siblings.length > 0) {
                    targetMemberRefDoc.data().siblings.forEach(sibling => {
                        childrenOfParent.push(sibling);
                    })
                }
    
                childrenOfParent.push(targetMemberId);
    
                currentTreeLeavesRef.add({
                    name: {
                        firstName: null,
                        lastName: null,
                        surname: null
                    },
                    siblings: [],
                    parents: [],
                    spouses: [],
                    children: firebase.firestore.FieldValue.arrayUnion(...childrenOfParent),
                    topMember: true,
                    created_by: authMemberDoc.id
                }).then(parentRef => {
                    trees.doc(currentTreeId).update({
                        viewers: firebase.firestore.FieldValue.arrayUnion(parentRef.id)
                    }).catch(err => {
                        console.log("Error adding new member to tree: "+err.message);
                    });
                    childrenOfParent.forEach(childId => {
                        currentTreeLeavesRef.doc(childId).update({
                            topMember: false,
                            parents: firebase.firestore.FieldValue.arrayUnion(parentRef.id)
                        })
                        .then(() => {
                            // renderParentToDom(parentRef);
                            setupViewWithActiveMember(authMemberDoc.id);
                            console.log("new parent added");
                        })
                    })
                })
            });
        })
    })
}

function handleProfileInfo(state, e) {
    if (state) {
        if (state == "show") {
            let target = e.target;

            let name = target.querySelector(".profileLeaf__caption").textContent;
            let imageUrl = target.querySelector(".profileLeaf__image").getAttribute("src");
            let email = target.querySelector(".profileLeaf__email").textContent;
            let birthday = target.querySelector(".profileLeaf__birthday").textContent;
            let deceased = target.querySelector(".profileLeaf__deceased");
            let address1 = target.querySelector(".profileLeaf__address1").textContent;
            let address2 = target.querySelector(".profileLeaf__address2").textContent;
            let city = target.querySelector(".profileLeaf__city").textContent;
            let zipcode = target.querySelector(".profileLeaf__zipcode").textContent;
            let country = target.querySelector(".profileLeaf__country").textContent;

            profileInfoName.textContent = name; 
            profileInfoImage.setAttribute('src', imageUrl); 
            profileInfoEmail.textContent = email; 
            profileInfoBirthday.textContent = birthday; 
            profileInfoAddress1.textContent = address1; 
            profileInfoAddress2.textContent = address2; 
            profileInfoCity.textContent = city; 
            profileInfoZipcode.textContent = zipcode; 
            profileInfoCountry.textContent = country; 

            profileInfo.classList.add("show");

            if (!admins.includes(authMemberDoc.id)) {
                profileInfo.querySelector("form").remove();
                profileInfo.querySelector(".profileInfo__imageUploadButton").remove();
                profilePhotoInputUpload.remove();
            }
        }
    } else {
        profileInfo.classList.remove("show");
    }
}

const getProfileImageURL = async (leafDoc) => {
    if (leafDoc.data().photo) {
        let storageRef = storage.ref();
        let imageRef = storageRef.child(leafDoc.data().photo);

        return imageRef.getDownloadURL();
    }
}

const getMemberLi = async (params) => {
    let leafDoc = params["leafDoc"] ? params["leafDoc"] : false;
    let name = leafDoc.data().name.firstName ? leafDoc.data().name.firstName : "Unnamed";
    let email = leafDoc.data().email ? leafDoc.data().email : "No email set";
    let birthday = leafDoc.data().birthday ? leafDoc.data().birthday.toDate() : "No birthday set";
    let address1 = leafDoc.data().address ? leafDoc.data().address.address1 : "No address1 set";
    let address2 = leafDoc.data().address ? leafDoc.data().address.address2 : "No address2 set";
    let city = leafDoc.data().address ? leafDoc.data().address.city : "No city set";
    let zipcode = leafDoc.data().address ? leafDoc.data().address.zipcode : "No zipcode set";
    let country = leafDoc.data().address ? leafDoc.data().address.country : "No country set";
    let classNames = params["relationship"] ? params["relationship"] : '';
    let claimedBy = leafDoc.data().claimed_by ? leafDoc.data().claimed_by : false; 
    let createdBy = leafDoc.data().created_by ? leafDoc.data().created_by : false; 

    let has_invitation = leafDoc.data().invitation ?  leafDoc.data().invitation : false;
    let is_topMember = leafDoc.data().topMember === true ? true : false;

    let parentMenuOption = '';
    let spouseMenuOption = '';
    let siblingMenuOption = '';
    let childMenuOption = '';
    let deleteMenuOption = '';
    let inviteMenuOption = '';

    if (classNames.includes("spouse")) {
        // check for married, seperated, divorced
    }

    if (claimedBy === authMemberDoc.id) {
        classNames = classNames + " you"; 
    }

    // if admin
    // If invitation is pending
    if (leafDoc) {

        if (activeMemberIsAdmin) {
            // console.log("Is admin");
        }

        if (activeMemberIsContributor) {
            // console.log("Is contributor");
        }

        if (activeMemberIsViewer) {
            // console.log("Is viewer");
        }

        if (activeMemberIsAdmin) {

            if (has_invitation) {
                inviteMenuOption = `<div class="cancel_invite_member_action">Cancel invitation</div>`;
            } else if (!claimedBy){
                inviteMenuOption = `<div class="invite_member_action">Invite</div>`;
            } else if (claimedBy) {

            }
            
            if (!claimedBy) {
                deleteMenuOption = `<div class="delete_leaf_action" style="color:red;">Delete</div>`;
            } else {
                deleteMenuOption = `<div class="delete_member_action" style="color:red;">Uninvite ${name}</div>`;
            }
            
            childMenuOption = `<div class="add_child_option">Add child</div>`;
            spouseMenuOption = `<div class="add_spouse_option">Add partner</div>`;
            siblingMenuOption = `<div class="add_sibling_option">Add sibling</div>`;

            if (is_topMember) {
                parentMenuOption = `<div class="add_parent_option">Add parent</div>`;
            }
        } else {
            if (createdBy === authMemberDoc.id && !claimedBy) {
                childMenuOption = `<div class="add_child_option">Add child</div>`;
                spouseMenuOption = `<div class="add_spouse_option">Add partner</div>`;
                siblingMenuOption = `<div class="add_sibling_option">Add sibling</div>`;
                inviteMenuOption = `<div class="invite_member_action">Invite</div>`;
                deleteMenuOption = `<div class="delete_leaf_action" style="color:red;">Delete</div>`;
            }
        }
    }

    if (leafDoc && claimedBy) {
        const memberDoc = await members.doc(claimedBy).get();
        name = memberDoc.data().name.firstName;
        classNames = classNames + " claimed";
    }

    return generateProfileLeafHtml({
        "name": name,
        "classNames": classNames,
        "leafDoc": leafDoc,
        "parentMenuOption": parentMenuOption,
        "spouseMenuOption": spouseMenuOption,
        "siblingMenuOption": siblingMenuOption,
        "childMenuOption": childMenuOption,
        "deleteMenuOption": deleteMenuOption,
        "inviteMenuOption": inviteMenuOption,
        "profilePhoto" : await getProfileImageURL(leafDoc),
        "email": email,
        "birthday": birthday,
        "address1": address1,
        "address2": address2,
        "city": city,
        "zipcode": zipcode,
        "country": country
    })
}

function generateProfileLeafHtml(params) {
    let name = params["name"];
    let classNames = params["classNames"];
    let leafDoc = params["leafDoc"];
    let parentMenuOption = params["parentMenuOption"] ? params["parentMenuOption"] : '';
    let spouseMenuOption = params["spouseMenuOption"] ? params["spouseMenuOption"] : '';
    let siblingMenuOption = params["siblingMenuOption"] ? params["siblingMenuOption"] : '';
    let childMenuOption = params["childMenuOption"] ? params["childMenuOption"] : '';
    let deleteMenuOption = params["deleteMenuOption"] ? params["deleteMenuOption"] : '';
    let inviteMenuOption = params["inviteMenuOption"] ? params["inviteMenuOption"] : '';
    let email = params['email'];
    let birthday = params['birthday'];
    let address1 = params['address1'];
    let address2 = params['address2'];
    let city = params['city'];
    let zipcode = params['zipcode'];
    let country = params['country'];
    let profilePhoto = params["profilePhoto"] ? params['profilePhoto'] : randomProfileImage();

    let li = `
        <figure class="profileLeaf ${classNames}" data-id="${leafDoc.id}">
            <img class="profileLeaf__image" src="${profilePhoto}"/>
            <div class="actions">
                <div class="actions_dropdown">
                    ${parentMenuOption}
                    ${childMenuOption}
                    ${siblingMenuOption}
                    ${spouseMenuOption}
                    ${inviteMenuOption}
                    ${deleteMenuOption}
                </div>
            </div>
            <div class="profileLeaf__info">
                <span class="profileLeaf__email">${email}</span>
                <span class="profileLeaf__address1">${address1}</span>
                <span class="profileLeaf__address2">${address2}</span>
                <span class="profileLeaf__city">${city}</span>
                <span class="profileLeaf__zipcode">${zipcode}</span>
                <span class="profileLeaf__country">${country}</span>
                <span class="profileLeaf__birthday">${birthday}</span>
            </div>
            <figcaption class="profileLeaf__caption profileLeaf__name">${name}</figcaption> 
        </li>
    `
    return li;
}

// Set up elements based on authentication status

const setupAuthUi = (user) => {
    if (user) {
        if (user.admin) {
            adminRole.forEach(item => item.style.display = "block");
        }
        userEmail.textContent = user.email;
        loggedInLinks.forEach(item => item.style.display = "block");
        loggedOutLinks.forEach(item => item.style.display = "none");
    } else {
        loggedInLinks.forEach(item => item.style.display = "none");
        loggedOutLinks.forEach(item => item.style.display = "block");
        adminRole.forEach(item => item.style.display = "none");
    }
}

function editMember(e) {
    let targetEl = e.target.closest(".profileLeaf");
    let targetMemberId = targetEl.getAttribute('data-id');
    let leafName = targetEl.querySelector(".profileLeaf__name").textContent;
    let leafEmail = targetEl.querySelector(".profileLeaf__email").textContent;
    let leafBirthday = targetEl.querySelector(".profileLeaf__birthday").textContent === 0 ? targetEl.querySelector(".profileLeaf__birthday").textContent : false ;
    let leafAddress1 = targetEl.querySelector(".profileLeaf__address1").textContent;
    let leafAddress2 = targetEl.querySelector(".profileLeaf__address2").textContent;
    let leafCity = targetEl.querySelector(".profileLeaf__city").textContent;
    let leafZipcode = targetEl.querySelector(".profileLeaf__zipcode").textContent;
    let leafCountry = targetEl.querySelector(".profileLeaf__country").textContent;

    let leafNameText = leafName === 'Unnamed' ? '' : leafName;
    
    if (leafBirthday) {
        leafBirthday = new Date(leafBirthday).toISOString().substring(0, 10);
        editMemberForm["birthday"].value = leafBirthday;
    }

    editMemberForm["memberId"].value = targetMemberId;
    editMemberForm["name"].value = leafNameText;
    // editMemberForm["email"].value = leafEmail;
    // editMemberForm["birthday"].value = leafBirthday;
    // editMemberForm["address1"].value = leafAddress1;
    // editMemberForm["address2"].value = leafAddress2;
    // editMemberForm["city"].value = leafCity;
    // editMemberForm["zipcode"].value = leafZipcode;
    // editMemberForm["country"].value = leafCountry;
}

editMemberForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let memberId = editMemberForm['memberId'].value;
    let name = editMemberForm['name'].value;
    let email = editMemberForm['email'].value;
    let birthday = editMemberForm['birthday'].value ? new Date(editMemberForm['birthday'].value) : null;
    let address1 = editMemberForm['address1'].value;
    let address2 = editMemberForm['address2'].value;
    let city = editMemberForm['city'].value;
    let zipcode = editMemberForm['zipcode'].value;
    let country = editMemberForm['country'].value;

    currentTreeLeavesRef.doc(memberId).update({
        "name": {
            firstName: name
        },
        "email": email,
        "birthday": birthday,
        "address": {
            "address1": address1,
            "address2": address2,
            "city": city,
            "zipcode": zipcode,
            "country": country
        }
    }).then(() => {
        let targetLeaf = memberList.querySelector('.profileLeaf[data-id="'+memberId+'"]');
        
        targetLeaf.querySelector(".profileLeaf__name").textContent = name;

        editMemberForm.reset();
        // M.Modal.getInstance(editMemberModal).close();
        console.log("Updated successfully!");
    })

});

async function deleteMember(e) {
    e.stopPropagation();
    e.preventDefault();

    let leafEl = e.target.closest(".profileLeaf");
    let leafMemberId = leafEl.getAttribute('data-id');

    let leafDoc = await currentTreeLeavesRef.doc(leafMemberId).get();
    let memberId = leafDoc.data().claimed_by;

    let memberDoc = await members.doc(memberId).get();
    let memberPrimaryTree = memberDoc.data().primary_tree;

    if (currentTreeId === memberPrimaryTree) {
        members.doc(memberId).update({
            "trees": firebase.firestore.FieldValue.arrayRemove(currentTreeId),
            "primary_tree": null
        })
        .catch((err) => {
            console.log("member trees and primary tree not updated")
        })
    } else {
        members.doc(memberId).update({
            "trees": firebase.firestore.FieldValue.arrayRemove(currentTreeId),
        })
        .catch((err) => {
            console.log("member trees not updated")
        })
    }

    currentTreeLeavesRef.doc(leafMemberId).update({
        "claimed_by": null
    })
    .catch((err) => {
        console.log("primary tree not updated")
    })

    trees.doc(currentTreeId).update({
        "admins": firebase.firestore.FieldValue.arrayRemove(leafMemberId),
        "contributors": firebase.firestore.FieldValue.arrayRemove(leafMemberId),
        "viewers": firebase.firestore.FieldValue.arrayRemove(leafMemberId)
    })
    .then(() => {
        console.log("Tree updated to remove leaf from permissions");
    })
    .catch((err) => {
        console.log("tree not updated")
    })

    setupViewWithActiveMember(authMemberDoc.id);
}

function deleteLeaf(e) {
    e.stopPropagation();
    e.preventDefault();

    let targetEl = e.target.closest(".profileLeaf");
    let targetMemberId = targetEl.getAttribute('data-id');
    // let targetMemberId = editMemberForm["memberId"].value;
    // let targetEl = document.querySelector("[data-id='"+targetMemberId+"']");

    currentTreeLeavesRef.doc(targetMemberId).get().then(targetMemberDoc => { 
        console.log()
        if ( targetMemberDoc.data().claimed_by === authMemberDoc.id ) {
            alert("You cannot delete yourself. I will figure out a way not to show the button in the future");
            return;
        }

        warnAboutDescendants(targetMemberDoc);
        removeFromSiblings(targetMemberDoc);
        removeFromSpouses(targetMemberDoc);
        removeFromChildren(targetMemberDoc);
        removeFromParents(targetMemberDoc);

        if (targetMemberDoc.data().topMember === true) {
            if ( targetMemberDoc.data().spouses && targetMemberDoc.data().spouses.length > 0 ) {
                currentTreeLeavesRef.doc(targetMemberDoc.data().spouses[0]).update({
                    topMember: true
                })
                .then(() => {
                    console.log("spouse was made top member");
                })
            } else if ( targetMemberDoc.data().children && targetMemberDoc.data().children.length > 0 ) {
                currentTreeLeavesRef.doc(targetMemberDoc.data().children[0]).update({
                    topMember: true
                })
                .then(() => {
                    console.log("child was made top member");
                })
            } else if ( targetMemberDoc.data().siblings && targetMemberDoc.data().siblings > 0 ) {
                currentTreeLeavesRef.doc(targetMemberDoc.data().siblings[0]).update({
                    topMember: true
                })         
            }       
        }

        currentTreeLeavesRef.doc(targetMemberId).delete()
        .then(() => {
            // M.Modal.getInstance(editMemberModal).close();
            removeMemberFromDom(targetEl);
        });
    });
}

function removeMemberFromDom(targetEl) {
    targetEl.remove();
}

function renderParentToDom(parentRef) {
    let descendantHTML = memberList.innerHTML;
    let branch = document.createElement("ul");
    let directMemberContainer = document.createElement("ul");
    let descendantsContainer = document.createElement("ul");

    branch.setAttribute('class', 'branch');
    descendantsContainer.setAttribute('class', 'descendants');
    directMemberContainer.setAttribute('class', 'directMembers');

    currentTreeLeavesRef.doc(parentRef.id).get()
    .then((parentDoc) => {
        directMemberContainer.appendChild( buildLeaf(parentDoc) );
    })

    memberList.innerHTML = '';

    descendantsContainer.innerHTML += descendantHTML;
    branch.appendChild(directMemberContainer);
    branch.appendChild(descendantsContainer);
    memberList.appendChild(branch);
}

async function renderChildToDom(childRef, targetElement) {
    // currentTreeLeavesRef.doc(childRef.id).get()
    // .then((childDoc) => {
    //     let existing =  targetElement.closest(".branch").querySelector(".descendants");

    //     let descendantBranch = document.createElement('ul');
    //     let targetBranch = targetElement.closest(".branch");
    //     let descendantsContainer;

    //     descendantBranch.insertAdjacentElement("afterbegin", getMemberLi({"leafDoc" : childDoc}) );
    //     descendantBranch.setAttribute('class', 'branch');

    //     if (existing) {
    //         descendantsContainer = existing;
    //     } else {
    //         descendantsContainer = document.createElement('div');
    //         descendantsContainer.setAttribute('class', 'descendants');
    //     }

    //     descendantsContainer.appendChild(descendantBranch)
    //     targetBranch.appendChild(descendantsContainer);
    // })
    // .catch((err) => {
    //     console.log(err.message);
    // })

    let childDoc = await currentTreeLeavesRef.doc(childRef.id).get();
    let existing =  targetElement.closest(".branch").querySelector(".descendants");

    let descendantBranch = document.createElement('ul');
    let targetBranch = targetElement.closest(".branch");
    let descendantsContainer;

    let childMemberEl = await getMemberLi({"leafDoc" : childDoc});

    descendantBranch.insertAdjacentHTML('afterbegin', childMemberEl );
    descendantBranch.setAttribute('class', 'branch');

    if (existing) {
        descendantsContainer = existing;
    } else {
        descendantsContainer = document.createElement('div');
        descendantsContainer.setAttribute('class', 'descendants');
    }

    descendantsContainer.appendChild(descendantBranch)
    targetBranch.appendChild(descendantsContainer);
}

function warnAboutDescendants(targetMemberDoc) {
    // if target member has no spouses, but has children
    if (targetMemberDoc.data().spouses && targetMemberDoc.data().spouses.length > 0) {
        // Do nothing
    } else if (targetMemberDoc.data().children && targetMemberDoc.data().children.length > 0) {
        return alert("ALl descendant connections will be deleted (not true yet). TODO: Actually delete those descendant members");
    };
}

function setupViewWithActiveMember(activeMember) {
    members.doc(authMemberDoc.id).get()
    .then(doc => {
        setupView();
    });
}

function removeFromSpouses(doc) {
    let targetMemberId = doc.id;
    if (doc.data().spouses && Object.keys(doc.data().spouses).length > 0) {
        Object.keys(doc.data().spouses).forEach(spouseId => {
            currentTreeLeavesRef.doc(spouseId).set({
                // remove spouse id from map
                "spouses": {
                    [targetMemberId] : firebase.firestore.FieldValue.delete()
                }
            },
            { merge: true })   
        })
    }
}

function removeFromParents(doc) {
    let targetMemberId = doc.id;

    if (doc.data().parents && doc.data().parents.length > 0) {
        doc.data().parents.forEach(parentId => {
            currentTreeLeavesRef.doc(parentId).update({
                children: firebase.firestore.FieldValue.arrayRemove(targetMemberId)
            })   
        })
    }
}

function removeFromSiblings(doc) {
    let targetMemberId = doc.id;
    if (doc.data().siblings && doc.data().siblings.length > 0) {
        doc.data().siblings.forEach(siblingId => {
            currentTreeLeavesRef.doc(siblingId).update({
                siblings: firebase.firestore.FieldValue.arrayRemove(targetMemberId)
            })   
        })
    }
}

function removeFromChildren(doc) {
    let targetMemberId = doc.id;

    if (doc.data().children && doc.data().children.length > 0) {
        doc.data().children.forEach(childId => {
            currentTreeLeavesRef.doc(childId).update({
                parents: firebase.firestore.FieldValue.arrayRemove(targetMemberId)
            })   
        })
    }
}

const createTreeForm = document.querySelector("#create-tree-form");

createTreeForm.addEventListener('submit', (e) => {
    e.preventDefault();

    trees.add({
        created_by: authMemberDoc.id,
        admins: [],
        contributors: [],
        viewers: [],
        name: createTreeForm['treeName'].value,
        contributors: []
    }).then(treeRef => {
        treeRef.collection('leaves').add({
            claimed_by: authMemberDoc.id,
            name: {
                firstName: "You (Leaf)",
                lastName: null,
                surname: null
            },
            topMember: true,
            siblings: [],
            parents: [],
            children: [],
            spouses: [],
            address: {},
            email: '',
            birthday: 0
        }).then(leafRef => {
            if (!authMemberDoc.data().primary_tree) {
                console.log("user has not primary TREEEEEEEE!");
                members.doc(authMemberDoc.id).update({
                    primary_tree: treeRef.id,
                    trees: firebase.firestore.FieldValue.arrayUnion(treeRef.id),
                })
                .then(() => {
                    console.log("new member is: "+authMemberDoc.id);
                    trees.doc(treeRef.id).collection('leaves').doc(leafRef.id).update({
                        claimed_by: authMemberDoc.id
                    }).then(() => {
                        trees.doc(treeRef.id).update({
                            admins : firebase.firestore.FieldValue.arrayUnion(leafRef.id)
                        }).then(() => {
                            createTreeForm.reset();
                            location.reload();
                        })
                    })
                })
                .catch(err => {
                    console.log(err.message)
                })
                
            } else {
                members.doc(authMemberDoc.id).update({
                    trees: firebase.firestore.FieldValue.arrayUnion(treeRef.id),
                })
                .then(() => {
                    console.log("new member is: "+authMemberDoc.id);
                    trees.doc(treeRef.id).collection('leaves').doc(leafRef.id).update({
                        claimed_by: authMemberDoc.id
                    }).then(() => {
                        trees.doc(treeRef.id).update({
                            admins : firebase.firestore.FieldValue.arrayUnion(leafRef.id)
                        }).then(() => {
                            createTreeForm.reset();
                            location.reload();
                        })
                    })
                })
                .catch(err => {
                    console.log(err.message)
                })
            }

        })
        .catch(err => {
            console.log(err.message)
        })
    }).catch(err => {
        console.log(err.message);
    })

});

// setup materialize components
document.addEventListener('DOMContentLoaded', function() {
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);
});

// Close the dropdown menu if the user clicks outside of it
window.addEventListener('click', (e) => {
    if (!event.target.matches('.actions_dropdown_trigger')) {
      let dropdowns = document.querySelectorAll(".actions_dropdown.show");
      dropdowns.forEach(dropdown => {
          dropdown.classList.remove("show");
      })
    }
});

const storageUrl = "gs://mily-4c2a8.appspot.com";
const profilePhotoInputUpload = document.querySelector("[name='profilePhoto']");

profilePhotoInputUpload.addEventListener('change', (e) => {
    e.preventDefault();

    let leafId = editMemberForm["memberId"].value;
    let file = e.target.files[0];
    let fileName = file.name;
    // var file_ext = fileName.substr(fileName.lastIndexOf('.')+1,fileName.length);
    let filePath = 'tree/' + primaryTree + '/' + leafId + '/' + fileName;

    let storageRef = firebase.storage().ref(filePath);
    
    storageRef.put(file)
    .then(() => {
        currentTreeLeavesRef.doc(leafId).update({
            photo: filePath
        })
        .then(() => {
            let memberToUpdate = memberList.querySelector("[data-id='"+leafId+"'] .profileLeaf__image");
            let profileInfoImage = profileInfo.querySelector(".profileInfo__image");

            let reader = new FileReader();
            reader.onload = function(){
                memberToUpdate.setAttribute('src', reader.result);
                profileInfoImage.setAttribute('src', reader.result);
            };
            reader.readAsDataURL(file);

            console.log('Profile photo uploaded');
        })
        .catch((err) => {
            console.log(err.message);
        })
      }).catch((err) => {
          console.log(err.message);
      })
})