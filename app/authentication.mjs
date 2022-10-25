import { Router } from 'express';
const router = Router();
import Utente from './collezioni/utenti.mjs'; // get our mongoose model
import { compare } from 'bcrypt';
import RateLimit from 'express-rate-limit';
import { Validator } from 'node-input-validator';
import verify from './googleTokenChecker.mjs';
import createToken from './tokenCreation.mjs';
import {google} from 'googleapis';

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
			if (req.body.googleJwt != null && req.body.googleJwt != undefined) {
				//Checks the Google token
				console.log(req.body.googleJwt);

				//Check if the token is valid by first importing the public key used by Google (see here:
				//https://www.googleapis.com/oauth2/v3/certs; pay attention to import the new keys if the old ones expire. To do this,
				//check the keys' expiry date in the header of the response of the above link.)
				//Then follow the instructions in the following link: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
				await verify(req.body.googleJwt)
				.then(async ticket => {
					console.log("OK");
					var payload = ticket.getPayload();
					console.log("OK1");
					let user = await Utente.exists({ email: { $eq: payload.email } });
					if (user == null) {
						//Create a new user
						console.log("User OK");
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
						if(res.data.phoneNumbers != undefined) {
							console.log("phone OK");
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
							valutazioneMedia: 0.0
						});
						await user.save();
						console.log("User saved");
					}
					console.log("About to send response...");
					res.status(200).json(result(req.body.googleJwt.credential, payload.email, user.id)).send();
				})
				.catch(err => {
					console.log(err);
					res.status(500).json({
						error: "Errore interno al server."
					}).send();
				});
				return;
			}
			console.log("no token");

			//Set Facebook Login

			//No authentication with identity providers, so use email and password
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

export default router;