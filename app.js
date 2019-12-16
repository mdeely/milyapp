// const members = document.querySelector('.member__list');
// const families = document.querySelector('.family__list');
const familyTree = document.querySelector('.family__tree');
const addMemberForm = document.querySelector('#add-member-form');
const editMemberForm = document.querySelector('#edit-member-form');
const addFamilyForm = document.querySelector('#add-family-form');
const selectedSpouses = document.querySelector('#selectSpouse');
const addSiblingOrSpouseForm = document.querySelector('#add-sibling-or-spouse-form');
const addChildForm = document.querySelector('#add-child-form');
const addParentForm = document.querySelector('#add-parent-form');
const spouseSelect  = M.FormSelect.getInstance("#selectSpouses");



// function renderSpouseForSelect(doc) {
//     let familyId = doc.id;

//     // Iterate through members
//     db.collection('members').get().then(snapshot => {
//         snapshot.docs.forEach(doc => {
//             let option = document.createElement('option');

//             if (doc.data().familyId == familyId && doc.data().is_parent == true) {
//                 option.setAttribute( 'data-id', doc.id);
//                 option.setAttribute( 'value', doc.id);
//                 option.text = doc.data().firstName;
//                 selectSpouse.appendChild(option);
//             }
//         });
//     });
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

    db.collection("members").doc(id).get().then( doc => {
        let member = doc.data();

        editMemberForm.id.value = id;
        editMemberForm.firstName.value = member.firstName;
        // editMemberForm.is_parent.checked = true;
        // selectFamilies.options[selectFamilies.selectedIndex].value,
        // selectSpouse.options[selectSpouse.selectedIndex].value
    
        const modal = document.querySelector('#edit-member-modal');
        M.Modal.getInstance(modal).open();
    }).catch(err => {
        alert("there was an error loading this member");
    });
};


// Update member
editMemberForm.addEventListener('submit', (e) => {
    e.preventDefault();

    var spouseValues = spouseSelect.getSelectedValues();

    console.log(spouseValues);

    var memberId = editMemberForm.id.value;
    var member = db.collection("members").doc(memberId);

    return member.update({
        firstName: editMemberForm.firstName.value,
        spouses: firebase.firestore.FieldValue.arrayUnion(spouseValues)

        // is_parent: editMemberForm.is_parent.checked == true ? true : false,
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

//saving family
addFamilyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    db.collection('families').add({
        name: addFamilyForm.name.value,
    });
    addFamilyForm.name.value = '';

    const modal = document.querySelector('#add-family-modal');
    M.Modal.getInstance(modal).close();
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

db.collection('members').get().then((snapshot) => {
    snapshot.docs.forEach(doc => {
        renderMember(doc);
    })
})



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