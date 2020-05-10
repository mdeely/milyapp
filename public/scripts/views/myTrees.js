let myTreesViewEl = document.querySelector(`[data-view="my-trees"]`);
let myTreesDebugMsg = myTreesViewEl.querySelector(`.debugMessage`);

export default function setup() {
    pageTitle.innerHTML = "My trees";
}

export const myTreesViewOnAuthChange = (user) => {
    if (user) {
        myTreesDebugMsg.textContent = "Authenticated";
        populateMyTreesList();
    } else {
        myTreesDebugMsg.textContent = "Not authenticated";
    }
}

const populateMyTreesList = () => {
    let button = document.createElement("button");
    button.setAttribute("id", "new-tree_button");
    button.textContent = "Create a tree";

    button.addEventListener('click', e => {
        e.preventDefault();
        doSomething();
        alert("TODO: make a new tree");
    })

    myTreesDebugMsg.innerHTML += `Your trees:`;

    if (LocalDocs.trees) {
        for (let treeDoc of LocalDocs.trees) {
            let anchor = `<a href="#/trees/${treeDoc.id}">${treeDoc.data().name}</a>`
    
            myTreesDebugMsg.innerHTML += anchor;
        }
    }

    myTreesViewEl.appendChild(button);
}