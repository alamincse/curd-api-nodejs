const { parseJSON } = require('../../helpers/utilities');
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
					password,
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

	if (phone) {
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
		callback(400, { 
			error: 'Invalid phone number' 
		});
	}
};

handler._users.put = (requestProperties, callback) => {
	const firstName = validateString(requestProperties.body.first_name);
  	const lastName = validateString(requestProperties.body.last_name);
  	const phone = validatePhone(requestProperties.body.phone);
  	const password = validateString(requestProperties.body.password);

  	// Update only if phone is valid and at least one field is provided
  	if (phone) {
  		if (firstName || lastName || password) {
  			data.read('users', phone, (error, userData) => {
		        if (!error && userData) {
		          	const user = parseJSON(userData);

		          	if (firstName) user.firstName = firstName;
		          	if (lastName) user.lastName = lastName;
		          	if (password) user.password = password; 

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
  		callback(400, { 
  		 	error: 'Invalid phone number' 
  		});
  	}
};

handler._users.delete = (requestProperties, callback) => {
	const phone = validatePhone(requestProperties.queryStringObject.phone);

  	if (phone) {
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
  	} else {
    	callback(400, { 
    		error: 'Invalid phone number' 
    	});
  	}
};

module.exports = handler;