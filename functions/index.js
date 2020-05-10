const functions = require('firebase-functions');
// // const admin = require('firebase-admin');
// // admin.initializeApp();

// // exports.addAdminRole = functions.https.onCall((data, context) => {
// //     // check request is made by an admin
// //     if (context.auth.token.admin !== true) {
// //         return {err: 'Only admins can add other admins.' };
// //     }
// //     // get user and add custom (admin)
// //     return admin.auth().getUserByEmail(data.email).then(user => {
// //         return admin.auth().setCustomUserClaims(user.uid, {
// //             admin: true
// //         });
// //     }).then(() => {
// //         return {
// //             message: `Success! ${data.email} has been made an admin.`
// //         }
// //     }).catch(err => {
// //         return err;
// //     });
// // });
// exports.jsonResponseTest = functions.https.onRequest((req, res) => {
//     res.json({"test" : "I'm part of a json object!"})
//  })

//  exports.testFunction = functions.https.onRequest((req, res) => {
//      const obj = {jsonObject : "Hello!"}
//     res.send(obj);
//  })