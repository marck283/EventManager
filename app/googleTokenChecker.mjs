//Check for the correctness of the client-id
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client("22819640695-40ie511a43vdbh8p82o5uhm6b62529rm.apps.googleusercontent.com");

/**
 * Function to be used for Google Sign In only, otherwise it will not work.
 * @param {String} token The token to verify, expressed as required by Google Sign In
 * @returns 
 */
 var verify = token => {
	return client.verifyIdToken({
		idToken: token,
		audience: ["22819640695-40ie511a43vdbh8p82o5uhm6b62529rm.apps.googleusercontent.com",
	"666454225517-itbjsj8g0hp5rq3hmbcg8ieg4mi9o5s3.apps.googleusercontent.com"],  // Specify the CLIENT_ID of the app that accesses the backend
		// Or, if multiple clients access the backend:
		//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
	});
};

export default verify;