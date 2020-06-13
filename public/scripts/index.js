window.router();

window.onpopstate = function(event) {
    window.router();
}

const listenForSignUpForm = () => {
    const signUpForm = document.querySelector("#sign-up_form");

    signUpForm.addEventListener("submit", (e) => {
        e.preventDefault();
    
        let email = signUpForm['sign-up_email'].value;
        let password = signUpForm['sign-up_password'].value;
        let ageVerification = signUpForm.querySelector(`input[name="sign-up_age-verification"]:checked`);
    
        if (ageVerification) {
            auth.createUserWithEmailAndPassword(email, password)
            .then((user) => {
                signUpForm.reset();
                signUpForm.querySelector(".message").innerHTML = '';
                sendVerificationEmail(auth.currentUser);
            }).catch(err => {
                signUpForm.querySelector(".message").innerHTML = err.message;
            })
        } else {
            signUpForm.querySelector(".message").innerHTML = 'You must be 13 years or older to have an account.';
        }
    })
}

const sendVerificationEmail = (user) => {
    user.sendEmailVerification()
    .then(() => {
        console.log("Verification email sent!");
    })
    .catch(err => {
        console.log("Error sendign verification email.");
    })
}

const listenForSignInForm = () => {
    const signInForm = document.querySelector("#sign-in_form");

    signInForm.addEventListener("submit", (e) => {
        e.preventDefault();
    
        let email = signInForm['sign-in_email'].value;
        let password = signInForm['sign-in_password'].value;
    
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            signInForm.reset();
            signInForm.querySelector(".message").innerHTML = '';
        }).catch(err => {
            signInForm.querySelector(".message").innerHTML = err.message;
        })
    })
}

const listenForSignOutButton = () => {
    const signOutButton = document.querySelector("#sign-out_button");

    signOutButton.addEventListener('click', (e) => {
        e.preventDefault();
        // sign out the user
        auth.signOut();
        location.reload();
    })
}

listenForSignOutButton();
listenForSignUpForm();
listenForSignInForm();

for (let closeButton of document.querySelectorAll(".details__button--close")) {
  closeButton.addEventListener('click', (e) => {
      DetailsPanel.close();
  })
}

document.addEventListener('keydown', function(event) {
    const key = event.key; // Or const {key} = event; in ES6+

    activeTrigger = document.querySelector(`.dropdown:not(.u-visibility_hidden)`);
    
    if (key === "Escape") {
        if (activeTrigger) {
            closeAllDropdowns();
        } else {
            DetailsPanel.close();
        }
    }
});

addParentButton.addEventListener('click', (e) => {
  Relationship.addParent();
  closeAllDropdowns();
})

addChildButton.addEventListener('click', (e) => {
  Relationship.addChild();
  closeAllDropdowns();
})

addPartnerButton.addEventListener('click', (e) => {
  Relationship.addPartner();
  closeAllDropdowns();
})

addSiblingButton.addEventListener('click', (e) => {
  Relationship.addSibling();
  closeAllDropdowns();
})




// window.addEventListener('hashchange', router());
// window.addEventListener('onpopstate', router());

///////////
//////////
const memberOptionsDropdown = document.querySelector('[data-dropdown-target="member-options-dropdown"]');
const inviteMemberButton = document.querySelector("#invite-member-action");
// const deleteTreeButton = document.querySelector("#delete-tree");

const inviteMemberForm = document.querySelector("#invite-member_form");
// const editTreeForm = document.querySelector("#edit-tree_form");
const notificationIndicator = document.querySelector("#notification_indicator");
const notificationMenu = document.querySelector("#notification_menu");
const permissionsContainer = document.querySelector("#edit-tree_permissions");
const viewPermissionsTree = document.querySelector("#view-preferences_tree");
const viewPermissionsList = document.querySelector("#view-preferences_list");
const addRelationshipButton = document.querySelector(".add-relationship_button");

// const resetOnAuthStateChanged = auth.onAuthStateChanged(function (user) {
//     console.log("reset!");
// });

// const initializeGlobalMemberVars = (user) => new Promise(
//     function (resolve, reject) {
//         if (user) {
//             window.memberTreeDocs = [];

//             resolve(user.uid);
//             reject(console.log("initiation failed"));

//             membersRef.where('claimed_by', '==', user.uid).limit(1).get()
//             .then((queryResult => {
//                 window.authMemberDoc = queryResult.docs[0] ? queryResult.docs[0] : null;
//                 let iterations = authMemberDoc.data().trees.length;

//                 for (const [i, treeId] of authMemberDoc.data().trees.entries()) {
//                     console.log(treeId);
//                     treesRef.doc(treeId).get()
//                     .then((reqTreeDoc) => {
//                         if (!window.memberTreeDocs.includes(reqTreeDoc)) {
//                             window.memberTreeDocs.push(reqTreeDoc);
//                         }
//                     })
//                     .catch(err => {
//                         reject(err);
//                     })
//                     if (i === (iterations - 1)) {
//                         resolve(console.log("initialize function resolved!"));
//                     }
//                   }
//             }))
//         }
//     }
// );

let dropdownTriggers = document.querySelectorAll(`[data-dropdown-target]`);
let offset = 8;

const initiateDropdowns = () => {
    dropdownTriggers = document.querySelectorAll(`[data-dropdown-target]`);
    for (dropdownTrigger of dropdownTriggers) {
        initiateDropdown(dropdownTrigger);
    }
}

function initiateDropdown(triggerEl) {
    triggerEl.addEventListener('click', (e) => {
        e.preventDefault();
        // e.stopPropagation();
        showDropdown(triggerEl);
    })
}

const showDropdown = (triggerEl) => {
    let triggerData = triggerEl.getBoundingClientRect();
    let triggerX = triggerData.x;
    let triggerY = triggerData.y;
    let triggerWidth = triggerData.width;
    let triggerHeight = triggerData.height;
    let browserHeight = window.innerHeight;

    let targetClass = triggerEl.getAttribute("data-dropdown-target");
    let targetEl = document.querySelector(`#${targetClass}`);

    let positionForDropdown = triggerY + triggerHeight + offset;

    let targetElHeight = targetEl.getBoundingClientRect().height;;

    // get height of browser. 
    // Get height of targetEl
    // Get top value of targetEl

    // if the height of targetEl + top is greater than browser height

    if (targetEl.classList.contains(`u-visibility_hidden`)) {
        closeAllDropdowns();
        targetEl.classList.remove("u-visibility_hidden");
        targetEl.style.left = `${triggerX - triggerWidth + offset}px`;

        if ( (targetElHeight + positionForDropdown) >= browserHeight ) {
            targetEl.style.top = `${triggerY - targetElHeight - offset}px`;
            // put above trigger El
        } else {
            targetEl.style.top = `${positionForDropdown}px`;
        }

    } else {
        targetEl.classList.add("u-visibility_hidden")
    }

    targetEl.addEventListener('onblur', (e) => {
        console.log("blur?");
        closeAllDropdowns();
    })
}

const closeAllDropdowns = () => {
    dropdownTriggers = document.querySelectorAll(`[data-dropdown-target]`);

    for (dropdownTrigger of dropdownTriggers) {
        let targetClass = dropdownTrigger.getAttribute("data-dropdown-target");
        let targetEl = document.querySelector(`#${targetClass}`);

        targetEl.classList.add("u-visibility_hidden");
    }
}

const setupEmailVerificationView = (user) => {
    let msg = `<h2 class="u-mar-lr_auto">You must verify that ${user.email} belongs to you. Check your email.</h2>`
    let resendButton = document.createElement('button');
    resendButton.textContent = "Resend verification email"
    resendButton.setAttribute('class', 'u-d_block u-mar-lr_auto secondary');
    
    resendButton.addEventListener('click', (e) => {
        e.preventDefault();
        setupEmailVerificationView(user);
    })

    familyTreeEl.innerHTML += msg;
    familyTreeEl.appendChild(resendButton);
}

// const getLocalLeafDocFromId = (reqId) => {
//     return window.currentTreeLeaves.find(doc => doc.id === reqId);
// };

// const getLocalMemberDocFromId = (reqId) => {
//     return window.currentTreeMemberDocs.find(doc => doc.id === reqId);
// };

// const initiateSetupPage = (initiate = true) => {
//     if (initiate){
//         setProfileForm.classList.remove("u-d_none");
//         // createTreeForm.classList.remove("u-d_none")
//     } else {
//         setProfileForm.classList.add("u-d_none");
//         // createTreeForm.classList.add("u-d_none")
//     }
// }

// const setupView = () => {
//     clearView();
//     populateTreeMenu();
//     initiateSetupPage(false);

//     familyTree.innerHTML = '';

//     if (authMemberHasPermission()) {
//         window.topMemberDoc = window.currentTreeLeaves.find(doc => doc.data().topMember === true);
//         window.renderedLeafMembers = [];
//         let siblings = topMemberDoc.data().siblings && topMemberDoc.data().siblings.length > 0 ? topMemberDoc.data().siblings : null;
//         let generatedFamilyTreeHtml = renderFamilyFromMember(topMemberDoc);
    
//         if (siblings) {
//             for (siblingId of siblings) {
//                 let siblingBranchEl = createBranchEl("div", "branch")
//                 let siblingDoc = getLocalLeafDocFromId(siblingId);
//                 let siblingsHtml = renderFamilyFromMember(siblingDoc);
    
//                 siblingBranchEl.appendChild(siblingsHtml);
//                 familyTreeEl.appendChild(siblingsHtml);
//             }
//         }
    
//         setTreeHash(currentTreeDoc.id);
//         familyTreeEl.appendChild(generatedFamilyTreeHtml);
//         generateLines();
//         getNotificationsByAuthMember();
//         getNotificationsByEmail();
//     } else {
//         let msg = `<h1 class="u-mar-lr_auto">You do not have permission to view this family tree</h1>`
//         familyTreeEl.innerHTML = msg;
//     }
// }

// const authMemberHasPermission = () => {
//     let viewer = currentTreeDoc.data().viewers.includes(authMemberDoc.id);
//     let contributor = currentTreeDoc.data().contributors.includes(authMemberDoc.id);
//     let admin = currentTreeDoc.data().admins.includes(authMemberDoc.id);
//     let hasPermisison;

//     if (viewer || contributor || admin) {
//         hasPermission = true;
//     } else {
//         hasPermission = false;
//     }

//     return hasPermission;
// }

const closeModals = () => {
    let openModals = document.querySelectorAll(".modal.open");

    for (modal of openModals) {
        modal.classList.remove("open");
    }
}

const getLeafEl = (doc) => {
    let leafName;
    let leafProfilePhoto = doc.data().profile_photo ? doc.data().profile_photo : "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder.svg?alt=media&token=d3b939f1-d46b-4315-bcc6-3167d17a18ed";
    let figure = document.createElement("figure");
    let figcaption = document.createElement("figcaption");
    let img = document.createElement("div");
    
    if (doc.data().claimed_by) {
        let claimedBy = doc.data().claimed_by;
        reqMemberDoc = window.currentTreeMemberDocs.find(memberDoc => memberDoc.id === claimedBy);
        figure.setAttribute("data-member-id", reqMemberDoc.id);
        leafName = reqMemberDoc.data().name.firstName ? reqMemberDoc.data().name.firstName : "";
    } else {
        leafName = doc.data().name.firstName ? doc.data().name.firstName : "";

    }

    let viewListInfo = getListViewInfo(doc);

    figcaption.textContent = leafName;
    figcaption.setAttribute("class", "leaf_caption");
    figure.setAttribute("class", "leaf");
    figure.setAttribute("data-id", doc.id);

    img.setAttribute("class", "leaf__image");
    img.setAttribute("background-image", `url(${leafProfilePhoto})`);

    figure.appendChild(img);
    figure.appendChild(figcaption);

    figure.addEventListener('click', (e) => {
        e.preventDefault();

        let memberId = e.target.getAttribute("data-member-id");
        let leafId = e.target.getAttribute("data-id");
        let memberDoc = null;
        let leafDoc = getLocalLeafDocFromId(leafId);

        if (memberId) {
            memberDoc = getLocalMemberDocFromId(memberId);
            doc = memberDoc;
        }

        if (e.target.classList.contains("active")) {
            e.target.classList.remove("active");
            showDetailPanels(false);
        } else {
            removeActiveLeafClass();
            e.target.classList.add("active");
            showDetailPanels(true);
            populateDetailsPanel(doc, leafDoc);
        }
    });

    figure.appendChild(viewListInfo);
    return figure;
}

const authLeafPermissionType = () => {
    let permissionType = null;

    // console.log(LocalDocs.tree.data().permissions[LocalDocs.member.id]);

    // viewer = LocalDocs.tree.data().permissions[LocalDocs.member.id] ? "viewer" : null; 
    // contributor = LocalDocs.tree.data().contributors.includes(LocalDocs.member.id) ? "contributor": null; 
    // admin = LocalDocs.tree.data().admins.includes(LocalDocs.member.id) ? "admin" : null; 

    // if (viewer) {
    //     permissionType = "viewer";
    // } else if (contributor) {
    //     permissionType = "contributor";
    // } else if (admin) {
    //     permissionType = "admin";
    // }

    return permissionType = LocalDocs.tree.data().permissions[LocalDocs.member.id] ? LocalDocs.tree.data().permissions[LocalDocs.member.id] : null;

    //
    // TODO FIGURE OUT HOW TO SEND THE PERMISSION STATUS WHEN POPULATING DETAILS
}

// const generateImmediateFamilyElement = (parentDoc, relativeType) => {
//     let label;
//     let spouseAction = '';
//     if (relativeType === "parents") {
//         label = "Parent"
//     } else if (relativeType === "children") {
//         label = "Child"
//     } else if (relativeType === "siblings") {
//         label = "Sibling"
//     } else if (relativeType === "spouses") {
//         label = "Spouse"
//         spouseAction = `<button class="iconButton white u-mar-l_auto"><i class="fal fa-pencil-alt"></i></button>`
//     }

//     let el = `<div class="detailsPanel__item u-mar-b_4 u-d_flex u-align-items_center">
//                     <div class="detailsPanel__img u-mar-r_2"></div>
//                     <div class="detailsPanel__text u-mar-r_2">
//                         <div class="detailsPanel__name u-mar-b_point5 u-bold">${parentDoc.data().name.firstName}</div> 
//                         <div class="detailsPanel__realtiveType">${label}</div> 
//                     </div>
//                         ${spouseAction}
//                 </div>`
//     detailsPanelImmediateFamily.innerHTML += el;
// }

// const generateDetailElement = (params) => {
//     let reqName = params["name"];
//     let reqIcon = params["icon"];
//     let data = params["data"] ? params["data"] : null;

//     if (data) {
//         if (reqName === "birthday" && data) {
//             var options = { year: 'numeric', month: 'long', day: 'numeric' };
    
//             let date = new Date(data.replace(/-/g, '\/'));
//             data = new Intl.DateTimeFormat('en-US', options).format(date);
//         }

//         let infoEl = `<div class="detailsPanel__item detailsPanel__${reqName} u-mar-b_4"><i class="fa fa-${reqIcon} detailsPanel__icon u-mar-r_2"></i>${data}</div>`

//         detailsPanelMetaData.innerHTML += infoEl;
//     }
// }

const createBranchEl = (el, className) => {
    let branchEl = document.createElement(el);
    branchEl.setAttribute("class", className);

    return branchEl;
}

const replaceLeafWithMemberData = async (claimedBy, leafId) => {
    // let memberDoc = await membersRef.doc(claimedBy).get();
    // window.currentTreeMemberDocs.push(memberDoc);


    memberDocIfExists = window.currentTreeMemberDocs.find(memberDoc => memberDoc.id === claimedBy);

    let reqMemberDoc = memberDocIfExists === 'undefined' ? memberDocIfExits : null;

    // replaceProfileImageAndNameAndData(reqMemberDoc, leafId);
    
    function replaceProfileImageAndNameAndData(reqMemberDoc, leafId) {
    // let leafEl = document.querySelector(`[data-member-id="${reqMemberDoc.id}"]`);
    console.log(`TODO: Go and find the el with data-id=${leafId} and replace with ${reqMemberDoc.id} data`);

    // findLeaf, replace name and profile image and add data-member-id
    }
}

const renderFamilyFromMember = (doc) => {
    let children = doc.data().children && doc.data().children.length > 0 ? doc.data().children : null;
    let partners = doc.data().partners ? Object.entries(doc.data().partners) : null;
    let branchEl = createBranchEl("div", "branch");
    let leafEl = getLeafEl(doc);
    let partnersContainer = createBranchEl("div", "partners");

    if (doc.data().claimed_by) {
        leafEl.setAttribute("data-member-id", doc.data().claimed_by);
        replaceLeafWithMemberData(doc.data().claimed_by, doc.id);
    }
    
    partnersContainer.appendChild(leafEl);

    if (children) {
        let descendantsContainer = createBranchEl("div", "descendants");
        for (childId of children) {
            let childDoc = getLocalLeafDocFromId(childId);
            // let childDoc = window.currentTreeLeaves.find(leafDoc => leafDoc.id === childId);
            descendantsContainer.appendChild(renderFamilyFromMember(childDoc));
        }
        branchEl.appendChild(descendantsContainer);
    }

    if (partners) {
        for (partner of partners) {
            let partnerId = partner[0];
            let partnerStatus = partner[1];
            let partnerDoc = getLocalLeafDocFromId(partnerId);
            // let partnerDoc = window.currentTreeLeaves.find(leafDoc => leafDoc.id === partnerId);
            let partnerLeafEl = getLeafEl(partnerDoc);

            renderedLeafMembers.push(partnerId);
            partnersContainer.appendChild(partnerLeafEl);
        }
    }


    branchEl.prepend(partnersContainer);

    return branchEl;
}

// editTreeForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     let reqTreeId = editTreeForm["edit-tree_id"].value;
//     let newTreeName = editTreeForm["edit-tree_name"].value;

//     treesRef.doc(reqTreeId).update({
//         "name" : newTreeName
//     })
//     .then(() => {
//         console.log("Tree updated successfully!");
//         closeModals();
//         location.reload();
//     })
//     .catch(err => {
//         console.log(err.message);
//     })
// })

// deleteTreeButton.addEventListener('click', (e) => {
//     e.preventDefault;
//     let reqTreeId = editTreeForm["edit-tree_id"].value;

//     treesRef.doc(reqTreeId).delete();
//     // update this on all member's tree lists!
// })

inviteMemberForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let emaillAddress = inviteMemberForm["invite-member_email"].value;
    let leafId = detailsPanel.getAttribute("data-details-id");
    let permissionType = inviteMemberForm.querySelector(`input[name="invite-member_permission"]:checked`).value;
    let emailAlreadyInUse = LocalDocs.members.find(memberDoc => memberDoc.data().email === emaillAddress);
    console.log(`${emaillAddress} should take over ${leafId} as a ${permissionType}. Sent by ${LocalDocs.member.id}`);

    if (emailAlreadyInUse) {
        inviteMemberForm.querySelector(".error").textContent = `${emaillAddress} already belongs to a leaf on this tree.`;
    } else {
        notificationsRef.add({
            "type" : "leaf",
            "from_member" : LocalDocs.member.id,
            "for_email" : emaillAddress,
            "for_leaf" : leafId,
            "for_tree" : LocalDocs.tree.id,
            "permission_type" : permissionType,
            "status" : "pending"
        })
        .then(newNotificationRef => {
            currentTreeLeafCollectionRef.doc(leafId).update({
                invitation: newNotificationRef.id
            })
            .then(() => {
                console.log("invitation created successfully!");
                inviteMemberForm["invite-member_email"].value = '';
                inviteMemberForm.querySelector(".error").textContent = '';
                closeModals();
            })
            .catch(err => {
                console.log(err.message)
            })
        })
        .catch(err => {
            console.log(err.message);
        })
    }
})

renameTreeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let treeNameFromInput = renameTreeForm["rename-tree_name"].value;
    let treeId = renameTreeForm["rename-tree_id"].value;

    treesRef.doc(treeId).update({
        "name": treeNameFromInput
    })
    .then(() => {
        location.reload();
    })
})


const createTreeFormModal = document.querySelector("#create-tree_form_modal");
createTreeFormModal.addEventListener('submit', (e) => {
    e.preventDefault();

    let permissionObj = {};
    permissionObj[LocalDocs.member.id] = "admin";

    treesRef.add({
        "permissions" : permissionObj,
        "created_by" : LocalDocs.member.id,
        "name" : createTreeFormModal["create-tree_name"].value
    }).then(newTreeRef => {
        newTreeRef.collection('leaves').add(
            newLeafForFirebase({
                "created_by" : LocalDocs.member.id,
                "claimed_by" : LocalDocs.member.id,
                "topMember" : true
            })
        )
        if (!LocalDocs.member.data().primary_tree)
            membersRef.doc(LocalDocs.member.id).update({
                "trees" : firebase.firestore.FieldValue.arrayUnion(newTreeRef.id),
                "primary_tree" : newTreeRef.id
            })
            .then(() => {
                location.reload();
            })
            .catch(err => {
                console.log(err.message);
            })
        else {
            membersRef.doc(LocalDocs.member.id).update({
                "trees" : firebase.firestore.FieldValue.arrayUnion(newTreeRef.id),
            })   
            .then(() => {
                location.reload();
            })
            .catch(err => {
                console.log(err.message);
            })
        }

    })
    .catch(err => {
        console.log(err.message)
    });
})

const createTreeForm = document.querySelector("#create-tree_form");
createTreeForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let permissionObj = {};
    permissionObj[LocalDocs.member.id] = "admin";

    treesRef.add({
        "permissions" : permissionObj,
        "created_by" : LocalDocs.member.id,
        "name" : createTreeForm["create-tree_name"].value
    })
    .then(newTreeRef => {
        membersRef.doc(LocalDocs.member.id).update({
            "primary_tree" : newTreeRef.id,
            "trees" : [newTreeRef.id]
        })
        .then(() => {
            location.reload();
        })
        .catch(err => {
            console.log(err.message);
        })
    })
    .catch(err => {
        console.log(err.message);
    })
})

deleteLeafButton.addEventListener('click', (e) => {
  Relationship.deleteLeaf(e);
    closeAllDropdowns();
})

viewPermissionsTree.addEventListener('click', (e) => {
    e.preventDefault();
    showListView(false);
})

viewPermissionsList.addEventListener('click', (e) => {
    e.preventDefault();
    showListView();
})

const getListViewInfo = (leafDoc) => {
    return;
    let viewListInfo = document.createElement("div");
    viewListInfo.setAttribute("class", "view-list_info");
    
    let includeItems = ["name", "email", "phoneNumber", "address"];
    let groupItems = ["name", "address"];

    for (let [key, value] of Object.entries(memberBlueprint)) {
        if ( groupItems.includes(value["dataPath"]) ) {
            if ( value["defaultValue"] && Object.values(value["defaultValue"]).length > 0 ) {
                let group = document.createElement("span");
                group.setAttribute("class", "group");
                for (let [detailKey, detailValue] of Object.entries(value["defaultValue"])) {
                    if ( ["firstName", "surnameCurrent", "address1", "address2", "city", "zipcode", "country"].includes(detailValue["dataPath"]) ) {
                        let name = leafDoc.data()[value["dataPath"]][detailValue["dataPath"]] ? leafDoc.data()[value["dataPath"]][detailValue["dataPath"]] : "No data" ;
                        let detail = `<span class="leaf__detail-item">${name}</span>`;
                        group.innerHTML += detail;
                    }
                }
                viewListInfo.appendChild(group);
            } else {
                if ( includeItems.includes(key) ) {
                    let detail = `<span>${leafDoc.data()[value["dataPath"]]}</span>`
                    viewListInfo.innerHTML += detail;
                }
            }
        } else {
            if ( !excludedDetails.includes(value["dataPath"]) ) {
                let detail = `<span>${leafDoc.data()[value["dataPath"]]}</span>`
                viewListInfo.innerHTML += detail;
            }
            // do stuff with email phone. 
        }
    }
    return viewListInfo;
}

async function renderRowAndRelations(doc, tableEl) {
    let children = doc.data().children;
    let partners = doc.data().partners;
    
    let memberRow = await renderTableRow(doc);
    tableEl.appendChild(memberRow);

    if (Object.entries(partners).length > 0) {
        for (partnerId of Object.keys(partners)) {
            let partnerDoc = LocalDocs.leaves.find(leafDoc => leafDoc.id === partnerId);
            let partnerRow = await renderTableRow(partnerDoc);
            tableEl.appendChild(partnerRow);
        }
    }

    if (Object.entries(children).length > 0) {
        for (childId of Object.keys(children)) {
            let childDoc = LocalDocs.leaves.find(leafDoc => leafDoc.id === childId);
            renderRowAndRelations(childDoc, tableEl);
        }
    }

    // let activeLeafEl = familyTreeEl.querySelector(".active");
    // if (activeLeafEl) {
    //     let id = activeLeafEl.getAttribute(`data-id`);
    //     let makeTrActive = familyTreeListEl.querySelector(`[data-id="${id}"]`);

    //     makeTrActive.classList.add("active");
    // }
}

async function renderTableRow(doc) {
    let tr = createElementWithClass("tr", "");
    let tdName = createElementWithClass("td", "u-pad_1 u-bold");
    let tdProfileImage = createElementWithClass("td", "u-pad_1 profile__image");
    let tdEmail = createElementWithClass("td", "u-pad_1 u-font-size_14");
    let tdMobilePhone = createElementWithClass("td", "u-pad_1 u-font-size_14");
    let tdBirthday = createElementWithClass("td", "u-pad_1 u-font-size_14");
    let tdAddress = createElementWithClass("td", "u-pad_1 u-font-size_14");
    let tdViewInfo = createElementWithClass("td", "u-pad_1");
    let tdInfoButton = createElementWithClass("button", "u-pad_1 u-mar-l_auto u-mar-r_1 iconButton white");
    let tdInfoIcon = createElementWithClass("i", "fal fa-info-circle");

    let profileImage = createElementWithClass("div", "leaf__image");
    let leafImageEl = familyTreeEl.querySelector(`[data-id="${doc.id}"]`);
    let leafImageStyle = leafImageEl.querySelector(`.leaf__image`).getAttribute("style");

    profileImage.setAttribute("style", leafImageStyle);
    let nameString = `${ doc.data().name.firstName}  ${doc.data().name.surnameCurrent}`

    let firstName = doc.data().name.firstName || "No name";
    if (doc.data().name.firstNam || !doc.data().name.firstName) {
        nameString = `${firstName}`
    } else if (doc.data().name.firstName && doc.data().name.surnameCurrent) {
        nameString = `${firstName} ${doc.data().name.surnameCurrent}`
    }

    let email = doc.data().email || '';
    let mobilePhone = doc.data().phone.mobilePhone || '';
    let birthday = doc.data().birthday ? convertBirthday(doc.data().birthday) : '';
    let address;
    let address1 = doc.data().address.address1 ? doc.data().address.address1 : '';
    let address2 = doc.data().address.address2 ? doc.data().address.address2 : '';
    let city = doc.data().address.city ? doc.data().address.city : '';
    let state = doc.data().address.state ? doc.data().address.state : '';
    let zipcode = doc.data().address.zipcode ? doc.data().address.zipcode : '';

    if (address1 || address2) {
        address = `${address1} ${address2} ${city}, ${state} ${zipcode}`
    } else {
        address = `${city} ${state} ${zipcode}`
    }

    tdName.textContent = nameString;
    tdEmail.textContent = email;
    tdMobilePhone.textContent = mobilePhone;
    tdBirthday.textContent = birthday;
    tdAddress.textContent = address;

    tdInfoButton.setAttribute("tooltip", "More details");

    tr.setAttribute("data-id", doc.id);

    tdInfoButton.appendChild(tdInfoIcon);
    tdViewInfo.appendChild(tdInfoButton);

    tdProfileImage.appendChild(profileImage);

    tr.appendChild(tdProfileImage);
    tr.appendChild(tdName);
    tr.appendChild(tdEmail);
    tr.appendChild(tdMobilePhone);
    tr.appendChild(tdBirthday);
    tr.appendChild(tdAddress);
    tr.appendChild(tdViewInfo);

    tdInfoButton.addEventListener('click', (e) => {
        e.preventDefault();

        let tr = e.target.closest("tr");

        Leaf.toggleActive(tr);
        DetailsPanel.populate(doc, tr);
    });

    let activeTreeEl = familyTreeEl.querySelector(".active");
    if (activeTreeEl) {
        let id = activeTreeEl.getAttribute(`data-id`);
        let makeTrActive = familyTreeListEl.querySelector(`[data-id="${id}"]`);

        if (makeTrActive) {
            makeTrActive.classList.add("active");
        }
    }

    return tr;
}

const renderTableHeaders = () => {
    let tr = createElementWithClass("tr", "")
    let thProfileImage = createElementWithClass("th", "");
    let thName = createElementWithClass("th", "u-pad_1", "Name");
    let thEmail = createElementWithClass("th", "u-pad_1", "Email");
    let thMobilePhone = createElementWithClass("th", "u-pad_1", "Mobile Phone");
    let thBirthday = createElementWithClass("th", "u-pad_1", "Birthday");
    let thAddress = createElementWithClass("th", "u-pad_1", "Adderss");

    tr.appendChild(thProfileImage);
    tr.appendChild(thName);
    tr.appendChild(thEmail);
    tr.appendChild(thMobilePhone);
    tr.appendChild(thBirthday);
    tr.appendChild(thAddress);

    return tr;
}

const showListView = (show = true) => {
    if (show) {
        
        mainContent.classList.add("view_list");
        let topLeafDoc = LocalDocs.leaves.find(leafDoc => leafDoc.data().topMember === true);
        let tableEl = createElementWithClass("table", "u-w_full");

        tableEl.appendChild(renderTableHeaders());

        familyTreeListEl.innerHTML = '';
        familyTreeListEl.appendChild(tableEl);

        // if (tdEls.length > 0) {
        //     for (tdEl of tdEls) {
        //         tdEl.remove();
        //     }
        // }

        renderRowAndRelations(topLeafDoc, tableEl);

        // if (!tableEl.querySelector("tr td")) {
        //     if (topLeafDoc) {
        //         renderRowAndRelations(topLeafDoc, tableEl);
        //     }
        // }
    } else {
        mainContent.classList.remove("view_list");
    }

    closeAllDropdowns();
}

const newTreeForFirebase = (params) => {
    let newTreeObject = {};

    for (let [key, value] of Object.entries(treeBlueprint)) {
        if ( value["defaultValue"] && Object.values(value["defaultValue"]).length > 0 ) {
            newTreeObject[value["dataPath"]] = {};
            for (let [detailKey, detailValue] of Object.entries(value["defaultValue"])) {
                let newValue = params && params[detailValue["dataPath"]] ? params[detailValue["dataPath"]] : detailValue["defaultValue"];
                newTreeObject[value["dataPath"]][detailValue["dataPath"]] = newValue;
            }
        } else {
            let newValue = params && params[value["dataPath"]] ? params[value["dataPath"]] : value["defaultValue"];
            newTreeObject[value["dataPath"]] = newValue;
        }
    }

    return newTreeObject;
}

initiateModals();
initiateDropdowns();