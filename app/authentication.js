const express = require('express');
const router = express.Router();
const Utente = require('./collezioni/utenti.js'); // get our mongoose model
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const crypto = require('crypto');


// ---------------------------------------------------------
// route to authenticate and get a new token
// ---------------------------------------------------------
router.post('', async function(req, res) {
	// find the user
	let user = await Utente.findOne({
		email: req.body.email
	});
	
	// user not found
	if (!user){
		res.status(404).json({ success: false, message: 'Autenticazione fallita. Utente non trovato.' }).send();
		return;
	}
	// check if password matches
	if (user.password + user.salt != crypto.createHash('sha3-512').update(req.body.password).digest('hex') + user.salt) {
		res.status(403).json({ success: false, message: 'Autenticazione fallita. Password sbagliata.' }).send();
		return;
	}
	
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
	

});



module.exports = router;