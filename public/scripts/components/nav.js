let Nav = {};

Nav.update = function(user) {
    if (user) {
        for (let item of hideWhenAuthenticated) {
            item.style.display = "none";
        }
        for (let item of showWhenAuthenticated) {
            item.style.display = "";
        }
        navLogo.setAttribute("href", "#/my-trees");

        if (LocalDocs.member && LocalDocs.member.data().profile_photo) {
            let profileFileReference = storage.ref(`${LocalDocs.member.data().profile_photo}`);
            profileFileReference.getDownloadURL().then(function(url) {
                accountMenuButton.style.backgroundImage = `url(${url})`;
            })
        } else {
            accountMenuButton.style.backgroundImage = `url(${placeholderImageUrl})`;
        }

        // getNotificationsByAuthMember();
        getNotificationsByEmail();
    } else {
        for (let item of hideWhenAuthenticated) {
            item.style.display = "";
        }
        for (let item of showWhenAuthenticated) {
            item.style.display = "none";
        }
        navLogo.setAttribute("href", "/");
    }
}

const getNotificationsByAuthMember = () => {
    let notificationUpdateQuery = notificationsRef.where("from_member", "==", LocalDocs.member.id).where("status", "in", ["declined", "accepted"]);
    notificationUpdateQuery.get()
    .then(queryResult => {
        let docs = queryResult.docs;

        if (docs.length > 0) {
            for (doc of docs) {
                let notificationEl = document.createElement("div");
                let dismissNotificationButton = document.createElement('button');
                let icon = `<i class="fa fa-times"></i>`
                let message;

                dismissNotificationButton.innerHTML = icon;
                dismissNotificationButton.setAttribute("class", "iconButton white");

                notificationEl.setAttribute("data-notification-id", doc.id);
                notificationEl.setAttribute("class","dropdown__item");

                if (doc.data().status === "accepted") {
                    message = `${doc.data().for_email} accepted your request`;
                } else {
                    message = `${doc.data().for_email} declined your request`;
                }

                dismissNotificationButton.addEventListener('click', (e) => {
                    e.preventDefault();

                    notificationsRef.doc(doc.id).delete()
                    .then(() => {
                        console.log("notificaiton was dismissed and deleted");
                        location.reload();
                    })
                    .catch(err => {
                        console.log(err.message);
                    })
                })

                notificationEl.textContent += message;                

                notificationEl.appendChild(dismissNotificationButton);
                notificationMenu.appendChild(notificationEl);
                notificationIndicator.classList.remove("u-d_none");
            }
        }
    })
    console.log("TODO: when a user dismisses a declined or accepted invitation, delete notification record");
}

const getNotificationsByEmail = async (email) => {
    if (LocalDocs.member) {
        let notificationQuery = notificationsRef.where("status", "==", "pending").where("for_email", "==", LocalDocs.member.data().email);

        notificationQuery.get().then(queryResult  => {
            let docs = queryResult.docs;
            if (docs.length > 0) {
                notificationIndicator.classList.remove("u-d_none");
    
                for (doc of docs) {
                    let notificationEl = document.createElement("div");
                    let acceptNotification = document.createElement("button");
                    let declinetNotification = document.createElement("button");
    
                    acceptNotification.setAttribute("id", "accept-notification");
                    declinetNotification.setAttribute("id", "decline-notification");
                    declinetNotification.setAttribute("class", "danger");
    
                    acceptNotification.textContent = "Accept";
                    declinetNotification.textContent = "Decline";
    
                    acceptNotification.addEventListener('click', (e) => {
                        e.preventDefault();
                        handleNotification("accept", doc);
                    });
    
                    declinetNotification.addEventListener('click', (e) => {
                        e.preventDefault();
                        handleNotification("decline", doc);
                    });
    
                    notificationEl.setAttribute("data-notification-id", doc.id);
                    notificationEl.setAttribute("class","dropdown__item");
    
                    membersRef.doc(doc.data().from_member).get()
                    .then(memberDoc => {
                        if (memberDoc.exists) {
                            treesRef.doc(doc.data().for_tree).get()
                            .then((treeDoc) => {
                                treesRef.doc(doc.data().for_tree).collection("leaves").doc(doc.data().for_leaf).get()
                                .then((leafDoc) => {
                                    let memberName = memberDoc.data().name && memberDoc.data().name.firstName ? memberDoc.data().name.firstName : "a Mily member";
                                    let leafName = leafDoc.data().name && leafDoc.data().name.firstName ? leafDoc.data().name.firstName : "a leaf";
                                    let treeName = treeDoc.data().name ? treeDoc.data().name : "a tree";
            
                                    notificationEl.textContent = `You have an invitation from ${memberName} to take over "${leafName}" in family "${treeName}" as a ${doc.data().permission_type}.`;
            
                                    notificationEl.appendChild(acceptNotification);
                                    notificationEl.appendChild(declinetNotification);
                                    notificationMenu.appendChild(notificationEl);
                                })
                            });
                        } else {
                            console.log("An invitation exists, but that member is no longer a part of Mily.");
                        }
                    })
                }            
            } else {
                // No notifications!
            }
        })
    }
}

const handleNotification = (method, doc) => {
    let leafToTakeOver = doc.data().for_leaf;
    let treeToJoin = doc.data().for_tree;

    let reqTreeRef = treesRef.doc(treeToJoin);
    let reqTreeAndLeafRef = reqTreeRef.collection('leaves').doc(leafToTakeOver);

    if (method === "accept") {
        membersRef.doc(LocalDocs.member.id).get()
        .then(reqMemberDoc => {
            let permissionType = doc.data().permission_type + "s";

            reqTreeRef.update({
                // Place member into the correct permission.
                [permissionType] : firebase.firestore.FieldValue.arrayUnion(LocalDocs.member.id)
            })
            .then(() => console.log("permission added to tree successfully!"))
            .catch(() => console.log("error while adding permission to tree"));

            reqTreeAndLeafRef.update({
                // Update leaf to be claimed_by authmemeberdoc.id
                // Remove "invitation"
                "claimed_by" : LocalDocs.member.id,
                "invitation" : null
            })
            .then(() => console.log("leaf updated  successfully!"))
            .catch(() => console.log("error while updating leaf"));

            if (!reqMemberDoc.data().primary_tree) {
                // Make this the member's primary tree
                membersRef.doc(LocalDocs.member.id).update({
                    "primary_tree" : treeToJoin
                })
                .then(() => console.log("member primary tree updated  successfully!"))
                .catch(() => console.log("error while updating member primary tree"));
            }

            membersRef.doc(LocalDocs.member.id).update({
                // Add new tree to the member's Trees
                "trees" : firebase.firestore.FieldValue.arrayUnion(treeToJoin)
            })
            .then(() => console.log("member trees updated successfully!"))
            .catch(() => console.log("error while updating member trees"));

            notificationsRef.doc(doc.id).update({
                "status" : "accepted"
            })
            .then(() => console.log("notification updated  successfully!"))
            .catch(() => console.log("error while updating notification"));
        })
    } else if (method === "decline") {
        // set notification status to "declined"
        notificationsRef.doc(doc.id).update({
            "status" : "declined"
        })
        .then(() => console.log("notification declined successfully!"))
        .catch(() => console.log("error while declining notification"));

        // remove invitation from leaf
        reqTreeAndLeafRef.update({
            "invitation" : null
        })
        .then(() => console.log("leaf updated  successfully!"))
        .catch(() => console.log("error while updating leaf"));
    }
}