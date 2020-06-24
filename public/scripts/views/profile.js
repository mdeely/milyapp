let profileViewEl = document.querySelector(`[data-view="profile"]`);
let profileDebugMsg = profileViewEl.querySelector(`.debugMessage`);
let profileContent = profileViewEl.querySelector("#profile_content");
var storageRef = firebase.storage().ref()

function profileSetup() {
    pageTitle.innerHTML = "Profile";
    Nav.showViewPreferencesButton(false);
}

const profileViewOnAuthChange = (user) => {
    profileContent.innerHTML = '';
    window.location.hash = "/profile";
    if (user) {
        populateMemberDetails();
        return;
        editProfileEl();
    } else {
        profileContent.innerHTML = '';
    }
}

const populateMemberDetails = () => {
    let containerEl = createElementWithClass("ul", "");
    let groupItems = ["name", "address"];
    let dataSource = LocalDocs.member;

    MemberBlueprint.loop({
        "exclude" : ["profile_photo"],
        "functionCall" : generateDetailElement
    });

    generateFullAddress();
    generateFullName();
    profileContent.appendChild(containerEl);

    function generateFullAddress(dataSource = LocalDocs.member) {
        let listItem = createElementWithClass("li", "u-d_flex u-ai_center u-mar-b_1");
        let iconEl = createElementWithClass("i", `fal fa-map-pin fa-fw u-mar-r_2 u-font-size_20 u-o_50 u-font-size_20 u-o_50`);
        let button = createElementWithClass("button", "iconButton u-mar-l_auto white");
        let buttonIcon = createElementWithClass("i", "fal fa-lock-alt");
        
        button.setAttribute("tooltip", "Private");
        listItem.setAttribute("tooltip-position", "top left");
        listItem.setAttribute("tooltip", "Address");

        button.appendChild(buttonIcon);
        listItem.appendChild(iconEl);

        let address = new String;
        let addressArray = [
            "address1",
            "address2",
            "city",
            "state",
            "zipcode"
        ]

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

        if (address.length <= 0) {
            address = "No data";
        }

        if (address.length > 0) {
            let text = createElementWithClass("p", "u-mar-t_0 u-mar-b_0", address);
            listItem.appendChild(text);
            listItem.appendChild(button);
            containerEl.prepend(listItem);
        }
    }

    function generateFullName() {
        let listItem = createElementWithClass("li", "u-d_flex u-ai_center u-mar-b_1");
        let iconEl = createElementWithClass("i", `fal fa-id-badge fa-fw u-mar-r_2 u-font-size_20 u-o_50 u-font-size_20 u-o_50`);
        let text = createElementWithClass("p", "u-mar-t_0 u-mar-b_0");
        let button = createElementWithClass("button", "iconButton u-mar-l_auto white");
        let buttonIcon = createElementWithClass("i", "fal fa-lock-alt");
        
        button.setAttribute("tooltip", "Private");
        listItem.setAttribute("tooltip-position", "top left");
        
        button.appendChild(buttonIcon);
        listItem.appendChild(iconEl);

        let name = new String;
        let nameArray = [
            {"firstName" : "First name"},
            {"nickname" : "Nickname"},
            {"middleName" : "Middle name"},
            {"surnameCurrent" : "Last name"},
        ];

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
    
        if (text) {
            console.log(text);
            listItem.appendChild(text);
            listItem.appendChild(button);
            containerEl.prepend(listItem);
        }
    }

    function generateDetailElement(key, value, parentValue) {
        let isParent = parentValue ? (groupItems.includes(parentValue["dataPath"])) : false;

        if ( !isParent ) {
            let icon = value["icon"];
            let data = LocalDocs.member[`${value["dataPath"]}`] || null;

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
            data = data ? data : "No data";
        }
        let listItem = createElementWithClass("li", "u-d_flex u-ai_center u-mar-b_1");
        let iconEl = createElementWithClass("i", `fal fa-${icon} fa-fw u-mar-r_2 u-font-size_20 u-o_50`);
        let text = createElementWithClass("p", `${textClasses}`, data);
        let button = createElementWithClass("button", "iconButton u-mar-l_auto white");
        let buttonIcon = createElementWithClass("i", "fal fa-lock-alt");
        
        button.setAttribute("tooltip", "Private");
        listItem.setAttribute("tooltip", key);
        listItem.setAttribute("tooltip-position", "top left");

        button.appendChild(buttonIcon);
        listItem.appendChild(iconEl);
        listItem.appendChild(text);
        listItem.appendChild(button);

        containerEl.appendChild(listItem);
    }
}
const editProfileEl = () => {
    let form = createElementWithClass("form", "card full_width u-mar-lr_auto");
    let cardContent = createElementWithClass("div", "card__content u-d_flex u-flex-wrap_wrap");
    let cardHeader = createElementWithClass("div", "card__header");
    let cardFooter = createElementWithClass("div", "card__footer");
    let button = createElementWithClass("button", "u-w_full", "Save");
    let header = createElementWithClass("h2", "u-mar-b_0 u-mar-t_0", "Your profile");
    let fieldsetName = createElementWithClass("fieldset", "u-pad_1 u-flex_1");
    let fieldsetAddress = createElementWithClass("fieldset", "u-pad_1 u-flex_1");
    let fieldsetContact = createElementWithClass("fieldset", "u-pad_1 u-flex_1");
    let fieldsetOther = createElementWithClass("fieldset", "u-pad_1 u-flex_1");

    form.setAttribute("id", "set-profile_form");    

    let imageUrl = accountMenuButton.style.backgroundImage;
    let profilePhotoInputEl = generateInputItem({
        "value" : LocalDocs.member ? LocalDocs.member.profile_photo : null,
        "name" : "profile_photo",
        "label" : "Profile photo",
        "backgroundImage" : imageUrl,
        "type" : "file"
    });

    cardContent.appendChild(profilePhotoInputEl);

    MemberBlueprint.loop({
        "functionCall" : handleProfileItems,
        "exclude" : ["profile_photo"]
    });

    function handleProfileItems(key, value, parentValue) {
        let inputValue = "";

        if (LocalDocs.member) {
            inputValue = LocalDocs.member[value["dataPath"]] ? LocalDocs.member[value["dataPath"]] : null;
            if (parentValue) {
                inputValue = LocalDocs.member[parentValue["dataPath"]][value["dataPath"]];
            }
        } else {
            if (key === "Email") {
                inputValue = auth.currentUser.email;
            }
        }

        let isRequired = false;
        if (value["dataPath"] === "email") {
            isRequired = true;
        }

        let el = generateInputItem({
            "value" : inputValue,
            "name" : value["dataPath"],
            "label" : key,
            "type" : value["dataType"] || "text",
            "required" : isRequired
        });

        let regexName = /(name|Name|phonetic)/g;
        let regexAddress = /(address|zipcode|city|state|country)/g;
        let regexContact = /(phone|Phone|email)/g;

        if (value["dataPath"].match(regexName)) {
            fieldsetName.appendChild(el);
        } else if (value["dataPath"].match(regexAddress)) {
            fieldsetAddress.appendChild(el);
        } else if (value["dataPath"].match(regexContact)) {
            fieldsetContact.appendChild(el);
        } else {
            fieldsetOther.appendChild(el);
        }
        // cardContent.appendChild(el);
    }

    if (LocalDocs.member) {
        updateMember(button, form);
    } else {
        newMember(button, form);
        header.textContent = "Create your profile";
    }
    
    cardFooter.appendChild(button);
    cardContent.appendChild(fieldsetName);
    cardContent.appendChild(fieldsetContact);
    cardContent.appendChild(fieldsetAddress);
    cardContent.appendChild(fieldsetOther);
    cardHeader.appendChild(header)

    form.appendChild(cardHeader);
    form.appendChild(cardContent);
    form.appendChild(cardFooter);

    profileContent.appendChild(form);

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