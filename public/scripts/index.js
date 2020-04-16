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

const excludedDetails = ["children", "parents", "siblings", "spouses", "topMember"];
const excludedCategories = ["Name", "Address"];

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
    generateLines();
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
}

const generateDetailElement = (params) => {
    let reqName = params["name"];
    let reqIcon = params["icon"];
    let data = params["data"] ? params["data"] : null;

    if (data) {
        if (reqName === "birthday" && data) {
            var options = { year: 'numeric', month: 'long', day: 'numeric' };
    
            let date = new Date(data);
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

    saveButton.addEventListener("click", (e) => {
        e.preventDefault();
        let reqEditDoc = getDocFromDetailsPanelId();

        currentTreeLeafCollectionRef.doc(reqEditDoc.id).update({
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

const generateLines = () => {
    let spousesElArray = document.querySelectorAll(".spouses");

    for (spouseContainer of spousesElArray) {
        if (spouseContainer.childNodes.length > 1) {
            createLine(spouseContainer, spouseContainer.childNodes[0], spouseContainer.childNodes[1]);
        }
    }
}

const createLine = (branch, element1, element2)  => {
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
        parentToChildMiddleBar.setAttribute("class", 'parentToChild__middleBar');
        branch.nextSibling.insertAdjacentElement('afterbegin', parentToChildMiddleBar);

        let childLeaves = branch.nextSibling.querySelectorAll(".leaf");

        console.log(childLeaves.length );

        if (childLeaves.length > 1) {
            for (childLeaf of childLeaves) {
                let childToParentMiddleBar = document.createElement("div");
                childToParentMiddleBar.setAttribute("class", 'childToParent__middleBar');
                childLeaf.insertAdjacentElement('afterbegin', childToParentMiddleBar);
            }
        } else {
            console.log("not doing it")
        }
    }


    let spouseLine = document.createElement("div");
    spouseLine.setAttribute("class", 'spouseToSpouse__line');

    let spouseToChildren = document.createElement("div");
    spouseToChildren.setAttribute("class", 'parentToChildren__downLine');
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
