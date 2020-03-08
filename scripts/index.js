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

const profileInfo = document.querySelector(".profileInfo");
const profileInfoName = profileInfo.querySelector(".profileInfo__name");
const profileInfoImage = profileInfo.querySelector(".profileInfo__image");
const profileInfoEmail = profileInfo.querySelector(".profileInfo__email");
const profileInfoBirthday = profileInfo.querySelector(".profileInfo__birthday");
const profileInfoAddress1 = profileInfo.querySelector(".profileInfo__address1");
const profileInfoAddress2 = profileInfo.querySelector(".profileInfo__address2");
const profileInfoCity = profileInfo.querySelector(".profileInfo__city");
const profileInfoZipcode = profileInfo.querySelector(".profileInfo__zipcode");
const profileInfoCountry = profileInfo.querySelector(".profileInfo__country");

const viewPref_list = document.querySelector(".viewPref--list");
const viewPref_tree = document.querySelector(".viewPref--tree");

const placeholderImageUrl = "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?cs=srgb&dl=face-facial-hair-fine-looking-guy-614810.jpg&fm=jpg";

let owners = [];
let activeMember;
let activeMemberIsOwner = false;
let primaryTree = '';
let primaryTreeLeaves = '';

viewPref_list.addEventListener('click', () => {
    memberList.classList.add('list');
});

viewPref_tree.addEventListener('click', () => {
    memberList.classList.remove('list');
})

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
        let spouses = Object.keys(doc.data().spouses);
        let children = doc.data().children;
    
        if (spouses && spouses.length > 0) {
            // is spouse divorced, separated, or married?

            for (const spouse of spouses) {
                let spouseDoc = allLeaves.docs.find(spouseReq => spouseReq.id === spouse);
                // let spouseDoc = allLeaves.docs.find(spouseReq => console.log(spouseReq.id));

                let spouseEl = await getMemberLi({
                    "leafDoc" : spouseDoc,
                    "relationship" : "spouse"
                });

                directMemberContainer.insertAdjacentHTML('beforeend', spouseEl);
              }


            // spouses.forEach(spouse => {
            //     let spouseDoc = allLeaves.docs.find(spouseReq => spouseReq.id === spouse);
            //     let spouseEl = getMemberLi({
            //         "leafDoc" : spouseDoc,
            //         "relationship" : "spouse"
            //     });

            //     directMemberContainer.insertAdjacentHTML('beforeend', spouseEl);
            // })
        }
    
        if (children && children.length > 0) {

            for (const child of children) {
                let childDoc = allLeaves.docs.find(childReq => childReq.id === child);
                let descendantBranch = await buildBranchFromChosenMember(childDoc, allLeaves);
                descendantsContainer.prepend(descendantBranch);
              }

            // children.forEach(child => {
            //     let childDoc = allLeaves.docs.find(childReq => childReq.id === child);
            //     let descendantBranch = await buildBranchFromChosenMember(childDoc, allLeaves);
            //     descendantsContainer.prepend(descendantBranch);
            // })
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
            handleProfileInfo("show", e);
        });
    })
}

async function initiateTree(doc, allLeaves) {
    let chosenMemberSiblings = doc.data().siblings;
    let chosenMemberBranch = await buildBranchFromChosenMember(doc, allLeaves);
    
    memberList.appendChild(chosenMemberBranch);

    if (chosenMemberSiblings && chosenMemberSiblings.length > 0) {

        for (const sibling of chosenMemberSiblings) {
            let siblingDoc = allLeaves.docs.find(siblingReq => siblingReq.id === sibling);
            let siblingsBranch = await buildBranchFromChosenMember(siblingDoc, allLeaves);
            memberList.appendChild(siblingsBranch);
          }

        // chosenMemberSiblings.forEach((sibling) => {
        //     let siblingDoc = allLeaves.docs.find(siblingReq => siblingReq.id === sibling);
        //     let siblingsBranch = await buildBranchFromChosenMember(siblingDoc, allLeaves);
        //     memberList.appendChild(siblingsBranch);
        // })
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
                    spouses: null,
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
                    spouses: null,
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
                let spouses = {};
                spouses[targetMemberId] = null;
    
                if ( targetMemberDoc.data().children && targetMemberDoc.data().children.length > 0 ) {
                    targetMemberDoc.data().children.forEach(child => {
                        children.push(child);
                    })
                }

                primaryTreeLeaves.add({
                    name: null,
                    spouses: spouses,
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

                    let spouseObj = {};
                    spouseObj[spouseRef.id] = null;

                    console.log(targetMemberId);

                    primaryTreeLeaves.doc(targetMemberId).set({
                        spouses: spouseObj
                    }, {merge: true})
                    .then(() => {
                        setupViewWithActiveMember(activeMember);
                    }).catch((err) => {
                        console.log(err.message);
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

function handleProfileInfo(state, e) {
    if (state) {
        if (state == "show") {
            let target = e.target;

            let name = target.querySelector(".profileLeaf__caption").textContent;
            let imageUrl = target.querySelector(".profileLeaf__image").getAttribute("src");
            let email = target.querySelector(".profileLeaf__email").textContent;
            let birthday = target.querySelector(".profileLeaf__birthday").textContent;
            let deceased = target.querySelector(".profileLeaf__deceased");
            let address1 = target.querySelector(".profileLeaf__address1").textContent;
            let address2 = target.querySelector(".profileLeaf__address2").textContent;
            let city = target.querySelector(".profileLeaf__city").textContent;
            let zipcode = target.querySelector(".profileLeaf__zipcode").textContent;
            let country = target.querySelector(".profileLeaf__country").textContent;

            profileInfoName.textContent = name; 
            profileInfoImage.setAttribute('src', imageUrl); 
            profileInfoEmail.textContent = email; 
            profileInfoBirthday.textContent = birthday; 
            profileInfoAddress1.textContent = address1; 
            profileInfoAddress2.textContent = address2; 
            profileInfoCity.textContent = city; 
            profileInfoZipcode.textContent = zipcode; 
            profileInfoCountry.textContent = country; 

            profileInfo.classList.add("show");
        }
    } else {
        profileInfo.classList.remove("show");
    }
}

const getProfileImageURL = async (leafDoc) => {
    if (leafDoc.data().photo) {
        let storageRef = storage.ref();
        let imageRef = storageRef.child(leafDoc.data().photo);

        return imageRef.getDownloadURL();
    }
    return '';
}

const getMemberLi = async (params) => {
    let leafDoc = params["leafDoc"] ? params["leafDoc"] : false;
    let name = leafDoc.data().name ? leafDoc.data().name : "Unnamed";
    let email = leafDoc.data().email ? leafDoc.data().email : "No email set";
    let birthday = leafDoc.data().birthday ? leafDoc.data().birthday.toDate() : "No birthday set";
    let address1 = leafDoc.data().address ? leafDoc.data().address.address1 : "No address1 set";
    let address2 = leafDoc.data().address ? leafDoc.data().address.address2 : "No address2 set";
    let city = leafDoc.data().address ? leafDoc.data().address.city : "No city set";
    let zipcode = leafDoc.data().address ? leafDoc.data().address.zipcode : "No zipcode set";
    let country = leafDoc.data().address ? leafDoc.data().address.country : "No country set";
    let classNames = params["relationship"] ? params["relationship"] : '';
    let claimedBy = leafDoc.data().claimed_by ? leafDoc.data().claimed_by : false;  
    let parentMenuOption = '';
    let spouseMenuOption = '';
    let siblingMenuOption = '';

    if (classNames === "spouse") {

        // check for married, seperated, divorced
    } else {
        spouseMenuOption = `<div class="add_spouse_option">Add partner</div>`;
        siblingMenuOption = `<div class="add_sibling_option">Add sibling</div>`;
    }

    if (claimedBy === activeMember) {
        classNames = classNames + " you"; 
    }

    if (leafDoc && claimedBy) {
        classNames = classNames + " claimed";
    }

    if (leafDoc.data().topMember === true) {
        parentMenuOption = `<div class="add_parent_option">Add parent</div>`;
    }

    if (leafDoc && claimedBy) {
        const memberDoc = await members.doc(claimedBy).get();
        name = memberDoc.data().name.firstName;
    }

    return generateProfileLeafHtml({
        "name": name,
        "classNames": classNames,
        "leafDoc": leafDoc,
        "parentMenuOption": parentMenuOption,
        "spouseMenuOption": spouseMenuOption,
        "siblingMenuOption": siblingMenuOption,
        "profilePhoto" : await getProfileImageURL(leafDoc),
        "email": email,
        "birthday": birthday,
        "address1": address1,
        "address2": address2,
        "city": city,
        "zipcode": zipcode,
        "country": country
    })
}

function generateProfileLeafHtml(params) {
    let name = params["name"];
    let classNames = params["classNames"];
    let leafDoc = params["leafDoc"];
    let parentMenuOption = params["parentMenuOption"] ? params["parentMenuOption"] : '';
    let spouseMenuOption = params["spouseMenuOption"] ? params["spouseMenuOption"] : '';
    let siblingMenuOption = params["siblingMenuOption"] ? params["siblingMenuOption"] : '';
    let email = params['email'];
    let birthday = params['birthday'];
    let address1 = params['address1'];
    let address2 = params['address2'];
    let city = params['city'];
    let zipcode = params['zipcode'];
    let country = params['country'];
    // let profilePhoto = params["profilePhoto"] ? "url('"+params['profilePhoto']+")" : "";
    let profilePhoto = params["profilePhoto"] ? params['profilePhoto'] : placeholderImageUrl;


    // let li = `
    //     <li class="profileLeaf ${classNames}" data-id="${leafDoc.id}" style="background-image: ${profilePhoto}">
    //         <div class="actions">
    //             <div class="actions_dropdown">
    //                 ${parentMenuOption}
    //                 <div class="add_child_option">Add child</div>
    //                 <div class="add_sibling_option">Add sibling</div>
    //                 <div class="add_spouse_option">Add spouse</div>
    //                 <div class="delete_member_action" style="color:red;">Delete</div>
    //             </div>
    //         </div>
    //         <div class="profileLeaf__caption">
    //             <span class="profileLeaf__name">${name}</span>
    //         </div> 
    //         <div class="profileLeaf__connectors"></div>
    //     </li>
    // `

    let li = `
        <figure class="profileLeaf ${classNames}" data-id="${leafDoc.id}">
            <img class="profileLeaf__image" src="${profilePhoto}"/>
            <div class="actions">
                <div class="actions_dropdown">
                    ${parentMenuOption}
                    <div class="add_child_option">Add child</div>
                    ${siblingMenuOption}
                    ${spouseMenuOption}
                    <div class="delete_member_action" style="color:red;">Delete</div>
                </div>
            </div>
            <div class="profileLeaf__info">
                <span class="profileLeaf__email">${email}</span>
                <span class="profileLeaf__address1">${address1}</span>
                <span class="profileLeaf__address2">${address2}</span>
                <span class="profileLeaf__city">${city}</span>
                <span class="profileLeaf__zipcode">${zipcode}</span>
                <span class="profileLeaf__country">${country}</span>
                <span class="profileLeaf__birthday">${birthday}</span>
            </div>
            <figcaption class="profileLeaf__caption profileLeaf__name">${name}</figcaption> 
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
    let leafName = targetEl.querySelector(".profileLeaf__name").textContent;
    let leafEmail = targetEl.querySelector(".profileLeaf__email").textContent;
    let leafBirthday = targetEl.querySelector(".profileLeaf__birthday").textContent === 0 ? targetEl.querySelector(".profileLeaf__birthday").textContent : false ;
    let leafAddress1 = targetEl.querySelector(".profileLeaf__address1").textContent;
    let leafAddress2 = targetEl.querySelector(".profileLeaf__address2").textContent;
    let leafCity = targetEl.querySelector(".profileLeaf__city").textContent;
    let leafZipcode = targetEl.querySelector(".profileLeaf__zipcode").textContent;
    let leafCountry = targetEl.querySelector(".profileLeaf__country").textContent;

    let leafNameText = leafName === 'Unnamed' ? '' : leafName;
    
    if (leafBirthday) {
        leafBirthday = new Date(leafBirthday).toISOString().substring(0, 10);
        editMemberForm["birthday"].value = leafBirthday;
    }

    editMemberForm["memberId"].value = targetMemberId;
    editMemberForm["name"].value = leafNameText;
    // editMemberForm["email"].value = leafEmail;
    // editMemberForm["birthday"].value = leafBirthday;
    // editMemberForm["address1"].value = leafAddress1;
    // editMemberForm["address2"].value = leafAddress2;
    // editMemberForm["city"].value = leafCity;
    // editMemberForm["zipcode"].value = leafZipcode;
    // editMemberForm["country"].value = leafCountry;
}

editMemberForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let memberId = editMemberForm['memberId'].value;
    let name = editMemberForm['name'].value;
    let email = editMemberForm['email'].value;
    let birthday = editMemberForm['birthday'].value ? new Date(editMemberForm['birthday'].value) : null;
    let address1 = editMemberForm['address1'].value;
    let address2 = editMemberForm['address2'].value;
    let city = editMemberForm['city'].value;
    let zipcode = editMemberForm['zipcode'].value;
    let country = editMemberForm['country'].value;

    primaryTreeLeaves.doc(memberId).update({
        "name": name,
        "email": email,
        "birthday": birthday,
        "address": {
            "address1": address1,
            "address2": address2,
            "city": city,
            "zipcode": zipcode,
            "country": country
        }

    }).then(() => {
        let targetLeaf = memberList.querySelector('.profileLeaf[data-id="'+memberId+'"]');
        
        targetLeaf.querySelector(".profileLeaf__name").textContent = name;

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
            spouses: [],
            address: {},
            email: '',
            birthday: 0
        }).then(leafRef => {
            members.doc(authMemberId).update({
                primary_tree: treeRef.id,
                trees: firebase.firestore.FieldValue.arrayUnion(treeRef.id),
                address: {},
                email: ''
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


const storageUrl = "gs://mily-4c2a8.appspot.com";
const profilePhotoInputUpload = document.querySelector("[name='profilePhoto']");

profilePhotoInputUpload.addEventListener('change', (e) => {
    e.preventDefault();

    let leafId = editMemberForm["memberId"].value;
    let file = e.target.files[0];
    let fileName = file.name;
    // var file_ext = fileName.substr(fileName.lastIndexOf('.')+1,fileName.length);
    let filePath = 'tree/' + primaryTree + '/' + leafId + '/' + fileName;

    let storageRef = firebase.storage().ref(filePath);
    
    storageRef.put(file)
    .then(() => {
        primaryTreeLeaves.doc(leafId).update({
            photo: filePath
        })
        .then(() => {
            let memberToUpdate = memberList.querySelector("[data-id='"+leafId+"'] .profileLeaf__image");
            let profileInfoImage = profileInfo.querySelector(".profileInfo__image");

            let reader = new FileReader();
            reader.onload = function(){
                memberToUpdate.setAttribute('src', reader.result);
                profileInfoImage.setAttribute('src', reader.result);
            };
            reader.readAsDataURL(file);

            console.log('Profile photo uploaded');
        })
        .catch((err) => {
            console.log(err.message);
        })
      }).catch((err) => {
          console.log(err.message);
      })
})