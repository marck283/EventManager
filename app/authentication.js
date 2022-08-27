const express = require('express');
const router = express.Router();
const Utente = require('./collezioni/utenti.js'); // get our mongoose model
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const crypto = require('bcrypt');
const RateLimit = require('express-rate-limit');
const { Validator } = require('node-input-validator');

var limiter = RateLimit({
	windowMs: 1 * 60 * 1000, //1 minute
	max: 100, //Limit each IP to 100 requests per minute
	message: async () => "Hai raggiunto il numero massimo di richieste al minuto.",
	statusCode: 429
});

router.use(limiter);

// ---------------------------------------------------------
// route to authenticate and get a new token
// ---------------------------------------------------------
router.post('', async function (req, res) {
	const v = new Validator({
		csrfToken: req.body.csrfToken
	}, {
		csrfToken: 'required|string'
	});
	v.check(matched1 => {
		if (!matched1) {
			res.status(400).json({
				success: false,
				error: "Errore di autenticazione."
			}).send();
			return;
		}
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
					res.status(400).json({
						success: false,
						error: "Nome utente o password non forniti."
					}).send();
				} else {
					// find the user
					let user = await Utente.findOne({ email: { $eq: req.body.email } }).exec();

					// user not found
					if (!user) {
						res.status(404).json({ success: false, message: 'Autenticazione fallita. Utente non trovato.' }).send();
						return;
					}
					// Check if passwords match. Again hashing + salting to mitigate digest clashes and digest pre-computation
					crypto.compare(req.body.password, user.password)
						.then(result => {
							if (!result) {
								res.status(403).json({ success: false, message: 'Autenticazione fallita. Password sbagliata.' }).send();
							} else {
								// if user is found and password is right create a token
								var payload = {
									email: user.email,
									id: user._id
									// other data encrypted in the token	
								}
								var options = {
									expiresIn: 3600 // expires in 1 hour
								}
								var token = jwt.sign(payload, process.env.SUPER_SECRET, options);

								res.status(200).json({
									success: true,
									message: 'Autenticazione completata',
									token: token,
									email: user.email,
									id: user._id,
									self: "api/v2/Utenti/" + user._id
								}).send();
							}
						})
						.catch(err => {
							console.log(err);
							res.status(500).json({ error: "Errore interno al server." }).send();
						});
				}
			});
	});
	return;
});

module.exports = router;