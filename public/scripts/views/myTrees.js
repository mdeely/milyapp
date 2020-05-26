let myTreesViewEl = document.querySelector(`[data-view="my-trees"]`);
let myTreesDebugMsg = myTreesViewEl.querySelector(`.debugMessage`);
let myTreeListEl = myTreesViewEl.querySelector(`#myTree__list`);

let MyTrees = {};

const myTreesSetup = () => {
    pageTitle.innerHTML = "My trees";
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

    myTreesDebugMsg.innerHTML += `<h2 class="u-ta_center u-mar-l_2">Your trees:</h2>`;
    myTreesDebugMsg.appendChild(button);

    if (LocalDocs.member.data().trees) {
        let ranThrough = [];

        for await (let treeId of LocalDocs.member.data().trees) {
            if (!ranThrough.includes(treeId)) {
                treesRef.doc(treeId).get()
                .then((reqTreeDoc) => {
                    let liEl = createElementWithClass('li', 'u-w_full u-mar-r_2 u-mar-l_2' );
                    let aEl = createElementWithClass('a', 'myTree__item u-pad_1 u-w_full u-font-size_18 u-d_flex u-ai_center' );
                    let treeEditButton = createElementWithClass('button', 'iconButton white u-mar-l_auto edit_tree_button' );
                    let ellipsisIcon = createElementWithClass('i', 'fa fa-ellipsis-h' );
                    let dropdownEl = createElementWithClass('div', 'dropdown u-visibility_hidden u-p_fixed' );
                    let renameDropdown = createElementWithClass('div', 'dropdown__item' );
                    let editMembersDropdown = createElementWithClass('div', 'dropdown__item' );
                    let deleteDropdown = createElementWithClass('div', 'dropdown__item u-c_danger' );

                    liEl.setAttribute("data-tree-id", reqTreeDoc.id);
                    aEl.setAttribute("href", `#/trees/${reqTreeDoc.id}`);
                    treeEditButton.setAttribute("data-dropdown-target", `edit_tree_options_${reqTreeDoc.id}`); 
                    dropdownEl.setAttribute("id", `edit_tree_options_${reqTreeDoc.id}`);
                    renameDropdown.setAttribute("data-value", `rename`);
                    renameDropdown.setAttribute("data-modal-trigger", `rename-tree_modal`);
                    
                    aEl.textContent = reqTreeDoc.data().name;
                    renameDropdown.textContent = "Rename";
                    editMembersDropdown.textContent = "Edit member";
                    deleteDropdown.textContent = "Delete tree";

                    dropdownEl.appendChild(renameDropdown);
                    dropdownEl.appendChild(editMembersDropdown);
                    dropdownEl.appendChild(deleteDropdown);

                    treeEditButton.appendChild(ellipsisIcon);
                    aEl.appendChild(treeEditButton);
                    liEl.appendChild(dropdownEl);
                    liEl.appendChild(aEl);

                    deleteDropdown.addEventListener('click', (e) => {
                        e.preventDefault;
                        console.log("you finna deletea atlwsl");
                        treesRef.doc(reqTreeDoc.id).update({
                            "deleted": true
                        }).then(() => {
                            location.reload();
                        })
                    });

                    renameDropdown.addEventListener('click' , (e) => {
                        e.preventDefault();
                        renameTreeForm["rename-tree_name"].value = reqTreeDoc.data().name;
                        renameTreeForm["rename-tree_id"].value = reqTreeDoc.id;
                    });

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
                })
                // ranThrough.push(treeId);
            }
        }


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