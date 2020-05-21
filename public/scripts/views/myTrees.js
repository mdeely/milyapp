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
                    let anchor = `<li class="u-w_full u-mar-r_2"><a class="myTree__item u-pad_3 u-w_full u-d_block" href="#/trees/${reqTreeDoc.id}">${reqTreeDoc.data().name}</a></li>`;
                    let existingLeaf = myTreeListEl.querySelector(`[href*="${reqTreeDoc.id}"]`);
                    if (!existingLeaf) {
                        myTreeListEl.innerHTML += anchor;
                    }
                })
                ranThrough.push(treeId);
            }
        }
    } else {
        let el = `<p class="u-mar-lr_auto">Get started by creating your first tree!</p>`;
        myTreeListEl.innerHTML += el;
    }

    initiateModals();
}