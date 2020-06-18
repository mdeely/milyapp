const treeMenuDropdownEl = document.querySelector("#treeMenu__options");
const treeMenuCurrentTreeEl = document.querySelector("#treeMenu__currentTree");

function populate() {
    const dropdownHeader = TreeDropdownHeader("Families");
    treeMenuDropdownEl.appendChild(dropdownHeader);

    for (let treeDoc of window.memberTreeDocs) {
        let dropdownItem = TreeDropdownItem(treeDoc);
        treeMenuDropdownEl.appendChild(dropdownItem);
    }
}

const TreeDropdownItem = (treeDoc) => {
    let anchor = document.createElement("a");
    let editButton = document.createElement("button");
    let className = '';
    let isAdminOfTree = treeDoc.data().admins.includes(memberDoc.id) ? true : false;

    if (treeDoc.id === LocalDocs.tree.id) {
        className = "active";
    }

    anchor.setAttribute("href", `#/trees/${treeDoc.id}`);
    anchor.setAttribute("data-id", treeDoc.id);
    anchor.setAttribute("class", `dropdown__item ${className}`);
    anchor.textContent += treeDoc.data().name;

    editButton.innerHTML = `<i class="fas fa-pencil-alt"></i>`;
    editButton.setAttribute("class", "iconButton white u-mar-l_auto");
    editButton.setAttribute('data-modal-trigger', 'edit-tree_modal');

    editButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (isAdminOfTree) {
            editTreeForm.querySelector(".edit-tree_save").classList.remove("u-d_none");
            editTreeForm.querySelector(".edit-tree_delete").classList.remove("u-d_none");
            editTreeForm["edit-tree_name"].removeAttribute("disabled");
        } else {
            editTreeForm.querySelector(".edit-tree_save").classList.add("u-d_none")
            editTreeForm.querySelector(".edit-tree_delete").classList.add("u-d_none");
            editTreeForm["edit-tree_name"].setAttribute("disabled", true);
        }

        let reqTreeId = e.target.closest("[data-id]").getAttribute('data-id');
        let reqTreeDoc = window.authMemberTrees.find(doc => doc.id === reqTreeId);

        editTreeForm["edit-tree_name"].value = reqTreeDoc.data().name;
        editTreeForm["edit-tree_id"].value = reqTreeDoc.id;

        console.log(`TODO: If an admin, allow changing of permissions within the tree settings`);

        permissionsContainer.innerHTML = '';

        for (leafId of reqTreeDoc.data().viewers) {
            makePermissionDetailItem("viewer", leafId);
        }

        for (leafId of reqTreeDoc.data().contributors) {
            makePermissionDetailItem("contributor", leafId);
        }

        for (leafId of reqTreeDoc.data().admins) {
            makePermissionDetailItem("admins", leafId);
        }

        function makePermissionDetailItem(permType, leafId) {
            permType = permType.replace('s', '');
            console.log("TODO: Load actual data when showing IMMEDIATE FAMILY section");
            console.log("TODO: If not claimed_by, do not show that leaf");
            let el = `<div class="detailsPanel__item u-mar-b_4 u-d_flex u-align-items_center">
                        <div class="detailsPanel__img u-mar-r_2"></div>
                            <div class="detailsPanel__text u-mar-r_2">
                                <div class="detailsPanel__name u-mar-b_point5 u-bold">${leafId}</div> 
                                <div class="detailsPanel__realtiveType">${permType}</div> 
                            </div>
                            </div>`
            permissionsContainer.innerHTML += el;
        }

        showModal(e);
    })

    if (treeDoc.id === window.primaryTreeId) {
        anchor.innerHTML += " (Primary) "
    }

    // anchor.addEventListener('click', (e) => {
    //     // e.preventDefault();

    //     // let reqTreeId = e.target.getAttribute("data-id");
    //     // getAndSetCurrenTreeVars(reqTreeId);
    // })

    anchor.appendChild(editButton);

    return anchor;
}

const TreeDropdownHeader = (label) => {
    let container = document.createElement("div");
    let button = document.createElement("button");

    button.innerHTML = `<i class="fa fa-plus"></i>`;
    button.setAttribute("class", "iconButton white u-mar-l_auto");
    button.setAttribute('data-modal-trigger', 'create-tree_modal');

    button.addEventListener('click', (e) => {
        e.preventDefault();
        showModal(e);   
    })

    container.setAttribute("class", "dropdown__item dropdown__label");
    container.textContent = label;
    container.appendChild(button);

    return container;
}