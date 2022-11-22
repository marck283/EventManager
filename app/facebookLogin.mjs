import Utente from './collezioni/utenti.mjs';

var handleResponse = (resp, fbJwt, res) => {
    resp.json()
        .then(async json2 => {
            await fetch("https://graph.facebook.com/v15.0/" + json2.data.user_id + "?fields=email,name,picture&access_token=" + fbJwt)
                .then(resp => resp.json()
                    .then(async json1 => {
                        var user = new Utente({
                            nome: json1.data.nome,
                            email: json1.data.email,
                            password: "",
                            salt: "",
                            tel: "",
                            profilePic: json1.data.picture.data.url,
                            numEvOrg: 0,
                            valutazioneMedia: 0.0,
                            g_refresh_token: ""
                        });
                        await user.save();
                        user = await Utente.findOne({ email: { $eq: json1.data.email } });
                        res.status(200).json(result(fbJwt, json1.data.email, user.id, json1.data.picture.data.url)).send();
                    })
                    .catch(err => res.status(400).json({
                        error: "OAuth exception"
                    }).send()));
        });
};

var login = (fbJwt, res) => new Promise(async (resolve, reject) => {
    await fetch("https://graph.facebook.com/v15.0/debug_token?input_token=" + req.body.googleJwt + "&access_token=" + process.env.FACEBOOK_MOBILE_TOKEN)
        .then(resp => resolve(handleResponse(resp, fbJwt, res)))
        .catch(reject());
});

export default login;