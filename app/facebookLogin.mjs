import Utente from './collezioni/utenti.mjs';
import createToken from './tokenCreation.mjs';

var result = (token, email, name, id, profilePic, error = false, message = "") => {
	if (error) {
		return {
			success: false,
			message: message
		};
	}
	return {
		success: true,
		message: "Autenticazione completata",
		token: token,
		email: email,
        name: name,
		profilePic: profilePic,
		id: id,
		self: "/api/v2/Utenti/" + id
	};
};

var login = async (fbUserId, fbJwt, res) => {
    var req = new Request();
    req.url = "https://graph.facebook.com/v15.0/" + fbUserId + "?fields=email,name,picture&access_token=" + fbJwt;
    await fetch(req)
        .then(resp => resp.json()
            .then(async json1 => {
                console.log("nome:", json1.name);
                var user1 = await Utente.findOne({ email: { $eq: json1.email } });
                if (user1 != undefined && user1 != null) {
                    user1.facebookAccount.userId = fbUserId;
                    await user1.save();
                } else {
                    var user = new Utente({
                        nome: json1.name,
                        email: json1.email,
                        password: "",
                        salt: "",
                        tel: "",
                        profilePic: json1.picture.data.url,
                        numEvOrg: 0,
                        valutazioneMedia: 0.0,
                        googleAccount: {
                            userId: "",
                            g_refresh_token: ""
                        },
                        facebookAccount: {
                            userId: fbUserId
                        }
                    });
                    await user.save();
                }
                user = await Utente.findOne({ email: { $eq: json1.email } });
                res.status(200).json(result(createToken(json1.email, user.id, 172800), json1.email, json1.name, user.id, json1.picture.data.url)).send();
            }))
        .catch(err => {
            console.log(err);
            res.status(404).json({
                error: "Utente non trovato."
            }).send();
        });
};

export default login;