import { Router } from 'express';
const router = Router();
import Utente from './collezioni/utenti.mjs'; // get our mongoose model
import RateLimit from 'express-rate-limit';
import { Validator } from 'node-input-validator';
import verify from './googleTokenChecker.mjs';
import createToken from './tokenCreation.mjs';
import { google } from 'googleapis';
import login from './facebookLogin.mjs';
import _verify from 'jsonwebtoken';
import { compare } from 'bcrypt';

var limiter = RateLimit({
	windowMs: 1 * 60 * 1000, //1 minute
	max: 100, //Limit each IP to 100 requests per minute
	message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
	statusCode: 429
});

router.use(limiter);

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
					console.log("Google JWT: " + gJwt);
				} else {
					console.log("Not a Google JWT", gJwt);
				}

				//Check if the token is valid by first importing the public key used by Google (see here:
				//https://www.googleapis.com/oauth2/v3/certs; pay attention to import the new keys if the old ones expire. To do this,
				//check the keys' expiry date in the header of the response of the above link.)
				//Then follow the instructions in the following link: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
				await verify.verify(gJwt)
					.then(async ticket => {
						var payload = ticket.getPayload();
						let user = await Utente.findOne({ email: { $eq: payload.email } });
						if (user == undefined) {
							//Create a new user
							const service = google.people({
								version: 'v1',
								auth: process.env.PEOPLE_API_ID,
								headers: {
									"Referer": "https://eventmanager-uo29.onrender.com"
								}
							});
							/*const people = google.people({version: "v1"});
							const client = new google.auth.GoogleAuth({
								scopes: ["https://www.googleapis.com/auth/user.birthday.read"]
							});
							const authClient = client.getClient();
							google.options({auth: authClient});*/
							const res = await service.people.get({
								resourceName: 'people/' + payload.sub + "?personFields=phoneNumbers,birthdays",
							});
							var tel = "", birthday = "";
							if (res.data.phoneNumbers != undefined) {
								tel = res.data.phoneNumbers[0].canonicalForm;
							}
							if(res.data.birthdays != undefined) {
								birthday = res.data.birthdays[1].date.year + "-" + res.data.birthdays[1].date.month + "-" + res.data.birthdays[1].date.day;
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
								googleAccount: {
									userId: payload.sub,
									g_refresh_token: ""
								},
								facebookAccount: {
									userId: ""
								},
								birthday: birthday
							});
							await user.save();
						} else {
							if(user.googleAccount == undefined || user.googleAccount == "") {
								user.googleAccount.userId = payload.sub;
								await user.save();
							}
						}
						//user = await Utente.findOne({ email: { $eq: payload.email } });
						let token = createToken(payload.email, user.id, 172800);

						console.log("authToken:", token);

						res.status(200).json(result(token, payload.email,
						payload.given_name, user.id, payload.picture)).send();
					})
					.catch(async err => {
						console.log(err);

						_verify.verify(gJwt, process.env.SUPER_SECRET, async (err, decoded) => {
							if(err) {
								console.log(err);
								res.status(401).json({
									error: "Token non valido."
								}).send();
								return;
							}
							
							console.log("authTokenF:", gJwt);

							var user = await Utente.findById(decoded.id);
							res.status(200).json(result(gJwt, user.email, user.nome, user.id, user.profilePic)).send();
							return;
						});
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
						res.status(400).json(result(undefined, undefined, undefined, undefined, undefined, true, "Errore di autenticazione.")).send();
					} else {
						// find the user
						let user = await Utente.findOne({ email: { $eq: req.body.email } });

						// user not found
						if (!user) {
							res.status(404).json(result(undefined, undefined, undefined, undefined, undefined, true, "Autenticazione fallita. Utente non trovato.")).send();
							return;
						}

						// Check if passwords match. Again hashing + salting to mitigate digest clashes and digest pre-computation
						compare(req.body.password, user.password)
							.then(result1 => {
								if (!result1) {
									res.status(403).json(result(undefined, undefined, undefined, undefined, undefined, true, "Autenticazione fallita. Password sbagliata.")).send();
								} else {
									res.status(200).json(result(createToken(user.email, user._id, 172800), user.email, user._id, user.profilePic, false, "Autenticazione completata.")).send();
								}
								return;
							})
							.catch(err => {
								console.log(err);
								res.status(500).json({
									error: "Errore interno al server."
								}).send();
								return;
							});
					}
				});
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({error: "Errore interno al server."}).send();
			return;
		});
});

router.post("/facebookLogin", async (req, res) => {
	try {
		const v = new Validator({
			csrfToken: req.body.csrfToken,
			jwt: req.body.googleJwt,
			user_id: req.body.userId
		}, {
			csrfToken: 'required|string',
			jwt: 'required|string|minLength:1|alphaNumeric',
			user_id: 'required|string|minLength:1'
		});
		v.check()
			.then(async matched => {
				if (!matched) {
					console.log(v.errors);
					res.status(400).json(result(undefined, undefined, undefined, true, "Errore di autenticazione.")).send();
					return;
				}
				console.log("fbJwt: " + req.body.googleJwt);
				await login(req.body.userId, req.body.googleJwt, res);
			});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			error: "Errore interno al server"
		}).send();
	}
});

export default router;