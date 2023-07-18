import User from '../collezioni/utenti.mjs';

var getOrgNames = async events => {
    var orgNames = [];
    for(let e of events) {
        let user = await User.findById(e.organizzatoreID);
        if(user != undefined) {
            orgNames.push(user.nome);
        }
    }
    return orgNames;
};

export default getOrgNames;