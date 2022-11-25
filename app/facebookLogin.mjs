import Utente from './collezioni/utenti.mjs';
import createToken from './tokenCreation.mjs';

var login = async (fbUserId, fbJwt, res) => {
    await fetch("https://graph.facebook.com/v15.0/" + fbUserId + "?fields=email,name,picture&access_token=" + fbJwt)
        .then(resp => resp.json()
            .then(async json1 => {
                var user1 = await Utente.findOne({ email: { $eq: json1.email } });
                if (user1 != undefined && user1 != null) {
                    if(user1.facebookAccount != null && user1.facebookAccount.userId != null &&
                        user1.facebookAccount.userId != undefined && typeof(user1.facebookAccount.userId) == String &&
                        user1.facebookAccount.userId != "") {
                        res.status(409).json({ error: "Utente già registrato." }).send();
                        return;
                    }
                } else {
                    var user = new Utente({
                        nome: json1.nome,
                        email: json1.email,
                        password: "",
                        salt: "",
                        tel: "",
                        profilePic: json1.picture.data.url,
                        numEvOrg: 0,
                        valutazioneMedia: 0.0,
                        googleAccount: null,
                        facebookAccount: {
                            userId: fbUserId
                        }
                    });
                    await user.save();
                }
                user = await Utente.findOne({ email: { $eq: json1.email } });
                res.status(200).json(result(createToken(json1.email, user.id, 3600), json1.email, user.id, json1.picture.data.url)).send();
            }))
        .catch(err => {
            console.log(err);
            res.status(404).json({
                error: "Utente non trovato."
            }).send();
        });
};

export default login;