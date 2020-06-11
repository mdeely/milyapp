const auth = firebase.auth();
const db = firebase.firestore();
const functions = firebase.functions();
const storage = firebase.storage();

const urlForPhotos = "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/";

const membersRef = db.collection('members');
const treesRef = db.collection('trees');
const notificationsRef = db.collection('notifications');

const addParentButton = document.querySelector("#add-parent-action");
const addChildButton = document.querySelector("#add-child-action");
const addPartnerButton = document.querySelector("#add-partner-action");
const addSiblingButton = document.querySelector("#add-sibling-action");

const deleteLeafButton = document.querySelector("#delete-leaf-action");
// const removeMemberFromTreeButton = document.querySelector("#remove-member-from-tree-action");

// const editMemberButton = document.querySelector("#edit-member-action");

const dataViews = document.querySelectorAll(`[data-view]`);
const listTable = document.querySelector("#listTable");

const treeBlueprint = {
    "Permissions" : { "dataPath" : "permissions", "defaultValue" : {} },
    "Created by" : { "dataPath" : "created_by", "defaultValue" : null },
    "Name" : { "dataPath" : "name", "defaultValue" : null }
}

const familyTreeEl = document.querySelector("#familyTree");
const mainContent = document.querySelector("#mainContent");
const branchContainer = document.querySelector("#branchContainer");

const detailsPanel = mainContent.querySelector("#detailsPanel");
const detailsPanelInfo = detailsPanel.querySelector(".detailsPanel__information");
const detailsPanelEdit = detailsPanel.querySelector("#detailsPanel__edit");
const detailsPanelAction = detailsPanel.querySelector(".detailsPanel__actions");

const detailsPanelMetaData = detailsPanel.querySelector(".detailsPanel__metaData");
const detailsPanelImmediateFamily = detailsPanel.querySelector(".detailsPanel__immediateFamily");
const detailsPanelFirstName = detailsPanel.querySelector(".detailsPanel__firstName");
const detailsPanelFullName = detailsPanel.querySelector(".detailsPanel__fullName");
const detailsPanelProfileImage = detailsPanel.querySelector(".detailsPanel__profileImage");

const renameTreeForm = document.querySelector("#rename-tree_form");
const editTreeForm = document.querySelector("#edit-tree_form");
const inviteMembersToTreeForm = document.querySelector("#invite-members-to-tree_form");

const signUpButton = document.querySelector("#sign-up_button");
const logInButton = document.querySelector("#log-in_button");
const googleLogInButton = document.querySelector("#google-sign-up_button");
const microsoftLogInButton = document.querySelector("#microsoft-sign-up_button");
const accountMenuButton = document.querySelector("#accountMenu");
// const searchButton = document.querySelector("#search_button");
const viewPreferencesButton = document.querySelector("#view-preferences_button");

const navLogo = document.querySelector("#mainNav_logo");
const navProfileImage = document.querySelector(".mainNav__profile-image");

let hideWhenAuthenticated = [signUpButton, logInButton];
let showWhenAuthenticated = [accountMenuButton, viewPreferencesButton];

const pageTitle = document.querySelector("#pageTitle")

const excludedDetails = ["children", "parents", "siblings", "partners", "topMember", "claimed_by", "created_by", "profile_photo"];
const excludedCategories = ["Name", "Address"];

const placeholderImageUrl = "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder.svg?alt=media&token=d3b939f1-d46b-4315-bcc6-3167d17a18ed";

const availablePermissions = {
    "Admin" : "admin",
    "Contributor" : "contributor",
    "Viewer" : "viewer"
};
// document.querySelector(".view-preferences_zoomIn").addEventListener('click', (e) => {
//     console.log("zoom in");
// });

// document.querySelector(".view-preferences_zoomOut").addEventListener('click', (e) => {
//     console.log("zoom out");
// });


///////

let Leaf = {};

Leaf.removeActive = function() {
  let activeLeaf = document.querySelector(".leaf.active");

  if (activeLeaf) {
      activeLeaf.classList.remove("active");
  };
}

Leaf.setActive = function(el) {
    if (el.classList.contains("active")) {
        el.classList.remove("active");
        DetailsPanel.close();
    } else {
        Leaf.removeActive();
        el.classList.add("active");
    }
}


///////


let DetailsPanel = {};

DetailsPanel.show = function(docId = null) {
    mainContent.classList.add("showDetails");
    detailsPanel.scrollTop = 0;
}

DetailsPanel.close = function() {
    mainContent.classList.remove("showDetails");
    Leaf.removeActive();
    closeAllDropdowns();
}

DetailsPanel.getLeafDoc = function() {
    let leafId = detailsPanel.getAttribute("data-details-id");
    doc = LocalDocs.getLeafById(leafId);

    return doc;
}

DetailsPanel.getActiveDoc = function() {
    let memberId = detailsPanel.getAttribute("data-member-details-id");
    let leafId = detailsPanel.getAttribute("data-details-id");
    let doc = null;

    if (memberId) {
        doc = LocalDocs.getMemberById(memberId);
    } else {
        doc = LocalDocs.getLeafById(leafId);
    }

    return doc;
    // return window.currentTreeLeaves.find(leafDoc => leafDoc.id === id);
}

DetailsPanel.populate = function(leafDoc, leafEl) {
    let dataSource = leafDoc.data();
    let detailsPhoto = leafEl.querySelector(".leaf__image").getAttribute("style");
    let memberPermissionType = authLeafPermissionType();
    let table = document.createElement("table");
    
    let detailsHeaderEl = createElementWithClass("h6", "u-mar-b_2 u-mar-t_8 u-d_flex u-ai_center");
    let editDetailsAnchor = createElementWithClass("button", "u-mar-l_auto iconButton white");
    let pencilIcon = createElementWithClass("i", "fal fa-pencil-alt");

    detailsHeaderEl.textContent = "Details"
    editDetailsAnchor.setAttribute("tooltip", "Edit");

    editDetailsAnchor.appendChild(pencilIcon);
    editDetailsAnchor.addEventListener('click', (e) => {
        DetailsPanel.editMember();
        closeAllDropdowns();
    })

    if (leafDoc && leafDoc.data().claimed_by) {
        reqMemberDoc = LocalDocs.members.find(memberDoc => memberDoc.id === leafDoc.data().claimed_by);
        dataSource = reqMemberDoc ? reqMemberDoc.data() : dataSource ;
    }

    detailsPanelMetaData.textContent = '';
    detailsPanelImmediateFamily.textContent = '';
    detailsPanelFirstName.textContent = dataSource.name.firstName ? dataSource.name.firstName : "No name";
    detailsPanelFullName.textContent = createFullName(leafDoc);
    detailsPanel.setAttribute("data-details-id", leafDoc.id);
    detailsPanelProfileImage.setAttribute("style", detailsPhoto);

    // claimed leafs can always edit themselves
    // members can add if they are an admin or contributor
    // members can remove if they are an admin or a contributor+creator of a leaf
    
    if (memberPermissionType === "admin" || memberPermissionType === "contributor") {
        inviteMemberButton.classList.remove("u-d_none");
        // editMemberButton.classList.remove("u-d_none");
        addRelationshipButton.classList.remove("u-d_none");
        deleteLeafButton.classList.remove("u-d_none");
        detailsHeaderEl.classList.remove("u-d_none");

        if (leafDoc.data().topMember === true) {
            addParentButton.classList.remove("u-d_none");
        } else {
            addParentButton.classList.add("u-d_none");
        }

        if (memberPermissionType === "contributor") {
            if (leafDoc.data().created_by === LocalDocs.member.id) {
                deleteLeafButton.classList.remove("u-d_none");
            } else {
                deleteLeafButton.classList.add("u-d_none");
            }
        }
        if (!leafDoc.data().claimed_by) {
            detailsHeaderEl.appendChild(editDetailsAnchor);
        } else {
            deleteLeafButton.classList.add("u-d_none");
        }

    } else if (memberPermissionType === "viewer" || !memberPermissionType)  {
        console.log("I'm a viewers")
        addParentButton.classList.add("u-d_none")
        inviteMemberButton.classList.add("u-d_none");
        deleteLeafButton.classList.add("u-d_none");
        // editMemberButton.classList.add("u-d_none");
        addRelationshipButton.classList.add("u-d_none");
    }

    if (leafDoc.data().claimed_by) {
        // editMemberButton.classList.add("u-d_none");
        inviteMemberButton.classList.add("u-d_none");
        detailsPanel.setAttribute("data-details-member-id", leafDoc.data().claimed_by);

        if (leafDoc.data().claimed_by === LocalDocs.member.id) {
            // editMemberButton.classList.remove("u-d_none");
            detailsHeaderEl.classList.remove("u-d_none");
            detailsHeaderEl.appendChild(editDetailsAnchor);
        }
    } else {
        detailsPanel.removeAttribute("data-details-member-id");
    }

    if (leafDoc.data().invitation) {
        inviteMemberButton.classList.add("u-d_none");
    }

    // const detailsHeader =`<h6 class="u-mar-b_2 u-mar-t_8 u-d_flex u-ai_center">Details<a href="#" class="u-mar-l_auto iconButton white"><i class="fal fa-pencil-alt"></i></a></h6>`;

    let hasDetails = false;

    MemberBlueprint.loop({
        "exclude" : ["profile_photo"],
        "functionCall": generateDetailElement
    });

    // detailsPanelMetaData.insertAdjacentHTML("afterBegin", detailsHeader);
    detailsPanelMetaData.prepend(detailsHeaderEl);

    if (!hasDetails) {
        const detailsNoInfo =`<p class="u-italic u-text_lowest u-font-size_13">No details provided</p>`;
        detailsPanelMetaData.insertAdjacentHTML("beforeEnd", detailsNoInfo);
        // detailsPanelMetaData.innerHTML += detailsNoInfo;
    }

    MemberBlueprint.loop({
        "onlyRelationships" : true,
        "functionCall": generateImmediateFamilyElement
    });

    function generateDetailElement(key, value, parentValue = null) {
        let reqName = value["dataPath"];
        let reqParentName = parentValue ? parentValue["dataPath"] : null;
        let reqIcon = value["icon"];
        let data;

        if (reqParentName) {
            data = dataSource[reqParentName][reqName] ? dataSource[reqParentName][reqName] : null;
        } else {
            data = dataSource[reqName] ? dataSource[reqName] : null;
        }

        if (data && !key.includes("name")) {
            hasDetails = true;
        }

        if (key.includes("phone")) {
            data = formatPhoneNumber(data);
        }

        if (data) {
            if (data && reqName === "birthday" || reqName === "deathdate") {
                data = convertBirthday(data);
            }
    
            let infoEl = `<div class="detailsPanel__item detailsPanel__${reqName} u-mar-b_3" tooltip-reveal="fast" tooltip="${key}" tooltip-position="top left"><i class="fal fa-${reqIcon} detailsPanel__icon u-mar-r_2"></i>${data}</div>`
    
            if (reqParentName === "address") {
                // add to address element
            } else if (reqParentName !== 'name') {
                detailsPanelMetaData.innerHTML += infoEl;
            }
        }
    };

    function generateImmediateFamilyElement(key, value, parentValue) {
        let relativeType = value["dataPath"];
        let docDataPath = leafDoc.data()[relativeType] ? leafDoc.data()[relativeType] : null;
                
        if (relativeType === "partners") {
            if ( docDataPath && Object.keys(docDataPath).length > 0 ) {
                let relationshipHeader = document.createElement('h6');

                if (docDataPath && Object.keys(docDataPath).length === 1) {
                    singular = relativeType.slice(0, -1); 
                    relationshipHeader.textContent = `${singular}`;
                } else {
                    relationshipHeader.textContent = `${relativeType}`;
                }
                relationshipHeader.setAttribute("class", "u-mar-t_6 u-mar-b_2");
                detailsPanelImmediateFamily.appendChild(relationshipHeader);
                for ( let reqId of Object.keys(docDataPath) ) {
                    renderRelationship(reqId);
                }
            }
        } else {
            if (docDataPath && Object.keys(docDataPath).length > 0 ) {
                let relationshipHeader = document.createElement('h6');
                if (docDataPath && Object.keys(docDataPath).length === 1) {
                    if (relativeType === "children") {
                        singular = relativeType.replace("ren", "");
                        relationshipHeader.textContent = `${singular}`;
                    } else {
                        singular = relativeType.slice(0, -1); 
                        relationshipHeader.textContent = `${singular}`;
                    }
                } else {
                    relationshipHeader.textContent = `${relativeType}`;
                }
                relationshipHeader.setAttribute("class", "u-mar-t_6 u-mar-b_2");
                detailsPanelImmediateFamily.appendChild(relationshipHeader);
                for ( let reqId of Object.keys(docDataPath) ) {
                    renderRelationship(reqId);
                }
            }
        }

        function renderRelationship(reqId) {
            let familyLeafDoc = LocalDocs.getLeafById(reqId);
            let familyMemberDoc = null;
            let memberPermissionType = authLeafPermissionType();
            
            // if (familyLeafDoc.data().claimed_by) {
            //     familyMemberDoc = LocalDocs.getMemberDocByIdFromCurrentTree(familyLeafDoc.data().claimed_by);
            // }

            let docData = familyMemberDoc ? familyMemberDoc : familyLeafDoc;

            let firstName = docData.data().name.firstName || "No name";
            let surnameCurrent = docData.data().name.surnameCurrent ? ` ${docData.data().name.surnameCurrent}` : '';
            let label;
            let partnerAction = '';
            let childAction = '';
            let parentAction = '';
            let siblingAction = '';
            let leafEl = document.querySelector(`[data-id="${reqId}"]`);
            let profileImage = leafEl ? leafEl.querySelector(".leaf__image").getAttribute("style") : null;

            if (relativeType === "parents") {
                if (familyLeafDoc.data().children[leafDoc.id] !== null) {
                    let parentType = `${familyLeafDoc.data().children[leafDoc.id]}`;
                    label = `${parentType}`
                    if (parentType.includes("Step")) {
                        label = "Step-parent"
                    } else {
                        label = `${parentType}`
                    }
                } else {
                    label = ``
                }

                if (memberPermissionType === "admin" || memberPermissionType === "contributor") {
                        parentAction = `<button class="iconButton white u-mar-l_auto" tooltip="Options" tooltip-position="top middle" data-dropdown-target="parent_options_menu__${familyLeafDoc.id}">
                        <i class="fal fa-ellipsis-h"></i>
                    </button>
                    <div id="parent_options_menu__${familyLeafDoc.id}" class="dropdown u-visibility_hidden u-p_fixed">
                        <div class="dropdown__item" data-value="Biological">Biological</div>
                        <div class="dropdown__item" data-value="Step">Step-parent</div>
                        <div class="dropdown__item" data-value="Unrelated">Unrelated</div>
                        <div class="dropdown__item u-o_50" data-value="reset">Unset</div>
                    </div>`
                }
            } else if (relativeType === "children") {
                if (familyLeafDoc.data().parents[leafDoc.id] !== null) {
                    let childType = familyLeafDoc.data().parents[leafDoc.id];
                    if (childType.includes("Step")) {
                        label = "Step-child"
                    } else {
                        label = `${childType}`
                    }
                } else {
                    label = ``
                }
                if (memberPermissionType === "admin" || memberPermissionType === "contributor") {
                    if (memberPermissionType !== "contributor" && familyLeafDoc.data().created_by === LocalDocs.member.id) {
                        
                    }
                        childAction = `<button class="iconButton white u-mar-l_auto" tooltip="Options" tooltip-position="top middle" data-dropdown-target="child_options_menu__${familyLeafDoc.id}">
                        <i class="fal fa-ellipsis-h"></i>
                    </button>
                    <div id="child_options_menu__${familyLeafDoc.id}" class="dropdown u-visibility_hidden u-p_fixed">
                        <div class="dropdown__item" data-value="Adopted">Adopted</div>
                        <div class="dropdown__item" data-value="Biological">Biological</div>
                        <div class="dropdown__item" data-value="Step">Step-child</div>
                        <div class="dropdown__item" data-value="Unrelated">Unrelated</div>
                        <div class="dropdown__item u-o_50" data-value="reset">Unset</div>
                    </div>`
                }
            } else if (relativeType === "siblings") {
                if (familyLeafDoc.data().siblings[leafDoc.id] !== null) {
                    let siblingType = `${familyLeafDoc.data().siblings[leafDoc.id]}`;
                    label = `${siblingType}`
                    if (siblingType.includes("Step")) {
                        label = "Step-sibilng"
                    } else {
                        label = `${siblingType}`
                    }
                } else {
                    label = ``
                }
                if (memberPermissionType === "admin" || memberPermissionType === "contributor") {
                        siblingAction = `<button class="iconButton white u-mar-l_auto" tooltip="Options" tooltip-position="top middle" data-dropdown-target="sibling_options_menu__${familyLeafDoc.id}">
                        <i class="fal fa-ellipsis-h"></i>
                    </button>
                    <div id="sibling_options_menu__${familyLeafDoc.id}" class="dropdown u-visibility_hidden u-p_fixed">
                        <div class="dropdown__item" data-value="Biological">Biological</div>
                        <div class="dropdown__item" data-value="Step">Step</div>
                        <div class="dropdown__item" data-value="Unrelated">Unrelated</div>
                        <div class="dropdown__item u-o_50" data-value="reset">Unset</div>
                    </div>`
                }
            } else if (relativeType === "partners") { 
                let partnerType = familyLeafDoc.data().partners[leafDoc.id] ? familyLeafDoc.data().partners[leafDoc.id] : null;
                if (partnerType && partnerType !== "Unrelated") {
                    let partnerType = familyLeafDoc.data().partners[leafDoc.id];
                    label = `${partnerType}`
                } else {
                    label = ``
                }
                if (memberPermissionType === "admin" || memberPermissionType === "contributor") {
                    partnerAction = `<button class="iconButton white u-mar-l_auto" tooltip="Options" tooltip-position="top middle" data-dropdown-target="partner_options_menu__${familyLeafDoc.id}">
                                        <i class="fal fa-ellipsis-h"></i>
                                    </button>
                                    <div id="partner_options_menu__${familyLeafDoc.id}" class="dropdown u-visibility_hidden u-p_fixed">
                                        <div class="dropdown__item" data-value="Dating">Dating</div>
                                        <div class="dropdown__item" data-value="Engaged">Engaged</div>
                                        <div class="dropdown__item" data-value="Married">Married</div>
                                        <div class="dropdown__item" data-value="Divorced">Divorced</div>
                                        <div class="dropdown__item" data-value="Separated">Separated</div>
                                        <div class="dropdown__item" data-value="Widowed">Widowed</div>
                                        <div class="dropdown__item" data-value="Unrelated">Unrelated</div>
                                        <div class="dropdown__item u-o_50" data-value="reset">Unset</div>
                                    </div>`
                }
            }

            let detailsPanelItem = createElementWithClass("div", "detailsPanel__item u-mar-b_2 u-d_flex u-align-items_center");
            detailsPanelItem.setAttribute("data-leaf-id", familyLeafDoc.id);
            // let detailsPanelImage = createElementWithClass("img", "u-mar-r_2");
            // let detailsPanelText = createElementWithClass("div", "detailsPanel__text", "u-mar-r_2");
            // let detailsPanelName = createElementWithClass("div", "detailsPanel__name u-mar-b_point5 u-bold");
            // let detailsPanelRelativeType = createElementWithClass("div", "detailsPanel__realtiveType");

            // detailsPanelImage.setAttribute("style", profileImage || placeholderImageUrl);
            // detailsPanelName.textContent = firstName;
            // detailsPanelRelativeType.textContent = label;

            let content = `
                        <div class="detailsPanel__img u-mar-r_2" style='${profileImage || placeholderImageUrl}'></div>
                        <div class="detailsPanel__text u-mar-r_2">
                            <div class="detailsPanel__name u-mar-b_point5 u-bold">${firstName}${surnameCurrent}</div> 
                            <div class="detailsPanel__relativeType">${label}</div> 
                        </div>
                        ${partnerAction}${childAction}${parentAction}${siblingAction}`

            detailsPanelItem.innerHTML += content;

            detailsPanelItem.addEventListener("mouseover", (e) => {
                let leafId = detailsPanel.getAttribute("data-details-id");
                let targetSvg = document.querySelector(`svg[data-from-leaf="${leafId}"][data-to-leaf="${familyLeafDoc.id}"]`);

                leafEl.classList.add("highlight");

                if (targetSvg) {
                    targetSvg.classList.add("highlight");
                }
            })

            detailsPanelItem.addEventListener("mouseout", (e) => {
                let leafId = detailsPanel.getAttribute("data-details-id");
                let targetSvg = document.querySelector(`svg[data-from-leaf="${leafId}"][data-to-leaf="${familyLeafDoc.id}"]`);

                leafEl.classList.remove("highlight");

                if (targetSvg) {
                    targetSvg.classList.remove("highlight");
                }
            })

            detailsPanelImmediateFamily.appendChild(detailsPanelItem);

            if (memberPermissionType === "admin" || memberPermissionType === "contributor") {
                if (relativeType === "partners") {
                    initiatePartnerOptions(familyLeafDoc.id);
                }
    
                if (relativeType === "children") {
                    initiateChildOptions(familyLeafDoc.id);
                }
    
                if (relativeType === "parents") {
                    initiateParentOptions(familyLeafDoc.id);
                }

                if (relativeType === "siblings") {
                    initiateSiblingOptions(familyLeafDoc.id);
                }
            }
        }
    }
}

function convertBirthday(data) {
    let options = { year: 'numeric', month: 'long', day: 'numeric' };

    let date = new Date(data.replace(/-/g, '\/'));
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

function initiatePartnerOptions(leafId) {
    let partnerDropdownTrigger = detailsPanelImmediateFamily.querySelector(`[data-leaf-id="${leafId}"] [data-dropdown-target="partner_options_menu__${leafId}"]
    `);
    let partnerOptionEl = detailsPanelImmediateFamily.querySelector(`[data-leaf-id="${leafId}"] #partner_options_menu__${leafId}
    `);
    let partnerOptions = partnerOptionEl.querySelectorAll(".dropdown__item");

    initiateDropdown(partnerDropdownTrigger);

    for (option of partnerOptions) {
        option.addEventListener('click', (e) => {
            e.preventDefault();

            let value = e.target.getAttribute("data-value");

            if (value === "reset") {
                value = null;
            }
            let targetLeafId = DetailsPanel.getLeafDoc().id;

            console.log(value);
            console.log(leafId);
            console.log(targetLeafId);

            currentTreeLeafCollectionRef.doc(leafId).update({
                [`partners.${targetLeafId}`] : value
            })
            .then(() => {
                console.log("First partner updated succesfully");
            })

            currentTreeLeafCollectionRef.doc(targetLeafId).update({
                [`partners.${leafId}`] : value
            })
            .then(() => {
                console.log("Second partner updated succesfully");
                location.reload();
            })


            //////////////////
            //////////////////
            // MD NOTE: THE CODE BELOW IS COMMENTED OUT TO BE ABLE TO RECOVER RELATIONSHIPS THAT MAY BE MARKED AS UNRELATED
            ////////////////
            ////////////////

            // if (value === "Unrelated") {
            //     currentTreeLeafCollectionRef.doc(leafId).update({
            //         [`partners.${targetLeafId}`] : firebase.firestore.FieldValue.delete()
            //     })
            //     .then(() => {
            //         console.log("First partner updated succesfully");
            //     })
    
            //     currentTreeLeafCollectionRef.doc(targetLeafId).update({
            //         [`partners.${leafId}`] : firebase.firestore.FieldValue.delete()
            //     })
            //     .then(() => {
            //         console.log("Second partner updated succesfully");
            //         location.reload();
            //     })
            // } else {
            //     currentTreeLeafCollectionRef.doc(leafId).update({
            //         [`partners.${targetLeafId}`] : value
            //     })
            //     .then(() => {
            //         console.log("First partner updated succesfully");
            //     })
    
            //     currentTreeLeafCollectionRef.doc(targetLeafId).update({
            //         [`partners.${leafId}`] : value
            //     })
            //     .then(() => {
            //         console.log("Second partner updated succesfully");
            //         location.reload();
            //     })
            // }
        })
    }
}
// let microsoftProvider = new firebase.auth.OAuthProvider('microsoft.com');
//   microsoftLogInButton.addEventListener('click', (e) => {
//     e.preventDefault();
//     firebase.auth().signInWithPopup(microsoftProvider)
//     .then(function(result) {
//         console.log(result);
//       // User is signed in.
//       // IdP data available in result.additionalUserInfo.profile.
//       // OAuth access token can also be retrieved:
//       // result.credential.accessToken
//       // OAuth ID token can also be retrieved:
//       // result.credential.idToken
//     })
//     .catch(function(error) {
//         console.log(error);

//       // Handle error.
//     });
//  })

let googleProvider = new firebase.auth.GoogleAuthProvider();

googleLogInButton.addEventListener('click', (e) => {
    e.preventDefault();
    firebase.auth().signInWithPopup(googleProvider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        let token = result.credential.accessToken;
        // The signed-in user info.
        let user = result.user;
        // ...
      }).catch(function(error) {
        // Handle Errors here.
        let errorCode = error.code;
        let errorMessage = error.message;
        // The email of the user's account used.
        let email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        let credential = error.credential;
        // ...
    });
 })

function initiateChildOptions(leafId) {
    let childDropdownTrigger = detailsPanelImmediateFamily.querySelector(`[data-leaf-id="${leafId}"] [data-dropdown-target="child_options_menu__${leafId}"]
    `);

    let childOptionEl = detailsPanelImmediateFamily.querySelector(`[data-leaf-id="${leafId}"] #child_options_menu__${leafId}
    `);
    let childOptions = childOptionEl.querySelectorAll(".dropdown__item");

    initiateDropdown(childDropdownTrigger);

    for (option of childOptions) {
        option.addEventListener('click', (e) => {
            e.preventDefault();

            let value = e.target.getAttribute("data-value");

            if (value === "reset") {
                value = null;
            }
            let parentLeafId = DetailsPanel.getLeafDoc().id;

            console.log(value);
            console.log(leafId);
            console.log(parentLeafId);

            currentTreeLeafCollectionRef.doc(leafId).update({
                [`parents.${parentLeafId}`] : value
            })
            .then(() => {
                console.log("Child updated succesfully");

                currentTreeLeafCollectionRef.doc(parentLeafId).update({
                    [`children.${leafId}`] : value
                })
                .then(() => {
                    console.log("Parent updated succesfully");
                    location.reload();
                })
            })
        })
    }
}

function formatPhoneNumber(phoneNumberString) {
    var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
    var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      var intlCode = (match[1] ? '+1 ' : '')
      return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('')
    }
    return null
  }

function initiateParentOptions(leafId) {
    let parentDropdownTrigger = detailsPanelImmediateFamily.querySelector(`[data-leaf-id="${leafId}"] [data-dropdown-target="parent_options_menu__${leafId}"]
    `);

    let parentOptionEl = detailsPanelImmediateFamily.querySelector(`[data-leaf-id="${leafId}"] #parent_options_menu__${leafId}
    `);
    let parentOptions = parentOptionEl.querySelectorAll(".dropdown__item");

    initiateDropdown(parentDropdownTrigger);

    for (option of parentOptions) {
        option.addEventListener('click', (e) => {
            e.preventDefault();

            let value = e.target.getAttribute("data-value");

            if (value === "reset") {
                value = null;
            }
            let childLeafId = DetailsPanel.getLeafDoc().id;

            console.log(value);
            console.log(leafId);
            console.log(childLeafId);

            currentTreeLeafCollectionRef.doc(leafId).update({
                [`children.${childLeafId}`] : value
            })
            .then(() => {    
                currentTreeLeafCollectionRef.doc(childLeafId).update({
                    [`parents.${leafId}`] : value
                })
                .then(() => {
                    location.reload();
                })
            })

            //////////////////
            //////////////////
            // MD NOTE: THE CODE BELOW IS COMMENTED OUT TO BE ABLE TO RECOVER RELATIONSHIPS THAT MAY BE MARKED AS UNRELATED
            ////////////////
            ////////////////

            // if (value === "Unrelated") {
            //     currentTreeLeafCollectionRef.doc(leafId).update({
            //         [`children.${childLeafId}`] : firebase.firestore.FieldValue.delete()
            //     })
            //     .then(() => {    
            //         currentTreeLeafCollectionRef.doc(childLeafId).update({
            //             [`parents.${leafId}`] : firebase.firestore.FieldValue.delete()
            //         })
            //         .then(() => {
            //             location.reload();
            //         })
            //     })
            // } else {
            //     currentTreeLeafCollectionRef.doc(leafId).update({
            //         [`children.${childLeafId}`] : value
            //     })
            //     .then(() => {    
            //         currentTreeLeafCollectionRef.doc(childLeafId).update({
            //             [`parents.${leafId}`] : value
            //         })
            //         .then(() => {
            //             location.reload();
            //         })
            //     })
            // }

        })
    }
}

function initiateSiblingOptions(leafId) {
    let siblingDropdownTrigger = detailsPanelImmediateFamily.querySelector(`[data-leaf-id="${leafId}"] [data-dropdown-target="sibling_options_menu__${leafId}"]
    `);

    let siblingOptionEl = detailsPanelImmediateFamily.querySelector(`[data-leaf-id="${leafId}"] #sibling_options_menu__${leafId}
    `);
    let siblingOptions = siblingOptionEl.querySelectorAll(".dropdown__item");

    initiateDropdown(siblingDropdownTrigger);

    for (option of siblingOptions) {
        option.addEventListener('click', (e) => {
            e.preventDefault();

            let value = e.target.getAttribute("data-value");

            if (value === "reset") {
                value = null;
            }
            let siblingLeafId = DetailsPanel.getLeafDoc().id;

            currentTreeLeafCollectionRef.doc(leafId).update({
                [`siblings.${siblingLeafId}`] : value
            })
            .then(() => {
                console.log("Sibling #1 updated succesfully");

                currentTreeLeafCollectionRef.doc(siblingLeafId).update({
                    [`siblings.${leafId}`] : value
                })
                .then(() => {
                    console.log("Sibling #2 updated succesfully");
                    location.reload();
                })
            })
        })
    }
}


function createFullName(leafDoc) {
    let memberDoc = null;

    if (leafDoc.data().claimed_by) {
        memberDoc = LocalDocs.getMemberDocByIdFromCurrentTree(leafDoc.data().claimed_by);
    }

    let docData = memberDoc ? memberDoc : leafDoc;

    let fullName;
    let firstName = docData.data().name.firstName ? docData.data().name.firstName : null;
    let middleName = docData.data().name.middleName ? docData.data().name.middleName : null;
    let nickname = docData.data().name.nickname ? docData.data().name.nickname : null;
    let surnameCurrent = docData.data().name.surnameCurrent ? docData.data().name.surnameCurrent : null;

    if (firstName && !middleName && !nickname && !surnameCurrent) {
        // if only firstName
        fullName = ``;
    } else if (firstName && middleName && !nickname && !surnameCurrent) {
        // if only middle name
        fullName = `Middle name: ${middleName}`;
    } else if (!firstName && !middleName && !nickname && surnameCurrent) {
        // if only last name
        fullName = ``;
    } else if (firstName && middleName && !nickname && surnameCurrent) {
        // if only firstname, surnameCurrent, and middlename
        fullName = `${firstName} ${middleName} ${surnameCurrent}`;
    } else if (firstName && !middleName && nickname && !surnameCurrent) {
        // if only last name
        fullName = `Nickname: ${nickname}`;
    } else if (firstName && !middleName && !nickname && surnameCurrent) {
        // if firstname AND surnameCurrent
        fullName = `${surnameCurrent}`;
    } else if (firstName && !middleName && nickname && surnameCurrent) {
        // if firstname AND surnameCurrent
        fullName = `${firstName} (${nickname}) ${surnameCurrent}`;
    } else if (!firstName && !middleName && !nickname && !surnameCurrent) {
        // if none
        fullName = ``;
    } else {
        // anything else
        fullName = `${firstName} (${nickname}) ${middleName} ${surnameCurrent}`;
    }

    return fullName;
}

function createElementWithClass(elementType, classname = null, content = null) {
    let el = document.createElement(elementType);

    if (classname) {
        el.setAttribute("class", classname);
    }

    if (content) {
        el.textContent = content;
    }

    return el;
}

DetailsPanel.editMember = function() {
    detailsPanelEdit.innerHTML = '';
    detailsPanel.scrollTop = 0;

    let reqEditDoc = DetailsPanel.getLeafDoc();
    let reqEditDocData = reqEditDoc.data();
    let memberDoc = null;
    let header = `<h2 class="u-mar-t_4 u-mar-b_4">Edit details</h2>`

    if (reqEditDocData.claimed_by) {
        memberDoc = LocalDocs.getMemberDocByIdFromCurrentTree(reqEditDocData.claimed_by);
    }

    let docData = memberDoc ? memberDoc.data() : reqEditDocData;

    detailsPanelAction.classList.add("u-d_none");
    detailsPanelInfo.classList.add("u-d_none");
    detailsPanelEdit.classList.remove("u-d_none");

    MemberBlueprint.loop({
        "functionCall" : createMemberInput
    });

    function createMemberInput(key, value, parentValue) {
        let inputType = value.dataType ? value.dataType : "text";
        let data = '';
        let backgroundImageStyle;
        let leafElement;

        if (parentValue) {
            data = docData[parentValue.dataPath][value.dataPath] || data;
        } else {
            data = docData[value.dataPath] || data;;
        }

        if (value.dataPath === "profile_photo") {
            leafElement = document.querySelector(`[data-id="${reqEditDoc.id}"] .leaf__image`);
            backgroundImageStyle = leafElement.style.backgroundImage ? `style='background-image: ${leafElement.style.backgroundImage}'` : null
        }

        let isChecked;
        // if (value.dataPath === "deceased" && docData[value.dataPath] === true) {
        //     isChecked = "checked";
        // }

        let inputGroup = `<div class="inputGroup">
                                <label>${key}</label>
                                <input class="detailsEditInput__${value.dataPath}" type="${inputType}" name="${value.dataPath}" value="${data}" ${backgroundImageStyle}" ${isChecked}>
                            </div>`
    
        detailsPanelEdit.innerHTML += inputGroup;
    }

    let buttonGroup = document.createElement('div');
    let saveButton = document.createElement("button");
    let cancelButton = document.createElement("button");

    saveButton.textContent = "Save";
    saveButton.setAttribute("class", "u-w_full u-mar-b_1")
    saveButton.setAttribute("type", "submit");

    cancelButton.textContent = "Cancel";
    cancelButton.setAttribute("class", "u-w_full button secondary")
    cancelButton.setAttribute("href", "#");

    let ref;
    let docId;

    if (memberDoc) {
        ref = membersRef;
        docId = memberDoc.id;
    } else {
        ref = currentTreeLeafCollectionRef;
        docId = reqEditDoc.id;
    }

    saveButton.addEventListener("click", (e) => {
        e.preventDefault();

        console.log(`TODO: Profile images are setting to null on the member when updating a claimed leaf`);

        if (detailsPanelEdit["profile_photo"].files.length == 0) {
            // No photo to upload
            let photoFile = reqEditDoc.data().profile_photo;
            if (memberDoc) {
                photoFile = memberDoc.data().profile_photo;
            }
            goUpdateDoc(photoFile);
        } else {
            // Photo to upload
            let uploadedPhotoFile = detailsPanelEdit["profile_photo"].files[0];
            let fileName = uploadedPhotoFile.name;
            let profilePhotoRef;

            if (memberDoc) {
                profilePhotoRef = storageRef.child(`members/${memberDoc.id}/${fileName}`);
            } else {
                profilePhotoRef = storageRef.child(`trees/${LocalDocs.tree.id}/${reqEditDoc.id}/${fileName}`);
            }

            profilePhotoRef.put(uploadedPhotoFile).then(function(snapshot) {
                ref.doc(docId).update({
                    "profile_photo" : snapshot.metadata.fullPath
                })
                .then(() => {
                    goUpdateDoc(snapshot.metadata.fullPath);
                })
                .catch(err => {
                    console.log(err.message);
                })
            });
        }

        function goUpdateDoc(photoFile = null) {
            ref.doc(docId).update({
                "name" : {
                    "firstName" : detailsPanelEdit["firstName"].value,
                    "surnameCurrent" : detailsPanelEdit["surnameCurrent"].value,
                    "middleName" : detailsPanelEdit["middleName"].value,
                    "surnameBirth" : detailsPanelEdit["surnameBirth"].value,
                    "nickname" : detailsPanelEdit["nickname"].value,
                    "phonetic" : detailsPanelEdit["phonetic"].value,
                },
                "address" : {
                    "address1" : detailsPanelEdit["address1"].value,
                    "address2" : detailsPanelEdit["address2"].value,
                    "city" : detailsPanelEdit["city"].value,
                    "zipcode" : detailsPanelEdit["zipcode"].value,
                    "country" : detailsPanelEdit["country"].value,
                },
                "phone" : {
                    "homePhone" : detailsPanelEdit["homePhone"].value,
                    "mobilePhone" : detailsPanelEdit["mobilePhone"].value,
                    "workPhone" : detailsPanelEdit["workPhone"].value,
                },
                "website" : detailsPanelEdit["website"].value,
                "birthday" : detailsPanelEdit["birthday"].value,
                "deathdate" : detailsPanelEdit["deathdate"].value,
                "profile_photo" : photoFile,
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
        }
    });

    cancelButton.addEventListener("click", (e) => {
        e.preventDefault();
        detailsPanel.scrollTop = 0;
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
    detailsPanelEdit.insertAdjacentHTML("afterBegin", header);


    // add save/cancel action
    // turn all information into inputs
}

let MemberBlueprint = {};

MemberBlueprint.object = {
    "Name" : { "dataPath" : "name", "icon" : "user", 
                "defaultValue" : {
                    "First name" : { "dataPath" : "firstName", "defaultValue" : null, "icon" : "user" },
                    "Middle name" : { "dataPath" : "middleName", "defaultValue" : null, "icon" : "user" },
                    "Surname (current)" : { "dataPath" : "surnameCurrent", "defaultValue" : null, "icon" : "user" },
                    "Surname (at birth)" : { "dataPath" : "surnameBirth", "defaultValue" : null, "icon" : "user" },
                    "Nickname" : { "dataPath" : "nickname", "defaultValue" : null, "icon" : "user" },
                    "Phonetic" : { "dataPath" : "phonetic", "defaultValue" : null, "icon" : "user" }
                }
            },
    "Email" : { "dataPath" : "email", "defaultValue" : null, "icon" : "envelope" },
    "Website" : { "dataPath" : "website", "defaultValue" : null, "icon" : "link"},
    "Phone" : { "dataPath" : "phone", "icon" : "phone", 
                "defaultValue" : {
                    "Home phone" : { "dataPath" : "homePhone", "defaultValue" : null, "icon" : "phone", "dataType": "tel" },
                    "Mobile phone" : { "dataPath" : "mobilePhone", "defaultValue" : null, "icon" : "mobile-alt", "dataType": "tel" },
                    "Work phone" : { "dataPath" : "workPhone", "defaultValue" : null, "icon" : "building", "dataType": "tel" },
                }
            },
    "Birthday" : { "dataPath" : "birthday", "defaultValue" : null, "icon" : "birthday-cake", "dataType": "date" },
    "Death date" : { "dataPath" : "deathdate", "defaultValue" : null, "icon" : "hand-peace", "dataType": "date" },
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
    "Children" : { "dataPath" : "children", "defaultValue" : {} },
    "Parents" : { "dataPath" : "parents", "defaultValue" : {} },
    "Siblings" : { "dataPath" : "siblings", "defaultValue" : {} },
    "Partners" : { "dataPath" : "partners", "defaultValue" : {} },
    "Top Member" : { "dataPath" : "topMember", "defaultValue" : false },
    "Claimed by" : { "dataPath" : "claimed_by", "defaultValue" : null },
    "Created by" : { "dataPath" : "created_by", "defaultValue" : null },
    "Profile photo" : { "dataPath" : "profile_photo", "icon" : "picture", "defaultValue" : null , "dataType": "file"},
}

MemberBlueprint.loop = function(args) {
    let exclude = args.exclude || [];
    let functionCall = args.functionCall;
    let relationships = ["children", "parents", "siblings", "partners"];
    let metaDetails = ["claimed_by", "topMember", "created_by", ];
    let basicDetails = ["email", "birthday", "occupation", "profile_photo", "facebook", "instagram", "website"];
    let groups = ["name", "address", "phone"];
    let groupDetails = ["firstName", "middleName", "surnameCurrent", "nickname", "surnameBirth", "homePhone", "mobilePhone", "workPhone", "address1", "address2", "city", "zipcode", "country"];

    let excludeItems = new Array;

    if (args.onlyRelationships === true) {
        excludeItems = [...metaDetails, ...basicDetails, ...groups, ...groupDetails, ...exclude];
    } else {
        excludeItems = [...metaDetails, ...relationships, ...groups, ...exclude];
    };
    
    for (let [key, value] of Object.entries(MemberBlueprint.object)) {
        if (!excludeItems.includes(value["dataPath"])) {
            if ( value["defaultValue"] && Object.values(value["defaultValue"]).length > 0 ) {
                loopThroughSubItems(value);
            } else {
                functionCall(key, value);
            }
        } else {
            if ( value["defaultValue"] && Object.values(value["defaultValue"]).length > 0 ) {
                loopThroughSubItems(value);
            }
        }
    }

    function loopThroughSubItems(subValue) {
        for (let [detailKey, detailValue] of Object.entries(subValue["defaultValue"])) {
            if (!excludeItems.includes(detailValue["dataPath"])) {
                functionCall(detailKey, detailValue, subValue);
            }
        }
    }

        // if (!excludeItems.includes(value["dataPath"])) {
        //     console.log("will be INCLUDED");
        //     if (!excludeGroups.includes(value["dataPath"])) {
        //         checkForSubItem(key, value)
        //     }
        // } else {
        //     checkForSubItem(key, value);
        //     // if ( value["defaultValue"] && Object.values(value["defaultValue"]).length > 0 ) {
        //     //     checkForSubItem(key, value)
        //     // } else {
        //     //     functionCall(key, value);
        //     // }
        // }
        // if (!excludeGroupDefaults.includes(value["dataPath"]) && !excludeDefaults.includes(value["dataPath"])) {
        //     if ( value["defaultValue"] && Object.values(value["defaultValue"]).length > 0 ) {
        //         checkForSubItem(key, value)
        //     }
        // } else {
        //     if ( value["defaultValue"] && Object.values(value["defaultValue"] ).length > 0 ) {
        //         checkForSubItem(key, value)
        //     } else {
        //         functionCall(key, value);
        //     }
        // }

        // function checkForSubItem(key, value) {
        //     if ( value["defaultValue"] && Object.values(value["defaultValue"]).length > 0 ) {
        //         for (let [detailKey, detailValue] of Object.entries(value["defaultValue"])) {
        //             if (!excludeItems.includes(detailValue["dataPath"])) {
        //                 functionCall(detailKey, detailValue, value);
        //             }
        //         }
        //     }
        // }
}


///////

let LocalDocs = {};

LocalDocs.leaves = [];
LocalDocs.claimedMembers = new Array;
LocalDocs.trees = [];
LocalDocs.member;
LocalDocs.members = new Array;


LocalDocs.getMemberDocByIdFromCurrentTree = function(reqId) {
    return LocalDocs.members.find(doc => doc.id === reqId);
}

LocalDocs.getMemberById = function(reqId) {
    return LocalDocs.members.find(doc => doc.id === reqId);
}

LocalDocs.getLeafById = function(reqId) {
    return LocalDocs.leaves.find(doc => doc.id === reqId);
}

///////


let Relationship = {};

Relationship.addParent = function() {
    let addParentTo = DetailsPanel.getActiveDoc();
    console.log(`I'm finna add a parent to ${addParentTo.id}`);

    let childrenObject = {};
    childrenObject[`${addParentTo.id}`] = null;

    if (addParentTo.data().siblings && Object.keys(addParentTo.data().siblings).length > 0) {
        for (siblingId of Object.keys( addParentTo.data().siblings)) {
            childrenObject[`${siblingId}`] = null;
        }
    };

    currentTreeLeafCollectionRef.add(      
        newLeafForFirebase({
            "children": childrenObject,
            "topMember": true,
            "created_by": LocalDocs.member.id
        })
    )
    .then((leafRef) => {
        console.log(`Parent ${leafRef.id} succesfully created!`);
        if (addParentTo.data().siblings && Object.keys(addParentTo.data().siblings).length > 0) {
            for (siblingId of Object.keys(addParentTo.data().siblings)) {
                currentTreeLeafCollectionRef.doc(siblingId).update({
                    [`parents.${leafRef.id}`] : null
                })
                .then(() => {
                    console.log(`${siblingId} successfully updated to have ${leafRef.id} as a parent`)
                })
                .catch(err => {
                    console.log(err.message)
                })
            }
        };

        currentTreeLeafCollectionRef.doc(addParentTo.id).update({
            [`parents.${leafRef.id}`] : null,
            topMember: false
        }).then(() => {
            location.reload();
        })

  })
  .catch((err) => {
      console.log("There was an error creating the new leaf");
      console.log(err.message);
  });
};

Relationship.addChild = function() {
    let addChildTo = DetailsPanel.getActiveDoc();
    console.log(`I'm finna add a child to ${addChildTo.id}`);

    // let parentArray = [addChildTo.id];
    let parentsObject = {};
    parentsObject[`${addChildTo.id}`] = null;

    // let siblingsArray = [];
    let siblingsObject = {};

    if (addChildTo.data().partners) {
        for (partnerId of Object.keys(addChildTo.data().partners)) {
            console.log(`${partnerId} should be added as a parent to the new child`)
            parentsObject[`${partnerId}`] = null;
        }
    }

    if (Object.keys(addChildTo.data().children).length > 0) {
        for (childId of Object.keys(addChildTo.data().children)) {
            siblingsObject[`${childId}`] = null;
        }
    }

    currentTreeLeafCollectionRef.add(
        newLeafForFirebase({
            "siblings": siblingsObject,
            "parents": parentsObject,
            "created_by": LocalDocs.member.id
        })
    )
    .then((newChildRef) => {
        for (parentId of Object.keys(parentsObject)) {
            currentTreeLeafCollectionRef.doc(parentId).update({ 
                [`children.${newChildRef.id}`] : null
            })
            .then(() => {
                console.log(`${parentId} has a new child: ${newChildRef.id}`)
            })
            .catch(err => {
                console.log(err.message);
            })
        }
        if (Object.keys(siblingsObject).length > 0) {
            for (siblingId of Object.keys(siblingsObject)) {
                currentTreeLeafCollectionRef.doc(siblingId).update({
                    [`siblings.${newChildRef.id}`] : null
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

Relationship.addPartner = function() {
    let addPartnerTo = DetailsPanel.getActiveDoc();
    // let partnerArray = [];

    // if (addPartnerTo.data().partners) {
    //     for (partnerId of Object.keys(addPartnerTo.data().partners)) {
    //         partnerArray.push(partnerId);
    //     }
    // }

    let partnerObject = {};
    let childrenObject = {};

    partnerObject[addPartnerTo.id] = null;

    if ( addPartnerTo.data().children && Object.keys(addPartnerTo.data().children).length > 0 ) {
        for (childId of Object.keys(addPartnerTo.data().children)) {
            childrenObject[`${childId}`] = null;
        }
    }

    if (partnerObject && Object.keys(partnerObject).length > 0) {
        for (partnerId of Object.keys(partnerObject)) {
            partnerObject[`${partnerId}`] = null;
        }
    }

    currentTreeLeafCollectionRef.add(
        newLeafForFirebase({
            "partners": partnerObject,
            "children": childrenObject,
            "created_by": LocalDocs.member.id
        })
    ).then(newPartnerDoc => {
        console.log(`${newPartnerDoc.id} was successfully created!`)
        currentTreeLeafCollectionRef.doc(addPartnerTo.id).update({
            [`partners.${newPartnerDoc.id}`] : null
        })
        .then(() => {
            console.log(`${newPartnerDoc.id} was added as a partner to ${addPartnerTo.id}`)

            if (Object.keys(childrenObject).length > 0) {
                for (childId of Object.keys(childrenObject)) {
                    currentTreeLeafCollectionRef.doc(childId).update({
                        [`parents.${newPartnerDoc.id}`] : null
                    })
                    .then(() => {
                        console.log(`${childId} has a new parent: ${newPartnerDoc.id}`)
                    })
                    .catch(err => {
                        console.log(err.message)
                    })
                }
            }
            
            if (addPartnerTo.data().partners) {
                for (partnerId of Object.keys(addPartnerTo.data().partners)) {
                    console.log(`Adding newPartner to ${partnerId}`);
                    currentTreeLeafCollectionRef.doc(partnerId).update({
                        [`partners.${newPartnerDoc.id}`]: null
                    })
                    .then(() => {
                        console.log("Partner successfully added")
                    })
                    .catch(err => {
                        console.log(`Partner not added`);
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

Relationship.addSibling = function() {
    let addSiblingTo = DetailsPanel.getActiveDoc();
    console.log(`I'm finna add a sibling to ${addSiblingTo.id}`);

    // let parentArray = new Array;
    // let siblingArray = [addSiblingTo.id];

    let parentObject = {};
    let siblingObject = {};
    siblingObject[addSiblingTo.id] = null;

    if (addSiblingTo.data().siblings && Object.keys(addSiblingTo.data().siblings).length > 0) {
        for (siblingId of Object.keys(addSiblingTo.data().siblings)) {
            siblingObject[siblingId] = null;
        }
    }

    if (addSiblingTo.data().parents && Object.keys(addSiblingTo.data().parents).length > 0) {
        for (parentId of Object.keys(addSiblingTo.data().parents)) {
            parentObject[parentId] = null;
        }
    }

    // get other siblings, make sure this new sibling is added to them
    // get parents, make sure new sibling is added as child to each
    
    console.log(parentObject);
    console.log(siblingObject);

    // Left off trying to figure out why adding a sibling won't add other siblnigs's parents to the new sibling

    currentTreeLeafCollectionRef.add(
        newLeafForFirebase({
            "siblings": siblingObject,
            "parents": parentObject,
            "created_by": LocalDocs.member.id
        })
    )
    .then((newSiblingRef) => {
        for (siblingId of Object.keys(siblingObject)) {
            currentTreeLeafCollectionRef.doc(siblingId).update({
                [`siblings.${newSiblingRef.id}`] : null
            })
            .then(() => {
                console.log(`${siblingId} has added ${newSiblingRef.id} as a sibling.`)
            })
            .catch(err => {
                console.log(err.message);
            })
        }

        if (Object.keys(parentObject).length > 0) {
            for (parentId of Object.keys(parentObject)) {
                currentTreeLeafCollectionRef.doc(parentId).update({
                    [`children.${newSiblingRef.id}`] : null
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
}

Relationship.deleteLeaf = function() {
    let reqRemovalDoc = DetailsPanel.getLeafDoc();
    console.log(reqRemovalDoc);

    if (reqRemovalDoc.data().claimed_by === LocalDocs.member.id) {
        alert("You cannot delete yourself!");
        return;
    } else {
        if (Object.keys(reqRemovalDoc.data().children).length > 0 && Object.keys(reqRemovalDoc.data().partners).length < 1 && Object.keys(reqRemovalDoc.data().parents).length > 0) {
            currentTreeLeafCollectionRef.doc(reqRemovalDoc.id).update({
                "deleted" : true
            }).then(() => {
                location.reload();
            })
        }
        else {
            if (reqRemovalDoc.data().topMember === true) {
                if (Object.keys(reqRemovalDoc.data().partners).length > 0) {
                    console.log(`TopMember deleted. Top Member reassigned to ${reqRemovalDoc.data().partners[0]}`);
                    currentTreeLeafCollectionRef.doc(Object.keys(reqRemovalDoc.data().partners)[0]).update({topMember: true});
                } else {
                    console.log(`TopMember deleted. Top Member reassigned to ${reqRemovalDoc.data().children[0]}`);
                    currentTreeLeafCollectionRef.doc(Object.keys(reqRemovalDoc.data().children)[0]).update({topMember: true});
                }
            }
            if (Object.keys(reqRemovalDoc.data().parents) && Object.keys(reqRemovalDoc.data().parents).length > 0) {
                for (parentId of Object.keys(reqRemovalDoc.data().parents)) {
                    console.log(`Updating parent ${parentId}`);
                    currentTreeLeafCollectionRef.doc(parentId).update({
                        [`children.${reqRemovalDoc.id}`] : firebase.firestore.FieldValue.delete()
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
    
            if (Object.keys(reqRemovalDoc.data().children) && Object.keys(reqRemovalDoc.data().children).length > 0) {
                for (childId of Object.keys(reqRemovalDoc.data().children)) {
                    console.log(`Updating child ${childId}`);
                    currentTreeLeafCollectionRef.doc(childId).update({
                        [`parents.${reqRemovalDoc.id}`] : firebase.firestore.FieldValue.delete()
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
            
            if (Object.keys(reqRemovalDoc.data().partners).length > 0) {
                if ( Object.keys(reqRemovalDoc.data().partners).length > 0 ) {
                    for ( partnerId of Object.keys(reqRemovalDoc.data().partners) ) {
                        console.log(`Updating partners ${partnerId}`);
                        currentTreeLeafCollectionRef.doc(partnerId).update({
                            [`partners.${reqRemovalDoc.id}`] : firebase.firestore.FieldValue.delete()
                        })
                        .then(() => {
                            console.log("Partner successfully updated")
                        })
                        .catch(err => {
                            console.log(`Partner not updated`);
                            console.log(err.message);
                        })
                    }
                }
            }
    
            if (reqRemovalDoc.data().siblings && Object.keys(reqRemovalDoc.data().siblings).length > 0) {
                for (siblingId of Object.keys(reqRemovalDoc.data().siblings)) {
                    console.log(`Updating sibling ${siblingId}`);
                    currentTreeLeafCollectionRef.doc(siblingId).update({
                        [`siblings.${reqRemovalDoc.id}`] : firebase.firestore.FieldValue.delete()
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

            treesRef.doc(LocalDocs.tree.id).update({
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
            document.querySelector(`[data-id="${reqRemovalDoc.id}"]`).remove();
        }
    }
}

// TODO: Make the below function available. Abstract the foor loop with the exclude/include arrays and such!!!
function newLeafForFirebase(params) {
    let newLeafObject = {};

    for (let [key, value] of Object.entries(MemberBlueprint.object)) {
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

let connectionObject = {};

function connectLines() {
    let connectionChildren = connectionObject["children"] = {};
    let connectionPartners = connectionObject["partners"] = {};

    for (let leafDoc of LocalDocs.leaves) {
        let children = Object.keys(leafDoc.data().children).length > 0 ? Object.entries(leafDoc.data().children) : null;
        let partners = Object.keys(leafDoc.data().partners).length > 0 ? Object.entries(leafDoc.data().partners) : null;

        if (children) {
            connectionChildren[`${leafDoc.id}`] = children;
        }

        if (partners) {
            connectionPartners[`${leafDoc.id}`] = partners;
        }
    }

    iterateOverConnections();
}

function iterateOverConnections() {
    let apartArray = ["Separated", "Divorced", "Widowed"];
    let unrelatedArray = ["Unrelated", "Step"];

    for (let [parentId, parentValue] of Object.entries(connectionObject.children)) {
        let parentEl = familyTreeEl.querySelector(`[data-id="${parentId}"]`);

        for (let childId of parentValue) {
            if ( !unrelatedArray.includes(childId[1]) ) {
                let childEl = familyTreeEl.querySelector(`[data-id="${childId[0]}"]`);
                
                createSVG(parentEl, childEl, "child");
            }
        }
    } 

    for (let [partnerId, partnerValue] of Object.entries(connectionObject.partners)) {
        if (partnerId) {
            let partnerEl = familyTreeEl.querySelector(`[data-id="${partnerId}"]`);

            for (let partnerMatchId of partnerValue) {
                if ( apartArray.includes(partnerMatchId[1]) ) {
                    let partnerMatchEl = familyTreeEl.querySelector(`[data-id="${partnerMatchId[0]}"]`);

                    createSVG(partnerEl, partnerMatchEl, "partner");
                }
            }
        }
    } 
}

function createSVG(fromEl, toEl, relationshipType) {
    let toAttributes = toEl.getBoundingClientRect();
    let fromAttributes = fromEl.getBoundingClientRect();
    let style = getComputedStyle(fromEl);
    let width = fromEl.offsetWidth;
    let height = width;
    let halfWidth = width / 2;
    let captionOffset = 12;
    let singleMargin = parseInt(style.marginTop);
    let distanceDif;

    let fromleafId = fromEl.getAttribute("data-id");
    let toLeafId = toEl.getAttribute("data-id");

    let middleOfToX = toAttributes.x - toAttributes.width;
    let middleOfToY = toAttributes.y - toAttributes.width;

    if (fromAttributes.x > toAttributes.x) {
        distanceDif = (-1 * (fromAttributes.x - toAttributes.x)) + halfWidth;
    } else {
        distanceDif = (toAttributes.x - fromAttributes.x) + halfWidth;
    }

    let d;

    if (relationshipType === "child") {
        d = `M${halfWidth} ${height + captionOffset} L${halfWidth} ${height + (captionOffset/2) + singleMargin} L${distanceDif} ${height + (captionOffset/2) + singleMargin} L${distanceDif} ${height + captionOffset + (singleMargin*2)}`;
    } else if (relationshipType === "partner") {
        d = `M${halfWidth} ${halfWidth} L${distanceDif} ${halfWidth}`;
    }

    let xmlns = "http://www.w3.org/2000/svg";

    let svgElem = document.createElementNS(xmlns, "svg");
    svgElem.setAttributeNS(null, "viewBox", "0 0 " + width + " " + width);
    svgElem.setAttributeNS(null, "width", width);
    svgElem.setAttributeNS(null, "height", width);
    svgElem.setAttributeNS(null, "class", "leaf_connections");
    svgElem.setAttributeNS(null, "data-from-leaf", fromleafId);
    svgElem.setAttributeNS(null, "data-to-leaf", toLeafId);

    // svgElem.setAttributeNS(null, "preserveAspectRatio", "none");

    let svgNS = "http://www.w3.org/2000/svg";  
    path = document.createElementNS(svgNS, "path");
    path.setAttributeNS(null, "d", d);

    if (relationshipType === "partner") {
        path.setAttributeNS(null, "stroke-dasharray", "4 4");
    }

    svgElem.appendChild(path);
    fromEl.appendChild(svgElem);

    // return polylineConnector;
}

function initiateModals() {
    let modalTriggers = document.querySelectorAll("[data-modal-trigger]");
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

function showModal(e) {
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

function signUpSetup() {
    pageTitle.innerHTML = "Sign up";
};


function signUpViewOnAuthChange(user) {
    if (user) {
       window.location.hash= '/my-trees';
    }
};


function logInSetup() {
    pageTitle.innerHTML = "Log in";
};


function logInViewOnAuthChange(user) {
    if (user) {
        window.location.hash = '/my-trees';
    }
};