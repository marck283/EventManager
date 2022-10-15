const jwt = require('jsonwebtoken');

//Check for the correctness of the client-id
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("22819640695-40ie511a43vdbh8p82o5uhm6b62529rm.apps.googleusercontent.com");

const tokenChecker = (req, res, next) => {
	var token = req.body.token || req.query.token || req.headers['x-access-token'], error = false;

	if (!token || token === "") {
		res.status(401).send({ 
			success: false,
			message: 'fallita autenticazione'
		});
		return;
	}
	jwt.verify(token, process.env.SUPER_SECRET, async (err, decoded) => {
		if (err) {
			await verify(token, ticket => {
				console.log("ho il token");
				req.loggedUser = ticket.getPayload();
				next();
			}, () => {
				error = true;
				console.log("ho il token errato");
				res.status(401).json({
					success: false,
					message: 'fallita autenticazione'
				}).send();
				return;
			});
		} else {
			console.log("ho il token");
			req.loggedUser = decoded;
			next();
		}
	});
};

/**
 * Function to be used for Google Sign In only, otherwise it will not work.
 * @param {String} token The token to verify, expressed as required by Google Sign In
 * @returns 
 */
var verify = async (token, cb, cbErr) => {
	await client.verifyIdToken({
		idToken: token,
		audience: ["22819640695-40ie511a43vdbh8p82o5uhm6b62529rm.apps.googleusercontent.com",
	"666454225517-itbjsj8g0hp5rq3hmbcg8ieg4mi9o5s3.apps.googleusercontent.com"],  // Specify the CLIENT_ID of the app that accesses the backend
		// Or, if multiple clients access the backend:
		//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
	})
	.then(cb)
	.catch(cbErr);
	return;
};

module.exports = { tokenChecker, verify };