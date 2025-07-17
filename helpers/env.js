// Environment configurations
const environments = {
  staging: {
   		port: 3000,
    	envName: 'staging',
  	},
  	development: {
  		port: 4000,
  		envName: 'development',
	},
  	production: {
    	port: 5000,
    	envName: 'production',
  	},
};

// Determine current environment from NODE_ENV
const currentEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV.toLowerCase() : 'staging';

// Select the correct environment config
const envToExport = environments[currentEnv] || environments.staging;

// Export the environment config
module.exports = envToExport;