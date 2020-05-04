import * as TreeLeaf from '../components/treeLeaf.js'

const familyTreeEl = document.querySelector("#familyTree");

export function initiate() {
    let topMemberDoc = window.currentLeafDocs.find(leafDoc => leafDoc.data().topMember === true);
    let siblings = topMemberDoc.data().siblings ? topMemberDoc.data().siblings : null;

    let topMemberBranchEl = renderBranchByDoc(topMemberDoc);

    if (siblings && siblings.length > 0) {
        for (let siblingId of siblings) {
            let siblingDoc = window.currentLeafDocs.find(leafDoc => leafDoc.id === siblingId);
            let siblingBranchEl = renderBranchByDoc(siblingDoc);
            familyTreeEl.appendChild(siblingBranchEl);
        }
    }

    familyTreeEl.appendChild(topMemberBranchEl);
}

export function clear() {
    familyTreeEl.innerHTML = '';
}

const renderBranchByDoc = (memberDoc) => {
    let branchEl = createGroupEl("branch");
    let spousesBranchEl = createGroupEl("spouses");

    let children = memberDoc.data().children ? memberDoc.data().children : null;
    let spouses = memberDoc.data().spouses ? memberDoc.data().spouses : null;
    
    if (spouses &&  Object.keys(spouses).length > 0) {
        for (let spouseId of Object.keys(spouses)) {
            let topSpouseMemberDoc = window.currentLeafDocs.find(leafDoc => leafDoc.id === spouseId);
            spousesBranchEl.insertAdjacentHTML("beforeEnd", TreeLeaf.create(topSpouseMemberDoc));
        }
    }

    spousesBranchEl.insertAdjacentHTML("afterBegin", TreeLeaf.create(memberDoc));
    branchEl.appendChild(spousesBranchEl);

    if (children && children.length > 0) {
        let descendantBranchEL = createGroupEl("descendants");

        for (let childId of children) {
            let childMemberDoc = window.currentLeafDocs.find(leafDoc => leafDoc.id === childId);
            let childBranchEl = renderBranchByDoc(childMemberDoc);

            descendantBranchEL.appendChild(childBranchEl);
        }

        branchEl.appendChild(descendantBranchEL);
    }



    return branchEl;
}

const renderLeavesByDoc = (doc) => {
    console.log(`rendering`)
}

const createGroupEl = (className = null) => {
    let newGroupEl = document.createElement("div");
    newGroupEl.setAttribute("class", `${className}`);

    return newGroupEl;
}