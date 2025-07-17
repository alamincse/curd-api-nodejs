const data = require('../lib/data');
const crypto = require('crypto');

// Utilities container
const utilities = {};

utilities.parseJSON = (jsonString) => {
	try {
		return JSON.parse(jsonString || '{}');
	} catch(error) {
		console.log('JSON parse error:', error.message);

		return {};
	}
}


utilities.hash = (str) => {
	if (typeof str === 'string' && str.length > 0) {
		return crypto.createHmac('sha256', 'secretKey').update(str).digest('hex');
	}

	return false;
}

utilities.createRandomString = (strLength) => {
	const possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
	let output = '';

	for (let i = 1; i <= strLength; i++) {
    	output += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  	}
  	
  	return output;
}

// return token (From Bearer Token) or just null
utilities.getBearerToken = (headers) => {
	const authHeader = headers['authorization'] ?? '';

	return authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
}

// verify user token
utilities.verifyToken = (tokenId, phone, callback) => {
	data.read('tokens', tokenId, (tokenError, tokenData) => {
		if (! tokenError && tokenData) {
			const token = utilities.parseJSON(tokenData);

			if (token.phone === phone && token.expires > Date.now()) {
				callback(true);
			} else {
				callback(false);
			}
		} else {
			callback(false);
		}
	});
}

// validation rules
utilities.validateToken = (token) => typeof token === 'string' && token.trim().length === 40 ? token.trim() : false;

utilities.validatePhone = (phone) => {
	const pattern = /^01[3-9][0-9]{8}$/; // Bangladeshi phone number

	return typeof phone === 'string' && pattern.test(phone.trim()) ? phone.trim() : null;
}

module.exports = utilities;