let myTreesViewEl = document.querySelector(`[data-view="my-trees"]`);
let myTreesDebugMsg = myTreesViewEl.querySelector(`.debugMessage`);

let MyTrees = {};

const myTreesSetup = () => {
    pageTitle.innerHTML = "My trees";
}

const myTreesViewOnAuthChange = (user) => {
    if (user) {
        // myTreesDebugMsg.textContent = "Authenticated";
        populateMyTreesList();
    } else {
        myTreesDebugMsg.textContent = "Not authenticated";
    }
}

const populateMyTreesList = () => {
    let button = document.createElement("button");
    button.setAttribute("class", "new-tree_button u-mar-lr_auto");
    button.setAttribute("data-modal-trigger", "create-tree_modal");

    button.textContent = "Create a tree";

    myTreesDebugMsg.innerHTML += `<h2 class="u-ta_center">Your trees:</h2>`;

    if (LocalDocs.member.data().trees) {
        for (let treeId of LocalDocs.member.data().trees) {
            treesRef.doc(treeId).get()
            .then((reqTreeDoc) => {
                let anchor = `<a href="#/trees/${reqTreeDoc.id}">${reqTreeDoc.data().name}</a>`
                myTreesDebugMsg.innerHTML += anchor;
            })
        }
    }

    myTreesViewEl.appendChild(button);
    initiateModals();
}