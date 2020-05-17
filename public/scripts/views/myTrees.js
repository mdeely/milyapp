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
        myTreesDebugMsg.textContent = "Not authenticated";
    }
}

const populateMyTreesList = async () => {
    myTreesDebugMsg.innerHTML = '';
    myTreeListEl.textContent = '';

    let button = document.createElement("button");
    button.setAttribute("class", "new-tree_button u-mar-l_auto");
    button.setAttribute("data-modal-trigger", "create-tree_modal");

    button.textContent = "Create a tree";

    myTreesDebugMsg.innerHTML += `<h2 class="u-ta_center">Your trees:</h2>`;
    myTreesDebugMsg.appendChild(button);

    if (LocalDocs.member.data().trees) {
        let ranThrough = [];

        for await (let treeId of LocalDocs.member.data().trees) {
            if (!ranThrough.includes(treeId)) {
                treesRef.doc(treeId).get()
                .then((reqTreeDoc) => {
                    let anchor = `<li><a class="button secondary myTree__item u-d_block" href="#/trees/${reqTreeDoc.id}">${reqTreeDoc.data().name}</a></li>`;
                    myTreeListEl.innerHTML += anchor;
                })
                ranThrough.push(treeId);
            }
        }
    }

    initiateModals();
}