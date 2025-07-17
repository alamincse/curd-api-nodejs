const {homeHandler} = require('./handlers/routeHandlers/homeHandler');
const {userHandler} = require('./handlers/routeHandlers/userHandler');

const routes = {
	home: homeHandler,
	user: userHandler,
};

module.exports = routes;