let treeViewEl = document.querySelector(`[data-view="tree"]`);
let treeDebugMsg = treeViewEl.querySelector(`.debugMessage`);

let Tree = {};

Tree.setup = function(treeId) {
    clear();
    Nav.showViewPreferencesButton(true);

    //// MILY ASH
    //// Fetch API for receiving a JSON response
    // fetch('http://example.com/movies.json')
    // .then(response => response.json())
    // .then(data => console.log(data));

    variablizeCurrentTreeDoc(treeId)
    .then((response) => {
        if (response) {
            if (auth.currentUser){
                if (LocalDocs.member) {
                    Tree.continueTreeSetup(treeId);
                } else {
                    membersRef.where('claimed_by', '==', auth.currentUser.uid).limit(1).get()
                    .then((queryResult) => {
                        if (queryResult.docs[0]) {
                            LocalDocs.member = queryResult.docs[0] ? queryResult.docs[0] : null;
                            Tree.continueTreeSetup(treeId);
                        }
                    })
                }
            } else {
                Tree.continueTreeSetup(treeId);
            }
        }
    })
}

Tree.continueTreeSetup = function(treeId) {
    LocalDocs.leaves = [];

    if ( (LocalDocs.member ? LocalDocs.member.data().trees.includes(treeId) : false) || LocalDocs.tree.data().public === true) {
        pageTitle.innerHTML = LocalDocs.tree ? LocalDocs.tree.data().name : "Tree not found!";
        treesRef.doc(LocalDocs.tree.id).collection('leaves').get()
        .then((response) => {
            for (doc of response.docs) {
                LocalDocs.leaves.push({
                    id: doc.id,
                    ...doc.data()
                });
            }
            window.currentTreeLeafCollectionRef = treesRef.doc(LocalDocs.tree.id).collection('leaves');
            
            TreeBranch.initiate();
    
            let tableEl = familyTreeListEl.querySelector("table");
            let tdEls = tableEl.querySelectorAll("tr td");
        })
    } else {
        Nav.showViewPreferencesButton();
        treeDebugMsg.innerHTML += `
                <h1 class="u-mar-lr_auto u-ta_center">
                    <i class="far fa-lock-alt u-d_block u-mar-b_2"></i>
                    Private tree
                </h2>
                <p class="u-mar-lr_auto u-ta_center">The tree your are trying to view is private and can only be viewed by members of that tree.</p>
                `;
    }
}

Tree.treeViewOnAuthChange = function(user) {
    if (user) {
        treeDebugMsg.innerHTML = "";
    } else {
        // treeDebugMsg.innerHTML += `<h1 class="u-mar-lr_auto u-ta_center">Sign up/in to join this tree</h2>`;
        // console.log("tree auth change!");
        // console.log("not authenticated!");
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
    let topMemberDoc = LocalDocs.leaves.find(item => item.topMember === true);
    let siblings = topMemberDoc.siblings ? topMemberDoc.siblings : null;

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

    let children = Object.keys(memberDoc.children).length > 0 ? Object.keys(memberDoc.children) : null;
    let partners = Object.keys(memberDoc.partners).length > 0 ?  Object.keys(memberDoc.partners) : null;
    
    let togetherPartnerTypes = ["Married", "Engaged", "Dating"];
    let apartPartnerTypes = ["Separated", "Divorced", "Widowed"];

    if (partners) {
        for (let partnerId of partners) {
            let topPartnerMemberDoc = LocalDocs.leaves.find(leafDoc => leafDoc.id === partnerId);
            let partnerType = topPartnerMemberDoc.partners[memberDoc.id] ? topPartnerMemberDoc.partners[memberDoc.id] : null;
            
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
    let data = doc;
    let memberDoc;

    let figure = createElementWithClass("figure", "leaf");
    let image = createElementWithClass("div", "leaf__image");
    let figCaption = createElementWithClass("figcaption", "leaf_caption");
    // let addRelationshipButton = createElementWithClass("button", "u-p_absolute");
    // let icon = createElementWithClass("i", "far fa-plus");

    let leafName = data.name.firstName ? data.name.firstName : "No name";
    let leafProfilePhoto = "https://firebasestorage.googleapis.com/v0/b/mily-4c2a8.appspot.com/o/assets%2Fplaceholder%2Fprofile_placeholder.svg?alt=media&token=d3b939f1-d46b-4315-bcc6-3167d17a18ed";

    if (doc.deleted === true) {
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

    figure.setAttribute("data-id", doc.id);

    figCaption.textContent = leafName;

    // addRelationshipButton.appendChild(icon);

    figure.appendChild(figCaption);
    figure.appendChild(image);
    // figure.appendChild(addRelationshipButton);

    figure.addEventListener("click", (e) => {
        e.preventDefault();

        let leafTarget = e.target;

        if (auth.currentUser) {
            Leaf.toggleActive(leafTarget);
            DetailsPanel.populate(doc, e.target);
        }
    });

    if (doc.claimed_by && doc.deleted !== true) {
        replaceNameAndImageWithMemberDoc(doc.id, doc.claimed_by);
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

            LocalDocs.members.push({
                id: reqMemberDoc.id,
                ...reqMemberDoc.data()
            });

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
