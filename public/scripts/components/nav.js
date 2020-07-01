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

        if (LocalDocs.member && LocalDocs.member.profile_photo) {
            let profileFileReference = storage.ref(`${LocalDocs.member.profile_photo}`);
            profileFileReference.getDownloadURL().then(function(url) {
                let targetProfileEl = document.querySelector(".profile__image");
                let profileImageStyle = accountMenuButton.style.backgroundImage;

                targetProfileEl.style.backgroundImage = profileImageStyle;
                accountMenuButton.style.backgroundImage = `url(${url})`;
                LocalDocs.member["profile_url"] = url;
            })
        } else {
            accountMenuButton.style.backgroundImage = `url(${placeholderImageUrl})`;
        }

        // getNotificationsByAuthMember();
        Nav.getNotificationsByEmail();
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

Nav.showViewPreferencesButton = function(show) {
    if (show) {
        showToolbarButton.classList.remove("u-d_none");
        toolbarEl.style.display = "";
    } else {
        showToolbarButton.classList.add("u-d_none");
        toolbarEl.style.display = "none";
    }
}

// Nav.getNotificationsByAuthMember = function() {
//     let notificationUpdateQuery = notificationsRef.where("from_member", "==", LocalDocs.member.id).where("status", "in", ["declined", "accepted"]);
//     notificationUpdateQuery.get()
//     .then(queryResult => {
//         let docs = queryResult.docs;

//         if (docs.length > 0) {
//             for (doc of docs) {
//                 console.log("There is a notification");
//                 let notificationEl = createElementWithClass("div", "dropdown__item");
//                 let dismissNotificationButton = createElementWithClass('button', "iconButton white");
//                 let icon = `<i class="fa fa-times"></i>`
//                 let message;

//                 dismissNotificationButton.innerHTML = icon;

//                 notificationEl.setAttribute("data-notification-id", doc.id);

//                 if (doc.data().status === "accepted") {
//                     message = `${doc.data().for_email} accepted your request`;
//                 } else {
//                     message = `${doc.data().for_email} declined your request`;
//                 }

//                 dismissNotificationButton.addEventListener('click', (e) => {
//                     e.preventDefault();

//                     notificationsRef.doc(doc.id).delete()
//                     .then(() => {
//                         console.log("notificaiton was dismissed and deleted");
//                         location.reload();
//                     })
//                     .catch(err => {
//                         console.log(err.message);
//                     })
//                 })

//                 notificationEl.textContent += message;                

//                 notificationEl.appendChild(dismissNotificationButton);
//                 notificationMenu.appendChild(notificationEl);
//                 notificationIndicator.classList.remove("u-visibility_hidden");
//             }
//         } else {
//             notificationMenu.classList.add("u-visibility_hidden");
//         }
//     })
//     console.log("TODO: when a user dismisses a declined or accepted invitation, delete notification record");
// }

Nav.getNotificationsByEmail = async function(email) {
    if (LocalDocs.member) {
        let notificationQuery = notificationsRef.where("status", "==", "pending").where("for_email", "==", auth.currentUser.email);
        
        notificationQuery.get().then(queryResult  => {
            let notificationDocs = queryResult.docs;
            if (notificationDocs.length > 0) {
                notificationIndicator.classList.remove("u-visibility_hidden");
    
                for (notificationDoc of notificationDocs) {
                    // LocalDocs.notifications = {
                    //     id : doc.id,
                    //     ...doc.data()
                    // }
                    let existingNotificationEl = notificationMenu.querySelector(`[data-notification-id="${notificationDoc.id}"]`);
                    if (!existingNotificationEl) {
                        let notificationEl = createElementWithClass("div", "dropdown__item u-font-size_13");
                        let acceptNotification = createElementWithClass("button", "u-mar-r_1");
                        let declinetNotification = createElementWithClass("button", "danger");
                        let buttonGroup = createElementWithClass("div", "u-d_flex u-mar-l_3 u-mar-t_1")
        
                        acceptNotification.setAttribute("id", "accept-notification");
                        declinetNotification.setAttribute("id", "decline-notification");
                        notificationEl.setAttribute("data-notification-id", notificationDoc.id);
                        notificationEl.setAttribute("style", "max-width: 348px");

                        acceptNotification.textContent = "Accept";
                        declinetNotification.textContent = "Decline";
    
                        acceptNotification.addEventListener('click', (e) => {
                            e.preventDefault();
                            handleNotification("accept", notificationDoc);
                        });
        
                        declinetNotification.addEventListener('click', (e) => {
                            e.preventDefault();
                            handleNotification("decline", notificationDoc);
                        });
                                
                        membersRef.doc(notificationDoc.data().from_member).get()
                        .then(memberDoc => {
                            if (memberDoc.exists) {
                                treesRef.doc(notificationDoc.data().for_tree).get()
                                .then((treeDoc) => {
                                    let memberName = memberDoc.data().name && memberDoc.data().name.firstName ? memberDoc.data().name.firstName : "Someone";
                                    let treeName = treeDoc.data().name ? treeDoc.data().name : "a tree";
                                    let leafName;
                                    let notificationMessage;
    
                                    if (notificationDoc.data().type === "leaf") {
                                        treesRef.doc(notificationDoc.data().for_tree).collection("leaves").doc(notificationDoc.data().for_leaf).get()
                                        .then((leafDoc) => {
                                            leafName = leafDoc.data().name && leafDoc.data().name.firstName ? leafDoc.data().name.firstName : "a leaf";
                                            notificationMessage =`${memberName} invited you to the ${treeName} tree.`;
                                            appendToNotifications(acceptNotification, declinetNotification, notificationMessage);
                                        })
                                    } else if (notificationDoc.data().type === "tree") {
                                        notificationMessage =`${memberName} Invited you to the ${treeName} tree.`;
                                        appendToNotifications(acceptNotification, declinetNotification, notificationMessage);
                                    }   
                                    
                                    function appendToNotifications(acceptBtn, declineButton, message) {
                                        notificationEl.insertAdjacentText('afterBegin', message);
    
                                        buttonGroup.appendChild(acceptBtn);
                                        buttonGroup.appendChild(declineButton);
                                        notificationEl.appendChild(buttonGroup);
                                        notificationMenu.appendChild(notificationEl);
                                    } 
                                });
                            } else {
                                console.log("An invitation exists, but that member is no longer a part of Mily.");
                            }
                        })
                    }
                }            
            } else {
                notificationMenu.classList.add("u-visibility_hidden");
            }
        })
    }
}

const handleNotification = (method, doc) => {
    let leafToTakeOver = doc.data().for_leaf;
    let treeToJoin = doc.data().for_tree;

    let reqTreeRef = treesRef.doc(treeToJoin);
    let reqTreeAndLeafRef;

    if (doc.data().type === "leaf") {
        reqTreeAndLeafRef = reqTreeRef.collection('leaves').doc(leafToTakeOver);
    }

    if (method === "accept") {
        membersRef.doc(LocalDocs.member.id).get()
        .then(reqMemberDoc => {

            reqTreeRef.update({
                // Place member into the correct permission.
                [`permissions.${LocalDocs.member.id}`] : doc.data().permission_type
            })
            .then(() => console.log("permission added to tree successfully!"))
            .catch(() => console.log("error while adding permission to tree"));

            if (!reqMemberDoc.data().primary_tree) {
                membersRef.doc(LocalDocs.member.id).update({
                    "primary_tree" : treeToJoin
                })
                .then(() => console.log("member primary tree updated  successfully!"))
                .catch(() => console.log("error while updating member primary tree"));
            }

            membersRef.doc(LocalDocs.member.id).update({
                // Add new tree to the member's Trees
                [`trees.${treeToJoin}`] : null
            })
            .then(() => {
                notificationsRef.doc(doc.id).update({
                    "status" : "accepted"
                })
                .then(() => {
                    console.log("notification updated  successfully!");
                    location.reload();
                })
                .catch(() => console.log("error while updating notification"));
            })
            .catch(() => console.log("error while updating member trees"));

            if (doc.data().for_leaf) {
                reqTreeAndLeafRef.update({
                    "claimed_by" : LocalDocs.member.id,
                    "invitation" : null
                })
                .then(() => {
                    console.log("leaf updated");
                })
                .catch(() => console.log("error while updating leaf"));
            }
        })
    } else if (method === "decline") {
        // set notification status to "declined"
        notificationsRef.doc(doc.id).update({
            "status" : "declined"
        })
        .then(() => {
            // remove invitation from leaf
            if (doc.data().type === "leaf") {
                reqTreeAndLeafRef.update({
                    "invitation" : null
                })
                .then(() => console.log("leaf updated  successfully!"))
                .catch(() => console.log("error while updating leaf"));
            }
        });

    }
}