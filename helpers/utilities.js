const utilities = {};

utilities.parseJSON = (jsonString) => {
	try {
    	return JSON.parse(jsonString);
  	} catch(error) {
  		console.log('JSON parse error:', error.message);
    	return {};
  	}
};

module.exports = utilities;