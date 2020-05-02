import { TreeDropdownItem, TreeDropdownHeader } from '../components/treeDropdownItem.js'

const treeMenuDropdownEl = document.querySelector("#treeMenu__options");

export function populate() {
    const dropdownHeader = TreeDropdownHeader("Families");
    treeMenuDropdownEl.appendChild(dropdownHeader);

    for (let treeDoc of window.memberTreeDocs) {
        let dropdownItem = TreeDropdownItem(treeDoc);
        treeMenuDropdownEl.appendChild(dropdownItem);
    }
}

export function clear() {
    treeMenuDropdownEl.innerHTML = '';
}