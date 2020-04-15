const familyTreeEl = document.querySelector("#familyTree");
const treeMenuEl = document.querySelector("#treeMenu");
const treeMenuDropdownEl = document.querySelector("#treeMenu__options");
const treeMenuCurrentTreeEl = document.querySelector("#treeMenu__currentTree");
const mainContent = document.querySelector("#mainContent");
const detailsPanel = mainContent.querySelector("#detailsPanel");
const detailsPanelInfo = detailsPanel.querySelector(".detailsPanel__information");
const detailsPanelFirstName = detailsPanel.querySelector(".detailsPanel__firstName");
const detailsPanelMetaData = detailsPanel.querySelector(".detailsPanel__metaData");
const detailsPanelEdit = detailsPanel.querySelector("#detailsPanel__edit");
const detailsPanelNav = detailsPanel.querySelector(".detailsPanel__nav");
const detailsPanelAction = detailsPanel.querySelector(".detailsPanel__actions");
const placeholderImageUrl = "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder.svg?alt=media&token=d3b939f1-d46b-4315-bcc6-3167d17a18ed";
const modalTriggers = document.querySelectorAll("[data-modal-trigger]");
const dropdownTriggers = document.querySelectorAll(`[data-dropdown-target]`);
const memberOptionsDropdown = document.querySelector('[data-dropdown-target="member-options-dropdown"]');
const removeLeafButton = document.querySelector("#remove-leaf-action");
const editMemberButton = document.querySelector("#edit-member-action");
const addParentButton = document.querySelector("#add-parent-action");
const addChildButton = document.querySelector("#add-child-action");
const addSpouseButton = document.querySelector("#add-spouse-action");
const addSiblingButton = document.querySelector("#add-sibling-action");

const memberBlueprint = {
    "Name" : { "dataPath" : "name", "icon" : "user", 
                "defaultValue" : {
                    "First Name" : { "dataPath" : "firstName", "defaultValue" : null, "icon" : "user" },
                    "Middle Name" : { "dataPath" : "middleName", "defaultValue" : null, "icon" : "user" },
                    "Last Name" : { "dataPath" : "lastName", "defaultValue" : null, "icon" : "user" },
                    "Surname" : { "dataPath" : "surname", "defaultValue" : null, "icon" : "user" }
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
}

const setupView = () => {
    clearView();
    populateTreeMenu();

    familyTree.innerHTML = '';
    
    window.topMemberDoc = window.currentTreeLeaves.find(doc => doc.data().topMember === true);
    window.renderedLeafMembers = [];
    let siblings = topMemberDoc.data().siblings && topMemberDoc.data().siblings.length > 0 ? topMemberDoc.data().siblings : null;
    let generatedFamilyTreeHtml = renderFamilyFromMember(topMemberDoc);

    if (siblings) {
        for (siblingId of siblings) {
            let siblingBranchEl = createBranchEl("div", "branch")
            let siblingDoc = window.currentTreeLeaves.find(leafDoc => leafDoc.id === siblingId);
            let siblingsHtml = renderFamilyFromMember(siblingDoc);

            siblingBranchEl.appendChild(siblingsHtml);
            familyTreeEl.appendChild(siblingsHtml);
        }
    }

    familyTreeEl.appendChild(generatedFamilyTreeHtml);
}

const showModal = (e) => {
    let targetModalName = e.target.getAttribute("data-modal-trigger");
    let targetModal = document.querySelector('[data-modal="'+targetModalName+'"]');
    let closeModal = targetModal.querySelectorAll(".modal_button--close");

    targetModal.classList.add("open");

    for (let close of closeModal) {
        close.addEventListener('click', (e) => {
            e.target.closest(".modal").classList.remove("open");
        })
    }
    // targetModal.classList.add("open");
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

    for (let treeDoc of window.authMemberTrees) {
        let treeAnchor = document.createElement("li");
        let className = '';

        if (treeDoc.id === window.currentTreeDoc.id) {
            className = "active";
            treeMenuCurrentTreeEl.innerHTML += treeDoc.data().name;
        }

        if (treeDoc.id === window.primaryTreeId) {
            treeAnchor.innerHTML += "(Primary) "
        }

        treeAnchor.setAttribute("data-id", treeDoc.id);
        treeAnchor.setAttribute("class", `dropdown__item ${className}`);
        treeAnchor.textContent += treeDoc.data().name;

        treeAnchor.addEventListener('click', (e) => {
            e.preventDefault();

            let reqTreeId = e.target.getAttribute("data-id");
            getAndSetCurrenTreeVars(reqTreeId);
        })

        treeMenuDropdownEl.appendChild(treeAnchor);
    }

    let caretIcon = `<i class="fa fa-caret-down u-mar-l_2 u-pe_none u-o_75"></i>`;

    treeMenuCurrentTreeEl.innerHTML += caretIcon;
}

const getLeafEl = (doc) => {
    let leafName = doc.data().name.firstName ? doc.data().name.firstName : "No name";
    let figure = document.createElement("figure");
    let figcaption = document.createElement("figcaption");

    figcaption.textContent = leafName;
    figcaption.setAttribute("class", "leaf_caption");
    figure.setAttribute("class", "leaf");
    figure.setAttribute("data-id", doc.id);
    figure.appendChild(figcaption);

    figure.addEventListener('click', (e) => {
        e.preventDefault();

        let docId = e.target.getAttribute("data-id");

        if (e.target.classList.contains("active")) {
            e.target.classList.remove("active");
            showDetailPanels(false);
        } else {
            removeActiveLeafClass();

            e.target.classList.add("active");
            showDetailPanels(true);
            populateDetailsPanel(docId);
        }
    });

    return figure;
}

const populateDetailsPanel = (docId) => {
    detailsPanelMetaData.textContent = '';
    let doc = window.currentTreeLeaves.find(doc => doc.id === docId);
    detailsPanelFirstName.textContent = doc.data().name.firstName ? doc.data().name.firstName : "No name";

    detailsPanel.setAttribute("data-details-id", docId);

    let profileImage = detailsPanel.querySelector(".detailsPanel__profileImage img");
    profileImage.setAttribute('src', placeholderImageUrl);

    if (doc.data().topMember === true) {
        addParentButton.classList.remove("u-d_none");
    } else {
        addParentButton.classList.add("u-d_none")
    }

    if (doc.data().claimed_by === authMemberDoc.id) {
        removeLeafButton.classList.add("u-d_none");
    } else {
        removeLeafButton.classList.remove("u-d_none");
    }

    // for (let [key, value] of Object.entries(memberBlueprint)) {
    //     generateDetailElement({data: doc.data()[value["dataPath"]], name: value["dataPath"], icon: value["icon"]});
    // }



    for (let [key, value] of Object.entries(memberBlueprint)) {
        if ( !["children", "parents", "siblings", "spouses", "topMember"].includes(value["dataPath"]) ) {
            if ( value["defaultValue"] && Object.values(value["defaultValue"]).length > 0 ) {
                for (let [detailKey, detailValue] of Object.entries(value["defaultValue"])) {
                    if ( !["firstName"].includes(detailValue["dataPath"]) ) {
                        generateDetailElement({data: doc.data()[value["dataPath"]][detailValue["dataPath"]], name: detailValue["dataPath"], icon: value["icon"]});
                    }
                }
            } else {
                if ( !["Name", "Address"].includes(key) ) {
                    generateDetailElement({data: doc.data()[value["dataPath"]], name: value["dataPath"], icon: value["icon"]});
                }
            }
        }
    }





}

const generateDetailElement = (params) => {
    let reqName = params["name"];
    let reqIcon = params["icon"];
    let data = params["data"] ? params["data"] : null;

    if (data) {
        // if (reqName === "birthday" && data) {
        //     var options = { year: 'numeric', month: 'long', day: 'numeric' };
    
        //     let date = data.toDate();
        //     data = new Intl.DateTimeFormat('en-US', options).format(date);
        // }

        // if (reqName === "address" && data) {
        //     // handle address stuff
        // }

        let infoEl = `<div class="detailsPanel__item detailsPanel__${reqName} u-mar-b_4"><i class="fa fa-${reqIcon} detailsPanel__icon u-mar-r_2"></i>${data}</div>`

        detailsPanelMetaData.innerHTML += infoEl;
    }
}

const createBranchEl = (el, className) => {
    let branchEl = document.createElement(el);
    branchEl.setAttribute("class", className);

    return branchEl;
}

const renderFamilyFromMember = (doc) => {
    let children = doc.data().children && doc.data().children.length > 0 ? doc.data().children : null;
    let spouses = doc.data().spouses ? Object.entries(doc.data().spouses) : null;
    let branchEl = createBranchEl("div", "branch");
    let leafEl = getLeafEl(doc);
    let spousesContainer = createBranchEl("div", "spouses");

    renderedLeafMembers.push(doc.id);
    
    spousesContainer.appendChild(leafEl);

    if (children) {
        let descendantsContainer = createBranchEl("div", "descendants");
        for (childId of children) {
            let childDoc = window.currentTreeLeaves.find(leafDoc => leafDoc.id === childId);
            descendantsContainer.appendChild(renderFamilyFromMember(childDoc));
        }
        branchEl.appendChild(descendantsContainer);
    }

    if (spouses) {
        for (spouse of spouses) {
            let spouseId = spouse[0];
            let spouseStatus = spouse[1];
            let spouseDoc = window.currentTreeLeaves.find(leafDoc => leafDoc.id === spouseId);
            let spouseLeafEl = getLeafEl(spouseDoc);

            renderedLeafMembers.push(spouseId);
            spousesContainer.appendChild(spouseLeafEl);
        }
    }


    branchEl.prepend(spousesContainer);

    return branchEl;
}

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

const getDocFromDetailsPanelId = () => {
    let id = detailsPanel.getAttribute("data-details-id")
    return window.currentTreeLeaves.find(leafDoc => leafDoc.id === id);
}

const editMember = () => {
    let reqEditDoc = getDocFromDetailsPanelId();
    let reqEditDocData = reqEditDoc.data();

    detailsPanelEdit.classList.remove("u-d_none");





    for (let [key, value] of Object.entries(memberBlueprint)) {
        let data = '';
        let name = '';

        if ( !["children", "parents", "siblings", "spouses", "topMember"].includes(value["dataPath"]) ) {
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

            if ( !["Name", "Address"].includes(key) ) {
                createMemberInput(key, data, name);
            }
        }
    }



    // for (let [key, value] of Object.entries(memberBlueprint)) {
    //     let data = '';
    //     let name = '';
    //     let pathArray = value.split(".");

    //     if (pathArray.length === 2) {
    //         data = reqEditDocData[`${pathArray[0]}`] ? reqEditDocData[`${pathArray[0]}`][`${pathArray[1]}`] : null;
    //         name = pathArray[1];
    //     } else {
    //         data = reqEditDocData[`${pathArray[0]}`] ? reqEditDocData[`${pathArray[0]}`] : null;
    //         name = pathArray[0];
    //     }

    //     createMemberInput(key, data, name);
    // }

    let buttonGroup = document.createElement('div');
    let saveButton = document.querySelector("button");
    let cancelButton = `<a href="#" class="u-w_full button secondary">Cancel</a>`

    saveButton.textContent = "Save";
    saveButton.setAttribute("class", "u-w_full")
    saveButton.setAttribute("type", "submit");

    // cancelButton.addEventListener("click", (e) => {
    //     detailsPanelInfo.classList.add("u-d_none");
    //     detailsPanelInfo.classList.remove("u-d_none");
    // });

    detailsPanelEdit.addEventListener("submit", (e) => {
        e.preventDefault();
        let reqEditDoc = getDocFromDetailsPanelId();

        currentTreeLeafCollectionRef.doc(reqEditDoc.id).update({
            "name" : {
                "firstName" : detailsPanelEdit["firstName"].value,
                "lastName" : detailsPanelEdit["lastName"].value,
                "middleName" : detailsPanelEdit["middleName"].value,
                "surname" : detailsPanelEdit["surname"].value,
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

    buttonGroup.setAttribute("class", "formActions u-pad_4");
    buttonGroup.appendChild(saveButton);
    buttonGroup.innerHTML += cancelButton;
    
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

    let inputGroup = `<div class="inputGroup">
                            <label class="u-mar-r_2 u-w_33perc">${detailName}</label>
                            <input class="u-mar-l_auto u-flex_1'" type="${type}" name="${name}" value="${data}">
                        </div>`

    detailsPanelEdit.innerHTML += inputGroup;
}

const removeLeaf = async () => {
    let reqRemovalDoc = getDocFromDetailsPanelId();
    console.log(`I'm tryna remove ${reqRemovalDoc.id}`);

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
    
            currentTreeLeafCollectionRef.doc(reqRemovalDoc.id).delete();
            document.querySelector(`[data-id="${reqRemovalDoc.id}"]`).remove();
        }
    }
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
    let addParentTo = getDocFromDetailsPanelId();
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
    let addChildTo = getDocFromDetailsPanelId();
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
    let addSpouseTo = getDocFromDetailsPanelId();

    let spouseArray = [];

    if (addSpouseTo.data().spouses) {
        for (spouseId of Object.keys(addSpouseTo.data().spouses)) {
            spouseArray.push(spouseId);
        }
    }

    console.log(spouseArray);

    let spouseObject = {};
    let childrenArray = [];

    spouseObject[addSpouseTo.id] = null;

    if (addSpouseTo.data().children) {
        for (childId in addSpouseTo.data().children) {
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
        })
        .catch(err => {
            console.log(err.message)
        })

        if (childrenArray.length > 0) {
            for (childId in childrenArray) {
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
}

const addSibling = (e) => {
    let addSiblingTo = getDocFromDetailsPanelId();
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

initiateModals();
initiateDropdowns();

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

// // Functions needed

// // Set all leaf docs to window.leaves
// // Get specific leaf doc
// // Replace specific leaf doc
// // Delete specific leaf doc

// // Get authMember
// // Set authMember
// // Clear authMember

// // Get authMember trees

// //

// window.leaves = [];

// const memberList = document.querySelector(".familyTree");
// const loggedOutLinks = document.querySelectorAll(".logged-out");
// const loggedInLinks = document.querySelectorAll(".logged-in");
// const adminRole = document.querySelectorAll(".admin-role");
// const userEmail = document.querySelector(".userEmail");
// const createTreeModal = document.querySelector('#create-primary-tree-modal');
// const createTreeButton = document.querySelector('#create-tree-button');
// const editMemberModal = document.querySelector('#edit-member-modal');
// const notificationModal = document.querySelector('#notification-modal');
// const notificationAcceptButton = document.querySelector("#notification-accept-button");
// const notificationDeclineButton = document.querySelector("#notification-decline-button");
// const editMemberForm = document.querySelector('#edit-member-form');
// const editMemberFormButton = document.querySelector('#edit-member-form-button');
// const inviteMemberForm = document.querySelector('#invite-member-form');
// const inviteMemberFormButton = document.querySelector('#invite-member-form-button');
// const treeNameContainer = document.querySelector(".treeName");
// const profileInfoClose = document.querySelector(".profileInfo__close");
// const profileInfoEdit = document.querySelector(".profileInfo__edit");
// const contentContainer = document.querySelector(".contentContainer");
// const navigation = document.querySelector(".navigation");

// const viewPrefZoomIn = document.querySelector(".viewPref--zoomIn");
// const viewPrefZoomOut = document.querySelector(".viewPref--zoomOut");

// const profileInfo = document.querySelector(".profileInfo");
// const profileInfoForm = profileInfo.querySelector("form");
// const profileInfoInformation = profileInfo.querySelector(".profileInfo__information");
// const profileInfoFooter = profileInfo.querySelector(".profileInfo__footer");
// const profileInfoName = profileInfo.querySelector(".profileInfo__name");
// const profileInfoMiddleName = profileInfo.querySelector(".profileInfo__middleName");
// const profileInfoLastName = profileInfo.querySelector(".profileInfo__lastName");
// const profileInfoSurname = profileInfo.querySelector(".profileInfo__surname");
// const profileInfoImage = profileInfo.querySelector(".profileInfo__image");
// const profileInfoEmail = profileInfo.querySelector(".profileInfo__email");
// const profileInfoBirthday = profileInfo.querySelector(".profileInfo__birthday");
// const profileInfoAddress1 = profileInfo.querySelector(".profileInfo__address1");
// const profileInfoAddress2 = profileInfo.querySelector(".profileInfo__address2");
// const profileInfoCity = profileInfo.querySelector(".profileInfo__city");
// const profileInfoZipcode = profileInfo.querySelector(".profileInfo__zipcode");
// const profileInfoCountry = profileInfo.querySelector(".profileInfo__country");

// const viewPref_list = document.querySelector(".viewPref--list");
// const viewPref_tree = document.querySelector(".viewPref--tree");

// // const placeholderImageUrl = "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?cs=srgb&dl=face-facial-hair-fine-looking-guy-614810.jpg&fm=jpg";
// const placeholderImageUrl = "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder.svg?alt=media&token=d3b939f1-d46b-4315-bcc6-3167d17a18ed";
// const placeholderImageUrl2 = "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder_2.svg?alt=media&token=966e665f-5d88-48a9-83d9-eec397b1b823";
// const placeholderImageUrl3 = "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder_3.svg?alt=media&token=fde7c2ee-01a0-472d-a8a0-ea78c2d64620";
// const placeholderImages = [
//     "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder.svg?alt=media&token=d3b939f1-d46b-4315-bcc6-3167d17a18ed",
//     // "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder_2.svg?alt=media&token=966e665f-5d88-48a9-83d9-eec397b1b823",
//     "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder_3.svg?alt=media&token=fde7c2ee-01a0-472d-a8a0-ea78c2d64620",
//     "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder_4.svg?alt=media&token=3e7e95d1-9b65-4085-9442-64d9dab53ec8"
// ];

// viewPref_list.addEventListener('click', () => {
//     memberList.classList.add('list');
// });

// viewPref_tree.addEventListener('click', () => {
//     memberList.classList.remove('list');
// })

// const rendertreeIdFromUrl = (treeIdFromUrl) => {
//     setTreeVariables(treeIdFromUrl);

//     console.log("tree id is in url");
//     // TREE IN URL
//     if (treeIdFromUrl) {

//         trees.doc(treeIdFromUrl).get().then(doc => {
//             window.currentTreeDoc = doc;
            
//             // treeNameContainer.innerHTML += `${currentTreeDoc.data().name}`;
//             setAdminsAndActiveMember();
//         })

//         handleMemberTrees(authMemberDoc.data().trees);

//         let pathName = location.pathname;

//         trees.doc(treeIdFromUrl).collection('leaves').get()
//         .then((allLeaves) => {
//             window.currentTreeLeavesDocs = allLeaves.docs;
//             if (currentTreeLeavesDocs.length > 0) {
//                 // updateDocument('',"Tree!", pathName+"#/trees/"+treeId);
//                 currentTreeLeavesDocs.forEach(leafDoc => {
//                     if (leafDoc.data().topMember === true) {
//                         initiateTree(leafDoc, currentTreeLeavesDocs);
//                     } 
//                 });
//                 // render tree from tree params
//                 // 
//             } else {
//                 memberList.innerHTML = '';

//                 console.log("Tree does not exist!")
//             }
//         })
//         .catch(err => {
//             console.log("Error retreiving tree: "+err);
//         })
//     } else  {
//         memberList.innerHTML = '';
//         // Check for active member
//         // Does active member have a primary tree?
//         // Then see if that have any "trees", pick the first one, make that the new primary.
//         // If no "trees, show "you have no trees!" and maybe a button.
//         console.log("Tree ID is not present");
//     }
// }

// function handleMemberTrees(docs) {
//     docs.forEach(tree => {
//         // let pathName = location.pathname;
//         trees.doc(tree).get().then((treeDoc) => {
//             let link = document.createElement("a");
//             link.setAttribute("href", "#/trees/"+tree);
//             link.textContent = treeDoc.data().name;
//             treeNameContainer.appendChild(link);
//         })
//     })
// }

// const renderPrimaryTreeFromMember = (reqTreeId) => {
//     setTreeVariables();
//     trees.doc(reqTreeId).get().then(doc => {
//         window.currentTreeDoc = doc;
        
//         // treeNameContainer.innerHTML += `${currentTreeDoc.data().name}`;
//         setAdminsAndActiveMember();
//     })

//     handleMemberTrees(authMemberDoc.data().trees);

//     let pathName = location.pathname;
//     // get tree to see if member is admin
    
//     currentTreeLeavesRef.get()
//     .then(allLeaves => {
//         window.currentTreeLeavesDocs = allLeaves.docs;
//         // updateDocument('',"Tree!", pathName+"#/trees/"+reqTreeId);
//         currentTreeLeavesDocs.forEach(leafDoc => {
//             if (leafDoc.data().topMember === true) {
//                 initiateTree(leafDoc, currentTreeLeavesDocs);
//             } 
//         });
//     });

//     updateDocument('',"Tree!", pathName+"#/trees/"+reqTreeId);

//     // Reset view
//     // Set activeMembe
//     // Notificaitons (check and present)

//     // Handle tree based data and presentation
//     // Get that tree's leaf that is claimed by the current member
//     // 

//     // Set authMember (id, email, primary_tree, trees)
//     // Set authMemberLeaf 
//     // Set currentTreeId (name, members, )
//     // 
// }

// function checkForNotifications() {
//     notifications
//     .where('sent_to', '==', authMemberDoc.data().email)
//     .where('status', '==', "pending")
//     .get().then((data) => {

//         if (data.docs.length > 0) {
//             console.log("notifications found");
//             data.docs.forEach(doc => {
//                 console.log("Notification for " +doc.data().sent_to+" to take over leaf member "+doc.data().leaf_to_claim +". Tree: "+doc.data().tree);
//                 let notificationId = notificationModal.querySelector(".notificationId");
//                 let message = notificationModal.querySelector(".notification-message");

//                 notificationId.textContent = doc.id;
//                 message.textContent += doc.data().sent_from + " has invited you to take over a leaf ("+doc.data().leaf_to_claim+")";

//                 if (doc.permission_type === "admin") {
//                     message.textContent += "ADMIN permissions";
//                 } else if (doc.permission_type === "contributor") {
//                     message.textContent += "CONTRIBUTOR permissions";
//                 } else if (doc.permission_type === "viewer") {
//                     message.textContent += "VIEWER permissions.";
//                 }

//                 notificationAcceptButton.addEventListener('click', (e) => {
//                     e.preventDefault;

//                     let notificationId = notificationModal.querySelector(".notificationId").textContent;
//                     let tree = doc.data().tree;
//                     let leaf_to_claim = doc.data().leaf_to_claim;
//                     let permission_type = doc.data().permission_type;

//                     trees.doc(tree).collection('leaves').doc(leaf_to_claim).update({
//                         "claimed_by": authMemberDoc.id,
//                         "invitation" : null
//                     })
//                     .then(() => {
//                         console.log("Leaf claimed and invitation removed!");

//                         notifications.doc(notificationId).delete()
//                         .then(() => {
//                             console.log("Notification deleted!");
//                         })
//                         .catch(err => {
//                             console.log("error deleting notification: "+err.message);
//                         })  

//                         trees.doc(tree).update({
//                             [permission_type] : firebase.firestore.FieldValue.arrayUnion(doc.data().leaf_to_claim)
//                         }).then(() => {
//                             console.log("Successfully set permissions");
//                             console.log("Member has primary tree : "+authMemberDoc.data().primary_tree);
//                             if (!authMemberDoc.data().primary_tree) {
//                                 console.log('Adding family tree as primary :)');
//                                 members.doc(authMemberDoc.id).update({
//                                     "trees" : firebase.firestore.FieldValue.arrayUnion(tree),
//                                     "primary_tree": tree
//                                 })
//                                 .then(() => {  
//                                     console.log("Tree updated!")
//                                     notificationModal.style.display = "none";
//                                     setupViewWithActiveMember(authMemberDoc.id);
//                                 })
//                                 .catch(err => {
//                                     console.log("error updating members: "+err.message)
//                                 })
//                             } else {
//                                 members.doc(authMemberDoc.id).update({
//                                     "trees" : firebase.firestore.FieldValue.arrayUnion(tree),
//                                 })
//                                 .then(() => {  
//                                     console.log("Tree updated!")
//                                     notificationModal.style.display = "none";
//                                     setupViewWithActiveMember(authMemberDoc.id);
//                                 })
//                                 .catch(err => {
//                                     console.log("error updating members: "+err.message)
//                                 })
//                             }
//                         }).catch(err => {
//                             console.log("error updating tree"+err.message)
//                         }) 
                        
//                     }).catch(err => {
//                         console.log("error updating leaf")
//                     }) 
//                 });

//                 notificationDeclineButton.addEventListener('click', (e) => {
//                     e.preventDefault();

//                     let notificationId = notificationModal.querySelector(".notificationId").textContent;
//                     let tree = doc.data().tree;
//                     let leaf_to_claim = doc.data().leaf_to_claim;

//                     trees.doc(tree).collection("leaves").doc(leaf_to_claim).update({
//                         invitation: null
//                     })
//                     .then(() => {
//                         notifications.doc(notificationId).update({
//                             status: "declined"
//                         })
//                         .then(() => {
//                             notificationModal.style.display = "none";
//                             setupViewWithActiveMember(authMemberDoc.id);
//                         })
//                     });
//                 })
//             })
//             notificationModal.style.display = "block";
//         } else {
//             // console.log("no notifications found");
//         }
//     });
// }

// // Render members and actions available 
// const setupView = async (treeDocFromUrl) => {
//     // check to see if parameters exist;

//     if (window.authMemberDoc) {
//         memberList.innerHTML = "";
//         contentContainer.style.display = "";

//         checkForNotifications();
        
//         if (location.hash) {
//             // if tree id comes from url
//             treeNameContainer.innerHTML = '';

//             let treeDoc = await getTreeDocFromUrl();
//             let treeIdFromUrl = treeDoc.id;
            
//             console.log("rendering from url");
//             if (treeDoc) {
//                 rendertreeIdFromUrl(treeIdFromUrl);
//             } else {
//                 renderPrimaryTreeFromMember(authMemberDoc.data().primary_tree);
//             }
//         }
//         else if (authMemberDoc.data().primary_tree && authMemberDoc.data().primary_tree.length > 0) {
//             treeNameContainer.innerHTML = '';
                    
//             console.log("rendering from primary Member");
//             renderPrimaryTreeFromMember(authMemberDoc.data().primary_tree);
//         }

//     } else {
//         updateDocument('',"Welcome!", "/");
//         // if (treeIdFromUrl) {
//         //     console.log("treeid: "+treeIdFromUrl);
//         //     location.search = treeIdFromUrl;
//         // }
//         contentContainer.style.display = "none";
//         console.log("Log in or sign up to begin");
//     }

//     // panzoom(memberList, {
//     //     maxZoom: 1,
//     //     minZoom: 0.5,
//     //     pinchSpeed: .8 // zoom two times faster than the distance between fingers
//     //   });
// }

// async function setTreeVariables(treeIdFromUrl) {
//     let treeId = authMemberDoc.data().primary_tree;

//     if (treeIdFromUrl) {
//         treeId = treeIdFromUrl;
//     }

//     window.currentTreeId = treeId;
//     window.currentTreeRef = trees.doc(currentTreeId);
//     window.currentTreeLeavesRef = currentTreeRef.collection('leaves');
//     window.authMemberTreeLeafDoc = await currentTreeLeavesRef.where("claimed_by", "==", authMemberDoc.id).limit(1).get()
//     .then((data) => {
//         return data.docs[0];
//     })
//     window.authMemberTreeLeafId = authMemberTreeLeafDoc.id;
// }

// const updateDocument = (state=null, title=null, url) => {
//     history.pushState(state, title, url);
//     document.title = title;
// }

// function randomProfileImage() {
//     image = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
//     return image;
// }

// viewPrefZoomIn.addEventListener('click', (e) => {
//     e.preventDefault();
    
//     let zoomAmount = parseInt(memberList.getAttribute("data-zoom"));
//     let matrixZoom;

//     if (zoomAmount === 1) {
//          return
//     } else {
//         zoomAmount = zoomAmount - 1;
//         matrixZoom = 1 / zoomAmount;
//     }

//     memberList.style.transform = `matrix(${matrixZoom}, 0, 0,${matrixZoom}, 0, 0)`;
//     memberList.setAttribute("data-zoom", zoomAmount);
// })

// viewPrefZoomOut.addEventListener('click', (e) => {
//     e.preventDefault();
    
//     let zoomAmount = parseInt(memberList.getAttribute("data-zoom"));
//     let matrixZoom;

//     if (zoomAmount === 4) {
//          return
//     } else {
//         zoomAmount = zoomAmount + 1;
//         matrixZoom = 1 / zoomAmount;
//     }

//     memberList.style.transform = `matrix(${matrixZoom}, 0, 0,${matrixZoom}, 0, 0)`;
//     memberList.setAttribute("data-zoom", zoomAmount);
// })


// async function setAdminsAndActiveMember() {
//     admins = currentTreeDoc.data().admins;
//     contributors = currentTreeDoc.data().contributors;
//     viewers = currentTreeDoc.data().viewers;

//     window.isAdminLeaf = admins.find(adminMember => adminMember === authMemberTreeLeafId) ? true : false;
//     window.isContributorLeaf = contributors.find(contributorMember => contributorMember === authMemberTreeLeafId) ? true : false;
//     window.isViewerLeaf = viewers.find(viewerMember => viewerMember === authMemberTreeLeafId) ? true : false;;
// }

// async function initiateBranch(doc) {
//     let branch = await buildBranchFromChosenMember(doc);
//     memberList.appendChild(branch);
// }

// async function buildBranchFromChosenMember(doc) {
//     let branch = document.createElement("ul");
//     let directMemberContainer = document.createElement("ul");
//     let descendantsContainer = document.createElement("ul");
//     let chosenMember = await getMemberLi({
//         "leafDoc": doc 
//     });
    
//     branch.setAttribute('class', 'branch');
//     descendantsContainer.setAttribute('class', 'descendants');
//     directMemberContainer.setAttribute('class', 'directMembers');
//     directMemberContainer.insertAdjacentHTML('afterbegin', chosenMember);

//     if (doc) {
//         window.leaves.push(doc);

//         let spouses = doc.data().spouses ? Object.entries(doc.data().spouses) : "";
//         let children = doc.data().children;
    
//         if (spouses && spouses.length > 0) {
//             // is spouse divorced, separated, or married?

//             for (const spouse of spouses) {
//                 let spouseKey = spouse[0];
//                 let spouseValue = spouse[1];
//                 let spouseRelationship = spouseValue !== null ? "spouse "+spouse[1] : "spouse";
//                 let spouseDoc = currentTreeLeavesDocs.find(spouseReq => spouseReq.id === spouseKey);
//                 let spouseEl = await getMemberLi({
//                     "leafDoc" : spouseDoc,
//                     "relationship" : spouseRelationship
//                 });

//                 directMemberContainer.insertAdjacentHTML('beforeend', spouseEl);
//               }
//         }
    
//         if (children && children.length > 0) {

//             for (const child of children) {
//                 let childDoc = currentTreeLeavesDocs.find(childReq => childReq.id === child);
//                 let descendantBranch = await buildBranchFromChosenMember(childDoc);
//                 descendantsContainer.prepend(descendantBranch);
//             }

//             branch.prepend(descendantsContainer);
//         }
//     } else {

//     }
//     // directMemberContainer.prepend(chosenMember);
//     branch.prepend(directMemberContainer);
    
//     return branch;
// }

// const addEventListenerToProfileLeaves = () => {
//     let profileLeaves = document.querySelectorAll(".profileLeaf");
//     profileLeaves.forEach(profileLeaf => {
//         profileLeaf.addEventListener('contextmenu', (e) => {
//             e.preventDefault();
//             e.target.querySelector(".actions_dropdown").classList.add("show");
//         });

//         profileLeaf.addEventListener('touchstart', (e) => {
//             e.preventDefault();
//             if (e.touches.length === 2) {
//                 e.target.querySelector(".actions_dropdown").classList.add("show");
//             } else if (e.touches.length === 1) {
//                 editMember(e);
//                 handleProfileInfo("show", e);
//             }
//         });

//         profileLeaf.addEventListener('click', (e) => {
//             editMember(e);
//             handleProfileInfo("show", e);
//         });
//     })
// }

// async function initiateTree(doc) {
//     let chosenMemberSiblings = doc.data().siblings ? doc.data().siblings : false;
//     let chosenMemberBranch = await buildBranchFromChosenMember(doc);
    
//     memberList.appendChild(chosenMemberBranch);

//     if (chosenMemberSiblings && chosenMemberSiblings.length > 0) {

//         for (const sibling of chosenMemberSiblings) {
//             let siblingDoc = currentTreeLeavesDocs.find(siblingReq => siblingReq.id === sibling);
//             let siblingsBranch = await buildBranchFromChosenMember(siblingDoc);
//             memberList.appendChild(siblingsBranch);
//           }
//     }

//     // treeNameContainer.addEventListener('click', (e) => {
//     //     console.log("this will open a menu of trees");
//     // })

//     profileInfoClose.addEventListener("click", (e) => {
//         handleProfileInfo();
//     });

//     profileInfoEdit.addEventListener('click', (e) => {
//         profileInfoForm.style.display = "block";
//         profileInfoInformation.style.display = "none";
//         profileInfoFooter.style.display = "block";
//     })

//     addEventListenerToProfileLeaves();

//     let cancelInviteMemberAction = document.querySelectorAll(".cancel_invite_member_action");
//     cancelInviteMemberAction.forEach(action => {
//         action.addEventListener('click', (e) => {
//             e.preventDefault();
//             e.stopPropagation();

//             let targetEl = e.target.closest(".profileLeaf");
//             let targetLeafId = targetEl.getAttribute('data-id');

//             currentTreeLeavesRef.doc(targetLeafId).get()
//             .then((leafDoc) => {
//                 let invitationId = leafDoc.data().invitation;
//                 console.log(invitationId);
//                 notifications.doc(invitationId).delete()
//                 .then(()=> {
//                     currentTreeLeavesRef.doc(targetLeafId).update({
//                         "invitation": null
//                     }).catch(err => {
//                         console.log("Error upating leaf invitation: "+err.message);
//                     });
//                     setupViewWithActiveMember(authMemberDoc.id);
//                 })
//                 .catch(err => {
//                     console.log("Error deleting notification: "+err.message);
//                 })
//             });
//         })
//     });

//     let inviteMemberAction = document.querySelectorAll(".invite_member_action");
//     inviteMemberAction.forEach(action => {
//         action.addEventListener('click', (e) => {
//             e.preventDefault();
//             e.stopPropagation();

//             let targetEl = e.target.closest(".profileLeaf");
//             let targetMemberId = targetEl.getAttribute('data-id');

//             inviteMemberForm.querySelector("#invite-leaf-id").value = targetMemberId;
//             inviteMemberForm.style.display = "block";
//         })
//     })

//     inviteMemberFormButton.addEventListener("click", (e) => {  
//         e.target.style.pointerEvents = "none";
//         e.target.setAttribute("disabled", "disabled");
//         e.preventDefault();
//         createInvitation(e);
//     });

//     function createInvitation(e) {
//         console.log("Clicked!!");

//         let leafId = inviteMemberForm.querySelector("#invite-leaf-id").value;
//         let invitationTo = inviteMemberForm.querySelector("#invite-email").value;
//         let permission = inviteMemberForm.querySelector('[name="permission-type"]:checked').value;

//         notifications.add({
//             "type": "invite",
//             "sent_to": invitationTo,
//             "sent_from" : authMemberDoc.id,
//             "leaf_to_claim": leafId,
//             "tree" : currentTreeId,
//             "status": "pending",
//             "permission_type": permission
//         })
//         .then((notificationReq) => {
//             currentTreeLeavesRef.doc(leafId).update({
//                 "invitation": notificationReq.id
//             })
//             .then(() => {
//                 console.log("notification made!");
//                 e.target.style.pointerEvents = null;
//                 inviteMemberForm.style.display = "none";
//                 e.target.setAttribute("disabled", null);
//             })
//             .catch(err => {
//                 console.log(err.message);
//             })
//         })
//         .catch(err => {
//             console.log(err.message);
//         })
//     }

//     let deleteLeafActions = document.querySelectorAll(".delete_leaf_action");
//     deleteLeafActions.forEach(action => {
//         action.addEventListener('click', (e) => {
//             deleteLeaf(e);
//         })
//     })

//     let deleteMemberActions = document.querySelectorAll(".delete_member_action");
//     deleteMemberActions.forEach(action => {
//         action.addEventListener('click', (e) => {
//             deleteMember(e);
//         })
//     })

//     let childButtons = document.querySelectorAll(".add_child_option");
//     childButtons.forEach(childButton => {
//         childButton.addEventListener('click', (e) => {
//             e.preventDefault();
//             e.stopPropagation();
            
//             // get target member
//             let targetEl = e.target.closest(".profileLeaf");
//             let targetMemberId = targetEl.getAttribute('data-id');
//             let parents = [];
    
//             parents.push(targetMemberId);
    
//             // create child member, update parent members
//             currentTreeLeavesRef.doc(targetMemberId).get()
//             .then((targetMemberRef) => {
//                 if (targetMemberRef.data().spouses && targetMemberRef.data().spouses.length > 0) {
//                     targetMemberRef.data().spouses.forEach(spouseId => {
//                         parents.push(spouseId);
//                     })
//                 }
    
//                 currentTreeLeavesRef.add({
//                     name: {
//                         firstName: null,
//                         middleName: null,
//                         lastName: null,
//                         surname: null
//                     },
//                     parents: firebase.firestore.FieldValue.arrayUnion(...parents),
//                     children: [],
//                     spouses: null,
//                     siblings: [],
//                     topMember: false,
//                     created_by: authMemberDoc.id
//                 }).then(childRef => {
//                     trees.doc(currentTreeId).update({
//                         viewers: firebase.firestore.FieldValue.arrayUnion(childRef.id)
//                     }).catch(err => {
//                         console.log("Error adding new member to tree: "+err.message);
//                     });
//                     if (parents && parents.length > 0) {
//                         parents.forEach(parentId => {    
//                             currentTreeLeavesRef.doc(parentId).update({
//                                 children: firebase.firestore.FieldValue.arrayUnion(childRef.id)
//                             })
//                             .then(() => {
//                                 // Do something
//                             })
//                             .catch((err) => {
//                                 console.log(err.message);
//                             }) 
//                         })
//                     };
//                     setupViewWithActiveMember(authMemberDoc.id);
//                     // renderChildToDom(childRef, targetEl);
    
//                 }).catch((err) => {
//                     console.log(err.message)
//                 })
//             })
//         })
//     })

//     let sibilngButtons = document.querySelectorAll(".add_sibling_option");
//     sibilngButtons.forEach(siblingButton => {
//         siblingButton.addEventListener('click', (e) => {
//             e.stopPropagation();
//             e.preventDefault();
    
//             // get target member
//             let targetEl = e.target.closest(".profileLeaf");
//             let targetMemberId = targetEl.getAttribute('data-id');
    
//             console.log(currentTreeLeavesRef);
//             console.log("targetMemberId: "+targetMemberId);

//             currentTreeLeavesRef.doc(targetMemberId).get()
//             .then((targetMemberRefDoc) => {
//                 let siblings = [];
//                 let parents = [];

//                 // console.log("doc id: "+targetMemberRefDoc.id);
//                 // console.log(targetMemberRefDoc);
//                 // console.log(targetMemberRefDoc.data().siblings.length > 0);

//                 console.log("doc siblings: "+targetMemberRefDoc.data().siblings);
    
//                 if ( targetMemberRefDoc.data().siblings && targetMemberRefDoc.data().siblings.length > 0) {
//                     targetMemberRefDoc.data().siblings.forEach(sibling => {
//                         siblings.push(sibling);
//                     })
//                 }
//                 if ( targetMemberRefDoc.data().parents && targetMemberRefDoc.data().parents.length > 0) {
//                     targetMemberRefDoc.data().parents.forEach(parent => {
//                         parents.push(parent);
//                     })
//                 }
    
//                 siblings.push(targetMemberId);
    
//                 currentTreeLeavesRef.add({
//                     name: {
//                         firstName: null,
//                         middleName: null,
//                         lastName: null,
//                         surname: null
//                     },
//                     siblings: firebase.firestore.FieldValue.arrayUnion(...siblings),
//                     parents: [],
//                     spouses: null,
//                     children: [],
//                     topMember: false,
//                     created_by: authMemberDoc.id
//                 }).then(newSiblingRef => {
//                     trees.doc(currentTreeId).update({
//                         viewers: firebase.firestore.FieldValue.arrayUnion(newSiblingRef.id)
//                     }).catch(err => {
//                         console.log("Error adding new member to tree: "+err.message);
//                     });
//                     siblings.forEach(siblingId => {
//                         currentTreeLeavesRef.doc(siblingId).update({
//                             siblings: firebase.firestore.FieldValue.arrayUnion(newSiblingRef.id)
//                         })
//                     });
//                     if ( targetMemberRefDoc.data().parents && targetMemberRefDoc.data().parents.length > 0 ) {
//                         currentTreeLeavesRef.doc(newSiblingRef.id).update({
//                             parents: firebase.firestore.FieldValue.arrayUnion(...parents)
//                         });
    
//                         parents.forEach(parentId => {
//                             currentTreeLeavesRef.doc(parentId).update({
//                                 children: firebase.firestore.FieldValue.arrayUnion(newSiblingRef.id)
//                             })
//                         });
//                     }
//                     setupViewWithActiveMember(authMemberDoc.id);
//                 })
//             });
//         })
//     })


//     let spouseButtons = document.querySelectorAll(".add_spouse_option");
//     spouseButtons.forEach(spouseButton => {
//         spouseButton.addEventListener('click', (e) => {
//             e.stopPropagation();
//             e.preventDefault();
    
//             let targetEl = e.target.closest(".profileLeaf");
//             let targetMemberId = targetEl.getAttribute('data-id');
    
//             currentTreeLeavesRef.doc(targetMemberId).get()
//             .then((targetMemberDoc) => {
//                 // add these to new spouse
//                 let children = [];
//                 let spouses = {};
//                 spouses[targetMemberId] = null;
    
//                 if ( targetMemberDoc.data().children && targetMemberDoc.data().children.length > 0 ) {
//                     targetMemberDoc.data().children.forEach(child => {
//                         children.push(child);
//                     })
//                 }

//                 currentTreeLeavesRef.add({
//                     name: {
//                         firstName: null,
//                         middleName: null,
//                         lastName: null,
//                         surname: null
//                     },
//                     spouses: spouses,
//                     siblings: [],
//                     children: [],
//                     parents: [],
//                     topMember: false,
//                     created_by: authMemberDoc.id
//                 }).then(spouseRef => {
//                     trees.doc(currentTreeId).update({
//                         viewers: firebase.firestore.FieldValue.arrayUnion(spouseRef.id)
//                     }).catch(err => {
//                         console.log("Error adding new member to tree: "+err.message);
//                     });
//                     if ( targetMemberDoc.data().children && targetMemberDoc.data().children.length > 0 ) {
//                         children.forEach(childId => {
//                             currentTreeLeavesRef.doc(childId).update({
//                                 parents: firebase.firestore.FieldValue.arrayUnion(spouseRef.id)
//                             })
//                             .then(() => {
//                                 console.log("Children updated to include new spouse");
//                             })
//                         })
//                         currentTreeLeavesRef.doc(spouseRef.id).update({
//                             children: firebase.firestore.FieldValue.arrayUnion(...children)
//                         });
//                     }

//                     let spouseObj = {};
//                     spouseObj[spouseRef.id] = null;

//                     currentTreeLeavesRef.doc(targetMemberId).set({
//                         spouses: spouseObj
//                     }, {merge: true})
//                     .then(() => {
//                         setupViewWithActiveMember(authMemberDoc.id);
//                     }).catch((err) => {
//                         console.log(err.message);
//                     })
//                 });
//             })
//         })
//     })

//     let parentButtons = document.querySelectorAll(".add_parent_option");
//     parentButtons.forEach(parentButton => {
//         parentButton.addEventListener('click', (e) => {
//             e.stopPropagation();

//             // get target member
//             let targetEl = e.target.closest(".profileLeaf");
//             let targetMemberId = targetEl.getAttribute('data-id');
    
//             currentTreeLeavesRef.doc(targetMemberId).get()
//             .then(targetMemberRefDoc => {
//                 let childrenOfParent = [];
    
//                 if ( targetMemberRefDoc.data().siblings.length > 0) {
//                     targetMemberRefDoc.data().siblings.forEach(sibling => {
//                         childrenOfParent.push(sibling);
//                     })
//                 }
    
//                 childrenOfParent.push(targetMemberId);
    
//                 currentTreeLeavesRef.add({
//                     name: {
//                         firstName: null,
//                         middleName: null,
//                         lastName: null,
//                         surname: null
//                     },
//                     siblings: [],
//                     parents: [],
//                     spouses: [],
//                     children: firebase.firestore.FieldValue.arrayUnion(...childrenOfParent),
//                     topMember: true,
//                     created_by: authMemberDoc.id
//                 }).then(parentRef => {
//                     trees.doc(currentTreeId).update({
//                         viewers: firebase.firestore.FieldValue.arrayUnion(parentRef.id)
//                     }).catch(err => {
//                         console.log("Error adding new member to tree: "+err.message);
//                     });
//                     childrenOfParent.forEach(childId => {
//                         currentTreeLeavesRef.doc(childId).update({
//                             topMember: false,
//                             parents: firebase.firestore.FieldValue.arrayUnion(parentRef.id)
//                         })
//                         .then(() => {
//                             // renderParentToDom(parentRef);
//                             setupViewWithActiveMember(authMemberDoc.id);
//                             console.log("new parent added");
//                         })
//                     })
//                 })
//             });
//         })
//     })
// }

// function handleProfileInfo(state, e) {
//     if (state) {
//         if (state == "show") {
//             let target = e.target;

//             let name = target.querySelector(".profileLeaf__caption").textContent;
//             let middleName = target.querySelector(".profileLeaf__middleName").textContent;
//             let lastName = target.querySelector(".profileLeaf__lastName").textContent;
//             let surname = target.querySelector(".profileLeaf__surname").textContent;
//             let imageUrl = target.querySelector(".profileLeaf__image").getAttribute("src");
//             let email = target.querySelector(".profileLeaf__email").textContent;
//             let birthday = target.querySelector(".profileLeaf__birthday").textContent;
//             let deceased = target.querySelector(".profileLeaf__deceased");
//             let address1 = target.querySelector(".profileLeaf__address1").textContent;
//             let address2 = target.querySelector(".profileLeaf__address2").textContent;
//             let city = target.querySelector(".profileLeaf__city").textContent;
//             let zipcode = target.querySelector(".profileLeaf__zipcode").textContent;
//             let country = target.querySelector(".profileLeaf__country").textContent;

//             profileInfoName.textContent = name; 
//             profileInfoMiddleName.textContent = middleName; 
//             profileInfoLastName.textContent = lastName; 
//             profileInfoSurname.textContent = surname; 
//             profileInfoImage.setAttribute('src', imageUrl); 
//             profileInfoEmail.textContent = email; 
//             profileInfoBirthday.textContent = birthday; 
//             profileInfoAddress1.textContent = address1; 
//             profileInfoAddress2.textContent = address2; 
//             profileInfoCity.textContent = city; 
//             profileInfoZipcode.textContent = zipcode; 
//             profileInfoCountry.textContent = country; 

//             profileInfo.classList.add("show");

//             profileInfoForm.style.display = "none";
//             profileInfoInformation.style.display = "block";
//             profileInfoFooter.style.display = "none";

//             if (!isAdminLeaf) {
//                 profileInfoEdit.style.display = "none";
//                 profileInfo.querySelector(".profileInfo__imageUploadButton").style.display = "none";;
//                 profilePhotoInputUpload.style.display = "none";
//             } else {
//                 profileInfoEdit.style.display = "block";
//                 profileInfo.querySelector(".profileInfo__imageUploadButton").style.display = "block";;
//                 profilePhotoInputUpload.style.display = "block";            }
//         }
//     } else {
//         profileInfo.classList.remove("show");
//     }
// }

// const getProfileImageURL = async (leafDoc) => {
//     if (leafDoc.data().photo) {
//         let storageRef = storage.ref();
//         let imageRef = storageRef.child(leafDoc.data().photo);

//         return imageRef.getDownloadURL();
//     }
// }

// const getMemberLi = async (params) => {
//     let leafDoc = params["leafDoc"] ? params["leafDoc"] : false;
//     let leafDocData = leafDoc.data();
//     let name = leafDocData.name.firstName ? leafDocData.name.firstName : "Unnamed";
//     let middleName = leafDocData.name.middleName ? leafDocData.name.middleName : "Unnamed";
//     let lastName = leafDocData.name.lastName ? leafDocData.name.lastName : "Unnamed";
//     let surname = leafDocData.name.surname ? leafDocData.name.surname : "Unnamed";
//     let email = leafDocData.email ? leafDocData.email : "No email set";
//     let birthday = leafDocData.birthday ? leafDocData.birthday.toDate() : "No birthday set";
//     let address1 = leafDocData.address ? leafDocData.address.address1 : "No address1 set";
//     let address2 = leafDocData.address ? leafDocData.address.address2 : "No address2 set";
//     let city = leafDocData.address ? leafDocData.address.city : "No city set";
//     let zipcode = leafDocData.address ? leafDocData.address.zipcode : "No zipcode set";
//     let country = leafDocData.address ? leafDocData.address.country : "No country set";
//     let classNames = params["relationship"] ? params["relationship"] : '';
//     let claimedBy = leafDocData.claimed_by ? leafDocData.claimed_by : false; 
//     let createdBy = leafDocData.created_by ? leafDocData.created_by : false; 

//     let has_invitation = leafDocData.invitation ?  leafDocData.invitation : false;
//     let is_topMember = leafDocData.topMember === true ? true : false;

//     let parentMenuOption = '';
//     let spouseMenuOption = '';
//     let siblingMenuOption = '';
//     let childMenuOption = '';
//     let deleteMenuOption = '';
//     let inviteMenuOption = '';

//     if (classNames.includes("spouse")) {
//         // check for married, seperated, divorced
//     }

//     if (claimedBy === authMemberDoc.id) {
//         classNames = classNames + " you"; 
//     }

//     // if admin
//     // If invitation is pending
//     if (leafDoc) {

//         // if (isAdminLeaf) {
//         //     if (leafDoc.id === authMemberTreeLeafId) {
//         //         treeNameContainer.innerHTML += "(admin)"

//         //         if (currentTreeId === authMemberDoc.data().primary_tree) {
//         //             treeNameContainer.innerHTML += "(primary)"
//         //         }
//         //     }
//         // }

//         // if (isContributorLeaf) {
//         //     if (leafDoc.id === authMemberTreeLeafId) {
//         //         treeNameContainer.innerHTML += "(contributor)"

//         //         if (currentTreeId === authMemberDoc.data().primary_tree) {
//         //             treeNameContainer.innerHTML += "(primary)"
//         //         }
//         //     }
//         // }

//         // if (isViewerLeaf) {
//         //     if (leafDoc.id === authMemberTreeLeafId) {
//         //         treeNameContainer.innerHTML += "(viewer)"

//         //         if (currentTreeId === authMemberDoc.data().primary_tree) {
//         //             treeNameContainer.innerHTML += "(primary)"
//         //         }
//         //     }
//         // }

//         if (isAdminLeaf) {

//             console.log("admin?: "+isAdminLeaf);

//             if (has_invitation) {
//                 inviteMenuOption = `<div class="cancel_invite_member_action">Cancel invitation</div>`;
//             } else if (!claimedBy){
//                 inviteMenuOption = `<div class="invite_member_action">Invite</div>`;
//             } else if (claimedBy) {

//             }
            
//             if (!claimedBy) {
//                 deleteMenuOption = `<div class="delete_leaf_action" style="color:red;">Delete</div>`;
//             } else if (claimedBy === authMemberDoc.id) {
//             } else {
//                 deleteMenuOption = `<div class="delete_member_action" style="color:red;">Uninvite ${name}</div>`;
//             }
            
//             childMenuOption = `<div class="add_child_option">Add child</div>`;
//             spouseMenuOption = `<div class="add_spouse_option">Add partner</div>`;
//             siblingMenuOption = `<div class="add_sibling_option">Add sibling</div>`;

//             if (is_topMember) {
//                 parentMenuOption = `<div class="add_parent_option">Add parent</div>`;
//             }
//         } else {
//             if (createdBy === authMemberDoc.id && !claimedBy) {
//                 childMenuOption = `<div class="add_child_option">Add child</div>`;
//                 spouseMenuOption = `<div class="add_spouse_option">Add partner</div>`;
//                 siblingMenuOption = `<div class="add_sibling_option">Add sibling</div>`;
//                 inviteMenuOption = `<div class="invite_member_action">Invite</div>`;
//                 deleteMenuOption = `<div class="delete_leaf_action" style="color:red;">Delete</div>`;
//             }
//         }
//     }

//     if (leafDoc && claimedBy) {
//         const memberDoc = await members.doc(claimedBy).get();
//         name = memberDoc.data().name.firstName;
//         middleName = memberDoc.data().name.middleName;
//         lastName = memberDoc.data().name.lastName;
//         surname = memberDoc.data().name.surname;
//         email = memberDoc.data().email;
//         birthday = memberDoc.data().birthday;
//         classNames = classNames + " claimed";
//     }

//     return generateProfileLeafHtml({
//         "name": name,
//         "middleName": middleName,
//         "lastName": lastName,
//         "surname": surname,
//         "classNames": classNames,
//         "leafDoc": leafDoc,
//         "parentMenuOption": parentMenuOption,
//         "spouseMenuOption": spouseMenuOption,
//         "siblingMenuOption": siblingMenuOption,
//         "childMenuOption": childMenuOption,
//         "deleteMenuOption": deleteMenuOption,
//         "inviteMenuOption": inviteMenuOption,
//         "profilePhoto" : await getProfileImageURL(leafDoc),
//         "email": email,
//         "birthday": birthday,
//         "address1": address1,
//         "address2": address2,
//         "city": city,
//         "zipcode": zipcode,
//         "country": country
//     })
// }

// function generateProfileLeafHtml(params) {
//     let name = params["name"];
//     let middleName = params["middleName"];
//     let lastName = params["lastName"];
//     let surname = params["surname"];
//     let classNames = params["classNames"];
//     let leafDoc = params["leafDoc"];
//     let parentMenuOption = params["parentMenuOption"] ? params["parentMenuOption"] : '';
//     let spouseMenuOption = params["spouseMenuOption"] ? params["spouseMenuOption"] : '';
//     let siblingMenuOption = params["siblingMenuOption"] ? params["siblingMenuOption"] : '';
//     let childMenuOption = params["childMenuOption"] ? params["childMenuOption"] : '';
//     let deleteMenuOption = params["deleteMenuOption"] ? params["deleteMenuOption"] : '';
//     let inviteMenuOption = params["inviteMenuOption"] ? params["inviteMenuOption"] : '';
//     let email = params['email'];
//     let birthday = params['birthday'];
//     let address1 = params['address1'];
//     let address2 = params['address2'];
//     let city = params['city'];
//     let zipcode = params['zipcode'];
//     let country = params['country'];
//     let profilePhoto = params["profilePhoto"] ? params['profilePhoto'] : randomProfileImage();

//     let li = `
//         <figure class="profileLeaf ${classNames}" data-id="${leafDoc.id}">
//             <img class="profileLeaf__image" src="${profilePhoto}"/>
//             <div class="profileLeaf__connection"></div>
//             <div class="actions">
//                 <div class="actions_dropdown">
//                     ${parentMenuOption}
//                     ${childMenuOption}
//                     ${siblingMenuOption}
//                     ${spouseMenuOption}
//                     ${inviteMenuOption}
//                     ${deleteMenuOption}
//                 </div>
//             </div>
//             <div class="profileLeaf__info">
//                 <span class="profileLeaf__email">${email}</span>
//                 <span class="profileLeaf__middleName">${middleName}</span>
//                 <span class="profileLeaf__lastName">${lastName}</span>
//                 <span class="profileLeaf__surname">${surname}</span>
//                 <span class="profileLeaf__address1">${address1}</span>
//                 <span class="profileLeaf__address2">${address2}</span>
//                 <span class="profileLeaf__city">${city}</span>
//                 <span class="profileLeaf__zipcode">${zipcode}</span>
//                 <span class="profileLeaf__country">${country}</span>
//                 <span class="profileLeaf__birthday">${birthday}</span>
//             </div>
//             <figcaption class="profileLeaf__caption profileLeaf__name">${name}</figcaption> 
//         </figure>
//     `
//     return li;
// }

// // Set up elements based on authentication status

// const setupAuthUi = (user) => {
//     if (user) {
//         if (user.admin) {
//             adminRole.forEach(item => item.style.display = "block");
//         }
//         userEmail.textContent = user.email;
//         loggedInLinks.forEach(item => item.style.display = "block");
//         loggedOutLinks.forEach(item => item.style.display = "none");
//     } else {
//         loggedInLinks.forEach(item => item.style.display = "none");
//         loggedOutLinks.forEach(item => item.style.display = "block");
//         adminRole.forEach(item => item.style.display = "none");
//     }
// }

// function editMember(e) {
//     let targetEl = e.target.closest(".profileLeaf");
//     let targetMemberId = targetEl.getAttribute('data-id');
//     let leafName = targetEl.querySelector(".profileLeaf__name").textContent;
//     let leafMiddleName = targetEl.querySelector(".profileLeaf__middleName").textContent;
//     let leafLastName = targetEl.querySelector(".profileLeaf__lastName").textContent;
//     let leafSurname = targetEl.querySelector(".profileLeaf__surname").textContent;
//     let leafEmail = targetEl.querySelector(".profileLeaf__email").textContent;
//     let leafBirthday = targetEl.querySelector(".profileLeaf__birthday").textContent ? targetEl.querySelector(".profileLeaf__birthday").textContent : false;
//     let leafAddress1 = targetEl.querySelector(".profileLeaf__address1").textContent;
//     let leafAddress2 = targetEl.querySelector(".profileLeaf__address2").textContent;
//     let leafCity = targetEl.querySelector(".profileLeaf__city").textContent;
//     let leafZipcode = targetEl.querySelector(".profileLeaf__zipcode").textContent;
//     let leafCountry = targetEl.querySelector(".profileLeaf__country").textContent;

//     let leafNameText = leafName === 'Unnamed' ? '' : leafName;
    
//     if (typeof leafBirthday !== "string") {
//         leafBirthday = new Date(leafBirthday).toISOString().substring(0, 10);
//         editMemberForm["birthday"].value = leafBirthday;
//     }

//     editMemberForm["memberId"].value = targetMemberId;
//     editMemberForm["name"].value = leafNameText;
//     editMemberForm["middleName"].value = leafMiddleName;
//     editMemberForm["lastName"].value = leafLastName;
//     editMemberForm["surname"].value = leafSurname;
//     editMemberForm["email"].value = leafEmail;
//     editMemberForm["birthday"].value = leafBirthday;
//     editMemberForm["address1"].value = leafAddress1;
//     editMemberForm["address2"].value = leafAddress2;
//     editMemberForm["city"].value = leafCity;
//     editMemberForm["zipcode"].value = leafZipcode;
//     editMemberForm["country"].value = leafCountry;
// }

// editMemberFormButton.addEventListener('click', (e) => {
//     e.preventDefault();

//     let memberId = editMemberForm['memberId'].value;
//     let name = editMemberForm['name'].value;
//     let middleName = editMemberForm['middleName'].value;
//     let lastName = editMemberForm['lastName'].value;
//     let surname = editMemberForm['surname'].value;
//     let email = editMemberForm['email'].value;
//     let birthday = editMemberForm['birthday'].value ? new Date(editMemberForm['birthday'].value) : null;
//     let address1 = editMemberForm['address1'].value;
//     let address2 = editMemberForm['address2'].value;
//     let city = editMemberForm['city'].value;
//     let zipcode = editMemberForm['zipcode'].value;
//     let country = editMemberForm['country'].value;

//     currentTreeLeavesRef.doc(memberId).update({
//         "name": {
//             "firstName": name,
//             "lastName": lastName,
//             "middleName": middleName,
//             "surname": surname
//         },
//         "email": email,
//         "birthday": birthday,
//         "address": {
//             "address1": address1,
//             "address2": address2,
//             "city": city,
//             "zipcode": zipcode,
//             "country": country
//         }
//     }).then(() => {
//         let targetLeaf = memberList.querySelector('.profileLeaf[data-id="'+memberId+'"]');
        
//         targetLeaf.querySelector(".profileLeaf__name").textContent = name;

//         // editMemberForm.reset();
//         // M.Modal.getInstance(editMemberModal).close();
//         console.log("Updated successfully!");
//     })

// });

// async function deleteMember(e) {
//     e.stopPropagation();
//     e.preventDefault();

//     let leafEl = e.target.closest(".profileLeaf");
//     let leafMemberId = leafEl.getAttribute('data-id');

//     let leafDoc = await currentTreeLeavesRef.doc(leafMemberId).get();
//     let memberId = leafDoc.data().claimed_by;

//     let memberDoc = await members.doc(memberId).get();
//     let memberPrimaryTree = memberDoc.data().primary_tree;

//     console.log("Current tree is: "+currentTreeId);
//     console.log("Member's primary tree is: "+memberPrimaryTree)

//     if (currentTreeId === memberPrimaryTree) {
//         members.doc(memberId).update({
//             "trees": firebase.firestore.FieldValue.arrayRemove(currentTreeId),
//             "primary_tree": null
//         })
//         .catch((err) => {
//             console.log("member trees and primary tree not updated")
//         })
//     } else {
//         members.doc(memberId).update({
//             "trees": firebase.firestore.FieldValue.arrayRemove(currentTreeId),
//         })
//         .catch((err) => {
//             console.log("member trees not updated")
//         })
//     }

//     currentTreeLeavesRef.doc(leafMemberId).update({
//         "claimed_by": null
//     })
//     .catch((err) => {
//         console.log("primary tree not updated")
//     })

//     trees.doc(currentTreeId).update({
//         "admins": firebase.firestore.FieldValue.arrayRemove(leafMemberId),
//         "contributors": firebase.firestore.FieldValue.arrayRemove(leafMemberId),
//         "viewers": firebase.firestore.FieldValue.arrayRemove(leafMemberId)
//     })
//     .then(() => {
//         console.log("Tree updated to remove leaf from permissions");
//     })
//     .catch((err) => {
//         console.log("tree not updated")
//     })

//     setupViewWithActiveMember(authMemberDoc.id);
// }

// function deleteLeaf(e) {
//     e.stopPropagation();
//     e.preventDefault();

//     let targetEl = e.target.closest(".profileLeaf");
//     let targetMemberId = targetEl.getAttribute('data-id');
//     // let targetMemberId = editMemberForm["memberId"].value;
//     // let targetEl = document.querySelector("[data-id='"+targetMemberId+"']");

//     currentTreeLeavesRef.doc(targetMemberId).get().then(targetMemberDoc => { 
//         console.log()
//         if ( targetMemberDoc.data().claimed_by === authMemberDoc.id ) {
//             alert("You cannot delete yourself. I will figure out a way not to show the button in the future");
//             return;
//         }

//         warnAboutDescendants(targetMemberDoc);
//         removeFromSiblings(targetMemberDoc);
//         removeFromSpouses(targetMemberDoc);
//         removeFromChildren(targetMemberDoc);
//         removeFromParents(targetMemberDoc);

//         if (targetMemberDoc.data().topMember === true) {
//             if ( targetMemberDoc.data().spouses && targetMemberDoc.data().spouses.length > 0 ) {
//                 currentTreeLeavesRef.doc(targetMemberDoc.data().spouses[0]).update({
//                     topMember: true
//                 })
//                 .then(() => {
//                     console.log("spouse was made top member");
//                 })
//             } else if ( targetMemberDoc.data().children && targetMemberDoc.data().children.length > 0 ) {
//                 currentTreeLeavesRef.doc(targetMemberDoc.data().children[0]).update({
//                     topMember: true
//                 })
//                 .then(() => {
//                     console.log("child was made top member");
//                 })
//             } else if ( targetMemberDoc.data().siblings && targetMemberDoc.data().siblings > 0 ) {
//                 currentTreeLeavesRef.doc(targetMemberDoc.data().siblings[0]).update({
//                     topMember: true
//                 })         
//             }       
//         }

//         currentTreeLeavesRef.doc(targetMemberId).delete()
//         .then(() => {
//             // M.Modal.getInstance(editMemberModal).close();
//             removeMemberFromDom(targetEl);
//         });
//     });
// }

// function removeMemberFromDom(targetEl) {
//     targetEl.remove();
// }

// function renderParentToDom(parentRef) {
//     let descendantHTML = memberList.innerHTML;
//     let branch = document.createElement("ul");
//     let directMemberContainer = document.createElement("ul");
//     let descendantsContainer = document.createElement("ul");

//     branch.setAttribute('class', 'branch');
//     descendantsContainer.setAttribute('class', 'descendants');
//     directMemberContainer.setAttribute('class', 'directMembers');

//     currentTreeLeavesRef.doc(parentRef.id).get()
//     .then((parentDoc) => {
//         directMemberContainer.appendChild( buildLeaf(parentDoc) );
//     })

//     memberList.innerHTML = '';

//     descendantsContainer.innerHTML += descendantHTML;
//     branch.appendChild(directMemberContainer);
//     branch.appendChild(descendantsContainer);
//     memberList.appendChild(branch);
// }

// async function renderChildToDom(childRef, targetElement) {
//     // currentTreeLeavesRef.doc(childRef.id).get()
//     // .then((childDoc) => {
//     //     let existing =  targetElement.closest(".branch").querySelector(".descendants");

//     //     let descendantBranch = document.createElement('ul');
//     //     let targetBranch = targetElement.closest(".branch");
//     //     let descendantsContainer;

//     //     descendantBranch.insertAdjacentElement("afterbegin", getMemberLi({"leafDoc" : childDoc}) );
//     //     descendantBranch.setAttribute('class', 'branch');

//     //     if (existing) {
//     //         descendantsContainer = existing;
//     //     } else {
//     //         descendantsContainer = document.createElement('div');
//     //         descendantsContainer.setAttribute('class', 'descendants');
//     //     }

//     //     descendantsContainer.appendChild(descendantBranch)
//     //     targetBranch.appendChild(descendantsContainer);
//     // })
//     // .catch((err) => {
//     //     console.log(err.message);
//     // })

//     let childDoc = await currentTreeLeavesRef.doc(childRef.id).get();
//     let existing =  targetElement.closest(".branch").querySelector(".descendants");

//     let descendantBranch = document.createElement('ul');
//     let targetBranch = targetElement.closest(".branch");
//     let descendantsContainer;

//     let childMemberEl = await getMemberLi({"leafDoc" : childDoc});

//     descendantBranch.insertAdjacentHTML('afterbegin', childMemberEl );
//     descendantBranch.setAttribute('class', 'branch');

//     if (existing) {
//         descendantsContainer = existing;
//     } else {
//         descendantsContainer = document.createElement('div');
//         descendantsContainer.setAttribute('class', 'descendants');
//     }

//     descendantsContainer.appendChild(descendantBranch)
//     targetBranch.appendChild(descendantsContainer);
// }

// function warnAboutDescendants(targetMemberDoc) {
//     // if target member has no spouses, but has children
//     if (targetMemberDoc.data().spouses && targetMemberDoc.data().spouses.length > 0) {
//         // Do nothing
//     } else if (targetMemberDoc.data().children && targetMemberDoc.data().children.length > 0) {
//         return alert("ALl descendant connections will be deleted (not true yet). TODO: Actually delete those descendant members");
//     };
// }

// function setupViewWithActiveMember(activeMember) {
//     members.doc(authMemberDoc.id).get()
//     .then(doc => {
//         setupView();
//     });
// }

// function removeFromSpouses(doc) {
//     let targetMemberId = doc.id;
//     if (doc.data().spouses && Object.keys(doc.data().spouses).length > 0) {
//         Object.keys(doc.data().spouses).forEach(spouseId => {
//             currentTreeLeavesRef.doc(spouseId).set({
//                 // remove spouse id from map
//                 "spouses": {
//                     [targetMemberId] : firebase.firestore.FieldValue.delete()
//                 }
//             },
//             { merge: true })   
//         })
//     }
// }

// function removeFromParents(doc) {
//     let targetMemberId = doc.id;

//     if (doc.data().parents && doc.data().parents.length > 0) {
//         doc.data().parents.forEach(parentId => {
//             currentTreeLeavesRef.doc(parentId).update({
//                 children: firebase.firestore.FieldValue.arrayRemove(targetMemberId)
//             })   
//         })
//     }
// }

// function removeFromSiblings(doc) {
//     let targetMemberId = doc.id;
//     if (doc.data().siblings && doc.data().siblings.length > 0) {
//         doc.data().siblings.forEach(siblingId => {
//             currentTreeLeavesRef.doc(siblingId).update({
//                 siblings: firebase.firestore.FieldValue.arrayRemove(targetMemberId)
//             })   
//         })
//     }
// }

// function removeFromChildren(doc) {
//     let targetMemberId = doc.id;

//     if (doc.data().children && doc.data().children.length > 0) {
//         doc.data().children.forEach(childId => {
//             currentTreeLeavesRef.doc(childId).update({
//                 parents: firebase.firestore.FieldValue.arrayRemove(targetMemberId)
//             })   
//         })
//     }
// }

// createTreeButton.addEventListener('click',(e) => {
//     e.preventDefault();
//     console.log("çreate tree clicked");
//     createTreeModal.style.display = "block";
// })

// const createTreeForm = document.querySelector("#create-tree-form");

// createTreeForm.addEventListener('submit', (e) => {
//     e.preventDefault();

//     trees.add({
//         created_by: authMemberDoc.id,
//         admins: [],
//         contributors: [],
//         viewers: [],
//         name: createTreeForm['treeName'].value,
//         contributors: []
//     }).then(treeRef => {
//         treeRef.collection('leaves').add({
//             claimed_by: authMemberDoc.id,
//             name: {
//                 firstName: "You (Leaf)",
//                 middleName: null,
//                 lastName: null,
//                 surname: null
//             },
//             topMember: true,
//             siblings: [],
//             parents: [],
//             children: [],
//             spouses: [],
//             address: {},
//             email: '',
//             birthday: 0
//         }).then(leafRef => {
//             if (!authMemberDoc.data().primary_tree) {
//                 console.log("user has not primary TREEEEEEEE!");
//                 members.doc(authMemberDoc.id).update({
//                     primary_tree: treeRef.id,
//                     trees: firebase.firestore.FieldValue.arrayUnion(treeRef.id),
//                 })
//                 .then(() => {
//                     console.log("new member is: "+authMemberDoc.id);
//                     trees.doc(treeRef.id).collection('leaves').doc(leafRef.id).update({
//                         claimed_by: authMemberDoc.id
//                     }).then(() => {
//                         trees.doc(treeRef.id).update({
//                             admins : firebase.firestore.FieldValue.arrayUnion(leafRef.id)
//                         }).then(() => {
//                             createTreeForm.reset();
//                             location.reload();
//                         })
//                     })
//                 })
//                 .catch(err => {
//                     console.log(err.message)
//                 })
                
//             } else {
//                 members.doc(authMemberDoc.id).update({
//                     trees: firebase.firestore.FieldValue.arrayUnion(treeRef.id),
//                 })
//                 .then(() => {
//                     console.log("new member is: "+authMemberDoc.id);
//                     trees.doc(treeRef.id).collection('leaves').doc(leafRef.id).update({
//                         claimed_by: authMemberDoc.id
//                     }).then(() => {
//                         trees.doc(treeRef.id).update({
//                             admins : firebase.firestore.FieldValue.arrayUnion(leafRef.id)
//                         }).then(() => {
//                             createTreeForm.reset();
//                             location.reload();
//                         })
//                     })
//                 })
//                 .catch(err => {
//                     console.log(err.message)
//                 })
//             }

//         })
//         .catch(err => {
//             console.log(err.message)
//         })
//     }).catch(err => {
//         console.log(err.message);
//     })

// });

// // setup materialize components
// // document.addEventListener('DOMContentLoaded', function() {
// //     var modals = document.querySelectorAll('.modal');
// //     M.Modal.init(modals);
// // });

// // Close the dropdown menu if the user clicks outside of it
// window.addEventListener('click', (e) => {
//     if (!event.target.matches('.actions_dropdown_trigger')) {
//       let dropdowns = document.querySelectorAll(".actions_dropdown.show");
//       dropdowns.forEach(dropdown => {
//           dropdown.classList.remove("show");
//       })
//     }
// });

// const storageUrl = "gs://mily-4c2a8.appspot.com";
// const profilePhotoInputUpload = document.querySelector("[name='profilePhoto']");

// profilePhotoInputUpload.addEventListener('change', (e) => {
//     e.preventDefault();

//     let leafId = editMemberForm["memberId"].value;
//     let file = e.target.files[0];
//     let fileName = file.name;
//     // var file_ext = fileName.substr(fileName.lastIndexOf('.')+1,fileName.length);
//     let filePath = 'tree/' + primaryTree + '/' + leafId + '/' + fileName;

//     let storageRef = firebase.storage().ref(filePath);
    
//     storageRef.put(file)
//     .then(() => {
//         currentTreeLeavesRef.doc(leafId).update({
//             photo: filePath
//         })
//         .then(() => {
//             let memberToUpdate = memberList.querySelector("[data-id='"+leafId+"'] .profileLeaf__image");
//             let profileInfoImage = profileInfo.querySelector(".profileInfo__image");

//             let reader = new FileReader();
//             reader.onload = function(){
//                 memberToUpdate.setAttribute('src', reader.result);
//                 profileInfoImage.setAttribute('src', reader.result);
//             };
//             reader.readAsDataURL(file);

//             console.log('Profile photo uploaded');
//         })
//         .catch((err) => {
//             console.log(err.message);
//         })
//       }).catch((err) => {
//           console.log(err.message);
//       })
// })


// // Open/Close modals
// // Open/Close dropdowns
// // Open/Close sidemenu