const crypto = require('crypto');

const utilities = {};

utilities.parseJSON = (jsonString) => {
	try {
    	return JSON.parse(jsonString);
  	} catch(error) {
  		console.log('JSON parse error:', error.message);
    	return {};
  	}
};

utilities.hash = (str) => {
	if (typeof str === 'string' && str.length > 0) {
    	return crypto.createHmac('sha256', 'secretKey').update(str).digest('hex');
  	}
  	
  	return false;
};

utilities.createRandomString = (strLength) => {
	const possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
	let output = '';

	for (let i = 1; i <= strLength; i++) {
    	output += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  	}
  	
  	return output;
};

module.exports = utilities;