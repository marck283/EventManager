import pkg from 'jsonwebtoken';
const { sign } = pkg;

/**
 * Function used to create authorization tokens for users who do not use Google Sign In or Facebook Login APIs.
 * @param {*} email 
 * @param {*} id 
 * @param {*} secs 
 * @returns 
 */
var createToken = (email, id, secs) => {
	// if user is found and password is right create a token
	var payload = {
		email: email,
		id: id
		// other data encrypted in the token	
	}
	var options = {
		expiresIn: secs // expires in 1 hour
	}
	return sign(payload, process.env.SUPER_SECRET, options);
};

export default createToken;