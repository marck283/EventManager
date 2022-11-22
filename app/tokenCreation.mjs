import pkg from 'jsonwebtoken';
const { sign } = pkg;

/**
 * Function used to create authorization tokens for users who do not use Google Sign In APIs.
 * @param {String} email 
 * @param {String} id 
 * @param {Number} secs 
 * @returns 
 */
var createToken = (email, id, secs) => {
	var payload = {
		email: email,
		id: id
		// other data encrypted in the token	
	}
	var options = {
		expiresIn: secs // expires in "secs" seconds
	}
	return sign(payload, process.env.SUPER_SECRET, options);
};

export default createToken;