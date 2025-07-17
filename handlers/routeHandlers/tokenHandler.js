const { parseJSON, hash, createRandomString } = require('../../helpers/utilities');
const data = require('../../lib/data');

// Handler container
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
	const allowedMethods = ['get', 'post', 'put', 'delete'];
	const method = requestProperties.method;

	if (allowedMethods.includes(method)) {
		handler._tokens[method](requestProperties, callback);
	} else {
		callback(405, { 
			error: 'Method Not Allowed' 
		});
	}
};

// User Methods Container
handler._tokens = {};

// Helper to validate fields
const validateString = (value) => typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const validatePhone = (phone) => typeof phone === 'string' && phone.trim().length === 11 ? phone.trim() : null;

const validateToken = (tokenId) => typeof tokenId === 'string' && tokenId.trim().length === 40 ? tokenId.trim() : null;

const validateExtend = (extend) => typeof extend === 'boolean' && extend === true ? true : false;


handler._tokens.post = (requestProperties, callback) => {
	const phone = validatePhone(requestProperties.body.phone);
  	const password = validateString(requestProperties.body.password);

  	if (phone && password) {
  		data.read('users', phone, (error, userData) => {
  			if (!error && userData) {
  				const user = parseJSON(userData);
  				const hashedPassword = hash(password);

  				if (hashedPassword === user.password) {
  					// create token
  					const tokenId = createRandomString(40);
          			const expires = Date.now() + 60 * 60 * 1000; // 1 hour

          			const tokenObject = {
          				phone: phone,
          				tokenId: tokenId,
          				expires: expires,
          			};

          			// Store the token
		          	data.create('tokens', tokenId, tokenObject, (tokenError) => {
		            	if (!tokenError) {
		              		callback(200, tokenObject);
		            	} else {
		              		callback(500, { 
		              			error: 'Could not create token' 
		              		});
		            	}
		          	});
  				} else {
  					callback(400, { 
  						error: 'Password is incorrect' 
  					});
  				}
  			} else {
  				callback(404, { 
  					error: 'User not found' 
  				});
  			}
  		});
  	} else {
  		callback(400, { 
  			error: 'Missing required fields' 
  		});
  	}
};

handler._tokens.get = (requestProperties, callback) => {
	const tokenId = validateToken(requestProperties.queryStringObject.tokenId);

  	if (tokenId) {
	    data.read('tokens', tokenId, (tokenError, tokenData) => {
	      	if (!tokenError && tokenData) {
	        	const token = parseJSON(tokenData);

	        	callback(200, token);
	      	} else {
	        	callback(404, { 
	        		error: 'Token not found' 
	        	});
	      	}
	    });
  	} else {
	    callback(400, { 
	    	error: 'Invalid token ID' 
	    });
  	}
};

// update token expires time
handler._tokens.put = (requestProperties, callback) => {
	const tokenId = validateToken(requestProperties.body.tokenId);

  	const extend = validateExtend(requestProperties.body.extend);

  	if (tokenId && extend) {
    	data.read('tokens', tokenId, (tokenError, tokenData) => {
      		if (!tokenError && tokenData) {
        		const tokenObject = parseJSON(tokenData);

		        // Check if token is already expired
		        if (tokenObject.expires > Date.now()) {
		          	tokenObject.expires = Date.now() + 60 * 60 * 1000; // extend 1 hour

		          	data.update('tokens', tokenId, tokenObject, (updateError) => {
			            if (!updateError) {
			              	callback(200, { 
			              		message: 'Token expiration extended successfully' 
			              	});
			            } else {
			              	callback(500, { 
			              		error: 'Failed to update token' 
			              	});
			            }
		          	});
		        } else {
		          	callback(400, { 
		          		error: 'Token already expired' 
		          	});
		        }
	      	} else {
	        	callback(404, { 
	        		error: 'Token not found' 
	        	});
	      	}
	    });
  	} else {
	    callback(400, { 
	    	error: 'Invalid request with your fields' 
    	});
  	}
};

// logout user with the tokenId
handler._tokens.delete = (requestProperties, callback) => {
 	const tokenId = validateToken(requestProperties.queryStringObject.tokenId);

  	if (tokenId) {
	    data.read('tokens', tokenId, (tokenError, tokenData) => {
	      	if (!tokenError && tokenData) {
	        	data.delete('tokens', tokenId, (deleteError) => {
	          		if (!deleteError) {
	            		callback(200, { 
	            			message: 'Token deleted successfully' 
	            		});
	          		} else {
	            		callback(500, { 
	            			error: 'Failed to delete token' 
	            		});
	          		}
	        	});
	      	} else {
	        	callback(404, { 
	        		error: 'Token not found' 
	        	});
	      	}
	    });
  	} else {
    	callback(400, { 
    		error: 'Invalid token ID' 
    	});
  	}
};

module.exports = handler;