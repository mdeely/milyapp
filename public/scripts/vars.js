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
const addSpouseButton = document.querySelector("#add-spouse-action");
const addSiblingButton = document.querySelector("#add-sibling-action");

const removeLeafButton = document.querySelector("#remove-leaf-action");
const editMemberButton = document.querySelector("#edit-member-action");

const dataViews = document.querySelectorAll(`[data-view]`);

const treeBlueprint = {
    "Admins" : { "dataPath" : "admins", "defaultValue" : [] },
    "Contributors" : { "dataPath" : "contributors", "defaultValue" : [] },
    "Viewers" : { "dataPath" : "viewers", "defaultValue" : [] },
    "Created by" : { "dataPath" : "created_by", "defaultValue" : null },
    "Name" : { "dataPath" : "name", "defaultValue" : null }
}

const familyTreeEl = document.querySelector("#familyTree");
const mainContent = document.querySelector("#mainContent");
const leafConnections = document.querySelector("#leaf_connections");

const detailsPanel = mainContent.querySelector("#detailsPanel");
const detailsPanelInfo = detailsPanel.querySelector(".detailsPanel__information");
const detailsPanelEdit = detailsPanel.querySelector("#detailsPanel__edit");
const detailsPanelAction = detailsPanel.querySelector(".detailsPanel__actions");

const detailsPanelMetaData = detailsPanel.querySelector(".detailsPanel__metaData");
const detailsPanelImmediateFamily = detailsPanel.querySelector(".detailsPanel__immediateFamily");
const detailsPanelFirstName = detailsPanel.querySelector(".detailsPanel__firstName");

const pageTitle = document.querySelector("#pageTitle")

const excludedDetails = ["children", "parents", "siblings", "spouses", "topMember", "claimed_by", "created_by", "profile_photo"];
const excludedCategories = ["Name", "Address"];

const placeholderImageUrl = "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder.svg?alt=media&token=d3b939f1-d46b-4315-bcc6-3167d17a18ed";
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
}

DetailsPanel.close = function() {
    mainContent.classList.remove("showDetails");
    Leaf.removeActive();
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

DetailsPanel.populate = function(leafDoc) {
    let dataSource = leafDoc.data();
    
    if (leafDoc.data().claimed_by) {
        reqMemberDoc = LocalDocs.members.find(memberDoc => memberDoc.id === leafDoc.data().claimed_by);
        dataSource = reqMemberDoc.data();
    }

    detailsPanelMetaData.textContent = '';
    detailsPanelImmediateFamily.textContent = '';
    detailsPanelFirstName.textContent = dataSource.name.firstName ? dataSource.name.firstName : "No name";
    detailsPanel.setAttribute("data-details-id", leafDoc.id);

    if (leafDoc.data().topMember === true) {
        addParentButton.classList.remove("u-d_none");
    } else {
        addParentButton.classList.add("u-d_none");
    }

    if (leafDoc.data().claimed_by) {
        editMemberButton.classList.add("u-d_none");
        detailsPanel.setAttribute("data-details-member-id", leafDoc.data().claimed_by);
    } else {
        editMemberButton.classList.remove("u-d_none");
        detailsPanel.removeAttribute("data-details-member-id");
    }

    if (leafDoc.data().claimed_by === LocalDocs.member.id) {
        editMemberButton.classList.remove("u-d_none");
    }

    // Determine if leafDoc has a memberDoc.
    if (detailsPanel.hasAttribute("data-details-member-id")) {
        // do something if is claimed member
    }

    let profileImage = detailsPanel.querySelector(".detailsPanel__profileImage img");
    profileImage.setAttribute('src', placeholderImageUrl);
    
    // if (authLeafPermissionType() && authLeafPermissionType() === "admin" || authLeafPermissionType() && authLeafPermissionType() === "contributor") {
    //     addParentButton.classList.remove("u-d_none")
    //     inviteMemberButton.classList.remove("u-d_none");
    //     removeLeafButton.classList.remove("u-d_none");
    //     editMemberButton.classList.remove("u-d_none");
    //     addRelationshipButton.classList.remove("u-d_none");

    //     if (doc.data().topMember !== true) {
    //         addParentButton.classList.add("u-d_none")
    //     }

    //     if (doc.data().invitation) {
    //         inviteMemberButton.classList.add("u-d_none");
    //     }

    //     if (leafDoc.data().claimed_by) {
    //         if (leafDoc.data().claimed_by === authMemberDoc.id) {
    //             removeLeafButton.classList.add("u-d_none");
    //             editMemberButton.classList.remove("u-d_none");
    //             inviteMemberButton.classList.add("u-d_none");
    //         } else {
    //             inviteMemberButton.classList.add("u-d_none");
    //         }
    //     }

    // } else if (authLeafPermissionType() || authLeafPermissionType() === "viewer") {
    //     addParentButton.classList.add("u-d_none")
    //     inviteMemberButton.classList.add("u-d_none");
    //     removeLeafButton.classList.add("u-d_none");
    //     editMemberButton.classList.add("u-d_none");
    //     addRelationshipButton.classList.add("u-d_none");
    // } else {
    //     addParentButton.classList.add("u-d_none")
    //     inviteMemberButton.classList.add("u-d_none");
    //     removeLeafButton.classList.add("u-d_none");
    //     editMemberButton.classList.add("u-d_none");
    //     addRelationshipButton.classList.add("u-d_none");
    // }

    MemberBlueprint.loop({
        "exclude" : ["profile_photo"],
        "functionCall": generateDetailElement
    });

    MemberBlueprint.loop({
        "onlyRelationships" : true,
        "functionCall": generateImmediateFamilyElement
    });

    function generateDetailElement(key, value, parentValue = null) {
        let reqName = value["dataPath"];
        let reqIcon = value["icon"];
        let data = dataSource[reqName];

        if (data) {
            if (reqName === "birthday" && data) {
                var options = { year: 'numeric', month: 'long', day: 'numeric' };
        
                let date = new Date(data.replace(/-/g, '\/'));
                data = new Intl.DateTimeFormat('en-US', options).format(date);
            }
    
            let infoEl = `<div class="detailsPanel__item detailsPanel__${reqName} u-mar-b_4"><i class="fa fa-${reqIcon} detailsPanel__icon u-mar-r_2"></i>${data}</div>`
    
            detailsPanelMetaData.innerHTML += infoEl;
        }
    };

    function generateImmediateFamilyElement(key, value, parentValue) {
        let relativeType = value["dataPath"];
        let docDataPath = leafDoc.data()[relativeType] ? leafDoc.data()[relativeType] : null;

        if (relativeType === "spouses") {
            if ( docDataPath && Object.keys(docDataPath).length > 0 ) {
                for ( let reqId in docDataPath ) {
                    renderRelationship(reqId);
                }
            }
        } else {
            if (docDataPath && docDataPath.length > 0 ) {
                for ( let reqId of docDataPath ) {
                    renderRelationship(reqId);
                }
            }
        }

        function renderRelationship(reqId) {
            let familyDoc = LocalDocs.getLeafById(reqId);
            // if (familyDoc.data().claimed_by) {
            //     familyDoc = LocalDocs.getMemberDocByIdFromCurrentTree(reqId);
            // }

            let firstName = familyDoc ? familyDoc.data().name.firstName : "No name";
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
                        <div class="detailsPanel__img u-mar-r_2"><img src="${placeholderImageUrl}" alt="${firstName}"/></div>
                        <div class="detailsPanel__text u-mar-r_2">
                            <div class="detailsPanel__name u-mar-b_point5 u-bold">${firstName}</div> 
                            <div class="detailsPanel__realtiveType">${label}</div> 
                        </div>
                            ${spouseAction}
                    </div>`
            detailsPanelImmediateFamily.innerHTML += el;
        }
    }
}

DetailsPanel.editMember = function() {
    detailsPanelEdit.innerHTML = '';

    let reqEditDoc = DetailsPanel.getLeafDoc();
    let reqEditDocData = reqEditDoc.data();

    detailsPanelAction.classList.add("u-d_none");
    detailsPanelInfo.classList.add("u-d_none");
    detailsPanelEdit.classList.remove("u-d_none");

    MemberBlueprint.loop({
        "functionCall" : createMemberInput
    });

    function createMemberInput(key, value, parentValue) {
        let inputType = value.dataType ? value.dataType : "text";
        let data = '';

        if (parentValue) {
            data = reqEditDocData[parentValue.dataPath][value.dataPath] || data;
        } else {
            data = reqEditDocData[value.dataPath] || data;;
        }

        let inputGroup = `<div class="inputGroup inputGroup__horizontal">
                                <label class="u-mar-r_2 u-w_33perc">${key}</label>
                                <input class="u-mar-l_auto u-flex_1'" type="${inputType}" name="${value.dataPath}" value="${data}">
                            </div>`
    
        detailsPanelEdit.innerHTML += inputGroup;
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

        if (detailsPanelEdit["profile_photo"].files.length == 0) {
            goUpdateLeaf();
        } else {
            let profilePhotoFile = detailsPanelEdit["profile_photo"].files[0];
            let fileName = profilePhotoFile.name;
            let leafProfilePhotoRef = storageRef.child(`trees/${LocalDocs.tree.id}/${reqEditDoc.id}/${fileName}`);

            leafProfilePhotoRef.put(profilePhotoFile).then(function(snapshot) {
                currentTreeLeafCollectionRef.doc(reqEditDoc.id).update({
                    "profile_photo" : snapshot.metadata.fullPath
                })
                .then(() => {
                    goUpdateLeaf(snapshot.metadata.fullPath);
                })
                .catch(err => {
                    console.log(err.message);
                })
            });
        }

        function goUpdateLeaf(photoFile = LocalDocs.member.data().profile_photo || null) {
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

let MemberBlueprint = {};

MemberBlueprint.object = {
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
    "Birthday" : { "dataPath" : "birthday", "defaultValue" : null, "icon" : "birthday-cake", "dataType": "date" },
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
    "Profile photo" : { "dataPath" : "profile_photo", "icon" : "picture", "defaultValue" : null , "dataType": "file"}
}

MemberBlueprint.loop = function(args) {
    let exclude = args.exclude || [];
    let functionCall = args.functionCall;
    let relationships = ["children", "parents", "siblings", "spouses"];
    let metaDetails = ["claimed_by", "topMember", "created_by", ];
    let basicDetails = ["email", "birthday", "occupation", "profile_photo", "facebook", "instagram"];
    let groups = ["name", "address"];
    let groupDetails = ["firstName", "middleName", "lastName", "nickname", "surname", "address1", "address2", "city", "zipcode", "country"];

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
    return LocalDocs.claimedMembers.find(doc => doc.id === reqId);
}

LocalDocs.getMemberById = function(reqId) {
    return LocalDocs.trees.find(doc => doc.id === reqId);
}

LocalDocs.getLeafById = function(reqId) {
    return LocalDocs.leaves.find(doc => doc.id === reqId);
}

///////


let Relationship = {};

Relationship.addParent = function() {
    let addParentTo = DetailsPanel.getActiveDoc();
    console.log(`I'm finna add a parent to ${addParentTo.id}`);

    let childrenArray = [addParentTo.id];

    if (addParentTo.data().siblings) {
        childrenArray.push(...addParentTo.data().siblings);
    };

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
        };

        currentTreeLeafCollectionRef.doc(addParentTo.id).update({
            parents: firebase.firestore.FieldValue.arrayUnion(leafRef.id),
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

    let parentArray = [addChildTo.id];
    let siblingsArray = [];

    if (addChildTo.data().spouses) {
        for (spouseId of Object.keys(addChildTo.data().spouses)) {
            parentArray.push(spouseId);
        }
    }

    if (addChildTo.data().children) {
        siblingsArray.push(...addChildTo.data().children);
    }

    console.log(siblingsArray);
    console.log(parentArray);

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

Relationship.addSpouse = function() {
    let addSpouseTo = DetailsPanel.getActiveDoc();
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

Relationship.addSibling = function() {
    let addSiblingTo = DetailsPanel.getActiveDoc();
    console.log(`I'm finna add a sibling to ${addSiblingTo.id}`);

    let parentArray = new Array;
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

    // Left off trying to figure out why adding a sibling won't add other siblnigs's parents to the new sibling

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

Relationship.removeLeaf = function() {
    let reqRemovalDoc = DetailsPanel.getLeafDoc();

    if (reqRemovalDoc.data().claimed_by === LocalDocs.member.id) {
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
    
            if (reqRemovalDoc.data().parents && reqRemovalDoc.data().parents.length > 0) {
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
    
            if (reqRemovalDoc.data().children && reqRemovalDoc.data().children.length > 0) {
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
    
            if (reqRemovalDoc.data().siblings && reqRemovalDoc.data().siblings.length > 0) {
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

let connectionArray = {};

function connectLines() {
    for (let leafDoc of LocalDocs.leaves) {
        let children = leafDoc.data().children ? leafDoc.data().children : null;
        if (children && children.length > 0) {
            connectionArray[`${leafDoc.id}`] = children;
        }
    }

    iterateOverConnections();
}

function iterateOverConnections() {
    for (let [parentId, value] of Object.entries(connectionArray)) {
        let parentEl = familyTreeEl.querySelector(`[data-id="${parentId}"]`);
        let parrentAttributes = parentEl.getBoundingClientRect();

        for (let childId of value) {
            let childEl = familyTreeEl.querySelector(`[data-id="${childId}"]`);
            let childAttributes = childEl.getBoundingClientRect();

            createSVG(parrentAttributes, childAttributes, parentEl);
        }
    } 
}

function createSVG(parentAttributes, childAttributes, parentEl) {
    let style = getComputedStyle(parentEl);
    let width = parentEl.offsetWidth;
    let height = width;
    let halfWidth = width / 2;
    let captionOffset = 12;
    let singleMargin = parseInt(style.marginTop);
    let distanceDif;


    if (parentAttributes.x > childAttributes.x) {
        distanceDif = (-1 * (parentAttributes.x - childAttributes.x)) + halfWidth;
    } else {
        distanceDif = (childAttributes.x - parentAttributes.x) + halfWidth;
    }

    let d = `M${halfWidth} ${height + captionOffset} L${halfWidth} ${height + (captionOffset/2) + singleMargin} L${distanceDif} ${height + (captionOffset/2) + singleMargin} L${distanceDif} ${height + captionOffset + (singleMargin*2)}`;


    let xmlns = "http://www.w3.org/2000/svg";

    let svgElem = document.createElementNS(xmlns, "svg");
    svgElem.setAttributeNS(null, "viewBox", "0 0 " + width + " " + width);
    svgElem.setAttributeNS(null, "width", width);
    svgElem.setAttributeNS(null, "height", width);
    svgElem.setAttributeNS(null, "class", "leaf_connections");
    // svgElem.setAttributeNS(null, "preserveAspectRatio", "none");

    let svgNS = "http://www.w3.org/2000/svg";  
    path = document.createElementNS(svgNS, "path");
    path.setAttributeNS(null, "d", d);

    svgElem.appendChild(path);
    parentEl.appendChild(svgElem);

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