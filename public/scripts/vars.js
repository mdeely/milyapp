const memberBlueprint = {
    "Name" : { "dataPath" : "name", "icon" : "user", 
                "defaultValue" : {
                    "First Name" : { "dataPath" : "firstName", "defaultValue" : null, "icon" : "user" },
                    "Middle Name" : { "dataPath" : "middleName", "defaultValue" : null, "icon" : "user" },
                    "Last Name" : { "dataPath" : "lastName", "defaultValue" : null, "icon" : "user" },
                    "Surname" : { "dataPath" : "surname", "defaultValue" : null, "icon" : "user" },
                    "Nickname" : { "dataPath" : "nickname", "defaultValue" : null, "icon" : "user" }
                }
            },
    "Email" : { "dataPath" : "email", "defaultValue" : null, "icon" : "envelope" },
    "Birthday" : { "dataPath" : "birthday", "defaultValue" : null, "icon" : "birthday-cake", "dataType": "date" },
    "Address" : { "dataPath" : "address", "icon" : "map-pin", 
                "defaultValue" : {
                    "Address 1" : { "dataPath" : "address1", "defaultValue" : null, "icon" : "" },
                    "Address 2" : { "dataPath" : "address2", "defaultValue" : null, "icon" : "" },
                    "City" : { "dataPath" : "city", "defaultValue" : null, "icon" : "" },
                    "Zipcode" : { "dataPath" : "zipcode", "defaultValue" : null, "icon" : "" },
                    "Country" : { "dataPath" : "country", "defaultValue" : null, "icon" : "" }
                }
            },
    "Occupation" : { "dataPath" : "occupation", "defaultValue" : null, "icon" : "briefcase" },
    "Children" : { "dataPath" : "children", "defaultValue" : [] },
    "Parents" : { "dataPath" : "parents", "defaultValue" : [] },
    "Siblings" : { "dataPath" : "siblings", "defaultValue" : [] },
    "Spouses" : { "dataPath" : "spouses", "defaultValue" : {} },
    "Top Member" : { "dataPath" : "topMember", "defaultValue" : false },
    "Claimed by" : { "dataPath" : "claimed_by", "defaultValue" : null },
    "Created by" : { "dataPath" : "created_by", "defaultValue" : null },
    "Profile photo" : { "dataPath" : "profile_photo", "icon" : "picture", "defaultValue" : null , "dataType": "file"}
}

const treeBlueprint = {
    "Admins" : { "dataPath" : "admins", "defaultValue" : [] },
    "Contributors" : { "dataPath" : "contributors", "defaultValue" : [] },
    "Viewers" : { "dataPath" : "viewers", "defaultValue" : [] },
    "Created by" : { "dataPath" : "created_by", "defaultValue" : null },
    "Name" : { "dataPath" : "name", "defaultValue" : null }
}

const familyTreeEl = document.querySelector("#familyTree");
const pageTitle = document.querySelector("#pageTitle")

const signUpForm = document.querySelector("#sign-up_form");
const signInForm = document.querySelector("#sign-in_form");
const signOutButton = document.querySelector("#sign-out_button");

const excludedDetails = ["children", "parents", "siblings", "spouses", "topMember", "claimed_by", "created_by", "profile_photo"];
const excludedCategories = ["Name", "Address"];