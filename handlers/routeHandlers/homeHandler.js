const handler = {};

handler.homeHandler = (requestProperties, callback) => {
	console.log(requestProperties);

	callback(200, {
		message: 'This is a home page'
	});
};

module.exports = handler;