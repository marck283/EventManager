const jwt = require('jsonwebtoken');

//Check for the correctness of the client-id
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("22819640695-40ie511a43vdbh8p82o5uhm6b62529rm.apps.googleusercontent.com");

const tokenChecker = (req, res, next) => {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	if (!token || token === "") {
		return res.status(401).send({ 
			success: false,
			message: 'fallita autenticazione'
		});
	}
	jwt.verify(token, process.env.SUPER_SECRET, async (err, decoded) => {
		var error = false;		
		if (err) {
			await verify(token)
			.then(ticket => {
				console.log("ho il token");
				req.loggedUser = ticket.getPayload();
			})
			.catch(err => {
				error = true;
				console.log("ho il token errato");
			});
		} else {
			console.log("ho il token");
			req.loggedUser = decoded;
		}
		if(error) {
			res.status(401).json({
				success: false,
				message: 'fallita autenticazione'
			}).send();
			return;
		}
		next();
	});
};

/**
 * Function to be used for Google Sign In only, otherwise it will not work.
 * @param {String} token The token to verify, expressed as required by Google Sign In
 * @returns 
 */
var verify = async (token) => {
	return client.verifyIdToken({
		idToken: token,
		audience: ["22819640695-40ie511a43vdbh8p82o5uhm6b62529rm.apps.googleusercontent.com",
	"666454225517-itbjsj8g0hp5rq3hmbcg8ieg4mi9o5s3.apps.googleusercontent.com"],  // Specify the CLIENT_ID of the app that accesses the backend
		// Or, if multiple clients access the backend:
		//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
	});
};

module.exports = { tokenChecker, verify };