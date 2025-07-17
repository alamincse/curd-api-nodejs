// Dependencies
const { handleRequestResponse } = require('./helpers/handleRequestResponse');
const env = require('./helpers/env');
const http = require('http');

// App object
const app = {};

// Request handler(all incoming request & response)
app.handleRequestResponse = handleRequestResponse;

// Create and start the server
app.createServer = () => {
	const server = http.createServer(app.handleRequestResponse);
	
	server.listen(env.port, () => {
		console.log(`Server is running on port ${env.port}`);
	});
};


// Finaly call the create server
app.createServer();