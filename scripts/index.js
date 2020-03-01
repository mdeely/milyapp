const memberList = document.querySelector(".familyTree");
const loggedOutLinks = document.querySelectorAll(".logged-out");
const loggedInLinks = document.querySelectorAll(".logged-in");
const adminRole = document.querySelectorAll(".admin-role");
const userEmail = document.querySelector(".userEmail");
const createTreeModal = document.querySelector('#create-tree-modal');
const editMemberModal = document.querySelector('#edit-member-modal');
const editMemberForm = document.querySelector('#edit-member-form');
const treeNameContainer = document.querySelector(".treeName");
const removeMemberButton = document.getElementById("remove-member");

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
                        return;
                    }
                });
            });
            
        } else {
            let createTreeButton = `<a class="waves-effect waves-light btn-large modal-trigger logged-in" href="#create-tree-modal">Create a tree</a>`
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

function initiateBranch(doc, allLeaves) {
    let branch = buildBranchFromChosenMember(doc, allLeaves);
    memberList.appendChild(branch);
}

function buildBranchFromChosenMember(doc, allLeaves) {
    let branch = document.createElement("ul");
    let directMemberContainer = document.createElement("ul");
    let descendantsContainer = document.createElement("ul");
    let chosenMember = buidlLeaf(doc);

    branch.setAttribute('class', 'branch');
    descendantsContainer.setAttribute('class', 'descendants');
    directMemberContainer.setAttribute('class', 'directMembers');

    if (doc) {
        let spouses = doc.data().spouses;
        let children = doc.data().children;

        if (spouses && spouses.length > 0) {
            spouses.forEach(spouse => {
                let spouseDoc = allLeaves.docs.find(spouseReq => spouseReq.id === spouse);
                let spouseEl = buidlLeaf(spouseDoc);
                spouseEl.classList.add('spouse');

                directMemberContainer.prepend(spouseEl);
            })
        }
    
        if (children && children.length > 0) {
            children.forEach(child => {
                let childDoc = allLeaves.docs.find(childReq => childReq.id === child);
                let descendantBranch = buildBranchFromChosenMember(childDoc, allLeaves);
                descendantsContainer.prepend(descendantBranch);
            })
            branch.prepend(descendantsContainer);
        }
    } else {

    }

    directMemberContainer.prepend(chosenMember);
    branch.prepend(directMemberContainer);
    
    return branch;
}

function initiateTree(doc, allLeaves) {
    let chosenMemberSiblings = doc.data().siblings;
    let chosenMemberBranch = buildBranchFromChosenMember(doc, allLeaves);
    
    memberList.appendChild(chosenMemberBranch);

    if (chosenMemberSiblings && chosenMemberSiblings.length > 0) {
        chosenMemberSiblings.forEach(sibling => {
            let siblingDoc = allLeaves.docs.find(siblingReq => siblingReq.id === sibling);
            let siblingsBranch = buildBranchFromChosenMember(siblingDoc, allLeaves);
            memberList.appendChild(siblingsBranch);
        })
    }
}

function buidlLeaf(doc) {
    let li = document.createElement('li');
    let editButton = document.createElement('a');
    let editIcon = document.createElement('i');
    let span = document.createElement('span');
    let name = 'Unnamed';

    editIcon.setAttribute('class', 'fa fa-pencil-alt');
    editButton.setAttribute("class", "modal-trigger")
    editButton.setAttribute("href", "#edit-member-modal")
    li.setAttribute("class", 'profile_leaf');
    span.setAttribute("class", 'leaf_name');

    // Does doc exist?
    if (doc) {

        // Is it claimed by a member?
        if (doc.data().claimed_by) {
            if (doc.data().claimed_by === activeMember) {
                li.classList.add('you');
            }
        }

        li.setAttribute("data-id", doc.id);

        if (doc.data().name) {
            if (doc.data().name.length > 0) {
                name = doc.data().name;
            }
        }

        span.textContent = name;

    } else {
        span.textContent = "No data found";
    }

    editButton.appendChild(editIcon);
    span.appendChild(editButton);
    li.appendChild(span);

    if (doc && activeMemberIsOwner === true) {
        li.appendChild(createMemberActions(doc));
    }

    editButton.addEventListener('click', (e) => {
        let targetEl = e.target.closest(".profile_leaf");
        let targetMemberId = targetEl.getAttribute('data-id');
        let leafName = targetEl.querySelector(".leaf_name");
        let leafNameText = leafName.textContent === 'Unnamed' ? '' : leafName.textContent;

        editMemberForm["memberId"].value = targetMemberId;
        editMemberForm["name"].value = leafNameText;
    })

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

// Create actions
function createMemberActions(doc) {
    let actionsWrapper = document.createElement('div');
    let addMembersButton = document.createElement('button');
    let addMembers = document.createElement('div');
    let modifyMember = document.createElement('div');

    let childButton = generateButton('+child');
    let parentbutton = generateButton('+parent');
    let siblingButton = generateButton('+sibling');
    let spouseButton = generateButton('+spouse');

    actionsWrapper.setAttribute('class', 'actions');
    modifyMember.setAttribute('class', 'actions_modify');
    addMembers.setAttribute('class', 'actions_addMember');
    addMembers.setAttribute('data-menu-for', 'actions_add_member')
    addMembersButton.setAttribute('data-trigger-for', "actions_add_member");

    addMembersButton.textContent = "+";

    if (doc.data().topMember === true) {
        addMembers.appendChild(parentbutton);
    }

    addMembers.appendChild(spouseButton);
    addMembers.appendChild(siblingButton);
    addMembers.appendChild(childButton);

    actionsWrapper.appendChild(addMembersButton);
    actionsWrapper.appendChild(addMembers);
    actionsWrapper.appendChild(modifyMember)

    addMembersButton.addEventListener('click', (e) => {
        e.preventDefault();
        let trigger = e.target;

        handleAddMemberMenus(e);
    })

    childButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        // get target member
        let targetEl = e.target.closest(".profile_leaf");
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
                renderChildToDom(childRef, targetEl);

            }).catch((err) => {
                console.log(err.message)
            })
        })
    })

    parentbutton.addEventListener('click', (e) => {
        // get target member
        let targetEl = e.target.closest(".profile_leaf");
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
                        setupViewWithActiveMember(activeMember);
                        console.log("new parent added");
                    })
                })
            })

        });

    })

    siblingButton.addEventListener('click', (e) => {
        e.preventDefault();

        // get target member
        let targetEl = e.target.closest(".profile_leaf");
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

    spouseButton.addEventListener('click', (e) => {
        e.preventDefault();

        let targetEl = e.target.closest(".profile_leaf");
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

    return actionsWrapper;
}

editMemberForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let memberId = editMemberForm['memberId'].value;
    let name = editMemberForm['name'].value;

    primaryTreeLeaves.doc(memberId).update({
        name: name
    }).then(() => {
        document.querySelector('.profile_leaf[data-id="'+memberId+'"] .leaf_name').textContent = name;

        editMemberForm.reset();
        M.Modal.getInstance(editMemberModal).close();
        console.log("Updated successfully!");
    })

});

removeMemberButton.addEventListener('click', (e) => {
    deleteLeaf(e);
})

function deleteLeaf(e) {
    e.preventDefault();

    let targetMemberId = editMemberForm["memberId"].value;
    let targetEl = document.querySelector("[data-id='"+targetMemberId+"']");

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

function renderChildToDom(childRef, targetElement) {
    primaryTreeLeaves.doc(childRef.id).get()
    .then((childDoc) => {
        let existing =  targetElement.closest(".branch").querySelector(".descendants");

        let descendantBranch = document.createElement('ul');
        let targetBranch = targetElement.closest(".branch");
        let descendantsContainer;

        descendantBranch.appendChild( buidlLeaf(childDoc) );
        descendantBranch.setAttribute('class', 'branch');

        if (existing) {
            descendantsContainer = existing;
        } else {
            descendantsContainer = document.createElement('div');
            descendantsContainer.setAttribute('class', 'descendants');
        }

        descendantsContainer.appendChild(descendantBranch)
        targetBranch.appendChild(descendantsContainer);

        handleAddMemberMenus();
    })
    .catch((err) => {
        console.log(err.message);
    })

}

function handleAddMemberMenus(e) {
    document.querySelectorAll("[data-menu-for]").forEach(menu=>{menu.classList.remove('show')});

    if (!e) {
        return;
    } else {
        let trigger = e.target;
        trigger.nextSibling.classList.toggle("show");
    }
}

function warnAboutDescendants(targetMemberDoc) {
    // if target member has no spouses, but has children
    if (targetMemberDoc.data().spouses && targetMemberDoc.data().spouses.length > 0) {
        // Do nothing
    } else if (targetMemberDoc.data().children && targetMemberDoc.data().children.length > 0) {
        return alert("ALl descendant connections will be deleted. TODO: Actually delete those descendant members");
    };
}

function setupViewWithActiveMember(activeMember) {
    members.doc(activeMember).get()
    .then(doc => {
        freezeView(true);
        setupView(doc);
        freezeView(false);
    });
}

function freezeView(freeze) {
    if (freeze) {
        let width = memberList.offsetWidth;
        let height = memberList.offsetHeight;
    
        memberList.style.width = width;
        memberList.style.height = height;
    } else {
        memberList.style.width = '';
        memberList.style.height = '';
    }

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

function generateButton(buttonText) {
    let button;;

    if (buttonText === "edit") {
        button = document.createElement("a");
        button.setAttribute("class", "modal-trigger btn");
        button.setAttribute('href', '#edit-member-modal');
    } else {
        button = document.createElement("button");
    }

    button.textContent = buttonText;

    return button;
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