const express = require('express');
const router = express.Router();
const Utente = require('./collezioni/utenti.js'); // get our mongoose model
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const crypto = require('bcrypt');
const RateLimit = require('express-rate-limit');
const { Validator } = require('node-input-validator');

//Check for the correctness of the client-id
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client("22819640695-40ie511a43vdbh8p82o5uhm6b62529rm.apps.googleusercontent.com");

var limiter = RateLimit({
	windowMs: 1 * 60 * 1000, //1 minute
	max: 100, //Limit each IP to 100 requests per minute
	message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
	statusCode: 429
});

router.use(limiter);

async function verify(token) {
	return await client.verifyIdToken({
		idToken: token,
		audience: "22819640695-40ie511a43vdbh8p82o5uhm6b62529rm.apps.googleusercontent.com",  // Specify the CLIENT_ID of the app that accesses the backend
		// Or, if multiple clients access the backend:
		//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
	})
	.catch(err => {
		throw err;
	});
};

var createToken = (email, id) => {
	// if user is found and password is right create a token
	var payload = {
		email: email,
		id: id
		// other data encrypted in the token	
	}
	var options = {
		expiresIn: 3600 // expires in 1 hour
	}
	return jwt.sign(payload, process.env.SUPER_SECRET, options);
};

var result = (token, email, id, error = false, message = "") => {
	if(error) {
		return {
			success: false,
			message: message
		}
	}
	return {
		success: true,
		message: "Autenticazione completata",
		token: token,
		email: email,
		id: id,
		self: "/api/v2/Utenti/" + id
	};
};

// ---------------------------------------------------------
// route to authenticate and get a new token
// ---------------------------------------------------------
router.post('', async (req, res) => {
	var voptions = {};
	if(req.params.g_csrf_token) {
		voptions.csrfToken = g_csrf_token;
	} else {
		voptions.csrfToken = req.body.csrfToken;
	}
	const v = new Validator(voptions, {
		csrfToken: 'required|string'
	});
	v.check()
	.then(async matched1 => {
		if (!matched1) {
			res.status(400).json(result(undefined, undefined, undefined, true, "Errore di autenticazione.")).send();
			return;
		}
		//Check the JWT tokens
		if(req.body.googleJwt != null && req.body.googleJwt != undefined) {
			//Checks the Google token

			//Check if the token is valid by first importing the public key used by Google (see here:
			//https://www.googleapis.com/oauth2/v3/certs; pay attention to import the new keys if the old ones expire. To do this,
			//check the keys' expiry date in the header of the response of the above link.)
			//Then follow the instructions in the following link: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
			await verify(req.body.googleJwt.credential)
			.then(async ticket => {
				var payload = ticket.getPayload();
				//Retry implementing the user's data request to the Google People API using gapi in the client-side JavaScript code.
				if(await Utente.exists({email: {$eq: payload.email}}) == null) {
					//Create a new user
					let user = new Utente({
						nome: payload.given_name,
						email: payload.email,
						password: "",
						salt: "",
						tel: "",
						profilePic: payload.picture
					});
					await user.save();
				}
				res.status(200).json(result(ticket, payload.email, payload.sub)).send();
			})
			.catch(err => {
				res.status(500).json({
					error: "Errore interno al server."
				}).send();
				console.log(err);
			});
			return; //Next step: associate the token with an actual user account on this server
		}

		//No authentication with identity providers, so use email and password
		// find the user
		let user = await Utente.findOne({ email: { $eq: req.body.email } });

		// user not found
		if (!user) {
			res.status(404).json(result(undefined, undefined, undefined, true, "Autenticazione fallita. Utente non trovato.")).send();
			return;
		}

		// Check if passwords match. Again hashing + salting to mitigate digest clashes and digest pre-computation
		crypto.compare(req.body.password, user.password)
			.then(result1 => {
				if (!result1) {
					res.status(403).json(result(undefined, undefined, undefined, true, "Autenticazione fallita. Password sbagliata.")).send();
				} else {
					var token = createToken(user.email, user._id);
					res.status(200).json(result(token, user.email, user._id)).send();
				}
			})
			.catch(err => {
				console.log(err);
				res.status(500).json({
					error: "Errore interno al server."
				}).send();
			});
	})
	.catch(err => console.log(err));
	return;
});

module.exports = router;