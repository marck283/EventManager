import Utente from './collezioni/utenti.mjs';

var returnUser = async req => {
    var IDexample = req.loggedUser.id/* || req.loggedUser*/, user;

    /*if(IDexample == req.loggedUser) {
        user = await Utente.findOne({ email: { $eq: IDexample.email }});
    } else {*/
        user = await Utente.findById(IDexample);
    //}

    console.log(user);

    return user;
};

export default returnUser;