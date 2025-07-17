const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
	console.log('Not Found!');
	callback(404, {
		message: 'Your requested url does not found!',
	});
};

module.exports = handler;