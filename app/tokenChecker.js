const jwt = require('jsonwebtoken');
const verify = require('./googleTokenChecker.js');

const tokenChecker = async (req, res, next) => {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	if (!token || token === "") {
		res.status(401).send({ 
			success: false,
			message: 'fallita autenticazione'
		});
		return;
	}
	if(token.iss === "accounts.google.com" || token.iss === "https://accounts.google.com") {
		await verify(token)
		.then(ticket => {
			console.log("ho il token Google");
			req.loggedUser = ticket.getPayload();
			next();
		})
		.catch(err => {
			console.log(err);
			res.status(401).json({
				success: false,
				message: 'fallita autenticazione'
			}).send();
			return;
		});
	} else {
		jwt.verify(token, process.env.SUPER_SECRET, async (err, decoded) => {
			if (err) {
				res.status(401).json({
					success: false,
					message: 'fallita autenticazione'
				}).send();
			} else {
				console.log("ho il token");
				req.loggedUser = decoded;
				next();
			}
		});
	}
};

module.exports = tokenChecker;