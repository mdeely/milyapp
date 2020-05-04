import { TreeDropdownItem, TreeDropdownHeader } from '../components/treeDropdownItem.js'

const treeMenuDropdownEl = document.querySelector("#treeMenu__options");
const treeMenuCurrentTreeEl = document.querySelector("#treeMenu__currentTree");

export function populate() {
    const dropdownHeader = TreeDropdownHeader("Families");
    treeMenuDropdownEl.appendChild(dropdownHeader);

    for (let treeDoc of window.memberTreeDocs) {
        let dropdownItem = TreeDropdownItem(treeDoc);
        treeMenuDropdownEl.appendChild(dropdownItem);
    }
}

export const populateCurrentTreeDisplay = () => {
    treeMenuCurrentTreeEl.textContent = currentTreeDoc.data().name;
    // let caretIcon = `<i class="fa fa-caret-down u-mar-l_2 u-pe_none u-o_75"></i>`;
    // treeMenuCurrentTreeEl.innerHTML += caretIcon;
}