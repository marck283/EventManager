//Check for the correctness of the client-id
import { OAuth2Client } from 'google-auth-library';

const oauthCodeExchangeConfigured = Boolean(
	process.env.GCLIENT_SECRET && process.env.GCLIENT_REDIRECT_URI
);
var client = new OAuth2Client(
	process.env.GCLIENT_ID,
	process.env.GCLIENT_SECRET,
	process.env.GCLIENT_REDIRECT_URI
);
const url = client.generateAuthUrl({
	access_type: 'offline',
	scope: [
		"https://www.googleapis.com/auth/userinfo.email",
		"https://www.googleapis.com/auth/userinfo.profile",
		"https://www.googleapis.com/auth/user.birthday.read"
	]
});

const googleClientIds = [
	process.env.GCLIENT_ID
].filter(Boolean);

//Problema: invalid_grant? Prova a vedere qui per una possibile soluzione (prima della sezione OAuth):
//https://github.com/googleapis/google-auth-library-nodejs

/**
 * Function to be used for Google Sign In only, otherwise it will not work.
 * @param {String} token The token to verify, expressed as required by Google Sign In
 * @returns 
 */
 var verify = async token => {
	//await client.request({url});
	return client.verifyIdToken({
		idToken: token,
		audience: googleClientIds
	});
};

export default {verify, client, oauthCodeExchangeConfigured};