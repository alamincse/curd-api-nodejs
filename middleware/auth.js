const { getBearerToken, validateToken, validatePhone, verifyToken } =  require('../helpers/utilities');

const authMiddleware = (requestProperties, callback, next) => {
	const phoneNumber = requestProperties.queryStringObject?.phone || requestProperties.body?.phone;

	const bearerToken = getBearerToken(requestProperties.headersObject);

	const token = validateToken(bearerToken);
	const phone = validatePhone(phoneNumber);

	if (! phone) {
		callback(400, {
			error: 'Invalid phone number' 
		});
	} else if (! token) {
		callback(400, {
			error: 'Invalid Bearer Token' 
		});
	} else {
		verifyToken(token, phone, (isValid) => {
			if (isValid) {
				next(); // Go to actual route handler
			} else {
				callback(403, {
					error: 'Authentication failed!' 
				});
			}
		});
	}
}

module.exports = authMiddleware;