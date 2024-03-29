import pkg from 'jsonwebtoken';
const { verify: _verify } = pkg;

const tokenChecker = async (req, res, next) => {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	if (!token || token === "") {
		res.status(401).send({
			success: false,
			message: 'fallita autenticazione'
		});
		return;
	}

	_verify(token, process.env.SUPER_SECRET, async (err, decoded) => {
		if (err) {
			res.status(401).json({
				success: false,
				message: 'fallita autenticazione'
			}).send();
			return;
		}
		req.loggedUser = decoded;
		next();
	});
};

export default tokenChecker;