const memberList = document.querySelector(".familyTree");
const loggedOutLinks = document.querySelectorAll(".logged-out");
const loggedInLinks = document.querySelectorAll(".logged-in");
const adminRole = document.querySelectorAll(".admin-role");
const userEmail = document.querySelector(".userEmail");
const createTreeModal = document.querySelector('#create-tree-modal');
const editMemberModal = document.querySelector('#edit-member-modal');
const editMemberForm = document.querySelector('#edit-member-form');
const treeNameContainer = document.querySelector(".treeName");
const profileInfoClose = document.querySelector(".profileInfo__close");

let owners = [];
let activeMember;
let activeMemberIsOwner = false;
let primaryTree = '';
let primaryTreeLeaves = '';

// Render members and actions available 

const setupView = (doc) => {
    if (doc) {
        memberList.innerHTML = "";

        activeMember = doc.id;
        memberList.setAttribute('data-active-member', activeMember);


        if (doc.data().primary_tree && doc.data().primary_tree.length > 0) {
            primaryTree = doc.data().primary_tree;
            primaryTreeLeaves = trees.doc(primaryTree).collection('leaves');
            memberList.setAttribute('data-active-tree', primaryTree);

            trees.doc(primaryTree).get().then(doc => {
                treeNameContainer.innerHTML = `${doc.data().name}`;
                setOwnerAndActiveMemberVars(doc);
            })

            // get tree to see if member is owner
            primaryTreeLeaves.get()
            .then(allLeaves => {
                allLeaves.forEach(leafDoc => {
                    if (leafDoc.data().topMember === true) {
                        initiateTree(leafDoc, allLeaves);
                    } 
                });
            });
            
        } else {
            let createTreeButton = `<a class="waves-effect waves-light btn-large modal-trigger logged-in" href="#create-tree-modal">Create a family tree</a>`
            memberList.innerHTML += createTreeButton;
        }
    } else {
        memberList.innerHTML = '<h4>Log in or sign up to begin</h4>';
    }

    // panzoom(memberList, {
    //     maxZoom: 1,
    //     minZoom: 0.5,
    //     pinchSpeed: .8 // zoom two times faster than the distance between fingers
    //   });
}


function setOwnerAndActiveMemberVars(doc) {
    owners = doc.data().owners;
    let ownerMember = owners.find(ownerMember => ownerMember === activeMember);
    if (ownerMember) {
        activeMemberIsOwner = true;
    }
}

async function initiateBranch(doc, allLeaves) {
    let branch = await buildBranchFromChosenMember(doc, allLeaves);
    memberList.appendChild(branch);
}

async function buildBranchFromChosenMember(doc, allLeaves) {
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
        let spouses = doc.data().spouses;
        let children = doc.data().children;

        if (spouses && spouses.length > 0) {
            spouses.forEach(async spouse => {
                let spouseDoc = allLeaves.docs.find(spouseReq => spouseReq.id === spouse);
                let spouseEl = await getMemberLi({
                    "leafDoc" : spouseDoc,
                    "relationship" : "spouse"
                });

                directMemberContainer.insertAdjacentHTML('beforeend', spouseEl);
            })
        }
    
        if (children && children.length > 0) {
            children.forEach(async (child) => {
                let childDoc = allLeaves.docs.find(childReq => childReq.id === child);
                let descendantBranch = await buildBranchFromChosenMember(childDoc, allLeaves);
                descendantsContainer.prepend(descendantBranch);
            })
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
            handleProfileInfo("show");
        });
    })
}

async function initiateTree(doc, allLeaves) {
    let chosenMemberSiblings = doc.data().siblings;
    let chosenMemberBranch = await buildBranchFromChosenMember(doc, allLeaves);
    
    memberList.appendChild(chosenMemberBranch);

    if (chosenMemberSiblings && chosenMemberSiblings.length > 0) {
        chosenMemberSiblings.forEach(async (sibling) => {
            let siblingDoc = allLeaves.docs.find(siblingReq => siblingReq.id === sibling);
            let siblingsBranch = await buildBranchFromChosenMember(siblingDoc, allLeaves);
            memberList.appendChild(siblingsBranch);
        })
    }

    profileInfoClose.addEventListener("click", (e) => {
        handleProfileInfo();
    });

    addEventListenerToProfileLeaves();

    let deleteMemberActions = document.querySelectorAll(".delete_member_action");
    deleteMemberActions.forEach(action => {
        action.addEventListener('click', (e) => {
            deleteLeaf(e);
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
            primaryTreeLeaves.doc(targetMemberId).get()
            .then((targetMemberRef) => {
                if (targetMemberRef.data().spouses && targetMemberRef.data().spouses.length > 0) {
                    targetMemberRef.data().spouses.forEach(spouseId => {
                        parents.push(spouseId);
                    })
                }
    
                primaryTreeLeaves.add({
                    name: null,
                    parents: firebase.firestore.FieldValue.arrayUnion(...parents),
                    children: [],
                    spouses: [],
                    siblings: [],
                    topMember: false
                }).then(childRef => {
                    if (parents && parents.length > 0) {
                        parents.forEach(parentId => {    
                            primaryTreeLeaves.doc(parentId).update({
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
                    setupViewWithActiveMember(activeMember);
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
    
            primaryTreeLeaves.doc(targetMemberId).get()
            .then(targetMemberRefDoc => {
                let siblings = [];
                let parents = [];
    
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
    
                primaryTreeLeaves.add({
                    name: null,
                    siblings: firebase.firestore.FieldValue.arrayUnion(...siblings),
                    parents: [],
                    spouses: [],
                    children: [],
                    topMember: false
                }).then(newSiblingRef => {
                    siblings.forEach(siblingId => {
                        primaryTreeLeaves.doc(siblingId).update({
                            siblings: firebase.firestore.FieldValue.arrayUnion(newSiblingRef.id)
                        })
                    });
                    if ( targetMemberRefDoc.data().parents && targetMemberRefDoc.data().parents.length > 0 ) {
                        primaryTreeLeaves.doc(newSiblingRef.id).update({
                            parents: firebase.firestore.FieldValue.arrayUnion(...parents)
                        });
    
                        parents.forEach(parentId => {
                            primaryTreeLeaves.doc(parentId).update({
                                children: firebase.firestore.FieldValue.arrayUnion(newSiblingRef.id)
                            })
                        });
                    }
                    setupViewWithActiveMember(activeMember);
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
    
            primaryTreeLeaves.doc(targetMemberId).get()
            .then((targetMemberDoc) => {
                // add these to new spouse
                let children = [];
                let spouses = [];
    
                if ( targetMemberDoc.data().children && targetMemberDoc.data().children.length > 0 ) {
                    targetMemberDoc.data().children.forEach(child => {
                        children.push(child);
                    })
                }
    
                spouses.push(targetMemberId);
    
                primaryTreeLeaves.add({
                    name: null,
                    spouses: firebase.firestore.FieldValue.arrayUnion(...spouses),
                    siblings: [],
                    children: [],
                    parents: [],
                    topMember: false
                }).then(spouseRef => {
                    if ( targetMemberDoc.data().children && targetMemberDoc.data().children.length > 0 ) {
                        children.forEach(childId => {
                            primaryTreeLeaves.doc(childId).update({
                                parents: firebase.firestore.FieldValue.arrayUnion(spouseRef.id)
                            })
                            .then(() => {
                                console.log("Children updated to include new spouse");
                            })
                        })
                        primaryTreeLeaves.doc(spouseRef.id).update({
                            children: firebase.firestore.FieldValue.arrayUnion(...children)
                        });
                    }
    
                    primaryTreeLeaves.doc(targetMemberId).update({
                        spouses: firebase.firestore.FieldValue.arrayUnion(spouseRef.id)
                    })
                    .then(() => {
                        setupViewWithActiveMember(activeMember);
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
    
            primaryTreeLeaves.doc(targetMemberId).get()
            .then(targetMemberRefDoc => {
                let childrenOfParent = [];
    
                if ( targetMemberRefDoc.data().siblings.length > 0) {
                    targetMemberRefDoc.data().siblings.forEach(sibling => {
                        childrenOfParent.push(sibling);
                    })
                }
    
                childrenOfParent.push(targetMemberId);
    
                primaryTreeLeaves.add({
                    name: null,
                    siblings: [],
                    parents: [],
                    spouses: [],
                    children: firebase.firestore.FieldValue.arrayUnion(...childrenOfParent),
                    topMember: true
                }).then(parentRef => {
                    childrenOfParent.forEach(childId => {
                        primaryTreeLeaves.doc(childId).update({
                            topMember: false,
                            parents: firebase.firestore.FieldValue.arrayUnion(parentRef.id)
                        })
                        .then(() => {
                            // renderParentToDom(parentRef);
                            setupViewWithActiveMember(activeMember);
                            console.log("new parent added");
                        })
                    })
                })
    
            });
    
        })
    })
}

function handleProfileInfo(state) {
    if (state) {
        if (state == "show") {
            document.querySelector(".profileInfo").classList.add("show");
        }
    } else {
        document.querySelector(".profileInfo").classList.remove("show");
    }
}

const getMemberLi = async (params) => {
// const getMemberLi = (params) => {
    let leafDoc = params["leafDoc"] ? params["leafDoc"] : false;
    let name = leafDoc.data().name ? leafDoc.data().name : "Unnamed";
    let classNames = params["relationship"] ? params["relationship"] : '';
    let claimedBy = leafDoc.data().claimed_by ? leafDoc.data().claimed_by : false;  
    let parentMenuOption = '';
    let li = '';

    if (claimedBy === activeMember) {
        classNames = classNames + " you"; 
    }

    if (leafDoc && claimedBy) {
        classNames = classNames + " claimed";
    }

    if (leafDoc.data().topMember === true) {
        parentMenuOption = `<div class="add_parent_option">Add parent</div>`;
    }


    // members.doc(claimedBy).get()
    // .then((doc) => {
    //     if (doc.data().name.firstName) {
    //         console.log("a document was returned");
    //     }
    // })
    // .catch(() => {
    //     return li = generateProfileLeafHtml({
    //         "name": name,
    //         "classNames": classNames,
    //         "leafDoc": leafDoc,
    //         "parentMenuOption": parentMenuOption
    //     })
    // })


    // if (leafDoc && claimedBy) {
    //     // await member doc info
    //     const memberDoc = await members.doc(claimedBy).get();
    //     name = memberDoc.data().name.firstName;
    // }

    return generateProfileLeafHtml({
        "name": name,
        "classNames": classNames,
        "leafDoc": leafDoc,
        "parentMenuOption": parentMenuOption
    })
}

function generateProfileLeafHtml(params) {
    let name = params["name"];
    let classNames = params["classNames"];
    let leafDoc = params["leafDoc"];
    let parentMenuOption = params["parentMenuOption"] ? params["parentMenuOption"] : '';

    let li = `
        <li class="profileLeaf ${classNames}" data-id="${leafDoc.id}">
            <div class="actions">
                <div class="actions_dropdown">
                    ${parentMenuOption}
                    <div class="add_child_option">Add child</div>
                    <div class="add_sibling_option">Add sibling</div>
                    <div class="add_spouse_option">Add spouse</div>
                    <div class="delete_member_action" style="color:red;">Delete</div>
                </div>
            </div>
            <div class="profileLeaf__caption">
                <span class="profileLeaf__name">${name}</span>
            </div> 
            <div class="profileLeaf__connectors"></div>
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
    let leafName = targetEl.querySelector(".profileLeaf__name");
    let leafNameText = leafName.textContent === 'Unnamed' ? '' : leafName.textContent;

    editMemberForm["memberId"].value = targetMemberId;
    editMemberForm["name"].value = leafNameText;
}

editMemberForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let memberId = editMemberForm['memberId'].value;
    let name = editMemberForm['name'].value;

    primaryTreeLeaves.doc(memberId).update({
        name: name
    }).then(() => {
        document.querySelector('.profileLeaf[data-id="'+memberId+'"] .profileLeaf__name').textContent = name;

        editMemberForm.reset();
        M.Modal.getInstance(editMemberModal).close();
        console.log("Updated successfully!");
    })

});

function deleteLeaf(e) {
    e.stopPropagation();
    e.preventDefault();

    let targetEl = e.target.closest(".profileLeaf");
    let targetMemberId = targetEl.getAttribute('data-id');
    // let targetMemberId = editMemberForm["memberId"].value;
    // let targetEl = document.querySelector("[data-id='"+targetMemberId+"']");

    primaryTreeLeaves.doc(targetMemberId).get().then(targetMemberDoc => { 
        console.log()
        if ( targetMemberDoc.data().claimed_by === activeMember ) {
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
                primaryTreeLeaves.doc(targetMemberDoc.data().spouses[0]).update({
                    topMember: true
                })
                .then(() => {
                    console.log("spouse was made top member");
                })
            } else if ( targetMemberDoc.data().children && targetMemberDoc.data().children.length > 0 ) {
                primaryTreeLeaves.doc(targetMemberDoc.data().children[0]).update({
                    topMember: true
                })
                .then(() => {
                    console.log("child was made top member");
                })
            } else if ( targetMemberDoc.data().siblings && targetMemberDoc.data().siblings > 0 ) {
                primaryTreeLeaves.doc(targetMemberDoc.data().siblings[0]).update({
                    topMember: true
                })         
            }       
        }

        primaryTreeLeaves.doc(targetMemberId).delete()
        .then(() => {
            M.Modal.getInstance(editMemberModal).close();
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

    primaryTreeLeaves.doc(parentRef.id).get()
    .then((parentDoc) => {
        directMemberContainer.appendChild( buildLeaf(parentDoc) );
    })

    memberList.innerHTML = '';

    descendantsContainer.innerHTML += descendantHTML;
    branch.appendChild(directMemberContainer);
    branch.appendChild(descendantsContainer);
    memberList.appendChild(branch);
}

function renderChildToDom(childRef, targetElement) {
    primaryTreeLeaves.doc(childRef.id).get()
    .then((childDoc) => {
        let existing =  targetElement.closest(".branch").querySelector(".descendants");

        let descendantBranch = document.createElement('ul');
        let targetBranch = targetElement.closest(".branch");
        let descendantsContainer;

        descendantBranch.insertAdjacentElement("afterbegin", getMemberLi({"leafDoc" :childDoc}) );
        descendantBranch.setAttribute('class', 'branch');

        if (existing) {
            descendantsContainer = existing;
        } else {
            descendantsContainer = document.createElement('div');
            descendantsContainer.setAttribute('class', 'descendants');
        }

        descendantsContainer.appendChild(descendantBranch)
        targetBranch.appendChild(descendantsContainer);
    })
    .catch((err) => {
        console.log(err.message);
    })

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
    members.doc(activeMember).get()
    .then(doc => {
        setupView(doc);
    });
}

function removeFromSpouses(doc) {
    let targetMemberId = doc.id;

    if (doc.data().spouses && doc.data().spouses.length > 0) {
        doc.data().spouses.forEach(spouseId => {
            primaryTreeLeaves.doc(spouseId).update({
                spouses: firebase.firestore.FieldValue.arrayRemove(targetMemberId)
            })   
        })
    }
}

function removeFromParents(doc) {
    let targetMemberId = doc.id;

    if (doc.data().parents && doc.data().parents.length > 0) {
        doc.data().parents.forEach(parentId => {
            primaryTreeLeaves.doc(parentId).update({
                children: firebase.firestore.FieldValue.arrayRemove(targetMemberId)
            })   
        })
    }
}

function removeFromSiblings(doc) {
    let targetMemberId = doc.id;
    if (doc.data().siblings && doc.data().siblings.length > 0) {
        doc.data().siblings.forEach(siblingId => {
            primaryTreeLeaves.doc(siblingId).update({
                siblings: firebase.firestore.FieldValue.arrayRemove(targetMemberId)
            })   
        })
    }
}

function removeFromChildren(doc) {
    let targetMemberId = doc.id;

    if (doc.data().children && doc.data().children.length > 0) {
        doc.data().children.forEach(childId => {
            primaryTreeLeaves.doc(childId).update({
                parents: firebase.firestore.FieldValue.arrayRemove(targetMemberId)
            })   
        })
    }
}

const createTreeForm = document.querySelector("#create-tree-form");

createTreeForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let authMemberId = memberList.getAttribute('data-active-member');

    trees.add({
        created_by: authMemberId,
        owners: [authMemberId],
        members: [authMemberId],
        name: createTreeForm['treeName'].value
    }).then(treeRef => {
        treeRef.collection('leaves').add({
            claimed_by: authMemberId,
            name: `(You)`,
            topMember: true,
            siblings: [],
            parents: [],
            children: [],
            spouses: []
        }).then(leafRef => {
            members.doc(authMemberId).update({
                primary_tree: treeRef.id,
                trees: firebase.firestore.FieldValue.arrayUnion(treeRef.id)
            }).then(() => {
                console.log("new member is: "+authMemberId);
                trees.doc(treeRef.id).collection('leaves').doc(leafRef.id).update({
                    claimed_by: authMemberId
                }).then(() => {
                    createTreeForm.reset();
                    M.Modal.getInstance(editMemberModal).close();
                    location.reload();
                })
            })
            .catch(err => {
                console.log(err.message)
            })
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