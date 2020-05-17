let treeViewEl = document.querySelector(`[data-view="tree"]`);
let treeDebugMsg = treeViewEl.querySelector(`.debugMessage`);

let Tree = {};

Tree.setup = function(treeId) {
    clear();
    variablizeCurrentTreeDoc(treeId)
    .then((response) => {
        if (response) {
            pageTitle.innerHTML = LocalDocs.tree ? LocalDocs.tree.data().name : "Tree not found!";
            treesRef.doc(LocalDocs.tree.id).collection('leaves').get()
            .then((response) => {

                LocalDocs.leaves = response.docs;
                window.currentTreeLeafCollectionRef = treesRef.doc(LocalDocs.tree.id).collection('leaves');

                TreeBranch.initiate();
                console.log("TODO: change the treeBranch abilities based on authentication and permission status");
            })
        }
    })
}

Tree.treeViewOnAuthChange = function(user) {
    if (user) {
        // huh?
    } else {
        treeDebugMsg.innerHTML += `<h1 class="u-mar-lr_auto u-ta_center">Sign up/in to join this tree</h2>`;
        console.log("tree auth change!");
        console.log("not authenticated!");
    }
}

const clear = () => {
    TreeBranch.clear();
}

const variablizeCurrentTreeDoc = (treeId) => new Promise(
    function(resolve, reject) {
        treesRef.doc(treeId).get()
        .then((reqTreeDoc) => {
            LocalDocs.tree = reqTreeDoc.exists ? reqTreeDoc : null;
            resolve(true);
        })
        .catch(err => {
            reject(err.message);
        })
    }
)

const TreeBranch = {};

TreeBranch.initiate =  function() {
    let topMemberDoc = LocalDocs.leaves.find(leafDoc => leafDoc.data().topMember === true);
    let siblings = topMemberDoc.data().siblings ? topMemberDoc.data().siblings : null;

    let topMemberBranchEl = TreeBranch.renderBranchByDoc(topMemberDoc);

    if (siblings && siblings.length > 0) {
        for (let siblingId of siblings) {
            let siblingDoc = LocalDocs.leaves.find(leafDoc => leafDoc.id === siblingId);
            let siblingBranchEl = TreeBranch.renderBranchByDoc(siblingDoc);
            familyTreeEl.appendChild(siblingBranchEl);
        }
    }

    familyTreeEl.appendChild(topMemberBranchEl);
    connectLines();
}

TreeBranch.clear = function() {
    familyTreeEl.innerHTML = '';
}

 TreeBranch.renderBranchByDoc = function (memberDoc) {
    let branchEl = createGroupEl("branch");
    let spousesBranchEl = createGroupEl("spouses");

    let children = memberDoc.data().children ? memberDoc.data().children : null;
    let spouses = memberDoc.data().spouses ? memberDoc.data().spouses : null;
    
    if (spouses &&  Object.keys(spouses).length > 0) {
        for (let spouseId of Object.keys(spouses)) {
            let topSpouseMemberDoc = LocalDocs.leaves.find(leafDoc => leafDoc.id === spouseId);
            spousesBranchEl.appendChild(TreeLeaf.create(topSpouseMemberDoc));
        }
    }

    spousesBranchEl.appendChild(TreeLeaf.create(memberDoc));
    branchEl.appendChild(spousesBranchEl);

    if (children && children.length > 0) {
        let descendantBranchEL = createGroupEl("descendants");

        for (let childId of children) {
            let childMemberDoc = LocalDocs.leaves.find(leafDoc => leafDoc.id === childId);
            let childBranchEl = TreeBranch.renderBranchByDoc(childMemberDoc);

            descendantBranchEL.appendChild(childBranchEl);
        }

        branchEl.appendChild(descendantBranchEL);
    }

    return branchEl;
}

const createGroupEl = (className = null) => {
    let newGroupEl = document.createElement("div");
    newGroupEl.setAttribute("class", `${className}`);

    return newGroupEl;
}

const TreeLeaf = {};

TreeLeaf.create = function (doc) {
    let data = doc.data();
    let memberDoc;

    let figure = document.createElement("figure");
    let image = document.createElement("div");
    let figCaption = document.createElement("figcaption");

    let leafName = data.name.firstName ? data.name.firstName : "No name";
    let leafProfilePhoto = "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder.svg?alt=media&token=d3b939f1-d46b-4315-bcc6-3167d17a18ed";

    if (data.profile_photo) {
        let profileFileReference = storage.ref(`${data.profile_photo}`);
        profileFileReference.getDownloadURL().then(function(url) {
            image.style.backgroundImage = `url(${url})`;
        })
    } else {
        image.style.backgroundImage = `url(${leafProfilePhoto})`;
    }

    figure.setAttribute("class", "leaf");
    figure.setAttribute("data-id", doc.id);

    image.setAttribute("class", "leaf__image");

    figCaption.setAttribute("class", "leaf_caption");
    figCaption.textContent = leafName;

    figure.appendChild(figCaption);
    figure.appendChild(image);

    figure.addEventListener("click", (e) => {
        e.preventDefault();

        let leafTarget = e.target;

        DetailsPanel.show(doc.id);
        Leaf.setActive(leafTarget);
        DetailsPanel.populate(doc, e.target);
    });

    if (doc.data().claimed_by) {
        replaceNameAndImageWithMemberDoc(doc.id, doc.data().claimed_by);
    }

    return figure;
    // generate leaf
    // generate leaf list items
    // claimed members -> promise to swap that information.
    // return leaf El;
}

const replaceNameAndImageWithMemberDoc = (leafDocId, claimedById) => new Promise(

    function(resolve, reject) {
        membersRef.doc(claimedById).get()
        .then((reqMemberDoc) => {
            let targetLeaf = document.querySelector(`[data-id="${leafDocId}"]`);

            LocalDocs.members.push(reqMemberDoc);
            memberDocData = reqMemberDoc.data();
            memberName = memberDocData.name.firstName ? memberDocData.name.firstName : "No name (member)";
            memberProfilePhoto = "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder.svg?alt=media&token=d3b939f1-d46b-4315-bcc6-3167d17a18ed";

            if (memberDocData.profile_photo) {
                let profileFileReference = storage.ref(`${memberDocData.profile_photo}`);
                profileFileReference.getDownloadURL().then(function(url) {
                    targetLeaf.querySelector(".leaf__image").style.backgroundImage = `url(${url})`;
                })
            } else {
                targetLeaf.querySelector(".leaf__image").style.backgroundImage = `url(${memberProfilePhoto})`;
            }

            targetLeaf.querySelector(".leaf_caption").textContent = memberName;
            targetLeaf.setAttribute("data-member-id", reqMemberDoc.id);
        })
    }
)
