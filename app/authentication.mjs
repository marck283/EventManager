import { Router } from 'express';
const router = Router();
import Utente from './collezioni/utenti.mjs'; // get our mongoose model
import { compare } from 'bcrypt';
import RateLimit from 'express-rate-limit';
import { Validator } from 'node-input-validator';
import verify from './googleTokenChecker.mjs';
import createToken from './tokenCreation.mjs';
import { google } from 'googleapis';

var limiter = RateLimit({
	windowMs: 1 * 60 * 1000, //1 minute
	max: 100, //Limit each IP to 100 requests per minute
	message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
	statusCode: 429
});

router.use(limiter);

var result = (token, email, id, profilePic, error = false, message = "") => {
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
		profilePic: profilePic,
		id: id,
		self: "/api/v2/Utenti/" + id
	};
};

// ---------------------------------------------------------
// route to authenticate and get a new token
// ---------------------------------------------------------
router.post('', (req, res) => {
	var voptions = {};
	if (req.params.g_csrf_token) {
		voptions.csrfToken = req.params.g_csrf_token;
	} else {
		voptions.csrfToken = req.body.csrfToken;
	}
	const v = new Validator(voptions, {
		csrfToken: 'required|string'
	});
	v.check()
		.then(async matched1 => {
			if (!matched1) {
				console.log(v.errors);
				res.status(400).json(result(undefined, undefined, undefined, true, "Errore di autenticazione.")).send();
				return;
			}
			//Check the JWT tokens

			//Avrei una domanda: PERCHé I TOKEN JWT GOOGLE PER L'AUTENTICAZIONE STANDARD
			//E QUELLI PER ANDROID HANNO DUE CONTENUTI DIVERSI?
			if (req.body.googleJwt != null && req.body.googleJwt != undefined) {
				let gJwt = req.body.googleJwt;
				if (gJwt.credential != null && gJwt.credential != undefined) {
					gJwt = gJwt.credential;
				}

				//Check if the token is valid by first importing the public key used by Google (see here:
				//https://www.googleapis.com/oauth2/v3/certs; pay attention to import the new keys if the old ones expire. To do this,
				//check the keys' expiry date in the header of the response of the above link.)
				//Then follow the instructions in the following link: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
				await verify.verify(gJwt)
					.then(async ticket => {
						var payload = ticket.getPayload();
						let user = await Utente.exists({ email: { $eq: payload.email } });
						if (user == null) {
							//Create a new user
							const service = google.people({
								version: 'v1',
								auth: process.env.PEOPLE_API_ID,
								headers: {
									"Referer": "https://eventmanagerzlf.herokuapp.com/"
								}
							});
							const res = await service.people.get({
								resourceName: 'people/' + payload.sub + "?personFields=phoneNumbers"
							});
							var tel = "";
							if (res.data.phoneNumbers != undefined) {
								tel = res.data.phoneNumbers[0].canonicalForm;
							}
							user = new Utente({
								nome: payload.given_name,
								email: payload.email,
								password: "",
								salt: "",
								tel: tel,
								profilePic: payload.picture,
								numEvOrg: 0,
								valutazioneMedia: 0.0,
								g_refresh_token: ""
							});
							await user.save();
						}
						user = await Utente.findOne({ email: { $eq: payload.email } });
						res.status(200).json(result(gJwt, payload.email, user.id, payload.picture)).send();
					})
					.catch(async err => {
						console.log(err);
						res.status(401).json({
							error: "Token non valido."
						}).send();
					});
				return;
			}

			//No authentication with Google identity provider, so use email and password
			const v1 = new Validator({
				email: req.body.email,
				password: req.body.password
			}, {
				email: 'required|email',
				password: 'required|string'
			});
			v1.check()
				.then(async matched => {
					if (!matched) {
						res.status(400).json(result(undefined, undefined, undefined, true, "Errore di autenticazione.")).send();
					} else {
						// find the user
						let user = await Utente.findOne({ email: { $eq: req.body.email } });

						// user not found
						if (!user) {
							res.status(404).json(result(undefined, undefined, undefined, true, "Autenticazione fallita. Utente non trovato.")).send();
							return;
						}

						// Check if passwords match. Again hashing + salting to mitigate digest clashes and digest pre-computation
						compare(req.body.password, user.password)
							.then(result1 => {
								if (!result1) {
									res.status(403).json(result(undefined, undefined, undefined, true, "Autenticazione fallita. Password sbagliata.")).send();
								} else {
									res.status(200).json(result(createToken(user.email, user._id, 3600), user.email, user._id)).send();
								}
							})
							.catch(err => {
								console.log(err);
								res.status(500).json({
									error: "Errore interno al server."
								}).send();
							});
					}
				})
		})
		.catch(err => console.log(err));
	return;
});

router.post("/facebookLogin", async (req, res) => {
	try {
		const v = new Validator({
			csrfToken: req.body.csrfToken
		}, {
			csrfToken: 'required|string'
		});
		v.check()
			.then(async matched => {
				if (!matched) {
					console.log(v.errors);
					res.status(400).json(result(undefined, undefined, undefined, true, "Errore di autenticazione.")).send();
					return;
				}
				var error = false;
				var url = new URL("https://graph.facebook.com/v15.0/debug_token?input_token=" + req.body.googleJwt);
				
				const resp = await fetch(url)
					.catch(err => {
						console.log(err);
						res.status(500).json({
							error: "Errore interno al server"
						}).send();
						error = true;
					});
	
				if (!error) {
					await resp.json()
					.then(async json => {
						if (json.data.is_valid) {
							console.log("scopes: " + json.data);
							const scopes = json.data.scopes;
							if (!scopes.includes("email")) {
								console.log("noEmail");
								res.status(400).json({
									error: "L'utente non ha concesso l'autorizzazione per l'email"
								});
							} else {
								await fetch("graph.facebook.com/v15.0/" + json.data.user_id + "?fields=email,name,picture&access_token=" + req.body.googleJwt)
									.then(async resp => {
										const json = await resp.json();
										var user = new Utente({
											nome: json.data.nome,
											email: json.data.email,
											password: "",
											salt: "",
											tel: "",
											profilePic: json.data.picture.data.url,
											numEvOrg: 0,
											valutazioneMedia: 0.0,
											g_refresh_token: ""
										});
										await user.save();
		
										user = await Utente.findOne({ email: { $eq: json.data.email } });
										res.status(200).json(result(req.body.googleJwt, json.data.email, user.id, json.data.picture.data.url)).send();
									})
									.catch(err => {
										console.log(err);
										res.status(400).json({
											error: "OAuth exception"
										}).send();
									});
		
							}
						} else {
							res.status(401).json({
								error: "Token non valido."
							}).send();
						}
					});
				}
			});
	} catch(err) {
		console.log(err);
		res.status(500).json({
			error: "Errore interno al server"
		}).send();
	}
});

export default router;