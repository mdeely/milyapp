const familyTreeEl = document.querySelector("#familyTree");
const treeMenuEl = document.querySelector("#treeMenu");
const treeMenuDropdownEl = document.querySelector("#treeMenu__options");
const treeMenuCurrentTreeEl = document.querySelector("#treeMenu__currentTree");
const mainContent = document.querySelector("#mainContent");
const detailsPanel = mainContent.querySelector("#detailsPanel");
const detailsPanelInfo = detailsPanel.querySelector(".detailsPanel__information");
const detailsPanelFirstName = detailsPanel.querySelector(".detailsPanel__firstName");
const detailsPanelMetaData = detailsPanel.querySelector(".detailsPanel__metaData");
const detailsPanelImmediateFamily = detailsPanel.querySelector(".detailsPanel__immediateFamily");
const detailsPanelEdit = detailsPanel.querySelector("#detailsPanel__edit");
const detailsPanelAction = detailsPanel.querySelector(".detailsPanel__actions");
const placeholderImageUrl = "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder.svg?alt=media&token=d3b939f1-d46b-4315-bcc6-3167d17a18ed";
const modalTriggers = document.querySelectorAll("[data-modal-trigger]");
const dropdownTriggers = document.querySelectorAll(`[data-dropdown-target]`);
const memberOptionsDropdown = document.querySelector('[data-dropdown-target="member-options-dropdown"]');
const removeLeafButton = document.querySelector("#remove-leaf-action");
const inviteMemberButton = document.querySelector("#invite-member-action");
const editMemberButton = document.querySelector("#edit-member-action");
const addParentButton = document.querySelector("#add-parent-action");
const addChildButton = document.querySelector("#add-child-action");
const addSpouseButton = document.querySelector("#add-spouse-action");
const addSiblingButton = document.querySelector("#add-sibling-action");
const deleteTreeButton = document.querySelector("#delete-tree");
const createTreeForm = document.querySelector("#create-tree_form");
const inviteMemberForm = document.querySelector("#invite-member_form");
const createTreeFormModal = document.querySelector("#create-tree_form_modal");
const editTreeForm = document.querySelector("#edit-tree_form");
const notificationIndicator = document.querySelector("#notification_indicator");
const notificationMenu = document.querySelector("#notification_menu");
const permissionsContainer = document.querySelector("#edit-tree_permissions");
const viewPermissionsTree = document.querySelector("#view-preferences_tree");
const viewPermissionsList = document.querySelector("#view-preferences_list");
const addRelationshipButton = document.querySelector(".add-relationship_button");

// panzoom(familyTree, {
//     minZoom: .25, // prevent zooming out
//     maxZoom: 1, // prevent zooming beyond acceptable levels
//     // bounds: true, // prevent panning outside of container
//     boundsPadding: 1, // prevent panning outside of container
//     // zoomDoubleClickSpeed: 1
// });

const excludedDetails = ["children", "parents", "siblings", "spouses", "topMember", "claimed_by", "created_by", "profile_photo"];
const excludedCategories = ["Name", "Address"];

const treeBlueprint = {
    "Admins" : { "dataPath" : "admins", "defaultValue" : [] },
    "Contributors" : { "dataPath" : "contributors", "defaultValue" : [] },
    "Viewers" : { "dataPath" : "viewers", "defaultValue" : [] },
    "Created by" : { "dataPath" : "created_by", "defaultValue" : null },
    "Name" : { "dataPath" : "name", "defaultValue" : null }
}

const memberBlueprint = {
    "Name" : { "dataPath" : "name", "icon" : "user", 
                "defaultValue" : {
                    "First Name" : { "dataPath" : "firstName", "defaultValue" : null, "icon" : "user" },
                    "Middle Name" : { "dataPath" : "middleName", "defaultValue" : null, "icon" : "user" },
                    "Last Name" : { "dataPath" : "lastName", "defaultValue" : null, "icon" : "user" },
                    "Surname" : { "dataPath" : "surname", "defaultValue" : null, "icon" : "user" },
                    "Nickname" : { "dataPath" : "nickname", "defaultValue" : null, "icon" : "user" }
                }
            },
    "Email" : { "dataPath" : "email", "defaultValue" : null, "icon" : "envelope" },
    "Birthday" : { "dataPath" : "birthday", "defaultValue" : null, "icon" : "birthday-cake" },
    "Address" : { "dataPath" : "address", "icon" : "map-pin", 
                "defaultValue" : {
                    "Address 1" : { "dataPath" : "address1", "defaultValue" : null, "icon" : "" },
                    "Address 2" : { "dataPath" : "address2", "defaultValue" : null, "icon" : "" },
                    "City" : { "dataPath" : "city", "defaultValue" : null, "icon" : "" },
                    "Zipcode" : { "dataPath" : "zipcode", "defaultValue" : null, "icon" : "" },
                    "Country" : { "dataPath" : "country", "defaultValue" : null, "icon" : "" }
                }
            },
    "Occupation" : { "dataPath" : "occupation", "defaultValue" : null, "icon" : "briefcase" },
    "Children" : { "dataPath" : "children", "defaultValue" : [] },
    "Parents" : { "dataPath" : "parents", "defaultValue" : [] },
    "Siblings" : { "dataPath" : "siblings", "defaultValue" : [] },
    "Spouses" : { "dataPath" : "spouses", "defaultValue" : {} },
    "Top Member" : { "dataPath" : "topMember", "defaultValue" : false },
    "Claimed by" : { "dataPath" : "claimed_by", "defaultValue" : null },
    "Created by" : { "dataPath" : "created_by", "defaultValue" : null },
    "Profile photo" : { "dataPath" : "profile_photo", "icon" : "picture", "defaultValue" : null }
}

const getLocalLeafDocFromId = (reqId) => {
    return window.currentTreeLeaves.find(doc => doc.id === reqId);
};

const getLocalMemberDocFromId = (reqId) => {
    return window.currentTreeMemberDocs.find(doc => doc.id === reqId);
};

const initiateSetupPage = (initiate = true) => {
    if (initiate){
        createTreeForm.classList.remove("u-d_none")
    } else {
        createTreeForm.classList.add("u-d_none")
    }
}

const setupView = () => {
    clearView();
    populateTreeMenu();
    initiateSetupPage(false);

    familyTree.innerHTML = '';

    if (authMemberHasPermission()) {
        window.topMemberDoc = window.currentTreeLeaves.find(doc => doc.data().topMember === true);
        window.renderedLeafMembers = [];
        let siblings = topMemberDoc.data().siblings && topMemberDoc.data().siblings.length > 0 ? topMemberDoc.data().siblings : null;
        let generatedFamilyTreeHtml = renderFamilyFromMember(topMemberDoc);
    
        if (siblings) {
            for (siblingId of siblings) {
                let siblingBranchEl = createBranchEl("div", "branch")
                let siblingDoc = getLocalLeafDocFromId(siblingId);
                let siblingsHtml = renderFamilyFromMember(siblingDoc);
    
                siblingBranchEl.appendChild(siblingsHtml);
                familyTreeEl.appendChild(siblingsHtml);
            }
        }
    
        setTreeHash(currentTreeDoc.id);
        familyTreeEl.appendChild(generatedFamilyTreeHtml);
        generateLines();
        getNotificationsByAuthMember();
        getNotificationsByEmail();
    } else {
        let msg = `<h1 class="u-mar-lr_auto">You do not have permission to view this family tree</h1>`
        familyTreeEl.innerHTML = msg;
    }
}

const authMemberHasPermission = () => {
    let viewer = currentTreeDoc.data().viewers.includes(authMemberDoc.id);
    let contributor = currentTreeDoc.data().contributors.includes(authMemberDoc.id);
    let admin = currentTreeDoc.data().admins.includes(authMemberDoc.id);
    let hasPermisison;

    if (viewer || contributor || admin) {
        hasPermission = true;
    } else {
        hasPermission = false;
    }

    return hasPermission;
}


const getNotificationsByAuthMember = () => {
    let notificationUpdateQuery = notificationsRef.where("from_member", "==", authMemberDoc.id).where("status", "in", ["declined", "accepted"]);
    notificationUpdateQuery.get()
    .then(queryResult => {
        let docs = queryResult.docs;

        if (docs.length > 0) {
            for (doc of docs) {
                let notificationEl = document.createElement("div");
                let dismissNotificationButton = document.createElement('button');
                let icon = `<i class="fa fa-times"></i>`
                let message;

                dismissNotificationButton.innerHTML = icon;
                dismissNotificationButton.setAttribute("class", "iconButton white");

                notificationEl.setAttribute("data-notification-id", doc.id);
                notificationEl.setAttribute("class","dropdown__item");

                if (doc.data().status === "accepted") {
                    message = `${doc.data().for_email} accepted your request`;
                } else {
                    message = `${doc.data().for_email} declined your request`;
                }

                dismissNotificationButton.addEventListener('click', (e) => {
                    e.preventDefault();

                    notificationsRef.doc(doc.id).delete()
                    .then(() => {
                        console.log("notificaiton was dismissed and deleted");
                        location.reload();
                    })
                    .catch(err => {
                        console.log(err.message);
                    })
                })

                notificationEl.textContent += message;                

                notificationEl.appendChild(dismissNotificationButton);
                notificationMenu.appendChild(notificationEl);
                notificationIndicator.classList.remove("u-d_none");
            }
        }
    })
    console.log("TODO: when a user dismisses a declined or accepted invitation, delete notification record");
}

const getNotificationsByEmail = async (email = authMemberDoc.data().email) => {
    console.log(authMemberDoc.data().email);
    let notificationQuery = notificationsRef.where("status", "==", "pending").where("for_email", "==", authMemberDoc.data().email);

    notificationQuery.get().then(queryResult  => {
        let docs = queryResult.docs;
        console.log(docs);
        if (docs.length > 0) {
            notificationIndicator.classList.remove("u-d_none");

            for (doc of docs) {
                let notificationEl = document.createElement("div");
                let acceptNotification = document.createElement("button");
                let declinetNotification = document.createElement("button");

                acceptNotification.setAttribute("id", "accept-notification");
                declinetNotification.setAttribute("id", "decline-notification");
                declinetNotification.setAttribute("class", "danger");

                acceptNotification.textContent = "Accept";
                declinetNotification.textContent = "Decline";

                acceptNotification.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleNotification("accept", doc);
                });

                declinetNotification.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleNotification("decline", doc);
                });

                notificationEl.setAttribute("data-notification-id", doc.id);
                notificationEl.setAttribute("class","dropdown__item");

                membersRef.doc(doc.data().from_member).get()
                .then(memberDoc => {
                    if (memberDoc.exists) {
                        treesRef.doc(doc.data().for_tree).get()
                        .then((treeDoc) => {
                            treesRef.doc(doc.data().for_tree).collection("leaves").doc(doc.data().for_leaf).get()
                            .then((leafDoc) => {
                                let memberName = memberDoc.data().name && memberDoc.data().name.firstName ? memberDoc.data().name.firstName : "a Mily member";
                                let leafName = leafDoc.data().name && leafDoc.data().name.firstName ? leafDoc.data().name.firstName : "a leaf";
                                let treeName = treeDoc.data().name ? treeDoc.data().name : "a tree";
        
                                notificationEl.textContent = `You have an invitation from ${memberName} to take over "${leafName}" in family "${treeName}" as a ${doc.data().permission_type}.`;
        
                                notificationEl.appendChild(acceptNotification);
                                notificationEl.appendChild(declinetNotification);
                                notificationMenu.appendChild(notificationEl);
                            })
                        });
                    } else {
                        console.log("An invitation exists, but that member is no longer a part of Mily.");
                    }
                })
            }            
        } else {
            console.log("No notifications")
        }
    })
    
}

const handleNotification = (method, doc) => {
    let leafToTakeOver = doc.data().for_leaf;
    let treeToJoin = doc.data().for_tree;

    let reqTreeRef = treesRef.doc(treeToJoin);
    let reqTreeAndLeafRef = reqTreeRef.collection('leaves').doc(leafToTakeOver);

    if (method === "accept") {
        membersRef.doc(authMemberDoc.id).get()
        .then(reqMemberDoc => {
            let permissionType = doc.data().permission_type + "s";

            reqTreeRef.update({
                // Place member into the correct permission.
                [permissionType] : firebase.firestore.FieldValue.arrayUnion(authMemberDoc.id)
            })
            .then(() => console.log("permission added to tree successfully!"))
            .catch(() => console.log("error while adding permission to tree"));

            reqTreeAndLeafRef.update({
                // Update leaf to be claimed_by authmemeberdoc.id
                // Remove "invitation"
                "claimed_by" : authMemberDoc.id,
                "invitation" : null
            })
            .then(() => console.log("leaf updated  successfully!"))
            .catch(() => console.log("error while updating leaf"));

            if (!reqMemberDoc.data().primary_tree) {
                // Make this the member's primary tree
                membersRef.doc(authMemberDoc.id).update({
                    "primary_tree" : treeToJoin
                })
                .then(() => console.log("member primary tree updated  successfully!"))
                .catch(() => console.log("error while updating member primary tree"));
            }

            membersRef.doc(authMemberDoc.id).update({
                // Add new tree to the member's Trees
                "trees" : firebase.firestore.FieldValue.arrayUnion(treeToJoin)
            })
            .then(() => console.log("member trees updated successfully!"))
            .catch(() => console.log("error while updating member trees"));

            notificationsRef.doc(doc.id).update({
                "status" : "accepted"
            })
            .then(() => console.log("notification updated  successfully!"))
            .catch(() => console.log("error while updating notification"));
        })
    } else if (method === "decline") {
        // set notification status to "declined"
        notificationsRef.doc(doc.id).update({
            "status" : "declined"
        })
        .then(() => console.log("notification declined successfully!"))
        .catch(() => console.log("error while declining notification"));

        // remove invitation from leaf
        reqTreeAndLeafRef.update({
            "invitation" : null
        })
        .then(() => console.log("leaf updated  successfully!"))
        .catch(() => console.log("error while updating leaf"));
    }
}

const showModal = (e) => {
    let targetModalName = e.target.getAttribute("data-modal-trigger");
    let targetModal = document.querySelector('[data-modal="'+targetModalName+'"]');
    let closeModal = targetModal.querySelectorAll(".modal_button--close");

    targetModal.classList.add("open");

    for (let close of closeModal) {
        close.addEventListener('click', (e) => {
            e.preventDefault();
            e.target.closest(".modal").classList.remove("open");
        })
    }
    // targetModal.classList.add("open");
}

const closeModals = () => {
    let openModals = document.querySelectorAll(".modal.open");

    for (modal of openModals) {
        modal.classList.remove("open");
    }
}

const initiateModals = () => {
    for (let modalTrigger of modalTriggers) {
        modalTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            showModal(e);
        })
        // show modal
        // attached eventlisterners to have buttons close the modal.
        // bring focus to modal
        // addeventlisteners for onBlur
    }
};

const initiateDropdowns = () => {
    for (dropdownTrigger of dropdownTriggers) {
        dropdownTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            showDropdown(e);
        })
    }
}

const closeAllDropdowns = () => {
    for (dropdownTrigger of dropdownTriggers) {
        let targetClass = dropdownTrigger.getAttribute("data-dropdown-target");
        let targetEl = document.querySelector(`#${targetClass}`);
        targetEl.classList.add("u-d_none");
    }
}

const showDropdown = (e) => {
    let targetClass = e.target.getAttribute("data-dropdown-target");
    let targetEl = document.querySelector(`#${targetClass}`);

    if (targetEl.classList.contains(`u-d_none`)) {
        closeAllDropdowns();
        targetEl.classList.remove("u-d_none")
    } else {
        targetEl.classList.add("u-d_none")
    }
}

const populateTreeMenu = () => {
    treeMenuDropdownEl.innerHTML = '';

    let categoryheader = document.createElement("div");
    let categoryHeaderButton = document.createElement("button");

    categoryHeaderButton.innerHTML = `<i class="fa fa-plus"></i>`;
    categoryHeaderButton.setAttribute("class", "iconButton white u-mar-l_auto");
    categoryHeaderButton.setAttribute('data-modal-trigger', 'create-tree_modal');

    categoryHeaderButton.addEventListener('click', (e) => {
        e.preventDefault();
        showModal(e);   
    })

    categoryheader.setAttribute("class", "dropdown__item dropdown__label");
    categoryheader.textContent = "Families"
    categoryheader.appendChild(categoryHeaderButton);

    treeMenuDropdownEl.appendChild(categoryheader);

    for (let treeDoc of window.authMemberTrees) {
        let treeAnchor = document.createElement("li");
        let editButton = document.createElement("button");
        let className = '';
        let isAdminOfTree = treeDoc.data().admins.includes(authMemberDoc.id) ? true : false;

        if (treeDoc.id === window.currentTreeDoc.id) {
            className = "active";
            treeMenuCurrentTreeEl.innerHTML += treeDoc.data().name ? treeDoc.data().name : "Unnamed";
        }

        treeAnchor.setAttribute("data-id", treeDoc.id);
        treeAnchor.setAttribute("class", `dropdown__item ${className}`);
        treeAnchor.textContent += treeDoc.data().name;

        editButton.innerHTML = `<i class="fa fa-pencil-alt"></i>`;
        editButton.setAttribute("class", "iconButton white u-mar-l_auto");
        editButton.setAttribute('data-modal-trigger', 'edit-tree_modal');

        editButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            if (isAdminOfTree) {
                editTreeForm.querySelector(".edit-tree_save").classList.remove("u-d_none");
                editTreeForm.querySelector(".edit-tree_delete").classList.remove("u-d_none");
                editTreeForm["edit-tree_name"].removeAttribute("disabled");
            } else {
                editTreeForm.querySelector(".edit-tree_save").classList.add("u-d_none")
                editTreeForm.querySelector(".edit-tree_delete").classList.add("u-d_none");
                editTreeForm["edit-tree_name"].setAttribute("disabled", true);
            }

            console.log("TODO: CONSIDER POPULATING THIS STUFF FROM CURRENTTREE var")

            let reqTreeId = e.target.closest("[data-id]").getAttribute('data-id');
            let reqTreeDoc = window.authMemberTrees.find(doc => doc.id === reqTreeId);

            editTreeForm["edit-tree_name"].value = reqTreeDoc.data().name;
            editTreeForm["edit-tree_id"].value = reqTreeDoc.id;

            console.log(`TODO: If an admin, allow changing of permissions within the tree settings`);

            permissionsContainer.innerHTML = '';

            for (leafId of reqTreeDoc.data().viewers) {
                makePermissionDetailItem("viewer", leafId);
            }

            for (leafId of reqTreeDoc.data().contributors) {
                makePermissionDetailItem("contributor", leafId);
            }

            for (leafId of reqTreeDoc.data().admins) {
                makePermissionDetailItem("admins", leafId);
            }

            function makePermissionDetailItem(permType, leafId) {
                permType = permType.replace('s', '');
                console.log("TODO: Load actual data when showing IMMEDIATE FAMILY section");
                console.log("TODO: If not claimed_by, do not show that leaf");
                let el = `<div class="detailsPanel__item u-mar-b_4 u-d_flex u-align-items_center">
                            <div class="detailsPanel__img u-mar-r_2"></div>
                                <div class="detailsPanel__text u-mar-r_2">
                                    <div class="detailsPanel__name u-mar-b_point5 u-bold">${leafId}</div> 
                                    <div class="detailsPanel__realtiveType">${permType}</div> 
                                </div>
                             </div>`
                permissionsContainer.innerHTML += el;
            }

            showModal(e);
        })

        if (treeDoc.id === window.primaryTreeId) {
            treeAnchor.innerHTML += " (Primary) "
        }

        treeAnchor.addEventListener('click', (e) => {
            e.preventDefault();

            let reqTreeId = e.target.getAttribute("data-id");
            getAndSetCurrenTreeVars(reqTreeId);
        })

        treeAnchor.appendChild(editButton);
        treeMenuDropdownEl.appendChild(treeAnchor);
    }

    let caretIcon = `<i class="fa fa-caret-down u-mar-l_2 u-pe_none u-o_75"></i>`;

    treeMenuCurrentTreeEl.innerHTML += caretIcon;
}

const getLeafEl = (doc) => {
    let leafName = doc.data().name.firstName ? doc.data().name.firstName : "";
    let leafProfilePhoto = doc.data().profile_photo ? doc.data().profile_photo : "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder.svg?alt=media&token=d3b939f1-d46b-4315-bcc6-3167d17a18ed";
    let figure = document.createElement("figure");
    let figcaption = document.createElement("figcaption");
    let img = document.createElement("img");

    if (doc.data().claimed_by) {
        let claimedBy = doc.data().claimed_by;
        reqMemberDoc = window.currentTreeMemberDocs.find(memberDoc => memberDoc.id === claimedBy);
        figure.setAttribute("data-member-id", reqMemberDoc.id);
    }

    let viewListInfo = getListViewInfo(doc);

    figcaption.textContent = leafName;
    figcaption.setAttribute("class", "leaf_caption");
    figure.setAttribute("class", "leaf");
    figure.setAttribute("data-id", doc.id);

    img.setAttribute("class", "leaf__image");
    img.setAttribute("src", leafProfilePhoto);

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

    viewer = currentTreeDoc.data().viewers.includes(authMemberDoc.id) ? "viewer" : null; 
    contributor = currentTreeDoc.data().contributors.includes(authMemberDoc.id) ? "contributor": null; 
    admin = currentTreeDoc.data().admins.includes(authMemberDoc.id) ? "admin" : null; 

    if (viewer) {
        permissionType = "viewer";
    } else if (contributor) {
        permissionType = "contributor";
    } else if (admin) {
        permissionType = "admin";
    }

    return permissionType;

    //
    // TODO FIGURE OUT HOW TO SEND THE PERMISSION STATUS WHEN POPULATING DETAILS
}

const populateDetailsPanel = (doc, leafDoc) => {
    detailsPanelMetaData.textContent = '';
    detailsPanelImmediateFamily.textContent = '';
    detailsPanelFirstName.textContent = doc.data().name.firstName ? doc.data().name.firstName : "No name";
    detailsPanel.setAttribute("data-member-details-id", '');
    detailsPanel.setAttribute("data-details-id", leafDoc.id);

    if (doc.ref.parent.path === "members") {
        detailsPanel.setAttribute("data-member-details-id", doc.id);
    }

    let profileImage = detailsPanel.querySelector(".detailsPanel__profileImage img");
    profileImage.setAttribute('src', placeholderImageUrl);
    
    if (authLeafPermissionType() && authLeafPermissionType() === "admin" || authLeafPermissionType() && authLeafPermissionType() === "contributor") {
        addParentButton.classList.remove("u-d_none")
        inviteMemberButton.classList.remove("u-d_none");
        removeLeafButton.classList.remove("u-d_none");
        editMemberButton.classList.remove("u-d_none");
        addRelationshipButton.classList.remove("u-d_none");

        if (doc.data().topMember !== true) {
            addParentButton.classList.add("u-d_none")
        }

        if (doc.data().invitation) {
            inviteMemberButton.classList.add("u-d_none");
        }

        if (doc.data().claimed_by) {
            if (doc.data().claimed_by === authMemberDoc.id) {
                removeLeafButton.classList.add("u-d_none");
                editMemberButton.classList.remove("u-d_none");
                inviteMemberButton.classList.add("u-d_none");
            } else {
                inviteMemberButton.classList.add("u-d_none");
                editMemberButton.classList.add("u-d_none");
            }
        }

    } else if (authLeafPermissionType() || authLeafPermissionType() === "viewer") {
        addParentButton.classList.add("u-d_none")
        inviteMemberButton.classList.add("u-d_none");
        removeLeafButton.classList.add("u-d_none");
        editMemberButton.classList.add("u-d_none");
        addRelationshipButton.classList.add("u-d_none");
    } else {
        addParentButton.classList.add("u-d_none")
        inviteMemberButton.classList.add("u-d_none");
        removeLeafButton.classList.add("u-d_none");
        editMemberButton.classList.add("u-d_none");
        addRelationshipButton.classList.add("u-d_none");
    }

    for (let [key, value] of Object.entries(memberBlueprint)) {
        if ( !excludedDetails.includes(value["dataPath"]) ) {
            if ( value["defaultValue"] && Object.values(value["defaultValue"]).length > 0 ) {
                for (let [detailKey, detailValue] of Object.entries(value["defaultValue"])) {
                    if ( !["firstName"].includes(detailValue["dataPath"]) ) {
                        generateDetailElement({data: doc.data()[value["dataPath"]][detailValue["dataPath"]], name: detailValue["dataPath"], icon: value["icon"]});
                    }
                }
            } else {
                if ( !excludedCategories.includes(key) ) {
                    generateDetailElement({data: doc.data()[value["dataPath"]], name: value["dataPath"], icon: value["icon"]});
                }
            }
        }
    }

    let relativeTypeArray = ["spouses", "children", "siblings", "parents"];

    for (relativeType of relativeTypeArray) {
        let relativeData = leafDoc.data()[`${relativeType}`];
        if (relativeData) {
            if (relativeType === "spouses") {
                for ( relativeId in relativeData ) {
                    let relativeDoc = getLocalLeafDocFromId(relativeId);
                    generateImmediateFamilyElement(relativeDoc, relativeType); 
                }
            } else {
                for ( relativeId of relativeData ) {
                    let relativeDoc = getLocalLeafDocFromId(relativeId);
                    generateImmediateFamilyElement(relativeDoc, relativeType);  
                }
            }
        }
    }
}

const generateImmediateFamilyElement = (parentDoc, relativeType) => {
    let label;
    let spouseAction = '';
    if (relativeType === "parents") {
        label = "Parent"
    } else if (relativeType === "children") {
        label = "Child"
    } else if (relativeType === "siblings") {
        label = "Sibling"
    } else if (relativeType === "spouses") {
        label = "Spouse"
        spouseAction = `<button class="iconButton white u-mar-l_auto"><i class="fa fa-pencil-alt"></i></button>`
    }

    let el = `<div class="detailsPanel__item u-mar-b_4 u-d_flex u-align-items_center">
                    <div class="detailsPanel__img u-mar-r_2"></div>
                    <div class="detailsPanel__text u-mar-r_2">
                        <div class="detailsPanel__name u-mar-b_point5 u-bold">${parentDoc.data().name.firstName}</div> 
                        <div class="detailsPanel__realtiveType">${label}</div> 
                    </div>
                        ${spouseAction}
                </div>`
    detailsPanelImmediateFamily.innerHTML += el;
}

const generateDetailElement = (params) => {
    let reqName = params["name"];
    let reqIcon = params["icon"];
    let data = params["data"] ? params["data"] : null;

    if (data) {
        if (reqName === "birthday" && data) {
            var options = { year: 'numeric', month: 'long', day: 'numeric' };
    
            let date = new Date(data.replace(/-/g, '\/'));
            data = new Intl.DateTimeFormat('en-US', options).format(date);
        }

        let infoEl = `<div class="detailsPanel__item detailsPanel__${reqName} u-mar-b_4"><i class="fa fa-${reqIcon} detailsPanel__icon u-mar-r_2"></i>${data}</div>`

        detailsPanelMetaData.innerHTML += infoEl;
    }
}

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
    let spouses = doc.data().spouses ? Object.entries(doc.data().spouses) : null;
    let branchEl = createBranchEl("div", "branch");
    let leafEl = getLeafEl(doc);
    let spousesContainer = createBranchEl("div", "spouses");

    if (doc.data().claimed_by) {
        leafEl.setAttribute("data-member-id", doc.data().claimed_by);
        replaceLeafWithMemberData(doc.data().claimed_by, doc.id);
    }
    
    spousesContainer.appendChild(leafEl);

    if (children) {
        let descendantsContainer = createBranchEl("div", "descendants");
        for (childId of children) {
            let childDoc = getLocalLeafDocFromId(childId);
            // let childDoc = window.currentTreeLeaves.find(leafDoc => leafDoc.id === childId);
            descendantsContainer.appendChild(renderFamilyFromMember(childDoc));
        }
        branchEl.appendChild(descendantsContainer);
    }

    if (spouses) {
        for (spouse of spouses) {
            let spouseId = spouse[0];
            let spouseStatus = spouse[1];
            let spouseDoc = getLocalLeafDocFromId(spouseId);
            // let spouseDoc = window.currentTreeLeaves.find(leafDoc => leafDoc.id === spouseId);
            let spouseLeafEl = getLeafEl(spouseDoc);

            renderedLeafMembers.push(spouseId);
            spousesContainer.appendChild(spouseLeafEl);
        }
    }


    branchEl.prepend(spousesContainer);

    return branchEl;
}

editTreeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let reqTreeId = editTreeForm["edit-tree_id"].value;
    let newTreeName = editTreeForm["edit-tree_name"].value;

    treesRef.doc(reqTreeId).update({
        "name" : newTreeName
    })
    .then(() => {
        console.log("Tree updated successfully!");
        closeModals();
        location.reload();
    })
    .catch(err => {
        console.log(err.message);
    })
})

deleteTreeButton.addEventListener('click', (e) => {
    e.preventDefault;
    let reqTreeId = editTreeForm["edit-tree_id"].value;

    treesRef.doc(reqTreeId).delete();
    // update this on all member's tree lists!
})

inviteMemberForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let emaillAddress = inviteMemberForm["invite-member_email"].value;
    let leafId = detailsPanel.getAttribute("data-details-id");
    let permissionType = inviteMemberForm.querySelector(`input[name="invite-member_permission"]:checked`).value;
    let emailAlreadyInUse = window.currentTreeMemberDocs.find(memberDoc => memberDoc.data().email === emaillAddress);
    console.log(`${emaillAddress} should take over ${leafId} as a ${permissionType}. Sent by ${authMemberDoc.id}`);

    if (emailAlreadyInUse) {
        inviteMemberForm.querySelector(".error").textContent = `${emaillAddress} already belongs to a leaf on this tree.`;
    } else {
        notificationsRef.add({
            "type" : "invitation",
            "from_member" : authMemberDoc.id,
            "for_email" : emaillAddress,
            "for_leaf" : leafId,
            "for_tree" : currentTreeDoc.id,
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

createTreeFormModal.addEventListener('submit', (e) => {
    e.preventDefault();

    treesRef.add(
        newTreeForFirebase({
            "admins" : [authMemberDoc.id],
            "created_by" : authMemberDoc.id,
            "name" : createTreeFormModal["create-tree_name"].value
        })
    ).then(newTreeRef => {
        newTreeRef.collection('leaves').add(
            newLeafForFirebase({
                "created_by" : authMemberDoc.id,
                "claimed_by" : authMemberDoc.id,
                "topMember" : true
            })
        )
        membersRef.doc(authMemberDoc.id).update({
            "trees" : firebase.firestore.FieldValue.arrayUnion(newTreeRef.id)
        })
        .then(() => {
            location.reload();
        })
        .catch(err => {
            console.log(err.message);
        })
    })
    .catch(err => {
        console.log(err.message)
    });
})

createTreeForm.addEventListener('submit', (e) => {
    e.preventDefault();

    treesRef.add(
        newTreeForFirebase({
            "admins" : [authMemberDoc.id],
            "created_by" : authMemberDoc.id,
            "name" : createTreeForm["create-tree_name"].value
        })
    )
    .then(newTreeRef => {
        treesRef.doc(newTreeRef.id).collection('leaves').add(
            newLeafForFirebase({
                "claimed_by" : authMemberDoc.id,
                "created_by" : authMemberDoc.id,
                "topMember" : true
            })
        )
        .then(newLeafRef => {
            membersRef.doc(authMemberDoc.id).update({
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
    })
    .catch(err => {
        console.log(err.message);
    })
})

removeLeafButton.addEventListener('click', (e) => {
    removeLeaf(e);
    closeAllDropdowns();
})

editMemberButton.addEventListener('click', (e) => {
    editMember(e);
    closeAllDropdowns();
})

addParentButton.addEventListener('click', (e) => {
    addParent(e);
    closeAllDropdowns();
})

addChildButton.addEventListener('click', (e) => {
    addChild(e);
    closeAllDropdowns();
})

addSpouseButton.addEventListener('click', (e) => {
    addSpouse(e);
    closeAllDropdowns();
})

addSiblingButton.addEventListener('click', (e) => {
    addSibling(e);
    closeAllDropdowns();
})

const getDocFromDetailsPanelId = (forceLeaf = false) => {
    let memberId = detailsPanel.getAttribute("data-member-details-id");
    let leafId = detailsPanel.getAttribute("data-details-id");
    let doc = null;

    if (!forceLeaf && memberId) {
        doc = getLocalMemberDocFromId(memberId);
    } else {
        doc = getLocalLeafDocFromId(leafId);
    }

    return doc;
    // return window.currentTreeLeaves.find(leafDoc => leafDoc.id === id);
}

const editMember = () => {
    let reqEditDoc = getDocFromDetailsPanelId();
    let reqEditDocData = reqEditDoc.data();

    detailsPanelEdit.classList.remove("u-d_none");

    for (let [key, value] of Object.entries(memberBlueprint)) {
        let data = '';
        let name = '';

        if ( !excludedDetails.includes(value["dataPath"]) ) {
            if ( value["defaultValue"] && Object.values(value["defaultValue"]).length > 0 ) {
                for (let [detailKey, detailValue] of Object.entries(value["defaultValue"])) {
                    name = detailValue["dataPath"];
                    data = reqEditDocData[value["dataPath"]][detailValue["dataPath"]];
                    createMemberInput(detailKey, data, name);
                }
            } else {
                name = value["dataPath"];
                data = reqEditDocData[value["dataPath"]];
            }

            if ( !excludedCategories.includes(key) ) {
                if (name === "birthday" && data) {  

                    data = new Date(data).toISOString().substring(0, 10);
                }
                createMemberInput(key, data, name);
            }
        }
    }


    let buttonGroup = document.createElement('div');
    let saveButton = document.createElement("button");
    let cancelButton = document.createElement("button");

    saveButton.textContent = "Save";
    saveButton.setAttribute("class", "u-w_full")
    saveButton.setAttribute("type", "submit");

    cancelButton.textContent = "Cancel";
    cancelButton.setAttribute("class", "u-w_full button secondary")
    cancelButton.setAttribute("href", "#");

    let ref;
    if (reqEditDoc.ref.parent.path === "members") {
        ref = membersRef;
    } else {
        ref = currentTreeLeafCollectionRef;
    }

    saveButton.addEventListener("click", (e) => {
        e.preventDefault();
        let reqEditDoc = getDocFromDetailsPanelId();

        ref.doc(reqEditDoc.id).update({
            "name" : {
                "firstName" : detailsPanelEdit["firstName"].value,
                "lastName" : detailsPanelEdit["lastName"].value,
                "middleName" : detailsPanelEdit["middleName"].value,
                "surname" : detailsPanelEdit["surname"].value,
                "nickname" : detailsPanelEdit["nickname"].value,
            },
            "address" : {
                "address1" : detailsPanelEdit["address1"].value,
                "address2" : detailsPanelEdit["address2"].value,
                "city" : detailsPanelEdit["city"].value,
                "zipcode" : detailsPanelEdit["zipcode"].value,
                "country" : detailsPanelEdit["country"].value,
            },
            "birthday" : detailsPanelEdit["birthday"].value,

            "occupation" : detailsPanelEdit["occupation"].value,
            "email" : detailsPanelEdit["email"].value,
        })
        .then(() => {
            console.log("Updated!");
            detailsPanelAction.classList.remove("u-d_none");
            detailsPanelEdit.classList.add("u-d_none");
            detailsPanelInfo.classList.remove("u-d_none");
            location.reload();
        })
        .catch(err => {
            console.log(err.message)
        })
    });

    cancelButton.addEventListener("click", (e) => {
        e.preventDefault();
        detailsPanelEdit.classList.add("u-d_none");
        detailsPanelInfo.classList.remove("u-d_none");
        detailsPanelAction.classList.remove("u-d_none");
    });

    buttonGroup.setAttribute("class", "formActions u-pad_4");
    buttonGroup.appendChild(saveButton);
    buttonGroup.appendChild(cancelButton);
    
    detailsPanelInfo.classList.add("u-d_none");
    detailsPanelAction.classList.add("u-d_none");
    detailsPanelEdit.appendChild(buttonGroup);

    // add save/cancel action
    // turn all information into inputs
}

const createMemberInput = (detailName, data, name, type = "text") => {
    data = data ? data : '';

    if (detailName === "Birthday") {
        type = "date"
    }

    let inputGroup = `<div class="inputGroup inputGroup__horizontal">
                            <label class="u-mar-r_2 u-w_33perc">${detailName}</label>
                            <input class="u-mar-l_auto u-flex_1'" type="${type}" name="${name}" value="${data}">
                        </div>`

    detailsPanelEdit.innerHTML += inputGroup;
}

const removeLeaf = async () => {
    let reqRemovalDoc = getDocFromDetailsPanelId();

    if (reqRemovalDoc.data().claimed_by === authMemberDoc.id) {
        alert("You cannot delete yourself!");
        return
    } else {
        if (0 > 0) {
            console.log("do nothing?")
            // Dont remove completely, but mark as "empty connection"?
        }
        else {
    
            if (reqRemovalDoc.data().topMember === true) {
                console.log(`TopMember deleted. Top Member reassigned to ${reqRemovalDoc.data().children[0]}`);
                currentTreeLeafCollectionRef.doc(reqRemovalDoc.data().children[0]).update({topMember: true});
            }
    
            if (reqRemovalDoc.data().parents.length > 0) {
                for (parentId of reqRemovalDoc.data().parents) {
                    console.log(`Updating parent ${parentId}`);
                    currentTreeLeafCollectionRef.doc(parentId).update({
                        children: firebase.firestore.FieldValue.arrayRemove(reqRemovalDoc.id)
                    })
                    .then((ref) => {
                        console.log("Parent successfully updated")
                    })
                    .catch(err => {
                        console.log(`Parent not updated`);
                        console.log(err.message);
                    })
                }
            }
    
            if (reqRemovalDoc.data().children.length > 0) {
                for (childId of reqRemovalDoc.data().children) {
                    console.log(`Updating child ${childId}`);
                    currentTreeLeafCollectionRef.doc(childId).update({
                        parents: firebase.firestore.FieldValue.arrayRemove(reqRemovalDoc.id)
                    })
                    .then((ref) => {
                        console.log("Child successfully updated")
                    })
                    .catch(err => {
                        console.log(`Child not updated`);
                        console.log(err.message);
                    })
                }
            }
            
            if (reqRemovalDoc.data().spouses) {
                if ( Object.keys(reqRemovalDoc.data().spouses).length > 0 ) {
                    for ( spouseId of Object.keys(reqRemovalDoc.data().spouses) ) {
                        console.log(`Updating spouse ${spouseId}`);
                        currentTreeLeafCollectionRef.doc(spouseId).update({
                            [`spouses.${reqRemovalDoc.id}`] : firebase.firestore.FieldValue.delete()
                        })
                        .then(() => {
                            console.log("Spouse successfully updated")
                        })
                        .catch(err => {
                            console.log(`Spouse not updated`);
                            console.log(err.message);
                        })
                    }
                }
            }
    
            if (reqRemovalDoc.data().siblings.length > 0) {
                for (siblingId of reqRemovalDoc.data().siblings) {
                    console.log(`Updating sibling ${siblingId}`);
                    currentTreeLeafCollectionRef.doc(siblingId).update({
                        siblings: firebase.firestore.FieldValue.arrayRemove(reqRemovalDoc.id)
                    })
                    .then((ref) => {
                        console.log("Sibling successfully updated")
                    })
                    .catch(err => {
                        console.log(`Sibling not updated`);
                        console.log(err.message);
                    })
                }
            }

            treesRef.doc(currentTreeDoc.id).update({
                "admins" : firebase.firestore.FieldValue.arrayRemove(reqRemovalDoc.data().claimed_by),
                "contributors" : firebase.firestore.FieldValue.arrayRemove(reqRemovalDoc.data().claimed_by),
                "viewers" : firebase.firestore.FieldValue.arrayRemove(reqRemovalDoc.data().claimed_by)
            });
    
            currentTreeLeafCollectionRef.doc(reqRemovalDoc.id).delete()
            .then(() => {
                console.log("user was deleted");
                location.reload();
            })
            .catch(err => {
                console.log(err.message);
            })
            // document.querySelector(`[data-id="${reqRemovalDoc.id}"]`).remove();
        }
    }
}

viewPermissionsTree.addEventListener('click', (e) => {
    e.preventDefault();
    showListView(false);
})

viewPermissionsList.addEventListener('click', (e) => {
    e.preventDefault();
    showListView();
})

const getListViewInfo = (leafDoc) => {
    let viewListInfo = document.createElement("div");
    viewListInfo.setAttribute("class", "view-list_info");
    
    let includeItems = ["name", "email", "phone_number", "address"];
    let groupItems = ["name", "address"];

    for (let [key, value] of Object.entries(memberBlueprint)) {
        if ( groupItems.includes(value["dataPath"]) ) {
            if ( value["defaultValue"] && Object.values(value["defaultValue"]).length > 0 ) {
                let group = document.createElement("span");
                group.setAttribute("class", "group");
                for (let [detailKey, detailValue] of Object.entries(value["defaultValue"])) {
                    if ( ["firstName", "lastName", "address1", "address2", "city", "zipcode", "country"].includes(detailValue["dataPath"]) ) {
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

const showListView = (show = true) => {
    if (show) {
        familyTreeEl.classList.add("view_list");
        // Generate date for tree view
    } else {
        familyTreeEl.classList.remove("view_list");
    }
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

const newLeafForFirebase = (params) => {
    let newLeafObject = {};

    for (let [key, value] of Object.entries(memberBlueprint)) {
        if ( value["defaultValue"] && Object.values(value["defaultValue"]).length > 0 ) {
            newLeafObject[value["dataPath"]] = {};
            for (let [detailKey, detailValue] of Object.entries(value["defaultValue"])) {
                let newValue = params && params[detailValue["dataPath"]] ? params[detailValue["dataPath"]] : detailValue["defaultValue"];
                newLeafObject[value["dataPath"]][detailValue["dataPath"]] = newValue;
            }
        } else {
            let newValue = params && params[value["dataPath"]] ? params[value["dataPath"]] : value["defaultValue"];
            newLeafObject[value["dataPath"]] = newValue;
        }
    }

    return newLeafObject;
}

const addParent = () => {
    let addParentTo = getDocFromDetailsPanelId(true);
    console.log(`I'm finna add a parent to ${addParentTo}`);

    let childrenArray = [addParentTo.id];

    if (addParentTo.data().siblings) {
        for (siblingId of addParentTo.data().siblings) {
            childrenArray.push(siblingId);
        }
    }

    currentTreeLeafCollectionRef.add(      
        newLeafForFirebase({
            "children": childrenArray,
            "topMember": true
        })
    )
    .then((leafRef) => {
        console.log(`Parent ${leafRef.id} succesfully created!`);
        if (addParentTo.data().siblings) {
            for (siblingId of addParentTo.data().siblings) {
                currentTreeLeafCollectionRef.doc(siblingId).update({
                    parents: firebase.firestore.FieldValue.arrayUnion(leafRef.id)
                })
                .then(() => {
                    console.log(`${siblingId} successfully updated to have ${leafRef.id} as a parent`)
                })
                .catch(err => {
                    console.log(err.message)
                })
            }
        }

        currentTreeLeafCollectionRef.doc(topMemberDoc.id).update({
            topMember: false
        })

        currentTreeLeafCollectionRef.doc(addParentTo.id).update({
            parents: firebase.firestore.FieldValue.arrayUnion(leafRef.id)
        })

        location.reload();
    })
    .catch((err) => {
        console.log("There was an error creating the new leaf");
        console.log(err.message);
    });
}

const addChild = (e) => {
    let addChildTo = getDocFromDetailsPanelId(true);
    console.log(`I'm finna add a child to ${addChildTo.id}`);

    let parentArray = [addChildTo.id];
    let siblingsArray = [];

    if (addChildTo.data().spouses) {
        for (spouseId of Object.keys(addChildTo.data().spouses)) {
            parentArray.push(spouseId);
        }
    }

    if (addChildTo.data().children) {
        for (childId of addChildTo.data().children) {
            siblingsArray.push(childId);
        }
    }

    currentTreeLeafCollectionRef.add(
        newLeafForFirebase({
            "siblings": siblingsArray,
            "parents": parentArray
        })
    )
    .then((newChildRef) => {
        for (parentId of parentArray) {
            currentTreeLeafCollectionRef.doc(parentId).update({
                "children": firebase.firestore.FieldValue.arrayUnion(newChildRef.id)
            })
            .then(() => {
                console.log(`${parentId} has a new child: ${newChildRef.id}`)
            })
            .catch(err => {
                console.log(err.message);
            })
        }
        if (siblingsArray.length > 0) {
            for (siblingId of siblingsArray) {
                currentTreeLeafCollectionRef.doc(siblingId).update({
                    "siblings": firebase.firestore.FieldValue.arrayUnion(newChildRef.id)
                })
                .then(() => {
                    console.log(`${siblingId} has a new sibling: ${newChildRef.id}`)
                })
                .catch(err => {
                    console.log(err.message);
                })
            }
        }
        location.reload();
    })
}

const addSpouse = (e) => {
    let addSpouseTo = getDocFromDetailsPanelId(true);
    let spouseArray = [];

    if (addSpouseTo.data().spouses) {
        for (spouseId of Object.keys(addSpouseTo.data().spouses)) {
            spouseArray.push(spouseId);
        }
    }

    let spouseObject = {};
    let childrenArray = [];

    spouseObject[addSpouseTo.id] = null;

    if (addSpouseTo.data().children) {
        for (childId of addSpouseTo.data().children) {
            childrenArray.push(childId);
        }
    }

    if (spouseArray && spouseArray.length > 0) {
        for (spouseId of spouseArray) {
            spouseObject[`${spouseId}`] = null;
        }
    }

    currentTreeLeafCollectionRef.add(
        newLeafForFirebase({
            "spouses": spouseObject,
            "children": childrenArray
        })
    ).then(newSpouseDoc => {
        console.log(`${newSpouseDoc.id} was successfully created!`)
        currentTreeLeafCollectionRef.doc(addSpouseTo.id).update({
            [`spouses.${newSpouseDoc.id}`] : null
        })
        .then(() => {
            console.log(`${newSpouseDoc.id} was added as a spouse to ${addSpouseTo.id}`)

            if (childrenArray.length > 0) {
                for (childId of childrenArray) {
                    currentTreeLeafCollectionRef.doc(childId).update({
                        "parents" : firebase.firestore.FieldValue.arrayUnion(childId)
                    })
                    .then(() => {
                        console.log(`${childId} has a new parent: ${newSpouseDoc.id}`)
                    })
                    .catch(err => {
                        console.log(err.message)
                    })
                }
            }
            
            if (addSpouseTo.data().spouses) {
                for (spouseId of spouseArray) {
                    console.log(`Adding newSPouse to ${spouseId}`);
                    currentTreeLeafCollectionRef.doc(spouseId).update({
                        [`spouses.${newSpouseDoc.id}`]: null
                    })
                    .then(() => {
                        console.log("Spouse successfully added")
                    })
                    .catch(err => {
                        console.log(`Spouse not added`);
                        console.log(err.message);
                    })
                }
            }
            location.reload();
        })
        .catch(err => {
            console.log(err.message)
        })
    })
}

const addSibling = (e) => {
    let addSiblingTo = getDocFromDetailsPanelId(true);
    console.log(`I'm finna add a sibling to ${addSiblingTo.id}`);

    let parentArray = [];
    let siblingArray = [addSiblingTo.id];

    if (addSiblingTo.data().siblings) {
        for (siblingId of addSiblingTo.data().siblings) {
            siblingArray.push(siblingId);
        }
    }

    if (addSiblingTo.data().parents) {
        for (parentId of addSiblingTo.data().parents) {
            parentArray.push(parentId);
        }
    }

    currentTreeLeafCollectionRef.add(
        newLeafForFirebase({
            "siblings": siblingArray,
            "parents": parentArray
        })
    )
    .then((newSiblingRef) => {
        for (siblingId of siblingArray) {
            currentTreeLeafCollectionRef.doc(siblingId).update({
                "siblings" : firebase.firestore.FieldValue.arrayUnion(newSiblingRef.id)
            })
            .then(() => {
                console.log(`${siblingId} has added ${newSiblingRef.id} as a sibling.`)
            })
            .catch(err => {
                console.log(err.message);
            })
        }

        if (parentArray.length > 0) {
            for (parentId of parentArray) {
                currentTreeLeafCollectionRef.doc(parentId).update({
                    "children" : firebase.firestore.FieldValue.arrayUnion(newSiblingRef.id)
                })
                .then(() => {
                    console.log(`${parentId} has added ${newSiblingRef.id} as a sibling.`)
                })
                .catch(err => {
                    console.log(err.message);
                })
            }
        }
        location.reload();
    })
    .catch(err => {
        console.log(err.message);
    })

    // Get your siblings and add them as siblings to the newSibling
    // add newSibilng to your siblings
    // If you have parent(s), add newSibling as a child
}

const removeActiveLeafClass = () => {
    let activeLeaf = document.querySelector(".leaf.active");

    if (activeLeaf) {
        activeLeaf.classList.remove("active");
    };
}

const showDetailPanels = (show) => {
    closeAllDropdowns();
    detailsPanelInfo.classList.remove("u-d_none");
    detailsPanelEdit.classList.add("u-d_none");
    detailsPanelEdit.innerHTML = '';
    detailsPanelAction.classList.remove("u-d_none");

    if (show) {
        mainContent.classList.add("showDetails");
    } else {
        mainContent.classList.remove("showDetails");
        removeActiveLeafClass();
    }
}

document.addEventListener('keydown', function(event) {
    const key = event.key; // Or const {key} = event; in ES6+
    if (key === "Escape") {
       showDetailPanels(false);
    }
});

for (let closeButton of document.querySelectorAll(".details__button--close")) {
    closeButton.addEventListener('click', (e) => {
        showDetailPanels(false);
    })
}

const generateLines = () => {
    let spousesElArray = document.querySelectorAll(".spouses");

    for (spouseContainer of spousesElArray) {
        if (spouseContainer.childNodes.length > 1) {
            createLine(spouseContainer, spouseContainer.childNodes[0], spouseContainer.childNodes[1]);
        }
    }
}

const createLine = (branch, element1, element2)  => {
    return;
    // let e1_box = element1.getBoundingClientRect();
    // let e2_box = element2.getBoundingClientRect();

    // console.log(e1_box);
    // console.log(e2_box);

    // let e1_x = (e1_box.width / 2) + e1_box.x;
    // let e1_y = (e1_box.height / 2) + e1_box.y;

    // let e2_x = (e2_box.width / 2) + e2_box.x;
    // let e2_y = (e2_box.height / 2) + e2_box.y;

    // let midpoint = (e2_box.y + e2_box.x) / 2;

    if ( branch.nextSibling.classList.contains("descendants") ) {
        let parentToChildMiddleBar = document.createElement("div");
        parentToChildMiddleBar.setAttribute("class", 'parentToChild__middleBar connectorLine');
        branch.nextSibling.insertAdjacentElement('afterbegin', parentToChildMiddleBar);

        let childLeaves = branch.nextSibling.querySelectorAll(".leaf");

        if (childLeaves.length > 1) {
            for (childLeaf of childLeaves) {
                let childToParentMiddleBar = document.createElement("div");
                childToParentMiddleBar.setAttribute("class", 'childToParent__middleBar connectorLine');
                childLeaf.insertAdjacentElement('afterbegin', childToParentMiddleBar);
            }
        } else {
            console.log("no child leaves");
        }
    }


    let spouseLine = document.createElement("div");
    spouseLine.setAttribute("class", 'spouseToSpouse__line connectorLine');

    let spouseToChildren = document.createElement("div");
    spouseToChildren.setAttribute("class", 'parentToChildren__downLine connectorLine');
    // let spouseLine = document.createElement("div");
    // spouseLine.setAttribute("class", 'spouseLine');

//     let svg = `
//     <svg height="210" width="500" class="spouseLine">
//         <polyline points="
//             ${0},${0}
//             ${e2_x},${e2_y}
//         "
//         fill="none" stroke="black" />
//     </svg>
//   `

    // let svg = document.createElement("svg");
    // let polyline = document.createElement("polyline");

    // polyline.setAttribute("points", `${e1_x},${e1_y} ${e2_x},${e2_y}`);
    // polyline.setAttribute("fill", `none`);
    // polyline.setAttribute("stroke", `black`);

    // svg.setAttribute("class", `spouseLine`);
    // svg.setAttribute("width", `100`);
    // svg.setAttribute("height", `100`);

    // svg.appendChild(polyline);

    // familyTree.appendChild(svg);
    branch.appendChild(spouseLine);
    branch.appendChild(spouseToChildren);
}

initiateModals();
initiateDropdowns();
