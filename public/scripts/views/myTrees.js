let myTreesViewEl = document.querySelector(`[data-view="my-trees"]`);
let myTreesDebugMsg = myTreesViewEl.querySelector(`.debugMessage`);
let myTreeListEl = myTreesViewEl.querySelector(`#myTree__list`);

let MyTrees = {};

const myTreesSetup = () => {
    pageTitle.innerHTML = "Your trees";
    Nav.showViewPreferencesButton(false);
}

const myTreesViewOnAuthChange = (user) => {
    if (user) {
        populateMyTreesList();
    } else {
        window.location.hash = "#/log-in"
    }
}

const populateMyTreesList = async () => {
    myTreesDebugMsg.innerHTML = '';
    myTreeListEl.textContent = '';

    let button = document.createElement("button");
    button.setAttribute("class", "new-tree_button u-mar-l_auto u-mar-r_2");
    button.setAttribute("data-modal-trigger", "create-tree_modal");

    button.textContent = "Create a tree";

    myTreesDebugMsg.innerHTML += `<h2 class="u-ta_center u-mar-l_2">Your trees</h2>`;
    myTreesDebugMsg.appendChild(button);

    if (Object.keys(LocalDocs.member.trees)) {
        let ranThrough = [];

        for await (let treeId of Object.keys(LocalDocs.member.trees)) {
            if (!ranThrough.includes(treeId)) {
                treesRef.doc(treeId).get()
                .then((reqTreeDoc) => {
                    if (reqTreeDoc.exists && reqTreeDoc.data().deleted !== true) {
                        let liEl = createElementWithClass('li', 'u-w_full u-mar-r_2 u-mar-l_2' );
                        let aEl = createElementWithClass('div', 'myTree__item u-pad_2 u-w_full u-font-size_18 u-d_flex u-ai_center' );
                        let treeEditButton = createElementWithClass('button', 'iconButton white u-mar-l_auto edit_tree_button' );
                        let ellipsisIcon = createElementWithClass('i', 'far fa-ellipsis-h' );
                        let viewTreeButton = createElementWithClass('a', 'button secondary u-mar-l_2', "View");
                        let dropdownEl = createElementWithClass('div', 'dropdown u-visibility_hidden u-p_fixed' );
                        let renameDropdown = createElementWithClass('div', 'dropdown__item' );
                        // let inviteDropdown = createElementWithClass('div', 'dropdown__item' );
                        let editMembersDropdown = createElementWithClass('div', 'dropdown__item' );
                        let deleteDropdown = createElementWithClass('div', 'dropdown__item u-c_danger' );
                        let leaveTree = createElementWithClass('div', 'dropdown__item u-c_danger' );

                        liEl.setAttribute("data-tree-id", reqTreeDoc.id);
                        viewTreeButton.setAttribute("href", `#/trees/${reqTreeDoc.id}`);
                        treeEditButton.setAttribute("data-dropdown-target", `edit_tree_options_${reqTreeDoc.id}`); 
                        treeEditButton.setAttribute("tooltip", `Options`); 
                        dropdownEl.setAttribute("id", `edit_tree_options_${reqTreeDoc.id}`);
                        renameDropdown.setAttribute("data-value", `rename`);
                        renameDropdown.setAttribute("data-modal-trigger", `rename-tree_modal`);
                        // inviteDropdown.setAttribute("data-value", `invite`);
                        // inviteDropdown.setAttribute("data-modal-trigger", `invite-members-to-tree_modal`);
                        editMembersDropdown.setAttribute("data-modal-trigger", `edit-tree_modal`);
                        
                        aEl.textContent = reqTreeDoc.data().name;
                        renameDropdown.textContent = "Settings";
                        // inviteDropdown.textContent = "Add members";
                        editMembersDropdown.textContent = "Members";
                        deleteDropdown.textContent = "Delete tree";
                        leaveTree.textContent = "Leave tree";
    
                        // do not show this icon if no permissions
                        treeEditButton.appendChild(ellipsisIcon);
                        if ( reqTreeDoc.data().permissions[LocalDocs.member.id] ) {
                            if (reqTreeDoc.data().permissions[LocalDocs.member.id] === "admin") {
                                dropdownEl.appendChild(renameDropdown);
                                // dropdownEl.appendChild(inviteDropdown);
                                dropdownEl.appendChild(editMembersDropdown);
                                dropdownEl.appendChild(deleteDropdown);
                            } else {
                                dropdownEl.appendChild(leaveTree);
                            }
                        }

                        aEl.appendChild(treeEditButton);
                        aEl.appendChild(viewTreeButton);
                        liEl.appendChild(dropdownEl);
                        liEl.appendChild(aEl);
    
                        editMembersDropdown.addEventListener('click', (e) => {
                            e.preventDefault();
                            let permissionsEl = editTreeForm.querySelector(".permissions");
                            permissionsEl.innerHTML = '';
    
                            editTreeForm[`edit-tree_id`].value = treeId;
                            inviteMembersToTreeForm[`invite-member-to-tree_id`].value = treeId;

                            if (reqTreeDoc.data().permissions) {
                                for (let [memberId, memberPermission] of Object.entries(reqTreeDoc.data().permissions)) {
                                    let div = createElementWithClass("div", "u-mar-b_1 u-d_block");
                                    let select = document.createElement("select");
                                    let selectWrapper = createElementWithClass("div", "select-wrapper u-mar-l_auto");
                                    let removeMemberFromTreeButton = createElementWithClass("button", "iconButton white u-mar-l_1");
                                    let trashIcon = createElementWithClass("i", "u-c_danger fal fa-trash-alt");

                                    removeMemberFromTreeButton.setAttribute("tooltip", "Remove member");
                                    div.setAttribute("class", "u-d_flex u-mar-b_1 u-align-items_center");
                                    div.setAttribute("data-member-id", memberId);

                                    membersRef.doc(memberId).get()
                                    .then((reqMemberDoc) => {
                                        if (reqMemberDoc.exists) {
                                            let members = {};
                                            members = {
                                                id: reqMemberDoc.id,
                                                ...reqMemberDoc.data()
                                            }
                                            LocalDocs.trees[reqTreeDoc.id] = {
                                                members,
                                                ...reqTreeDoc.data()
                                            }
                                            div.textContent = `${reqMemberDoc.data().name.firstName} ${reqMemberDoc.data().name.surnameCurrent}`;
                                        } else {
                                            div.textContent = memberId;
                                        }

                                        for (let [permName, permValue] of Object.entries(availablePermissions)) {
                                            let option = document.createElement("option");
                                            option.textContent = permName;
                                            option.setAttribute("value", permValue);
        
                                            if (memberPermission === permValue) {
                                                option.setAttribute("selected", true);
                                            }
        
                                            select.appendChild(option);
                                        }
                                        
                                        removeMemberFromTreeButton.appendChild(trashIcon);
                                        selectWrapper.appendChild(select);
                                        div.appendChild(selectWrapper);
                                        div.appendChild(removeMemberFromTreeButton);
                                        permissionsEl.appendChild(div);
                                    })

                                    removeMemberFromTreeButton.addEventListener('click', (e) => {
                                        e.preventDefault();

                                        if (confirm("Remove this member?")) {
                                          let memberId = e.target.closest("[data-member-id]").getAttribute("data-member-id");
                                          let treeId = editTreeForm[`edit-tree_id`].value;

                                          treesRef.doc(treeId).get()
                                          .then((treeDoc) => {
                                              if (treeDoc.data().created_by === memberId) {
                                                  alert("You created this tree. You cannot remove yourself from it.")
                                              } else {
                                                membersRef.doc(memberId).update({
                                                    trees: firebase.firestore.FieldValue.arrayRemove(treeId)
                                                  })
                                                  .then(() => {
                                                      console.log("member had the tree removed");
                                                      treesRef.doc(treeId).update({
                                                        [`permissions.${memberId}`] : firebase.firestore.FieldValue.delete()
                                                      })
                                                      .then(() => {
                                                            // find if any leaves are claimed by this user.
                                                            treesRef.doc(treeDoc.id).collection("leaves").where("claimed_by", "==", memberId).get()
                                                            .then((response) => {
                                                                if (response.docs.length > 0) {
                                                                    let claimedLeafDoc = response.docs[0];
                                                                    treesRef.doc(treeId).collection("leaves").doc(claimedLeafDoc.id).update({
                                                                        "claimed_by" : null
                                                                    })
                                                                    .then(() => {
                                                                        console.log("member had a claimed leaf, and is now unclaimed");
                                                                    })
                                                                }
                                                            })
                                                            console.log("permission removed from tree");
                                                            // location.reload();
                                                      })
                                                      .catch(err => {
                                                        console.log(err.message);
                                                    })
                                                  })
                                                  .catch(err => {
                                                      console.log(err.message);
                                                  })
                                              }
                                          })
                                        }
                                    })
                                }
                            }
    
                            closeAllDropdowns();
                        })
    
                        deleteDropdown.addEventListener('click', (e) => {
                            e.preventDefault;
                            if (confirm("Are you sure you want to delete this tree?")) {
                                treesRef.doc(reqTreeDoc.id).update({
                                    "deleted": true
                                }).then(() => {
                                    location.reload();
                                })
                            }
                        });
    
                        renameDropdown.addEventListener('click' , (e) => {
                            e.preventDefault();
                            renameTreeForm["rename-tree_name"].value = reqTreeDoc.data().name;
                            renameTreeForm["rename-tree_id"].value = reqTreeDoc.id;
                            renameTreeForm["make-public"].checked = reqTreeDoc.data().public ? reqTreeDoc.data().public : null ;
                            closeAllDropdowns();
                        });

                        // inviteDropdown.addEventListener('click' , (e) => {
                        //     e.preventDefault();
                        //     inviteMembersToTreeForm[`invite-member-to-tree_id`].value = reqTreeDoc.id;
                        //     closeAllDropdowns();
                        // });

                        leaveTree.addEventListener('click', (e) => {
                            e.preventDefault();

                            membersRef.doc(LocalDocs.member.id).update({
                                [`trees.${reqTreeDoc.id}`] : firebase.firestore.FieldValue.delete()
                                // trees : firebase.firestore.FieldValue.arrayRemove(reqTreeDoc.id)
                            })
                            .then(() => {
                                console.log(`${LocalDocs.member.id} updated to remove tree ${reqTreeDoc.id}`);
                                treesRef.doc(reqTreeDoc.id).update({
                                    [`permissions.${LocalDocs.member.id}`] : firebase.firestore.FieldValue.delete()
                                })
                                .then(() => {
                                    console.log(`${reqTreeDoc.id} updated to remove permission from tree member: ${LocalDocs.member.id}`)

                                    treesRef.doc(reqTreeDoc.id).collection('leaves').where("claimed_by", "==", LocalDocs.member.id).get()
                                    .then((result) => {
                                        if (result.docs.length > 0) {
                                            let leafDocId = result.docs[0].id;
                                            if (leafDocId) {
                                                treesRef.doc(reqTreeDoc.id).collection('leaves').doc(leafDocId).update({
                                                    "claimed_by" : null
                                                })
                                                .then(() => {
                                                    console.log(`${leafDocId} updated to remove claimed by ${LocalDocs.member.id}`)
                                                    location.reload();
                                                })
                                                .catch(() => console.log("error"));
                                            } else {
                                                location.reload();
                                            }
                                        } else {
                                            location.reload();
                                        }
                                    })
                                })
                            })
                        })
    
                        // let anchor = `<li class="u-w_full u-mar-r_2 u-mar-l_2" data-tree-id="${reqTreeDoc.id}">
                        //                     <a class="myTree__item u-pad_1 u-w_full u-font-size_18 u-d_flex u-ai_center" href="#/trees/${reqTreeDoc.id}">${reqTreeDoc.data().name}
                        //                         <button class="iconButton white u-mar-l_auto edit_tree_button" data-dropdown-target="edit_tree_options_${reqTreeDoc.id}">
                        //                             <i class="fa fa-ellipsis-h"></i>
                        //                         </button>
                        //                     </a>
                        //                     <div id="edit_tree_options_${reqTreeDoc.id}" class="dropdown u-visibility_hidden u-p_fixed">
                        //                         <div class="dropdown__item" data-value="rename" data-modal-trigger="rename-tree_modal">Rename</div>
                        //                         <div class="dropdown__item"_>Edit members</div>
                        //                         <div class="dropdown__item u-c_danger" data-value="delete">Delete tree</div>
                        //                     </div>
                        //                 </li>`;
                                        
                        let existingLeaf = myTreeListEl.querySelector(`[data-tree-id="${reqTreeDoc.id}"]`);
    
                        if (!existingLeaf && reqTreeDoc.data().deleted !== true) {
                            myTreeListEl.appendChild(liEl);
                            initiateDropdown(treeEditButton);
                            // myTreeListEl.innerHTML += anchor;
                            // initiateEditTreeAction(reqTreeDoc);
                            initiateModals();
                        } 
                    }
                })
                // ranThrough.push(treeId);
            }
        }

        editTreeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let memberEls = editTreeForm.querySelectorAll(`[data-member-id]`);
            let treeId = editTreeForm[`edit-tree_id`].value;

            let obj = {};

            for (updateMemberPermission of memberEls) {
                let memberId = updateMemberPermission.getAttribute("data-member-id");
                let select = updateMemberPermission.querySelector("select");
                let value = select.options[select.selectedIndex].value;  
                
                obj[`${memberId}`] = value;
            };

            treesRef.doc(treeId).update({
                "permissions": obj
            })     
            .then(() => {
                console.log("updated!");
                location.reload();
            })   
            .catch(() => {
                console.log(err.message);
            }) 
            // closeModals();
        })
        
        inviteMembersToTreeForm.addEventListener("submit", (e) => {
            e.preventDefault();

            let treeId = inviteMembersToTreeForm[`invite-member-to-tree_id`].value;
            let emailForTree = inviteMembersToTreeForm[`invite-member-to-tree_email`].value;
            let permissionType = inviteMembersToTreeForm.querySelector(`input[name="invite-member-to-tree_permission"]:checked`).value;

            notificationsRef.add({
                "for_email": emailForTree,
                "for_leaf": null,
                "for_tree": treeId,
                "from_member": LocalDocs.member.id,
                "permission_type": permissionType,
                "status": "pending",
                "type": "tree"
            })
            .then(()=> {
                console.log("tree notification created");
                inviteMembersToTreeForm[`invite-member-to-tree_id`].value = "";
                inviteMembersToTreeForm[`invite-member-to-tree_email`].value = "";
                closeModals();
            })
        })


    } else {
        let el = `<p class="u-mar-lr_auto">Get started by creating your first tree!</p>`;
        myTreeListEl.innerHTML += el;
    }

    initiateModals();
}

function initiateEditTreeAction(treeDoc) {
    let treeOption = myTreeListEl.querySelector(`[data-tree-id="${treeDoc.id}"] .edit_tree_button`);
    let deleteOption = myTreeListEl.querySelector(`[data-tree-id="${treeDoc.id}"] [data-value="delete"]`);
    let renameOption = myTreeListEl.querySelector(`[data-tree-id="${treeDoc.id}"] [data-value="rename"]`);

    // initiateDropdown(treeOption);

    // deleteOption.addEventListener('click', (e) => {
    //     e.preventDefault;
    //     console.log("you finna deletea atlwsl");
    //     treesRef.doc(treeDoc.id).update({
    //         "deleted": true
    //     }).then(() => {
    //         location.reload();
    //     })
    // });


    // renameOption.addEventListener('click' , (e) => {
    //     e.preventDefault();
    //     renameTreeForm["rename-tree_name"].value = treeDoc.data().name;
    //     renameTreeForm["rename-tree_id"].value = treeDoc.id;
    // })
}