let profileViewEl = document.querySelector(`[data-view="profile"]`);
let profileDebugMsg = profileViewEl.querySelector(`.debugMessage`);
var storageRef = firebase.storage().ref()

function profileSetup() {
    pageTitle.innerHTML = "Profile";
}

const profileViewOnAuthChange = (user) => {
    profileViewEl.innerHTML = '';
    window.location.hash = "/profile";
    if (user) {
        editProfileEl();
    } else {
        profileViewEl.innerHTML = '';
    }
}

const editProfileEl = () => {
    let form = createElementWithClass("form", "card u-mar-lr_auto");
    let cardContent = document.createElement("div");
    let cardHeader = createElementWithClass("div", "card__header");
    let cardFooter = createElementWithClass("div", "card__footer");
    let button = createElementWithClass("button", "u-w_full", "Save");
    let header = createElementWithClass("h2", "u-mar-b_0", "Your profile");

    form.setAttribute("id", "set-profile_form");
    cardContent.setAttribute("class", "card__content");
    
    MemberBlueprint.loop({
        "functionCall" : handleProfileItems
    });

    function handleProfileItems(key, value, parentValue) {
        let inputValue = "";

        if (LocalDocs.member) {
            inputValue = LocalDocs.member.data()[value["dataPath"]];
            if (parentValue) {
                inputValue = LocalDocs.member.data()[parentValue["dataPath"]][value["dataPath"]];
            }
        } else {
            if (key === "Email") {
                inputValue = auth.currentUser.email;
            }
        }

        let imageUrl = null;
        if (value["dataPath"] === "profile_photo") {
            imageUrl = accountMenuButton.style.backgroundImage;
        }

        let isRequired = false;
        if (value["dataPath"] === "email") {
            isRequired = true;
        }

        let el = generateInputItem({
            "value" : inputValue,
            "name" : value["dataPath"],
            "label" : key,
            "backgroundImage" : imageUrl,
            "type" : value["dataType"] || "text",
            "required" : isRequired
        });

        cardContent.appendChild(el);
    }

    if (LocalDocs.member) {
        updateMember(button, form);
    } else {
        newMember(button, form);
        header.textContent = "Create your profile";
    }

    cardFooter.appendChild(button);

    cardHeader.appendChild(header)

    form.appendChild(cardHeader);
    form.appendChild(cardContent);
    form.appendChild(cardFooter);

    profileViewEl.appendChild(form);

    const setProfileForm = document.querySelector("#set-profile_form");
    
    setProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
    
        membersRef.doc(authMemberDoc.id).update({
            name : {
                firstName : setProfileForm["set-profile__firstName"]
            },
            birthday : setProfileForm["set-profile__birthday"]
        })
        .then(() => {
            console.log("member was updated");
        })
        .catch(err => {
            console.log(err.message);
        })
    })
}

const generateInputItem = (args) => {
    let inputGroupEl = createElementWithClass("div", "inputGroup");
    let labelEl = createElementWithClass("label");
    let inputEl = createElementWithClass("input");

    labelEl.textContent = args.label;
    labelEl.setAttribute("for", args.name);

    inputEl.setAttribute("name", args.name);
    inputEl.setAttribute("value", args.value);
    inputEl.setAttribute("type", args.type);

    if (args.backgroundImage !== null) {
        inputEl.style.backgroundImage = args.backgroundImage;
    }

    if (args.required === true) {
        inputEl.setAttribute("required", "true");
    }

    inputGroupEl.appendChild(labelEl);
    inputGroupEl.appendChild(inputEl);

    return inputGroupEl;
}

const updateMember = (button, form) => {
    button.addEventListener("click", (e) => {
        e.preventDefault();
        
        if (form["profile_photo"].files.length == 0) {
            goUpdateMember();
        } else {
            let profilePhotoFile = form["profile_photo"].files[0];
            let fileName = profilePhotoFile.name;
            let memberProfilePhotoRef = storageRef.child(`members/${LocalDocs.member.id}/${fileName}`);

            memberProfilePhotoRef.put(profilePhotoFile).then(function(snapshot) {
                membersRef.doc(LocalDocs.member.id).update({
                    "profile_photo" : snapshot.metadata.fullPath
                })
                .then((ref) => {
                    goUpdateMember(snapshot.metadata.fullPath);
                })
                .catch(err => {
                    console.log(err.message);
                })
            });
        }

        function goUpdateMember(photoFile = LocalDocs.member.data().profile_photo) { 
            membersRef.doc(LocalDocs.member.id).update({
                "name" : {
                    "firstName" : form["firstName"].value,
                    "lastName" : form["lastName"].value,
                    "middleName" : form["middleName"].value,
                    "surname" : form["surname"].value,
                    "nickname" : form["nickname"].value,
                },
                "address" : {
                    "address1" : form["address1"].value,
                    "address2" : form["address2"].value,
                    "city" : form["city"].value,
                    "zipcode" : form["zipcode"].value,
                    "country" : form["country"].value,
                },
                "birthday" : form["birthday"].value,
                "profile_photo" : photoFile,
                "occupation" : form["occupation"].value,
                "email" : form["email"].value,
            })
            .then(() => {
                console.log("Updated!");
                location.reload();
            })
            .catch(err => {
                console.log(err.message)
            })
        };

    });
}

const newMember = (button, form) => {
    button.addEventListener("click", (e) => {
        e.preventDefault();

        membersRef.add({
            "claimed_by" : auth.currentUser.uid,
            "created_by" : auth.currentUser.uid,
            "name" : {
                "firstName" : form["firstName"].value,
                "lastName" : form["lastName"].value,
                "middleName" : form["middleName"].value,
                "surname" : form["surname"].value,
                "nickname" : form["nickname"].value,
            },
            "address" : {
                "address1" : form["address1"].value,
                "address2" : form["address2"].value,
                "city" : form["city"].value,
                "zipcode" : form["zipcode"].value,
                "country" : form["country"].value,
            },
            "birthday" : form["birthday"].value,

            "occupation" : form["occupation"].value,
            "email" : form["email"].value,
        })
        .then(() => {
            console.log("new member created!");
            window.location.href = "#/my-trees";
            // location.reload();
        })
        .catch(err => {
            console.log(err.message)
        })
    });
}


// const loopThroughMemberBlueprint = (args) => {
//     let defaults = ["claimed_by", "topMember", "created_by", "children", "parents", "siblings", "spouses"];
//     let ignoreGroupLabels = args.ignoreGroupLabels ? args.ignoreGroupLabels : [];
//     if (!args.ignoreDefaults) {
//         ignoreGroupLabels.push(...defaults);
//     }
//     let ignoreItems = args.ignoreItems ? args.ignoreItems : [];
//     let functionCall = args.functionCall;

//     for (let [key, value] of Object.entries(memberBlueprint)) {
//         if (ignoreGroupLabels.includes(value["dataPath"]) || ignoreItems.includes(value["dataPath"])) {
//             if ( value["defaultValue"] && Object.values(value["defaultValue"]).length > 0 ) {
//                 loopSubItems(key, value)
//             }
//         } else {
//             if ( value["defaultValue"] && Object.values(value["defaultValue"] ).length > 0 ) {
//                 loopSubItems(key, value)
//             } else {
//                 functionCall(key, value);
//             }
//         }

//         function loopSubItems(key, value) {
//             for (let [detailKey, detailValue] of Object.entries(value["defaultValue"])) {
//                 if (!ignoreItems.includes(detailValue["dataPath"])) {
//                     functionCall(detailKey, detailValue, value);
//                 }
//             }
//         }
//     };
// }