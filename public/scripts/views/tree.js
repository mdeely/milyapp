let treeViewEl = document.querySelector(`[data-view="tree"]`);
let treeDebugMsg = treeViewEl.querySelector(`.debugMessage`);

let Tree = {};

Tree.setup = function(treeId) {
    clear();
    Nav.showViewPreferencesButton(true);
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

    if (siblings && Object.keys(siblings).length > 0) {
        for (let siblingId of Object.keys(siblings)) {
            let siblingDoc = LocalDocs.leaves.find(leafDoc => leafDoc.id === siblingId);
            let siblingBranchEl = TreeBranch.renderBranchByDoc(siblingDoc);
            branchContainer.appendChild(siblingBranchEl);
        }
    }
    

    branchContainer.appendChild(topMemberBranchEl);
    connectLines();
    // panzoom(branchContainer, {
    //     minZoom: .25, // prevent zooming out
    //     maxZoom: 2, // prevent zooming beyond acceptable levels
    //     // bounds: true, // prevent panning outside of container
    //     // boundsPadding: .5, // prevent panning outside of container
    //     // zoomDoubleClickSpeed: 1
    //     zoomSpeed: 0.085 // 6.5% per mouse wheel event
    // });
}

TreeBranch.clear = function() {
    branchContainer.innerHTML = '';
}

 TreeBranch.renderBranchByDoc = function (memberDoc) {
    let branchEl = createGroupEl("branch");
    let partnerBranchEl = createGroupEl("partners");
    let partnerTogetherEl = createGroupEl("together");
    let partnerApartEl = createGroupEl("apart");

    let children = Object.keys(memberDoc.data().children).length > 0 ? Object.keys(memberDoc.data().children) : null;
    let partners = Object.keys(memberDoc.data().partners).length > 0 ?  Object.keys(memberDoc.data().partners) : null;
    
    let togetherPartnerTypes = ["Married", "Engaged", "Dating"];
    let apartPartnerTypes = ["Separated", "Divorced", "Widowed"];

    if (partners) {
        for (let partnerId of partners) {
            let topPartnerMemberDoc = LocalDocs.leaves.find(leafDoc => leafDoc.id === partnerId);
            let partnerType = topPartnerMemberDoc.data().partners[memberDoc.id] ? topPartnerMemberDoc.data().partners[memberDoc.id] : null;
            
            if (togetherPartnerTypes.includes(partnerType)|| !partnerType) {
                partnerTogetherEl.appendChild(TreeLeaf.create(topPartnerMemberDoc));
            } else if (apartPartnerTypes.includes(partnerType)) {
                partnerApartEl.appendChild(TreeLeaf.create(topPartnerMemberDoc));
            }
        }
    }

    partnerBranchEl.appendChild(partnerTogetherEl);
    partnerBranchEl.appendChild(TreeLeaf.create(memberDoc));
    partnerBranchEl.appendChild(partnerApartEl);

    branchEl.appendChild(partnerBranchEl);

    if (children) {
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

    if (doc.data().deleted === true) {
        image.style.backgroundImage = '';
        image.style.backgroundColor = "white";
        leafName = "(deleted)";
    } else if (data.profile_photo) {
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

        if (auth.currentUser) {
            DetailsPanel.show(doc.id);
            Leaf.setActive(leafTarget);
            DetailsPanel.populate(doc, e.target);
        }
    });

    if (doc.data().claimed_by && doc.data().deleted !== true) {
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
