const jwt = require('jsonwebtoken');

const tokenChecker = function(req, res, next) {
	

	var token = req.body.token || req.query.token || req.headers['x-access-token'];


	if (!token || token === "") {
		return res.status(401).send({ 
			success: false,
			message: 'fallita autenticazione'
		});


	}

	jwt.verify(token, process.env.SUPER_SECRET, function(err, decoded) {			
		if (err) {
			console.log("ho il token errato");
			return res.status(401).send({
				success: false,
				message: 'fallita autenticazione'
			});
		} else {
			console.log("ho il token");
			req.loggedUser = decoded;
			next();
		}
	});
	
};

module.exports = tokenChecker;