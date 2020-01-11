const familyTree = document.querySelector('.family__tree');
const addMemberForm = document.querySelector('#add-member-form');
const editMemberForm = document.querySelector('#edit-member-form');
const spouseSelect = document.querySelector('#spouseSelect');
const addChildForm = document.querySelector('#add-child-form');
const addParentForm = document.querySelector('#add-parent-form');
const allMembers = db.collection('members');


db.collection('members').get().then((snapshot) => {
    const allMembers = snapshot.docs;

    snapshot.docs.forEach(doc => {
        // if ( !checkForExistence(doc) ) {
            renderMembers(doc, allMembers);
        // };
        renderSelectOptions(doc);
    });

    var instances = M.FormSelect.init(spouseSelect, options);

});

function renderSelectOptions(doc) {
    let text = doc.data().firstName;
    let value = doc.id;
    let option = document.createElement("option");

    option.setAttribute( 'value', value );
    option.text = text;

    // siblingSelect.appendChild(option);
    // childrenSelect.appendChild(option);
    spouseSelect.appendChild(option);
}

function renderMembers(doc, allMembers) {

    let relationship = '';
    let familyBranch = document.createElement('div')
    let siblings = doc.data().siblings;
    let spouses = doc.data().spouses;
    let children = doc.data().children;

    familyBranch.setAttribute('class', "family__branch" + relationship);
    familyTree.appendChild(familyBranch);

    if ( children && children.length >= 1 ) {  
        renderChildren(children, familyBranch, allMembers);
        relationship = relationship + " parent";
    };

    if ( siblings && siblings.length >= 1 ) {  
        renderSiblings(siblings, allMembers);
        relationship = relationship + " sibling";
    };

    if ( spouses && spouses.length >= 1 ) { 
        renderSpouses(spouses, familyBranch, allMembers);
        relationship = relationship + " spouse";

        let spousesContainer = familyBranch.querySelector(".spouses");
        let memberLi = gatherMemberData(doc.id, doc.data(), relationship);

        spousesContainer.appendChild(memberLi);
        
    } else {
        let memberLi = gatherMemberData(doc.id, doc.data(), relationship);
        familyBranch.appendChild(memberLi);
    }
};

function checkForExistence(doc) {
    let nodes = document.querySelectorAll('[data-id="'+doc.id+'"]');

    if ( nodes.length > 0 ) {
        return true;
    } else {
        return false;
    }
}

function gatherMemberData(id, data, className) {
    let memberLi = document.createElement("li");
    let editMember = document.createElement('button');

    memberLi.textContent = data.firstName;
    editMember.textContent = "edit";

    memberLi.setAttribute('class', 'profile_leaf '+className);
    memberLi.setAttribute('data-id', id);
    editMember.setAttribute('class', 'btn-small');

    memberLi.appendChild(editMember);

    editMember.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        let id = e.target.parentElement.getAttribute('data-id');
        openEditMemberModal(id);
    });

    return memberLi;
}

function renderSiblings(siblings, allMembers) {
    siblings.forEach(sibling => {

        let siblingMatch = allMembers.find(function(member) { 
            return member.id == sibling; 
          }); 

        let siblingId = siblingMatch.id;
        let siblingData = siblingMatch.data();

        let siblingBranch = document.createElement('div');
        let siblingLi = gatherMemberData(siblingId, siblingData, "sibling");

        siblingBranch.setAttribute('class', 'family__branch');

        siblingBranch.appendChild(siblingLi);
        familyTree.appendChild(siblingBranch);
    });
};

function renderSpouses(spouses, currentBranch, allMembers) {
    spouses.forEach(spouse => {

        let spouseMatch = allMembers.find(function(member) { 
            return member.id == spouse; 
          }); 

        let spouseId = spouseMatch.id;
        let spouseData = spouseMatch.data();
        let spousesBranch = document.createElement('div');
        let spouseLi = gatherMemberData(spouseId, spouseData, "spouse");

        spousesBranch.setAttribute("class", "spouses");

        let descendantsContainer = currentBranch.querySelector(".descendants")

        // TODO: Some spouses may not have siblings in which case they don't need to be insertBefore anything
        // TODO: If the spouse is a parent, they should have a "parent" class added

        spousesBranch.appendChild(spouseLi);
        currentBranch.insertBefore(spousesBranch, descendantsContainer);

    });
};

function renderChildren(children, familyBranch, allMembers) {
    let descendants = document.createElement("div");

    descendants.setAttribute("class", "descendants");

    children.forEach(child => {
        let childMatch = allMembers.find(function(member) { 
            return member.id == child; 
          }); 
        let childId = childMatch.id;
        let childData = childMatch.data();

        let childLi = gatherMemberData(childId, childData, "child");

        descendants.appendChild(childLi);
    });

    familyBranch.appendChild(descendants);
};


// function renderMemberChildren(doc) {

//     let children = doc.data().children;

//     children.forEach(child => { 
//         let isExisting = familyTree.querySelector('[data-id="'+child+'"]');
//         let li = `
//             <li data-id="${child}" class="profile_leaf child">${child}</li>
//             `

//         console.log(isExisting);
//         familyTree.innerHTML += li;
//     });
// };


// db.collection('member_children').get().then((snapshot) => {
//     snapshot.docs.forEach(doc => {
//         buildMemberChildrenArray(doc);
//     });
// });

// function buildMemberChildrenArray(doc) {
//     let member = [];
//     let memberChildren = doc.data().children;

//     member[0] = doc.id;

//     if ( memberChildren) {
//         member.push(memberChildren);
//     }

//     familyTreeObject.push(member);

//     familyTreeObject.find(isChild);

//     return familyTreeObject;
// };


// function renderLeaf(docId, type) {

//     let leafWithDocId = document.querySelector('[data-id="' + docId + '"]');
//     let className = '';
//     let siblingsList = '';

//     if ( leafWithDocId ) {

//         // let li = '';
//         // return li;
//     }

//     if ( type ) {
//         className = type;
        
//         if ( type == "child" ) {
//             console.log("Is child");
//         }
//     };

//     let li = `
//         <li class="profile_leaf ${className}" data-id="${docId}">
//             ${docId}
//         </li>
//     `

//     if (siblingsList) {
//         console.log("yes, but now there are siblingsList");
//     }

//     return li;
// }

// Show list of members inside family
function renderMember(doc) {
                                
    let li = document.createElement('li');
    let deleteMember = document.createElement('button');
    let editMember = document.createElement('button');
    let addSiblingOrSpouse = document.createElement('button');
    let addChild = document.createElement('button');
    let addParent = document.createElement('button');

    li.textContent = doc.data().firstName;
    deleteMember.textContent = 'delete';
    editMember.textContent = 'edit';
    addSiblingOrSpouse.textContent = "+sibling or spouse";
    addChild.textContent = "+child";
    addParent.textContent = "+parent";

    deleteMember.setAttribute('class', 'delete-member')
    editMember.setAttribute('class', 'edit-member')
    addSiblingOrSpouse.setAttribute('class', 'add-sibling-or-spouse')
    addChild.setAttribute('class', 'add-child');
    addParent.setAttribute('class', 'add-parent');
    li.setAttribute('class', 'profile_leaf');

    li.setAttribute('data-id', doc.id);
    li.appendChild(deleteMember);
    li.appendChild(editMember);
    // li.appendChild(addSiblingOrSpouse);
    // li.appendChild(addChild);
    // li.appendChild(addParent);

    // delete member
    deleteMember.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        let id = e.target.parentElement.getAttribute('data-id');
        db.collection('members').doc(id).delete();
        db.collection('member_siblings').doc(id).delete();
        db.collection('member_children').doc(id).delete();

    });

    // edit member
    editMember.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        let id = e.target.parentElement.getAttribute('data-id');
        openEditMemberModal(id);
    });

    // addSiblingOrSpouse
    addSiblingOrSpouse.addEventListener('click', (e) => {
        e.stopPropagation();
        let originId = e.target.parentElement.getAttribute('data-id');
        showSiblingSpouseModal(originId);
    })

    // add child
    addChild.addEventListener('click', (e) => {
        e.stopPropagation();
        let originId = e.target.parentElement.getAttribute('data-id');
        showChild(originId);
    })

    // add parent
    addParent.addEventListener('click', (e) => {
        e.stopPropagation();
        let originId = e.target.parentElement.getAttribute('data-id');
        showParent(originId);
    })

    familyTree.appendChild(li);

    // ul.appendChild(parentItem);
    // ul.appendChild(childList);
};

// Add parent
function showParent(originId) {
    const modal = document.querySelector('#add-parent-modal');
    M.Modal.getInstance(modal).open();

    addParentForm.originId.value = originId;
};

// Save parent
addParentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let originId = addParentForm.originId.value;
    let members = db.collection("members");

    members.add({
        firstName: addParentForm.firstName.value,
    })
    .then(function(docRef) {

        db.collection("member_children").doc(docRef.id).set({
            children: firebase.firestore.FieldValue.arrayUnion(originId)
        },
        {merge: true}
        ).then(function() {
            console.log("Success! "+docRef.id+" parent added.");
        })
        .catch(function(error) {
            console.error("Error adding member: ", error);
        });

    })
    .catch(function(error) {
        console.error("Member not added: ", error);
    });
    const modal = document.querySelector('#add-parent-modal');
    M.Modal.getInstance(modal).close();
})

// Add sibling or spouse
function showSiblingSpouseModal(originId) {
    const modal = document.querySelector('#add-sibling-or-spouse-modal');
    M.Modal.getInstance(modal).open();

    addSiblingOrSpouseForm.originId.value = originId;
};

// Save sibling or spouse
addSiblingOrSpouseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let originId = addSiblingOrSpouseForm.originId.value;

    db.collection("members").add({
        firstName: addSiblingOrSpouseForm.firstName.value,
    })
    .then(function(docRef) {

        db.collection('member_spouse').set({
            siblings: firebase.firestore.FieldValue.arrayUnion(docRef.id)
        },
        {merge: true}
        )
        .then(function() {
            console.log("Child "+docRef.id+"added successfully");
        })
        .catch(function(error) {
            // The document probably doesn't exist.
            console.error("Error relating child to member ", error);
        });


    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
})

// Add child modal
function showChild(originId) {
    const modal = document.querySelector('#add-child-modal');
    M.Modal.getInstance(modal).open();

    addChildForm.originId.value = originId;
};

// Save child
addChildForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let originId = addChildForm.originId.value;

    db.collection("members").add({
        firstName: addChildForm.firstName.value,
        // parentId: originId
    })
    .then(function(docRef) {

        db.collection("member_children").doc(originId).set({
            children: firebase.firestore.FieldValue.arrayUnion(docRef.id)
        },
        {merge: true}
        )
        .then(function() {
            console.log("Child "+docRef.id+"added successfully");
        })
        .catch(function(error) {
            // The document probably doesn't exist.
            console.error("Error relating child to member ", error);
        });
    })
    .catch(function(error) {
        console.error("Error creating child: ", error);
    });
    const modal = document.querySelector('#add-child-modal');
    M.Modal.getInstance(modal).close();
})

//saving member
addMemberForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    db.collection('members').add({
        firstName: addMemberForm.firstName.value,
        // is_parent: addMemberForm.is_parent.checked == true ? true : false,
        // email: addMemberForm.email.value,
        // familyId: selectFamilies.options[selectFamilies.selectedIndex].value,
        // spouseId: selectSpouse.options[selectSpouse.selectedIndex].value
    });
    addMemberForm.firstName.value = '';
    // addMemberForm.lastName.value = '';
    // addMemberForm.email.value = ''

    const modal = document.querySelector('#add-member-modal');
    M.Modal.getInstance(modal).close();
})

// Edit member update
function openEditMemberModal(id) {
    allMembers.doc(id).get().then( doc => {
        let member = doc.data();
        let matchingOption = spouseSelect.querySelector('option[value="'+id+'"');

        matchingOption.setAttribute('disabled', true);
        
        // TODO: LEFT OFF TRYING TO SELECT CURRENT SPOUSE IN DOM
        // TODO: Error when editng a member without spouse.
        if ( doc.data().spouses && doc.data().spouses.length >= 1) {
            let currentSpouseId = doc.data().spouses[0];
            let currentSpouse = spouseSelect.querySelector('option[value="'+currentSpouseId+'"');
            currentSpouse.setAttribute('selected', true);
        };

        var instances = M.FormSelect.init(spouseSelect, options);

        editMemberForm.firstName.value = member.firstName;
        editMemberForm.id.value = id;

        const modal = document.querySelector('#edit-member-modal');
        M.Modal.getInstance(modal).open();

    }).catch(err => {
        alert("there was an error loading this member");
    });
};


// Update member
editMemberForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let spouse = spouseSelect.options[spouseSelect.selectedIndex].value;

    let memberId = editMemberForm.id.value;
    let member = allMembers.doc(memberId);

    return member.update({

        spouses: firebase.firestore.FieldValue.arrayUnion(spouse)
    })
    .then(function() {
        console.log("Document successfully updated!");
        const modal = document.querySelector('#edit-member-modal');
        M.Modal.getInstance(modal).close();
    })
    .catch(function(error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
    });
})

// // real-time listener for members
// db.collection('members').onSnapshot(snapshot => {
//     let changes = snapshot.docChanges();
//     changes.forEach(change => {
//         if(change.type == 'added'){
//             renderMembersInFamily(change.doc);
//         } else if (change.type == 'removed'){
//             let li = families.querySelector('[data-id="' + change.doc.id + '"]');
//             families.removeChild(li);
//         }
//     })
// })

// // real-time listener for families
// db.collection('members').onSnapshot(snapshot => {
//     let changes = snapshot.docChanges();
//     changes.forEach(change => {
//         if(change.type == 'added'){
//             renderMembersInFamily(change.doc);
//             // renderFamiliesForSelect(change.doc);
//             // renderSpouseForSelect(change.doc);
//         } else if (change.type == 'removed'){
//             let li = members.querySelector('[data-id="' + change.doc.id + '"]');
//             let optionFamily = selectFamilies.querySelector('[data-id="' + change.doc.id + '"]');

//             members.removeChild(li);
//             selectFamilies.removeChild(optionFamily);
//         }
//     })
// })

// function renderParents(doc) {
//     let childList = document.createElement('ul');

//     childList.setAttribute('class', 'child__list');

//     let li = renderMember(doc);

//     li.setAttribute('class', 'parent__item profile_leaf');

//     doc.data().children.forEach(childId => {
//         db.collection("members").doc(childId).get().then( doc => {
//             let childElement = renderMember(doc);

//             childList.appendChild(childElement);
//         });
//     });

//     li.appendChild(childList);
//     familyTree.appendChild(li);
// }


// // real-time listener for members
// db.collection('members').onSnapshot(snapshot => {
//     let changes = snapshot.docChanges();
//     changes.forEach(change => {
//         if(change.type == 'added'){
//             startFamilyTree(change.doc);
//             // renderMembersInFamily(change.doc)
//         } else if (change.type == 'removed'){
//             let li = members.querySelector('[data-id="' + change.doc.id + '"]');
//             let optionSpouse = selectSpouse.querySelector('[data-id="' + change.doc.id + '"]');
//             li.parentNode.removeChild(li);
//             selectSpouse.removeChild(optionSpouse);
//         }
//     })
// })

// setup materialize components
document.addEventListener('DOMContentLoaded', function() {
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);
});