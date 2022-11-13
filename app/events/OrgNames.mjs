import User from '../collezioni/utenti.mjs';

var getOrgNames = async events => {
    var orgNames = [];
    for(let e of events) {
        orgNames.push((await User.findById(e.organizzatoreID)).nome);
    }
    return orgNames;
};

export default getOrgNames;