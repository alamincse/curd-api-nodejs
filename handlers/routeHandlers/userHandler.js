const { hash, parseJSON, getBearerToken, verifyToken } = require('../../helpers/utilities');
const data = require('../../lib/data');

// Handler container
const handler = {};

handler.userHandler = (requestProperties, callback) => {
	const allowedMethods = ['get', 'post', 'put', 'delete'];
	const method = requestProperties.method;

	if (allowedMethods.includes(method)) {
		handler._users[method](requestProperties, callback);
	} else {
		callback(405, { 
			error: 'Method Not Allowed' 
		});
	}
};

// User Methods Container
handler._users = {};

// Helper to validate fields
const validateString = (value) => typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const validatePhone = (phone) => typeof phone === 'string' && phone.trim().length === 11 ? phone.trim() : null;

const validateToken = (token) => typeof token === 'string' && token.trim().length === 40 ? token.trim() : false;


handler._users.post = (requestProperties, callback) => {
	const firstName = validateString(requestProperties.body.first_name);
  	const lastName = validateString(requestProperties.body.last_name);
  	const phone = validatePhone(requestProperties.body.phone);
  	const password = validateString(requestProperties.body.password);

	if (firstName && lastName && phone && password) {
		data.read('users', phone, (readError) => {
			if (readError) {
				const userObject = {
					firstName,
					lastName,
					phone,
					password: hash(password),
				};

				data.create('users', phone, userObject, (createError) => {
					if (!createError) {
						callback(200, {
							message: 'User was successfully created'
						})
					} else {
						callback(500, {
							error: 'Could not create user'
						})
					}
				});
			} else {
				callback(400, {
					error: 'User already exists'
				})
			}
		});
	} else {
		callback(400, {
			error: 'Invalid input fields!'
		});
	}
};

handler._users.get = (requestProperties, callback) => {
	const phone = validatePhone(requestProperties.queryStringObject.phone);

	// get token from header property(Headers)
	// const token = validateToken(requestProperties.headersObject.token);

	// get token from `Bearer Token` (Authorization)
	// const authorization = requestProperties.headersObject['authorization'] ?? null;
	// const bearerToken = authorization && authorization.startsWith('Bearer ') ? authorization.split(' ')[1] : null;
	// const token = validateToken(bearerToken);

	// get token from Bearer Authorization header
	const bearerToken = getBearerToken(requestProperties.headersObject);
	const token = validateToken(bearerToken);

	if (phone && token) {
		verifyToken(token, phone, (isValid) => {
			if (isValid) {
				data.read('users', phone, (error, userData) => {
					if (!error && userData) {
						const user = parseJSON(userData);

						// Remove sensitive data like password here!
				        delete user.password;

				        callback(200, user);
					} else {
						callback(404, { 
							error: 'User not found' 
						});
					}
				});
			} else {
				callback(403, { 
					error: 'Authentication failed!' 
				});
			}
		});
	} else {
		callback(400, { 
			error: 'Invalid phone number or token!' 
		});
	}
};

handler._users.put = (requestProperties, callback) => {
	const firstName = validateString(requestProperties.body.first_name);
  	const lastName = validateString(requestProperties.body.last_name);
  	const phone = validatePhone(requestProperties.body.phone);
  	const password = validateString(requestProperties.body.password);

  	// get token from Bearer Authorization header
  	const bearerToken = getBearerToken(requestProperties.headersObject);
	const token = validateToken(bearerToken);

  	// Update only if phone is valid and at least one field is provided
  	if (phone && token) {
  		verifyToken(token, phone, (isValid) => {
			if (isValid) {
		  		if (firstName || lastName || password) {
		  			data.read('users', phone, (error, userData) => {
				        if (!error && userData) {
				          	const user = parseJSON(userData);

				          	if (firstName) user.firstName = firstName;
				          	if (lastName) user.lastName = lastName;
				          	if (password) user.password = hash(password); 

				          	data.update('users', phone, user, (updateError) => {
				            	if (!updateError) {
				             		callback(200, { 
				             			message: 'User updated successfully' 
				             		});
				            	} else {
				              		callback(500, { 
				              			error: 'Could not update user' 
				              		});
				            	}
				          	});
				        } else {
			          		callback(404, { 
			          			error: 'User not found' 
			          		});
				        }
				      });
		  		} else {
		  			callback(400, { 
		  				error: 'No fields to update' 
		  			});
		  		}
		  	} else {
				callback(403, { 
					error: 'Authentication failed!' 
				});
			}
		});
  	} else {
  		callback(400, { 
  		 	error: 'Invalid phone number or token' 
  		});
  	}
};

handler._users.delete = (requestProperties, callback) => {
	const phone = validatePhone(requestProperties.queryStringObject.phone);

	// get token from Bearer Authorization header
  	const bearerToken = getBearerToken(requestProperties.headersObject);
	const token = validateToken(bearerToken);

  	if (phone && token) {
  		verifyToken(token, phone, (isValid) => {
			if (isValid) {
			    data.read('users', phone, (error, userData) => {
		      		if (!error && userData) {
				        data.delete('users', phone, (deleteError) => {
			          		if (!deleteError) {
					            callback(200, { 
					            	message: 'User deleted successfully' 
					            });
				          	} else {
					            callback(500, { 
					            	error: 'Could not delete the user' 
					            });
			          		}
				        });
			      	} else {
			        	callback(404, { 
			        		error: 'User not found' 
			        	});
			      	}
			    });

			    // Same user delete from tokens 
			    // Need to work on it
		    } else {
				callback(403, { 
					error: 'Authentication failed!' 
				});
			}
		});
  	} else {
    	callback(400, { 
    		error: 'Invalid phone number or token' 
    	});
  	}
};

module.exports = handler;