const {homeHandler} = require('./handlers/routeHandlers/homeHandler');
const {userHandler} = require('./handlers/routeHandlers/userHandler');
const {tokenHandler} = require('./handlers/routeHandlers/tokenHandler');

const routes = {
	home: homeHandler,
	token: tokenHandler,
	user: userHandler,
};

module.exports = routes;