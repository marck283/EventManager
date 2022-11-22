import Utente from './collezioni/utenti.mjs';

var login = async (fbUserId, fbJwt, res) => {
    await fetch("https://graph.facebook.com/v15.0/" + fbUserId + "?fields=email,name,picture&access_token=" + fbJwt)
        .then(resp => resp.json()
            .then(async json1 => {
                var user1 = await Utente.findOne({ email: { $eq: json1.email } });
                if(user1 != undefined && user1 != null) {
                    res.status(409).json({ error: "Utente già registrato." }).send();
                    return;
                }
                var user = new Utente({
                    nome: json1.nome,
                    email: json1.email,
                    password: "",
                    salt: "",
                    tel: "",
                    profilePic: json1.picture.data.url,
                    numEvOrg: 0,
                    valutazioneMedia: 0.0,
                    g_refresh_token: ""
                });
                await user.save();
                user = await Utente.findOne({ email: { $eq: json1.email } });
                res.status(200).json(result(fbJwt, json1.email, user.id, json1.picture.data.url)).send();
            }));
};

export default login;