const jwt = require('jsonwebtoken');

const tokenChecker = function(req, res, next) {
	

	var token = req.body.token || req.query.token || req.headers['x-access-token'];


	if (!token) {
		return res.status(401).send({ 
			success: false,
			message: 'token non presente'
		});
		console.log("non ho il token");

	}

	jwt.verify(token, process.env.SUPER_SECRET, function(err, decoded) {			
		if (err) {
			return res.status(403).send({
				success: false,
				message: 'falita autenticazione del token'
			});		
			console.log("ho il token errato");
		} else {
			console.log("ho il token");
			req.loggedUser = decoded;
			next();
		}
	});
	
};

module.exports = tokenChecker