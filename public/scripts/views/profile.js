const profileViewEl = document.querySelector(`[data-view="profile"]`);
const profileDebugMsg = profileViewEl.querySelector(`.debugMessage`);
const profileContent = profileViewEl.querySelector("#profile_content");
const profileInfo = profileViewEl.querySelector(".profile__info");
const profileImage = profileViewEl.querySelector(".profile__image");

const privacyButtonContainer = profileViewEl.querySelector(".privacy-button_container");
const privacySettingsPrivate = profileViewEl.querySelector("#privacy-settings_private");
const privacySettingsPublic = profileViewEl.querySelector("#privacy-settings_public");

const editProfilePageButton = profileViewEl.querySelector("#edit-profile-page_button");
const saveProfilePageButton = profileViewEl.querySelector("#save-profile-page_button");
const cancelProfilePageButton = profileViewEl.querySelector("#cancel-profile-page_button");

const profileImageInput = profileViewEl.querySelector("#profile-page-edit-profile");

let currentProfileImageStyle;

const profileContainer = profileViewEl.querySelector(".profile__container");

var storageRef = firebase.storage().ref();

function profileSetup() {
    pageTitle.innerHTML = "";
    Nav.showViewPreferencesButton(false);
}

const profileViewOnAuthChange = (authUser) => {
    window.location.hash = "/profile";
    if (authUser) {
        populateProfileHeader(authUser);
        populateMemberDetails(authUser);
        initiatePrivacyDropdown();
    } else {
        profileContainer.innerHTML = '';
        location.hash = "/log-in"
    }
}

const populateProfileHeader = () => {
    let profileNameEl = profileViewEl.querySelector(".profile__name");
    let accountEmail = profileViewEl.querySelector(".profile__email");

    let name = LocalDocs.member ? "No name" : "Create your profile";
    let email = auth.currentUser.email;
    let data = null;

    if (LocalDocs.member) {
        data = (LocalDocs.member.name && LocalDocs.member.name.firstName) ? LocalDocs.member.name : null;
        email = LocalDocs.member.email ? LocalDocs.member.email : email;
    }
    
    if (data && data.firstName && data.surnameCurrent) {
        name = `${data.firstName} ${data.surnameCurrent}`
    } else if (data && data.firstName) {
        name = `${data.firstName}`
    }

    if (!profileNameEl) {
        profileNameEl = createElementWithClass("div", "profile__name header_l u-c_white u-mar-b_1", name)
    } else {
        profileNameEl.textContent = name;
    }

    if (!accountEmail) {
        accountEmail = createElementWithClass("div", "profile__email u-font-size_18 u-c_white u-o_75 u-mar-b_2", email);
    } else {
        accountEmail.textContent = email;
    }
    
    profileInfo.prepend(accountEmail);
    profileInfo.prepend(profileNameEl);
}

const initiatePrivacyDropdown = () => {
    if (LocalDocs.member) {
        let existingButton = profileViewEl.querySelector("#privacy-dropdown_button");

        if (existingButton) {
            existingButton.remove();
        }
    
        let public_profile = LocalDocs.member.preferences.public_profile;
        let icon = "eye"
        let status = "public";
    
        if (!public_profile) {
            icon = "lock-alt";
            status = "private";
        };
    
        let button = createElementWithClass("button", "u-font-size_13 u-fw_200 white-outline", `Your profile is ${status}`);
        let buttonPrivacyStatus = createElementWithClass("i", `fal fa-${icon} u-font-size_15 u-mar-r_2`);
        let buttonPrivacyCaret = createElementWithClass("i", "fa fa-caret-down u-font-size_18 u-mar-l_1 u-o_50");
    
        button.setAttribute("id", "privacy-dropdown_button");
        button.setAttribute("data-dropdown-target", "privacy-settings");
    
        button.prepend(buttonPrivacyStatus);
        button.appendChild(buttonPrivacyCaret);
    
        privacyButtonContainer.prepend(button);
        initiateDropdown(button);
    
        if (public_profile) {
            privacySettingsPublic.querySelector("i.fa-check").classList.remove("u-visibility_hidden");
            privacySettingsPrivate.querySelector("i.fa-check").classList.add("u-visibility_hidden");
        } else {
            privacySettingsPublic.querySelector("i.fa-check").classList.add("u-visibility_hidden");
            privacySettingsPrivate.querySelector("i.fa-check").classList.remove("u-visibility_hidden");
        }
    
        profileViewEl.querySelector("#privacy-settings").classList.add("u-visibility_hidden");
    }

}

const populateMemberDetails = () => {
    profileContent.innerHTML = "";
    let containerEl = createElementWithClass("ul", "");
    let groupItems = ["name", "address"];
    let dataSource = LocalDocs.member ? LocalDocs.member : null;

    MemberBlueprint.loop({
        "exclude" : ["profile_photo"],
        "functionCall" : generateDetailElement
    });

    generateFullAddress();
    generateFullName();
    profileContent.appendChild(containerEl);

    function generateFullAddress() {
        // let privacyIcon;
        // if (LocalDocs.member) {
        //     privacyIcon = LocalDocs.member.preferences.public_profile === false ? `lock-alt` : `eye`;
        // }
        let listItem = createElementWithClass("li", "u-d_flex u-ai_center u-mar-b_3");
        let iconEl = createElementWithClass("i", `fal fa-map-pin fa-fw u-mar-r_2 u-font-size_20 u-o_50 u-font-size_20 u-o_50`);
        // let button = createElementWithClass("button", "iconButton u-mar-l_auto white");
        // let buttonIcon = createElementWithClass("i", `fal fa-${privacyIcon}`);
        
        // button.setAttribute("tooltip", "Privacy status");
        listItem.setAttribute("tooltip-position", "top left");
        listItem.setAttribute("tooltip", "Address");

        // button.appendChild(buttonIcon);
        listItem.appendChild(iconEl);

        let address = new String;
        let addressArray = [
            "address1",
            "address2",
            "city",
            "state",
            "zipcode"
        ];

        if (LocalDocs.member) {
            for (const [i, item] of addressArray.entries()) {
                if  (dataSource.address[`${item}`]) {
                    let info = dataSource.address[`${item}`];
    
                    if (i === 0 || !address) {
                        address = address.concat(`${info}`);
                    } else if (address.length <= 1) {
                        address = address.concat(`${info}`);
                    } else if (item === 'city' || item === 'state') {
                        address = address.concat(`, ${info}`);
                    } else {
                        address = address.concat(` ${info}`);
                    }
                }
            }
        }

        let klass;
        if (address.length <= 0) {
            address = "No address";
            klass = 'u-italic u-text_lowest';
        }

        if (address.length > 0) {
            let text = createElementWithClass("p", `u-mar-t_0 u-mar-b_0 ${klass}`, address);
            listItem.appendChild(text);
            // listItem.appendChild(button);
            containerEl.prepend(listItem);
        }
    }

    function generateFullName() {
        let privacyIcon;
        if (LocalDocs.member) {
            privacyIcon = LocalDocs.member.preferences.public_profile === false ? `lock-alt` : `eye`;
        }
        let listItem = createElementWithClass("li", "u-d_flex u-ai_center u-mar-b_3");
        let iconEl = createElementWithClass("i", `fal fa-id-badge fa-fw u-mar-r_2 u-font-size_20 u-o_50 u-font-size_20 u-o_50`);
        let text = createElementWithClass("p", "u-mar-t_0 u-mar-b_0");
        let button = createElementWithClass("button", "iconButton u-mar-l_auto white");
        let buttonIcon = createElementWithClass("i", `fal fa-${privacyIcon}`);
        
        // button.setAttribute("tooltip", "Privacy status");
        listItem.setAttribute("tooltip-position", "top left");
        
        // button.appendChild(buttonIcon);
        listItem.appendChild(iconEl);

        let name = new String;
        let nameArray = [
            {"firstName" : "First name"},
            {"nickname" : "Nickname"},
            {"middleName" : "Middle name"},
            {"surnameCurrent" : "Last name"},
        ];

        if (LocalDocs.member) {
            for (const [i, item] of nameArray.entries()) {
                for ( const [key, value] of Object.entries(item) ) {
                    if  (dataSource.name[`${key}`]) {
                        let info = dataSource.name[`${key}`];
                        let tooltip = value;
                        if (key === "nickname") {
                            info = `(${dataSource.name[key]})`;
                        }
                        if (i === 0 || !name) {
                            let span = createElementWithClass("span", "", `${info}`);
                            span.setAttribute("tooltip", tooltip);
                            span.setAttribute("tooltip-position", "top middle");
    
                            text.appendChild(span);
                        } else {
                            let span = createElementWithClass("span", "", ` ${info}`);
                            span.setAttribute("tooltip", tooltip);
                            span.setAttribute("tooltip-position", "top middle");
    
                            text.appendChild(span);
                        }
                    }
                }
            }
        }
    
        if (text.childNodes.length <= 0) {
            text.textContent = "No name";
            text.setAttribute("class", "u-italic u-text_lowest");
        }

        listItem.appendChild(text);
        // listItem.appendChild(button);
        containerEl.prepend(listItem);
    }

    function generateDetailElement(key, value, parentValue) {
        let isParent = parentValue ? (groupItems.includes(parentValue["dataPath"])) : false;
        let data = null;

        if ( !isParent ) {
            let icon = value["icon"];
            data = LocalDocs.member ? LocalDocs.member[`${value["dataPath"]}`] : null;

            if (data && (key === "Birthday" || key === "Death date")) {
                data = convertBirthday(data);
            }

            renderListItem(key, icon, data);
        }
    }

    function renderListItem(key, icon, data = null) {
        let textClasses = "u-mar-t_0 u-mar-b_0";
        if (!data) {
            textClasses = "u-mar-t_0 u-mar-b_0 u-italic u-text_lowest";
            let string = key.toLowerCase();
            data = data ? data : `No ${string}`;
        }

        let privacyIcon;
        if (LocalDocs.member) {
            privacyIcon = LocalDocs.member.preferences.public_profile === false ? `lock-alt` : `eye`;
        }
        let listItem = createElementWithClass("li", "u-d_flex u-ai_center u-mar-b_3");
        let iconEl = createElementWithClass("i", `fal fa-${icon} fa-fw u-mar-r_2 u-font-size_20 u-o_50`);
        let text = createElementWithClass("p", `${textClasses}`, data);
        // let button = createElementWithClass("button", "iconButton u-mar-l_auto white");
        // let buttonIcon = createElementWithClass("i", `fal fa-${privacyIcon}`);
        
        // button.setAttribute("tooltip", "Privacy status");
        listItem.setAttribute("tooltip", key);
        listItem.setAttribute("tooltip-position", "top left");

        // button.appendChild(buttonIcon);
        listItem.appendChild(iconEl);
        listItem.appendChild(text);
        // listItem.appendChild(button);

        containerEl.appendChild(listItem);
    }
}

const generateEditProfileForm = () => {
    currentProfileImageStyle = profileImage.style.backgroundImage;

    profile_content.innerHTML = '';
    profileImage.classList.add("editing");

    let form = createElementWithClass("form", "");
    form.setAttribute("id", "edit-profile-page_form");

    MemberBlueprint.loop({
        "exclude" : ["profile_photo"],
        "functionCall" : editFormInputs
    });

    function editFormInputs(key, value, parentValue) {
        let inputGroup = createElementWithClass("div", "inputGroup");
        let label = createElementWithClass("label", "", key);
        let input = createElementWithClass("input", "");
        let data = null;

        if (LocalDocs.member) {
            if (parentValue) {
                data = LocalDocs.member[parentValue["dataPath"]][value["dataPath"]] || null;
            } else {
                data = LocalDocs.member[value["dataPath"]] || null;
            }
        }

        input.value = data;
        input.setAttribute("type", value["dataType"] || "text");
        input.setAttribute("name", value["dataPath"]);
        input.setAttribute("id", value["dataPath"]);

        inputGroup.appendChild(label);
        inputGroup.appendChild(input);

        form.appendChild(inputGroup);
    }

    profileContent.appendChild(form);

    let inputs = profileContainer.querySelectorAll("input");
    for (inputEl of inputs) {
        inputEl.addEventListener("input", (e) => {
            saveProfilePageButton.classList.remove("disabled");
        })
    }

    profileImageInput.addEventListener("change", (e) => {
        console.log("changed");
        readURL(e.target);
    });

    function readURL(input) {
        if (input.files && input.files[0]) {
          var reader = new FileReader();
          
          reader.onload = function(e) {
              profileImage.style.backgroundImage = `url("${e.target.result}")`
          }
          
          reader.readAsDataURL(input.files[0]); // convert to base64 string
        }
    }
}

// const editProfileEl = () => {
//     let form = createElementWithClass("form", "card full_width u-mar-lr_auto");
//     let cardContent = createElementWithClass("div", "card__content u-d_flex u-flex-wrap_wrap");
//     let cardHeader = createElementWithClass("div", "card__header");
//     let cardFooter = createElementWithClass("div", "card__footer");
//     let button = createElementWithClass("button", "u-w_full", "Save");
//     let header = createElementWithClass("h2", "u-mar-b_0 u-mar-t_0", "Your profile");
//     let fieldsetName = createElementWithClass("fieldset", "u-pad_1 u-flex_1");
//     let fieldsetAddress = createElementWithClass("fieldset", "u-pad_1 u-flex_1");
//     let fieldsetContact = createElementWithClass("fieldset", "u-pad_1 u-flex_1");
//     let fieldsetOther = createElementWithClass("fieldset", "u-pad_1 u-flex_1");

//     form.setAttribute("id", "set-profile_form");    

//     let imageUrl = accountMenuButton.style.backgroundImage;
//     let profilePhotoInputEl = generateInputItem({
//         "value" : LocalDocs.member ? LocalDocs.member.profile_photo : null,
//         "name" : "profile_photo",
//         "label" : "Profile photo",
//         "backgroundImage" : imageUrl,
//         "type" : "file"
//     });

//     profileContent.appendChild(profilePhotoInputEl);

//     MemberBlueprint.loop({
//         "functionCall" : handleProfileItems,
//         "exclude" : ["profile_photo"]
//     });

//     function handleProfileItems(key, value, parentValue) {
//         let inputValue = "";

//         if (LocalDocs.member) {
//             inputValue = LocalDocs.member[value["dataPath"]] ? LocalDocs.member[value["dataPath"]] : null;
//             if (parentValue) {
//                 inputValue = LocalDocs.member[parentValue["dataPath"]][value["dataPath"]];
//             }
//         } else {
//             if (key === "Email") {
//                 inputValue = auth.currentUser.email;
//             }
//         }

//         let isRequired = false;
//         if (value["dataPath"] === "email") {
//             isRequired = true;
//         }

//         let el = generateInputItem({
//             "value" : inputValue,
//             "name" : value["dataPath"],
//             "label" : key,
//             "type" : value["dataType"] || "text",
//             "required" : isRequired
//         });

//         let regexName = /(name|Name|phonetic)/g;
//         let regexAddress = /(address|zipcode|city|state|country)/g;
//         let regexContact = /(phone|Phone|email)/g;

//         if (value["dataPath"].match(regexName)) {
//             fieldsetName.appendChild(el);
//         } else if (value["dataPath"].match(regexAddress)) {
//             fieldsetAddress.appendChild(el);
//         } else if (value["dataPath"].match(regexContact)) {
//             fieldsetContact.appendChild(el);
//         } else {
//             fieldsetOther.appendChild(el);
//         }
//         // cardContent.appendChild(el);
//     }

//     if (LocalDocs.member) {
//         updateMember(button, form);
//     } else {
//         newMember(button, form);
//         header.textContent = "Create your profile";
//     }
    
//     cardFooter.appendChild(button);
//     cardContent.appendChild(fieldsetName);
//     cardContent.appendChild(fieldsetContact);
//     cardContent.appendChild(fieldsetAddress);
//     cardContent.appendChild(fieldsetOther);
//     cardHeader.appendChild(header)

//     form.appendChild(cardHeader);
//     form.appendChild(cardContent);
//     form.appendChild(cardFooter);

//     profileContent.appendChild(form);

//     const setProfileForm = document.querySelector("#set-profile_form");
    
//     setProfileForm.addEventListener('submit', (e) => {
//         e.preventDefault();
    
//         membersRef.doc(authMemberDoc.id).update({
//             name : {
//                 firstName : setProfileForm["set-profile__firstName"]
//             },
//             birthday : setProfileForm["set-profile__birthday"]
//         })
//         .then(() => {
//             console.log("member was updated");
//         })
//         .catch(err => {
//             console.log(err.message);
//         })
//     })
// }

const generateInputItem = (args) => {
    let inputGroupEl = createElementWithClass("div", "inputGroup");
    let labelEl = createElementWithClass("label");
    let inputEl = createElementWithClass("input");

    labelEl.textContent = args.label;
    labelEl.setAttribute("for", args.name);

    inputEl.setAttribute("name", args.name);
    if (args.value) {
        inputEl.setAttribute("value", args.value);
    }
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
            let extension = fileName.split('.').pop();
            let memberProfilePhotoRef = storageRef.child(`members/${LocalDocs.member.id}/profile.${extension}`);

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

        function goUpdateMember(photoFile = LocalDocs.member.profile_photo) { 
            let object = {};
            
            MemberBlueprint.loop({
                "functionCall" : createObject,
                "exclude" : ["profile_photo"]
            });

            function createObject(key, value, parentValue) {
                let reqName = value["dataPath"];
                let reqParentName = parentValue ? parentValue["dataPath"] : null;
                let data = form[reqName].value;

                if (data) {
                    if (parentValue) {
                        if (!object[reqParentName]) {
                            object[reqParentName] = {};
                        }
                        object[reqParentName][reqName] = data;
                    } else {
                        object[reqName] = data;
                    }
                }

                object["profile_photo"] = photoFile;
            }


            membersRef.doc(LocalDocs.member.id).update(
                object
            )
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
                "surnameCurrent" : form["surnameCurrent"].value,
                "middleName" : form["middleName"].value,
                "surnameBirth" : form["surnameBirth"].value,
                "nickname" : form["nickname"].value,
            },
            "address" : {
                "address1" : form["address1"].value,
                "address2" : form["address2"].value,
                "city" : form["city"].value,
                "state" : form["state"].value,
                "zipcode" : form["zipcode"].value,
                "country" : form["country"].value,
            },
            "phone" : {
                "homePhone" : form["homePhone"].value,
                "mobilePhone" : form["mobilePhone"].value,
                "workPhone" : form["workPhone"].value,
            },
            "birthday" : form["birthday"].value,

            "occupation" : form["occupation"].value,
            "email" : form["email"].value,
        })
        .then(() => {
            window.location.href = "#/my-trees";
            // location.reload();
        })
        .catch(err => {
            console.log(err.message)
        })
    });
}

editProfilePageButton.addEventListener('click', (e) => {
    e.preventDefault();
    editProfilePageButton.classList.add("u-d_none");
    saveProfilePageButton.classList.remove("u-d_none");
    cancelProfilePageButton.classList.remove("u-d_none");

    profileContainer.classList.add("editing");
    generateEditProfileForm();
});

saveProfilePageButton.addEventListener('click', (e) => {
    e.preventDefault();

    let editProfilePageForm = profileViewEl.querySelector("#edit-profile-page_form");
    let object = {};

    if (profileImageInput.files && profileImageInput.files[0]) {
        let profilePhotoFile = profileImageInput.files[0];
        let fileName = profilePhotoFile.name;
        let extension = fileName.split('.').pop();
        let memberProfilePhotoRef = storageRef.child(`members/${LocalDocs.member.id}/profile.${extension}`);
    
        memberProfilePhotoRef.put(profilePhotoFile).then(function(snapshot) {
            object["profile_photo"] = snapshot.metadata.fullPath;
        });
    }

    MemberBlueprint.loop({
        "functionCall" : createObject,
        "exclude" : ["profile_photo"]
    });

    function createObject(key, value, parentValue) {
        let reqName = value["dataPath"];
        let reqParentName = parentValue ? parentValue["dataPath"] : null;
        let data = editProfilePageForm[reqName].value;

        if (data) {
            if (parentValue) {
                if (!object[reqParentName]) {
                    object[reqParentName] = {};
                }
                object[reqParentName][reqName] = data;
            } else {
                object[reqName] = data;
            }
        }
    };

    if (LocalDocs.member) {
        membersRef.doc(LocalDocs.member.id).update(object).then(() => {
            location.reload();
        });
    } else if (!LocalDocs.member) {
        let newMemberObject = {};
        MemberBlueprint.loop({
            "functionCall" : createNewMemberObject,
            "exclude" : ["profile_photo"]
        });

        function createNewMemberObject(key, value, parentValue) {
            newMemberObject["created_by"] = auth.currentUser.uid;
            newMemberObject["claimed_by"] = auth.currentUser.uid;
            newMemberObject["email"] = auth.currentUser.email;
            newMemberObject["trees"] = [];
            newMemberObject["primary_tree"] = null;
            newMemberObject["preferences"] = {};
            newMemberObject["preferences"]["public_profile"] = false;

            let reqNewMemberName = value["dataPath"];

            if (parentValue) {
                if (!newMemberObject[parentValue["dataPath"]]) {
                    newMemberObject[parentValue["dataPath"]] = {};
                }
                if (editProfilePageForm[reqNewMemberName].value) {
                    newMemberObject[parentValue["dataPath"]][value["dataPath"]] = editProfilePageForm[reqNewMemberName].value;
                } else {
                    newMemberObject[parentValue["dataPath"]][value["dataPath"]] = null;
                }
            } else {
                if (editProfilePageForm[reqNewMemberName].value) {
                    newMemberObject[value["dataPath"]] = editProfilePageForm[reqNewMemberName].value;
                } else {
                    newMemberObject[value["dataPath"]] = null;
                }
            }
        }

        membersRef.add(newMemberObject).then(() => {
            location.reload();
        })
    }
})

cancelProfilePageButton.addEventListener('click', (e) => {
    e.preventDefault();
    editProfilePageButton.classList.remove("u-d_none");
    saveProfilePageButton.classList.add("u-d_none");
    cancelProfilePageButton.classList.add("u-d_none");
    profileImage.classList.remove("editing");

    profileImage.style.backgroundImage = currentProfileImageStyle;

    profileContent.innerHTML = '';
    populateMemberDetails();

    profileContainer.classList.remove("editing");
});

privacySettingsPrivate.addEventListener("click", (e) => {
    e.preventDefault();

    if (LocalDocs.member && LocalDocs.member.preferences.public_profile !== false) {
        membersRef.doc(LocalDocs.member.id).update({
            "preferences" : {
                "public_profile" : false
            }
        })
        .then(() => {
            LocalDocs.member.preferences.public_profile = false;
            initiatePrivacyDropdown();
        })
    }
});

privacySettingsPublic.addEventListener("click", (e) => {
    e.preventDefault();

    if (LocalDocs.member.preferences.public_profile !== true) {
        membersRef.doc(LocalDocs.member.id).update({
            "preferences" : {
                "public_profile" : true
            }
        })
        .then(() => {
            LocalDocs.member.preferences.public_profile = true;
            initiatePrivacyDropdown();
        })
    }
});


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