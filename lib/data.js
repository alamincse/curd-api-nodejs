const fs = require('fs');
const path = require('path');

const lib = {};

lib.basedir = path.join('__dirname', '/../.data/');

lib.create = (dir, file, data, callback) => {
	fs.open(lib.basedir+dir+'/'+file+'.json', 'wx', (error, fileDescriptor) => {
		if (!error && fileDescriptor) {
			const stringData = JSON.stringify(data);

			fs.writeFile(fileDescriptor, stringData, (error) => {
				if (!error) {
					fs.close(fileDescriptor, (error) => {
						if (!error) {
							callback(false);
						} else {
							callback('Error closing the new file');
						}
					})
				} else {
					callback('Error writing to new file');
				}
			})
		} else {
			callback(error);
		}
	});
}


lib.read = (dir, file, callback) => {
	fs.readFile(lib.basedir+dir+'/'+file+'.json', 'utf8', (error, data) => {
		callback(error, data);
	});
}


lib.update = (dir, file, data, callback) => {
	fs.open(lib.basedir+dir+'/'+file+'.json', 'r+', (error, fileDescriptor) => {
		if (!error && fileDescriptor) {
			const stringData = JSON.stringify(data);

			fs.ftruncate(fileDescriptor, (error) => {
				if (!error) {
					fs.writeFile(fileDescriptor, stringData, (error) => {
						if (!error) {
							fs.close(fileDescriptor, (error) => {
								callback(false);
							})
						} else {
							callback('Error closing file');
						}
					})
				} else {
					callback(error);
				}
			});
		} else {
			callback(error)
		}
	});
}

lib.delete = (dir, file, callback) => {
	fs.unlink(lib.basedir+dir+'/'+file+'.json', (error) => {
		if (!error) {
			callback(false);
		} else {
			callback(error);
		}
	});
}

module.exports = lib;