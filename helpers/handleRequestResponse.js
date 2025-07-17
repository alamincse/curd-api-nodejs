const { notFoundHandler } = require('../handlers/routeHandlers/notFoundHandler');
const { StringDecoder } = require('string_decoder');
const { parseJSON } = require('../helpers/utilities');
const routes = require('../routes');
const url = require('url');

// Handler container
const handler = {};

// Handle request & response
handler.handleRequestResponse = (request, response) => {
	// get the url and parse it
	const parseUrl = url.parse(request.url, true);
	const path = parseUrl.pathname;
	const trimePath = path.replace(/^\/+|\/+$/g, '');
	const method = request.method.toLowerCase();
	const queryStringObject = parseUrl.query;
	const headersObject = request.headers;

	const requestProperties = {
		parseUrl,
		path,
		trimePath,
		method,
		queryStringObject,
		headersObject,
	};

	// decode striming payload data 
	const decoder = new StringDecoder('utf-8');
	let buffer = '';

	const chosenHandler = routes[trimePath] ?? notFoundHandler;

	request.on('data', (chunk) => {
		buffer += decoder.write(chunk);
	});

	request.on('end', () => {
		buffer += decoder.end();

		// Parse and attach body data
		requestProperties.body = parseJSON(buffer);

		// Route handling like `home`, `about`
		chosenHandler(requestProperties, (statusCode = 500, payload = {}) => {
			// statusCode = typeof statusCode === 'number' ? statusCode : 500;
			// payload = typeof payload === 'object' ? payload : {};

			const payloadString = JSON.stringify(payload);

			// return the final response
			response.setHeader('Content-Type', 'application/json');
			response.writeHead(statusCode);
			response.end(payloadString);
		});

		// console.log(buffer);
		// response.end('hello nodejs');
	});
};

module.exports = handler;