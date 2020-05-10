export const variablizeMemberDoc = (uid = auth.currentUser.uid) => new Promise(
    function(resolve, reject) {
        membersRef.where('claimed_by', '==', uid).limit(1).get()
        .then((queryResult) => {
            if (queryResult.docs[0]) {
                LocalDocs.member = queryResult.docs[0] ? queryResult.docs[0] : null;
                resolve(true);
            } else {
                resolve(false)
            }
        })
        .catch(err => {
            reject(console.log(err.message));
        })
    }
)